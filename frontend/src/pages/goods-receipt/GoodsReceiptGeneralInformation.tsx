import DatePickerField from "@/components/DatePickerField";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import StorageComboboxField from "./StorageComboboxField";

type Props = {
    receiptNumber: string;
    receiptDate?: Date;
    storage: string;
    receivedBy: string;
    onReceiptNumberChange: (value: string) => void;
    onReceiptDateChange: (value?: Date) => void;
    onStorageChange: (value: string) => void;
    onReceivedByChange: (value: string) => void;
};

export default function GoodsReceiptGeneralInformation(props: Props) {
    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Goods receipt details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="goods-receipt-number">
                        Receipt number
                    </FieldLabel>
                    <Input
                        id="goods-receipt-number"
                        maxLength={10}
                        value={props.receiptNumber}
                        onChange={(event) =>
                            props.onReceiptNumberChange(event.target.value)}
                    />
                </Field>
                <DatePickerField
                    id="goods-receipt-date"
                    label="Receipt date"
                    name="receiptDate"
                    date={props.receiptDate}
                    onSelect={props.onReceiptDateChange}
                />
                <StorageComboboxField
                    value={props.storage}
                    onChange={props.onStorageChange}
                />
                <Field>
                    <FieldLabel htmlFor="goods-receipt-received-by">
                        Received by
                    </FieldLabel>
                    <Input
                        id="goods-receipt-received-by"
                        maxLength={30}
                        value={props.receivedBy}
                        onChange={(event) =>
                            props.onReceivedByChange(event.target.value)}
                    />
                </Field>
            </CardContent>
        </Card>
    );
}
