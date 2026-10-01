import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Props = {
    productCode: string;
    name: string;
    unit: string;
    minimumStockLevel: string;
    onChange: (
        field: "productCode" | "name" | "unit" | "minimumStockLevel",
        value: string,
    ) => void;
};

export default function InventoryItemDetails({
    productCode,
    name,
    unit,
    minimumStockLevel,
    onChange,
}: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Inventory item details</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="inventory-item-code">
                            Product code
                        </FieldLabel>
                        <Input
                            id="inventory-item-code"
                            maxLength={25}
                            required
                            value={productCode}
                            onChange={(event) =>
                                onChange("productCode", event.target.value)
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="inventory-item-name">
                            Name
                        </FieldLabel>
                        <Input
                            id="inventory-item-name"
                            maxLength={100}
                            required
                            value={name}
                            onChange={(event) =>
                                onChange("name", event.target.value)
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="inventory-item-unit">
                            Unit
                        </FieldLabel>
                        <Input
                            id="inventory-item-unit"
                            maxLength={10}
                            value={unit}
                            onChange={(event) =>
                                onChange("unit", event.target.value)
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="minimum-stock-level">
                            Minimum stock level
                        </FieldLabel>
                        <Input
                            id="minimum-stock-level"
                            type="number"
                            min="0"
                            step="any"
                            value={minimumStockLevel}
                            onChange={(event) =>
                                onChange(
                                    "minimumStockLevel",
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                </FieldGroup>
            </CardContent>
        </Card>
    );
}
