(() => {
    "use strict";

    function normalizeLabel(value) {
        return value
            .replace(/\s+/g, " ")
            .replace(/\*$/, "")
            .trim()
            .toLocaleLowerCase("sl");
    }

    function fieldForLabel(labelText) {
        const expected = normalizeLabel(labelText);
        const label = [...document.querySelectorAll("main label[for]")].find(
            (candidate) =>
                !candidate.closest(".hidden") &&
                normalizeLabel(candidate.textContent ?? "") === expected,
        );
        return label ? document.getElementById(label.htmlFor) : null;
    }

    function setInput(label, value) {
        if (value == null || value === "") return false;
        const input = fieldForLabel(label);
        if (!(input instanceof HTMLInputElement) || input.type === "button")
            return false;
        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
        )?.set;
        setter?.call(input, String(value));
        input.dispatchEvent(
            new InputEvent("input", {
                bubbles: true,
                inputType: "insertText",
                data: String(value),
            }),
        );
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("blur", { bubbles: true }));
        return true;
    }

    function setInputValue(input, value) {
        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
        )?.set;
        setter?.call(input, String(value));
        input.dispatchEvent(
            new InputEvent("input", {
                bubbles: true,
                inputType: "insertText",
                data: String(value),
            }),
        );
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function miniBlagajnaCountryCode(code) {
        const normalizedCode = String(code ?? "")
            .trim()
            .toLocaleUpperCase("sl");
        return (
            { SLO: "SI", CRO: "HR", SRB: "RS" }[normalizedCode] ??
            normalizedCode
        );
    }

    function activateElement(element) {
        const bounds = element.getBoundingClientRect();
        const eventOptions = {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            button: 0,
            buttons: 1,
            clientX: bounds.left + bounds.width / 2,
            clientY: bounds.top + bounds.height / 2,
        };
        element.focus();
        element.dispatchEvent(
            new PointerEvent("pointerdown", {
                ...eventOptions,
                pointerId: 1,
                pointerType: "mouse",
                isPrimary: true,
            }),
        );
        element.dispatchEvent(new MouseEvent("mousedown", eventOptions));
        element.dispatchEvent(
            new PointerEvent("pointerup", {
                ...eventOptions,
                buttons: 0,
                pointerId: 1,
                pointerType: "mouse",
                isPrimary: true,
            }),
        );
        element.dispatchEvent(
            new MouseEvent("mouseup", { ...eventOptions, buttons: 0 }),
        );
        element.dispatchEvent(
            new MouseEvent("click", { ...eventOptions, buttons: 0 }),
        );
    }

    function waitForElement(find, timeout = 1500) {
        const startedAt = Date.now();
        return new Promise((resolve) => {
            const check = () => {
                const element = find();
                if (element || Date.now() - startedAt >= timeout) {
                    resolve(element ?? null);
                    return;
                }
                requestAnimationFrame(check);
            };
            check();
        });
    }

    async function selectComboboxOption(label, value) {
        if (!value)
            return { selected: false, debug: "No option value was provided." };
        const button = fieldForLabel(label);
        if (!(button instanceof HTMLInputElement) || button.type !== "button") {
            return {
                selected: false,
                debug: `Combobox input for "${label}" was not found.`,
            };
        }
        const expected = String(value).trim().toLocaleLowerCase("sl");
        if (button.value.trim().toLocaleLowerCase("sl") === expected) {
            return { selected: true, debug: "" };
        }

        activateElement(button);
        const select = button.closest(".form-select");
        const opened = await waitForElement(() =>
            button.classList.contains("opened") ||
            select?.querySelector('.list[aria-expanded="true"]')
                ? select
                : null,
        );
        if (!opened) {
            return {
                selected: false,
                debug: [
                    "The combobox did not enter its opened state after button.click().",
                    `Button HTML:\n${button.outerHTML}`,
                    `Select HTML:\n${select?.outerHTML ?? "(not found)"}`,
                ].join("\n\n"),
            };
        }
        const search = select?.querySelector('.list input[type="text"]');
        if (search instanceof HTMLInputElement) setInputValue(search, value);

        const listboxId = button.getAttribute("aria-owns");
        const listbox = () =>
            listboxId
                ? document.getElementById(listboxId)
                : select?.querySelector('ul[role="listbox"]');
        const option = await waitForElement(() => {
            const options =
                listbox()?.querySelectorAll('li, [role="option"]') ?? [];
            return [...options].find(
                (candidate) =>
                    candidate.textContent?.trim().toLocaleLowerCase("sl") ===
                    expected,
            );
        });
        const debugDetails = () =>
            [
                `URL: ${location.href}`,
                `Label: ${label}`,
                `Expected option: ${value}`,
                `Current button value: ${button.value}`,
                `aria-owns: ${listboxId ?? "(missing)"}`,
                `Button HTML:\n${button.outerHTML}`,
                `Select HTML:\n${select?.outerHTML ?? "(not found)"}`,
                `Listbox HTML:\n${listbox()?.outerHTML ?? "(not found)"}`,
            ]
                .join("\n\n")
                .slice(0, 15000);
        if (!(option instanceof HTMLElement)) {
            return { selected: false, debug: debugDetails() };
        }
        activateElement(option);
        let selected = await waitForElement(
            () =>
                button.value.trim().toLocaleLowerCase("sl") === expected
                    ? button
                    : null,
            500,
        );
        if (!selected && search instanceof HTMLInputElement) {
            search.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                }),
            );
            search.dispatchEvent(
                new KeyboardEvent("keyup", {
                    key: "Enter",
                    code: "Enter",
                    keyCode: 13,
                    which: 13,
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                }),
            );
            selected = await waitForElement(
                () =>
                    button.value.trim().toLocaleLowerCase("sl") === expected
                        ? button
                        : null,
                500,
            );
        }
        return {
            selected: Boolean(selected),
            debug: selected ? "" : debugDetails(),
        };
    }

    function countryComboboxValue(code, name) {
        const normalizedCode = miniBlagajnaCountryCode(code);
        return [normalizedCode, String(name ?? "").trim()]
            .filter(Boolean)
            .join(" - ");
    }

    function selectRadio(label) {
        const input = fieldForLabel(label);
        if (!(input instanceof HTMLInputElement) || input.type !== "radio")
            return false;
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
        return Number.isFinite(number)
            ? number.toFixed(2).replace(".", ",")
            : "";
    }

    function cityWithoutPostalCode(city, postalCode) {
        const normalizedCity = city?.trim() ?? "";
        const normalizedPostalCode = postalCode?.trim() ?? "";
        if (
            !normalizedPostalCode ||
            !normalizedCity.startsWith(normalizedPostalCode)
        )
            return normalizedCity;
        const remainder = normalizedCity.slice(normalizedPostalCode.length);
        return /^\s/.test(remainder) ? remainder.trimStart() : normalizedCity;
    }

    function customerAddress(invoice) {
        const city = cityWithoutPostalCode(
            invoice.customerCity,
            invoice.customerPostalCode,
        );
        return [
            invoice.customerAddress,
            [invoice.customerPostalCode, city].filter(Boolean).join(" "),
        ]
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

    async function fillVkrForm(
        invoice,
        businessYearNumber,
        vkrSerialNumber,
        businessPremises,
    ) {
        if (!location.hash.startsWith("#/porocanje-vkr-racunov")) {
            throw new Error(
                "Open a VKR invoice form in Mini Blagajna before filling it.",
            );
        }

        let filled = 0;
        const fill = (label, value) => {
            if (setInput(label, value)) filled += 1;
        };
        if (businessPremises) {
            const result = await selectComboboxOption(
                "Poslovni prostor",
                businessPremises,
            );
            if (!result.selected) {
                const error = new Error(
                    `Business premises "${businessPremises}" could not be selected.`,
                );
                error.debug = result.debug;
                throw error;
            }
            filled += 1;
        }
        const baseInvoiceNumber = String(invoice.invoiceNumber).replace(
            /^0+(?=\d)/,
            "",
        );
        const invoiceNumber = businessYearNumber
            ? `${baseInvoiceNumber}/${String(businessYearNumber).slice(-2)}`
            : baseInvoiceNumber;
        fill("Številka računa iz VKR", invoiceNumber);
        fill("Serijska številka VKR (oblika: 1234-1234567)", vkrSerialNumber);
        fill("Datum izdaje računa iz VKR", formatDate(invoice.serviceDate));
        fill("Datum dobave oz. oprav. stor.", formatDate(invoice.serviceDate));
        fill("Naziv", invoice.customerName);
        fill("Naslov", customerAddress(invoice));
        const country = invoice.customer?.country || invoice.customerCountry;
        const countryValue = countryComboboxValue(
            country,
            invoice.customerCountryName,
        );
        if (countryValue) {
            const result = await selectComboboxOption(
                "Koda države kupca",
                countryValue,
            );
            if (!result.selected) {
                const error = new Error(
                    `Country "${countryValue}" could not be selected.`,
                );
                error.debug = result.debug;
                throw error;
            }
            filled += 1;
        }
        const issuerValue = "Račun izdajam v svojem imenu";
        const issuerResult = await selectComboboxOption(
            "Račun izdajam v",
            issuerValue,
        );
        if (!issuerResult.selected) {
            const error = new Error(
                `Invoice issuer "${issuerValue}" could not be selected.`,
            );
            error.debug = issuerResult.debug;
            throw error;
        }
        filled += 1;

        const taxNumber =
            invoice.customer?.taxNumber?.replace(/^SI/i, "") ?? "";
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

        if (!filled)
            throw new Error("No supported VKR fields were found on this page.");
        return filled;
    }

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if (message?.type !== "FILL_VKR_FORM") return false;
        fillVkrForm(
            message.invoice,
            message.businessYearNumber,
            message.vkrSerialNumber,
            message.businessPremises,
        )
            .then((filled) => sendResponse({ ok: true, filled }))
            .catch((error) =>
                sendResponse({
                    ok: false,
                    error:
                        error instanceof Error ? error.message : String(error),
                    debug: error?.debug ?? "",
                }),
            );
        return true;
    });
})();
