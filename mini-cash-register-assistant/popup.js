const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");
const businessYearSelect = document.getElementById("business-year");
const invoiceFilterInput = document.getElementById("invoice-filter");
const invoiceSelect = document.getElementById("invoice");
const vkrSerialNumberInput = document.getElementById("vkr-serial-number");
const businessPremisesInput = document.getElementById("business-premises");
const fillButton = document.getElementById("fill");
const status = document.getElementById("status");
const debugContainer = document.getElementById("debug-container");
const debugOutput = document.getElementById("debug");
const SELECTED_BUSINESS_YEAR_KEY = "selectedBusinessYear";
const SELECTED_INVOICE_KEY = "selectedInvoice";
const VKR_SERIAL_NUMBER_KEY = "vkrSerialNumber";
const BUSINESS_PREMISES_KEY = "businessPremises";
let invoiceOptions = [];
const businessYearNumbers = new Map();

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function setDebug(details = "") {
  debugOutput.value = details;
  debugContainer.hidden = !details;
  debugContainer.open = Boolean(details);
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

function filterInvoiceOptions() {
  const selectedInvoice = invoiceSelect.value;
  const filter = invoiceFilterInput.value.trim().toLocaleLowerCase();
  const options = filter
    ? invoiceOptions.filter(({ label }) => label.toLocaleLowerCase().includes(filter))
    : invoiceOptions;
  replaceOptions(invoiceSelect, options.length ? "Select an invoice" : "No matching invoices", options);
  if (options.some(({ value }) => value === selectedInvoice)) invoiceSelect.value = selectedInvoice;
  invoiceSelect.disabled = options.length === 0;
  fillButton.disabled = !invoiceSelect.value;
}

async function loadBusinessYears() {
  setStatus("Loading business years…");
  const years = await request({ type: "GET_BUSINESS_YEARS" });
  businessYearNumbers.clear();
  for (const businessYear of years) {
    if (businessYear.code && businessYear.year != null) {
      businessYearNumbers.set(businessYear.code, businessYear.year);
    }
  }
  const options = years.filter(({ code }) => code).map(({ code, description, year }) => ({
    value: code,
    label: description ? `${year ?? code} — ${description}` : String(year ?? code),
  }));
  replaceOptions(businessYearSelect, "Select a business year", options);
  businessYearSelect.disabled = options.length === 0;
  loginButton.hidden = true;
  logoutButton.hidden = false;
  if (!options.length) {
    setStatus("No business years found.");
    return;
  }

  const stored = await chrome.storage.local.get(SELECTED_BUSINESS_YEAR_KEY);
  const selectedBusinessYear = stored[SELECTED_BUSINESS_YEAR_KEY];
  if (selectedBusinessYear && options.some(({ value }) => value === selectedBusinessYear)) {
    businessYearSelect.value = selectedBusinessYear;
    await loadInvoices(selectedBusinessYear);
    return;
  }

  setStatus("Choose a business year.");
}

async function loadInvoices(businessYear) {
  invoiceOptions = [];
  invoiceFilterInput.value = "";
  invoiceFilterInput.disabled = true;
  replaceOptions(invoiceSelect, "Select an invoice", []);
  invoiceSelect.disabled = true;
  fillButton.disabled = true;
  businessYearSelect.disabled = true;
  setStatus("Loading invoices…");
  try {
    const invoices = await request({ type: "GET_INVOICES", businessYear });
    const options = invoices.map((invoice) => ({
      value: invoice.invoiceNumber,
      label: `${invoice.invoiceNumber}${invoice.customerName ? ` — ${invoice.customerName}` : ""}`,
    }));
    invoiceOptions = options;
    invoiceFilterInput.disabled = options.length === 0;
    filterInvoiceOptions();
    const stored = await chrome.storage.local.get(SELECTED_INVOICE_KEY);
    const selectedInvoice = stored[SELECTED_INVOICE_KEY];
    if (selectedInvoice?.businessYear === businessYear &&
        options.some(({ value }) => value === selectedInvoice.invoiceNumber)) {
      invoiceSelect.value = selectedInvoice.invoiceNumber;
      fillButton.disabled = false;
    }
    setStatus(options.length
      ? `${options.length} invoice${options.length === 1 ? "" : "s"} loaded.`
      : "No invoices found.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    businessYearSelect.disabled = false;
  }
}

function showSignedOut() {
  loginButton.hidden = false;
  loginButton.disabled = false;
  logoutButton.hidden = true;
  replaceOptions(businessYearSelect, "Sign in first", []);
  replaceOptions(invoiceSelect, "Select a business year", []);
  invoiceOptions = [];
  invoiceFilterInput.value = "";
  invoiceFilterInput.disabled = true;
  businessYearSelect.disabled = true;
  invoiceSelect.disabled = true;
  fillButton.disabled = true;
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
    await chrome.storage.local.remove([SELECTED_BUSINESS_YEAR_KEY, SELECTED_INVOICE_KEY]);
    showSignedOut();
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    logoutButton.disabled = false;
  }
});

businessYearSelect.addEventListener("change", async () => {
  const businessYear = businessYearSelect.value;
  if (!businessYear) {
    await chrome.storage.local.remove(SELECTED_BUSINESS_YEAR_KEY);
    replaceOptions(invoiceSelect, "Select a business year", []);
    invoiceOptions = [];
    invoiceFilterInput.value = "";
    invoiceFilterInput.disabled = true;
    invoiceSelect.disabled = true;
    fillButton.disabled = true;
    setStatus("Choose a business year.");
    return;
  }

  await chrome.storage.local.set({ [SELECTED_BUSINESS_YEAR_KEY]: businessYear });
  await loadInvoices(businessYear);
});

invoiceSelect.addEventListener("change", async () => {
  const invoiceNumber = invoiceSelect.value;
  fillButton.disabled = !invoiceNumber;
  if (!invoiceNumber) {
    await chrome.storage.local.remove(SELECTED_INVOICE_KEY);
    return;
  }
  await chrome.storage.local.set({
    [SELECTED_INVOICE_KEY]: {
      businessYear: businessYearSelect.value,
      invoiceNumber,
    },
  });
});

invoiceFilterInput.addEventListener("input", filterInvoiceOptions);

vkrSerialNumberInput.addEventListener("input", () => {
  void chrome.storage.local.set({ [VKR_SERIAL_NUMBER_KEY]: vkrSerialNumberInput.value.trim() });
});

businessPremisesInput.addEventListener("input", () => {
  void chrome.storage.local.set({ [BUSINESS_PREMISES_KEY]: businessPremisesInput.value.trim() });
});

fillButton.addEventListener("click", async () => {
  const businessYear = businessYearSelect.value;
  const invoiceNumber = invoiceSelect.value;
  if (!businessYear || !invoiceNumber) return;

  fillButton.disabled = true;
  setStatus("Loading invoice…");
  setDebug();
  try {
    const invoice = await request({ type: "GET_INVOICE", businessYear, invoiceNumber });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("No active Mini Blagajna tab was found.");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "FILL_VKR_FORM",
      invoice,
      businessYearNumber: businessYearNumbers.get(businessYear),
      vkrSerialNumber: vkrSerialNumberInput.value.trim(),
      businessPremises: businessPremisesInput.value.trim(),
    });
    if (!response?.ok) {
      setDebug(response?.debug || "No DOM debug details were returned.");
      throw new Error(response?.error || "The VKR form could not be filled.");
    }
    setStatus(`${response.filled} fields filled. Review the form before submitting.`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error), true);
  } finally {
    fillButton.disabled = !invoiceSelect.value;
  }
});

void chrome.storage.local.get(VKR_SERIAL_NUMBER_KEY).then((stored) => {
  vkrSerialNumberInput.value = stored[VKR_SERIAL_NUMBER_KEY] ?? "";
});

void chrome.storage.local.get(BUSINESS_PREMISES_KEY).then((stored) => {
  businessPremisesInput.value = stored[BUSINESS_PREMISES_KEY] ?? "";
});

loadBusinessYears().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message === "Sign in to load data.") {
    setStatus("Sign in to load business years.");
    return;
  }
  setStatus(message, true);
});
