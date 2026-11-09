const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");
const businessYearSelect = document.getElementById("business-year");
const invoiceSelect = document.getElementById("invoice");
const status = document.getElementById("status");

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function request(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      if (!response?.ok) return reject(new Error(response?.error || "The extension request failed."));
      resolve(response.data);
    });
  });
}

function replaceOptions(select, placeholder, items) {
  select.replaceChildren(new Option(placeholder, ""));
  for (const item of items) select.add(new Option(item.label, item.value));
}

async function loadBusinessYears() {
  setStatus("Loading business years…");
  const years = await request({ type: "GET_BUSINESS_YEARS" });
  const options = years.filter(({ code }) => code).map(({ code, description, year }) => ({
    value: code,
    label: description ? `${year ?? code} — ${description}` : String(year ?? code),
  }));
  replaceOptions(businessYearSelect, "Select a business year", options);
  businessYearSelect.disabled = options.length === 0;
  loginButton.hidden = true;
  logoutButton.hidden = false;
  setStatus(options.length ? "Choose a business year." : "No business years found.");
}

function showSignedOut() {
  loginButton.hidden = false;
  loginButton.disabled = false;
  logoutButton.hidden = true;
  replaceOptions(businessYearSelect, "Sign in first", []);
  replaceOptions(invoiceSelect, "Select a business year", []);
  businessYearSelect.disabled = true;
  invoiceSelect.disabled = true;
  setStatus("Sign in to load business years.");
}

loginButton.addEventListener("click", async () => {
  loginButton.disabled = true;
  setStatus("Opening sign-in…");
  try {
    await request({ type: "LOGIN" });
    await loadBusinessYears();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  setStatus("Signing out…");
  try {
    await request({ type: "LOGOUT" });
    showSignedOut();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    logoutButton.disabled = false;
  }
});

businessYearSelect.addEventListener("change", async () => {
  replaceOptions(invoiceSelect, "Select an invoice", []);
  invoiceSelect.disabled = true;
  if (!businessYearSelect.value) return setStatus("Choose a business year.");
  businessYearSelect.disabled = true;
  setStatus("Loading invoices…");
  try {
    const invoices = await request({ type: "GET_INVOICES", businessYear: businessYearSelect.value });
    const options = invoices.map((invoice) => ({
      value: invoice.invoiceNumber,
      label: `${invoice.invoiceNumber}${invoice.customerName ? ` — ${invoice.customerName}` : ""}`,
    }));
    replaceOptions(invoiceSelect, "Select an invoice", options);
    invoiceSelect.disabled = options.length === 0;
    setStatus(options.length
      ? `${options.length} invoice${options.length === 1 ? "" : "s"} loaded.`
      : "No invoices found.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    businessYearSelect.disabled = false;
  }
});

loadBusinessYears().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "Sign in to load data.") {
    setStatus("Sign in to load business years.");
    return;
  }
  setStatus(message, true);
});
