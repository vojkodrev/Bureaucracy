import { useEffect, useState } from "react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import type { Storage } from "@/lib/goods-receipt-types";
import { fetchGoodsReceiptStorages } from "./goods-receipt-api";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function StorageComboboxField({ value, onChange }: Props) {
    const [storages, setStorages] = useState<Storage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const selected = storages.find((storage) => storage.code === value) ??
        (value ? { code: value } : null);
    const items = selected && !storages.some(
        (storage) => storage.code === selected.code,
    )
        ? [selected, ...storages]
        : storages;

    useEffect(() => {
        const controller = new AbortController();
        void fetchGoodsReceiptStorages(controller.signal)
            .then(setStorages)
            .catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException &&
                    requestError.name === "AbortError")) {
                    setError(requestError instanceof Error
                        ? requestError.message
                        : "Storages could not be loaded");
                }
            });
        return () => controller.abort();
    }, []);

    return (
        <Field>
            <FieldLabel htmlFor="goods-receipt-storage">Storage</FieldLabel>
            <Combobox
                items={items}
                value={selected}
                onValueChange={(storage) => onChange(storage?.code ?? "")}
                itemToStringLabel={(storage) => storage.code}
                itemToStringValue={(storage) => storage.code}
                isItemEqualToValue={(storage, current) =>
                    storage.code === current.code}
            >
                <ComboboxInput
                    id="goods-receipt-storage"
                    placeholder={error ?? "Select storage"}
                />
                <ComboboxContent>
                    <ComboboxEmpty>
                        {error ?? "No storages found."}
                    </ComboboxEmpty>
                    <ComboboxList>
                        {(storage: Storage) => (
                            <ComboboxItem
                                key={storage.code}
                                value={storage}
                            >
                                {storage.code}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </Field>
    );
}
