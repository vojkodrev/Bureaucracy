import { useEffect, useState } from "react";
import ErrorAlert from "@/components/ErrorAlert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    fetchInventoryItemStock,
    type InventoryItemStock,
} from "./inventory-item-api";

type Props = {
    productCode: string;
    unit: string;
};

export default function InventoryItemStockSummary({ productCode, unit }: Props) {
    const [result, setResult] = useState<{
        productCode: string;
        stock: InventoryItemStock[];
        error: string | null;
    }>({ productCode: "", stock: [], error: null });
    const isLoading = result.productCode !== productCode;
    const stock = isLoading ? null : result.stock;
    const error = isLoading ? null : result.error;

    useEffect(() => {
        const controller = new AbortController();
        void fetchInventoryItemStock(productCode, controller.signal)
            .then((stock) => setResult({ productCode, stock, error: null }))
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === "AbortError") return;
                setResult({
                    productCode,
                    stock: [],
                    error: requestError instanceof Error
                        ? requestError.message
                        : "Loading stock failed",
                });
            });
        return () => controller.abort();
    }, [productCode]);

    const formatQuantity = (quantity: number) =>
        `${quantity.toLocaleString("en-IE")} ${unit.trim()}`.trim();
    const total = stock?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    return (
        <div className="max-w-sm p-4">
            {error && (
                <ErrorAlert
                    title="Stock summary could not be loaded"
                    description="The inventory quantities could not be retrieved."
                    error={error}
                />
            )}
            {!error && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Storage</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    Loading stock…
                                </TableCell>
                            </TableRow>
                        )}
                        {stock?.map((item) => (
                            <TableRow key={item.storage ?? "__no_storage__"}>
                                <TableCell>{item.storage ?? "No storage"}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatQuantity(item.quantity)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {stock && stock.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">
                                    No stock movements found.
                                </TableCell>
                            </TableRow>
                        )}
                        {stock && stock.length > 1 && (
                            <TableRow>
                                <TableCell className="font-medium">Total</TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatQuantity(total)}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
