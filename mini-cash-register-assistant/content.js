(() => {
  "use strict";

  function normalizeLabel(value) {
    return value.replace(/\s+/g, " ").replace(/\*$/, "").trim().toLocaleLowerCase("sl");
  }

  function fieldForLabel(labelText) {
    const expected = normalizeLabel(labelText);
    const label = [...document.querySelectorAll("main label[for]")].find((candidate) =>
      !candidate.closest(".hidden") && normalizeLabel(candidate.textContent ?? "") === expected,
    );
    return label ? document.getElementById(label.htmlFor) : null;
  }

  function setInput(label, value) {
    if (value == null || value === "") return false;
    const input = fieldForLabel(label);
    if (!(input instanceof HTMLInputElement) || input.type === "button") return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, String(value));
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: String(value) }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    setter?.call(input, String(value));
    input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: String(value) }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function miniBlagajnaCountryCode(code) {
    const normalizedCode = String(code ?? "").trim().toLocaleUpperCase("sl");
    return ({ SLO: "SI", CRO: "HR", SRB: "RS" })[normalizedCode] ?? normalizedCode;
  }

  function setComboboxValue(label, value) {
    if (!value) return false;
    const button = fieldForLabel(label);
    if (!(button instanceof HTMLInputElement) || button.type !== "button") return false;
    setInputValue(button, value);
    button.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
  }

  function setComboboxInput(label, code, name) {
    const normalizedCode = miniBlagajnaCountryCode(code);
    const displayValue = [normalizedCode, String(name ?? "").trim()].filter(Boolean).join(" - ");
    return setComboboxValue(label, displayValue);
  }

  function selectRadio(label) {
    const input = fieldForLabel(label);
    if (!(input instanceof HTMLInputElement) || input.type !== "radio") return false;
    if (!input.checked) input.click();
    return true;
  }

  function formatDate(value) {
    if (!value) return "";
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value);
  }

  function formatAmount(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2).replace(".", ",") : "";
  }

  function cityWithoutPostalCode(city, postalCode) {
    const normalizedCity = city?.trim() ?? "";
    const normalizedPostalCode = postalCode?.trim() ?? "";
    if (!normalizedPostalCode || !normalizedCity.startsWith(normalizedPostalCode)) return normalizedCity;
    const remainder = normalizedCity.slice(normalizedPostalCode.length);
    return /^\s/.test(remainder) ? remainder.trimStart() : normalizedCity;
  }

  function customerAddress(invoice) {
    const city = cityWithoutPostalCode(invoice.customerCity, invoice.customerPostalCode);
    return [invoice.customerAddress, [invoice.customerPostalCode, city].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ");
  }

  function vatTotals(items) {
    const totals = new Map();
    for (const item of items ?? []) {
      const rate = Number(item.taxRate);
      if (!Number.isFinite(rate)) continue;
      const current = totals.get(rate) ?? { net: 0, tax: 0 };
      const net = Number(item.netAmount) || 0;
      const gross = Number(item.grossAmount) || 0;
      current.net += net;
      current.tax += gross - net;
      totals.set(rate, current);
    }
    return totals;
  }

  function fillVkrForm(invoice, vkrSerialNumber, businessPremises) {
    if (!location.hash.startsWith("#/porocanje-vkr-racunov")) {
      throw new Error("Open a VKR invoice form in Mini Blagajna before filling it.");
    }

    let filled = 0;
    const fill = (label, value) => { if (setInput(label, value)) filled += 1; };
    if (setComboboxValue("Poslovni prostor", businessPremises)) filled += 1;
    fill("Številka računa iz VKR", invoice.invoiceNumber);
    fill("Serijska številka VKR (oblika: 1234-1234567)", vkrSerialNumber);
    fill("Datum izdaje računa iz VKR", formatDate(invoice.issueDate));
    fill("Datum dobave oz. oprav. stor.", formatDate(invoice.serviceDate));
    fill("Naziv", invoice.customerName);
    fill("Naslov", customerAddress(invoice));
    const country = invoice.customer?.country || invoice.customerCountry;
    if (setComboboxInput("Koda države kupca", country, invoice.customerCountryName)) filled += 1;
    if (setComboboxValue("Račun izdajam v", "Račun izdajam v svojem imenu")) filled += 1;

    const taxNumber = invoice.customer?.taxNumber?.replace(/^SI/i, "") ?? "";
    if (taxNumber) {
      if (selectRadio("Zavezanec za DDV")) filled += 1;
      fill("Davčna številka ali ID za DDV (brez kode države)", taxNumber);
    } else if (selectRadio("Končni potrošnik (ni zavezanec za DDV)")) {
      filled += 1;
    }

    fill("Vrednost računa (EUR)", formatAmount(invoice.amount));
    fill("Znesek povračil (EUR)", "0,00");
    fill("Vrednost za plačilo (EUR)", formatAmount(invoice.amount));

    const totals = vatTotals(invoice.items);
    const vatFields = new Map([
      [9.5, ["9,5% osnova (EUR)", "9,5% davek (EUR)"]],
      [22, ["22% osnova (EUR)", "22% davek (EUR)"]],
      [5, ["5% osnova (EUR)", "5% davek (EUR)"]],
    ]);
    for (const [rate, [netLabel, taxLabel]] of vatFields) {
      const total = totals.get(rate);
      if (!total) continue;
      fill(netLabel, formatAmount(total.net));
      fill(taxLabel, formatAmount(total.tax));
    }

    if (!filled) throw new Error("No supported VKR fields were found on this page.");
    return filled;
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "FILL_VKR_FORM") return false;
    try {
      sendResponse({
        ok: true,
        filled: fillVkrForm(message.invoice, message.vkrSerialNumber, message.businessPremises),
      });
    } catch (error) {
      sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
    return false;
  });
})();
