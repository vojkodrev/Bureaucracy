importScripts("config.js");

const TOKEN_STORAGE_KEY = "keycloakTokens";
const encoder = new TextEncoder();

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomValue(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64Url(new Uint8Array(digest));
}

function keycloakEndpoint(path) {
  const base = EXTENSION_CONFIG.keycloakUrl.replace(/\/$/, "");
  return `${base}/realms/${encodeURIComponent(EXTENSION_CONFIG.keycloakRealm)}/protocol/openid-connect/${path}`;
}

async function fetchWithDetails(url, options, operation) {
  try {
    return await fetch(url, options);
  } catch (error) {
    const target = new URL(url).origin;
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${operation} could not connect to ${target}. ${reason}. ` +
      "Check that the server is running, the hostname is reachable, its HTTPS certificate is trusted in Chrome, " +
      "and the URL is included in manifest.json host_permissions.",
    );
  }
}

async function saveTokens(tokens) {
  const expiresAt = Date.now() + Number(tokens.expires_in ?? 0) * 1000;
  await chrome.storage.local.set({ [TOKEN_STORAGE_KEY]: { ...tokens, expiresAt } });
  return tokens.access_token;
}

async function exchangeToken(parameters) {
  const tokenUrl = keycloakEndpoint("token");
  const response = await fetchWithDetails(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(parameters),
  }, "Keycloak token request");
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.error_description || body.error || response.statusText || "Unknown response";
    throw new Error(`Keycloak token request failed at ${tokenUrl} (${response.status}): ${detail}`);
  }
  return saveTokens(body);
}

async function login() {
  const redirectUri = chrome.identity.getRedirectURL();
  const state = randomValue();
  const verifier = randomValue(64);
  const authorizationUrl = new URL(keycloakEndpoint("auth"));
  authorizationUrl.search = new URLSearchParams({
    client_id: EXTENSION_CONFIG.keycloakClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
    code_challenge: await sha256(verifier),
    code_challenge_method: "S256",
  }).toString();

  const callbackUrl = await chrome.identity.launchWebAuthFlow({
    url: authorizationUrl.toString(),
    interactive: true,
  });
  if (!callbackUrl) throw new Error("The sign-in window was closed before login completed.");

  const callback = new URL(callbackUrl);
  if (callback.searchParams.get("state") !== state) throw new Error("The login response state is invalid.");
  const authError = callback.searchParams.get("error_description") || callback.searchParams.get("error");
  if (authError) throw new Error(authError);
  const code = callback.searchParams.get("code");
  if (!code) throw new Error("Keycloak did not return an authorization code.");

  return exchangeToken({
    grant_type: "authorization_code",
    client_id: EXTENSION_CONFIG.keycloakClientId,
    redirect_uri: redirectUri,
    code,
    code_verifier: verifier,
  });
}

async function accessToken() {
  const stored = (await chrome.storage.local.get(TOKEN_STORAGE_KEY))[TOKEN_STORAGE_KEY];
  if (stored?.access_token && stored.expiresAt > Date.now() + 30_000) return stored.access_token;
  if (stored?.refresh_token) {
    try {
      return await exchangeToken({
        grant_type: "refresh_token",
        client_id: EXTENSION_CONFIG.keycloakClientId,
        refresh_token: stored.refresh_token,
      });
    } catch {
      await chrome.storage.local.remove(TOKEN_STORAGE_KEY);
    }
  }
  throw new Error("Sign in to load data.");
}

async function logout() {
  const stored = (await chrome.storage.local.get(TOKEN_STORAGE_KEY))[TOKEN_STORAGE_KEY];
  try {
    if (stored?.refresh_token) {
      const logoutUrl = keycloakEndpoint("logout");
      const response = await fetchWithDetails(logoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: EXTENSION_CONFIG.keycloakClientId,
          refresh_token: stored.refresh_token,
        }),
      }, "Keycloak logout request");
      if (!response.ok) {
        throw new Error(`Keycloak logout request failed at ${logoutUrl} (${response.status} ${response.statusText}).`);
      }
    }
  } finally {
    await chrome.storage.local.remove(TOKEN_STORAGE_KEY);
  }
}

async function graphql(query, variables) {
  const response = await fetchWithDetails(EXTENSION_CONFIG.graphqlUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  }, "Bureaucracy GraphQL request");
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) {
    await chrome.storage.local.remove(TOKEN_STORAGE_KEY);
    throw new Error("Your session expired. Sign in again.");
  }
  if (!response.ok) {
    const detail = result.error || result.errors?.map(({ message }) => message).join(", ") || response.statusText;
    throw new Error(
      `Bureaucracy GraphQL request failed at ${EXTENSION_CONFIG.graphqlUrl} ` +
      `(${response.status}${detail ? `: ${detail}` : ""}).`,
    );
  }
  if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(", "));
  return result.data;
}

async function loadBusinessYears() {
  const data = await graphql(`
    query ExtensionBusinessYears {
      businessYears(sortBy: "year", sortDirection: "desc", page: 1, pageSize: 100) {
        businessYears { code description year }
      }
    }
  `, {});
  return data?.businessYears?.businessYears ?? [];
}

async function loadInvoices(businessYear) {
  const query = `
    query ExtensionInvoices($businessYear: String!, $page: Int!) {
      searchInvoices(
        businessYear: $businessYear
        sortBy: "invoiceNumber"
        sortDirection: "desc"
        page: $page
        pageSize: 100
      ) {
        invoices { invoiceNumber customerName amount issueDate }
        totalPages
      }
    }
  `;
  const invoices = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await graphql(query, { businessYear, page });
    const result = data?.searchInvoices;
    invoices.push(...(result?.invoices ?? []));
    totalPages = result?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);
  return invoices;
}

async function loadInvoice(businessYear, invoiceNumber) {
  const data = await graphql(`
    query ExtensionInvoice($businessYear: String!, $invoiceNumber: String!) {
      invoice(businessYear: $businessYear, invoiceNumber: $invoiceNumber) {
        invoiceNumber amount issueDate serviceDate customerCode customerName customerAddress
        customerPostalCode customerCity customerCountry
        items { taxRate netAmount grossAmount }
      }
    }
  `, { businessYear, invoiceNumber });
  const invoice = data?.invoice;
  if (!invoice) throw new Error(`Invoice ${invoiceNumber} was not found.`);

  let customer = null;
  if (invoice.customerCode) {
    const customerData = await graphql(`
      query ExtensionInvoiceCustomer($businessYear: String!, $customerId: String!) {
        customer(businessYear: $businessYear, customerId: $customerId) {
          taxNumber country
        }
        countries(businessYear: $businessYear) { code name }
      }
    `, { businessYear, customerId: invoice.customerCode });
    customer = customerData?.customer ?? null;
    const countryCode = customer?.country || invoice.customerCountry;
    const country = customerData?.countries?.find(({ code }) => code === countryCode);
    invoice.customerCountryName = country?.name ?? null;
  }
  return { ...invoice, customer };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const action = message?.type === "LOGIN"
    ? login()
    : message?.type === "LOGOUT"
      ? logout()
    : message?.type === "GET_BUSINESS_YEARS"
      ? loadBusinessYears()
      : message?.type === "GET_INVOICES"
        ? loadInvoices(message.businessYear)
        : message?.type === "GET_INVOICE"
          ? loadInvoice(message.businessYear, message.invoiceNumber)
        : Promise.reject(new Error("Unknown extension action."));

  action.then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) }));
  return true;
});
