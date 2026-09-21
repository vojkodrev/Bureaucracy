import BankAccountComboboxField from "@/components/BankAccountComboboxField";
import DatePickerField from "@/components/DatePickerField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";

type Props = {
    statementNumber: string;
    statementDate: Date | undefined;
    bankAccount: string;
    selectDefaultAccount: boolean;
    onStatementNumberChange: (value: string) => void;
    onStatementDateChange: (value: Date | undefined) => void;
    onBankAccountChange: (value: string) => void;
    onDefaultBankAccountChange: (value: string) => void;
};

function BankStatementGeneralInformation({
    statementNumber,
    statementDate,
    bankAccount,
    selectDefaultAccount,
    onStatementNumberChange,
    onStatementDateChange,
    onBankAccountChange,
    onDefaultBankAccountChange,
}: Props) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>General information</CardTitle>
            </CardHeader>
            <CardContent>
                <FieldGroup>
                    <div className="grid gap-6 sm:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="statement-number">
                                Statement number
                            </FieldLabel>
                            <NumberInput
                                id="statement-number"
                                min="0"
                                step="1"
                                value={statementNumber}
                                onChange={(event) =>
                                    onStatementNumberChange(event.target.value)
                                }
                            />
                        </Field>
                        <DatePickerField
                            id="statement-date"
                            label="Statement date"
                            name="statementDate"
                            date={statementDate}
                            onSelect={onStatementDateChange}
                        />
                        <BankAccountComboboxField
                            id="statement-account"
                            label="Bank account"
                            value={bankAccount}
                            onChange={onBankAccountChange}
                            selectFirstByDefault={selectDefaultAccount}
                            onDefaultChange={onDefaultBankAccountChange}
                        />
                    </div>
                </FieldGroup>
            </CardContent>
        </Card>
    );
}

export default BankStatementGeneralInformation;
