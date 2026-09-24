import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import { formatCurrency } from "@/lib/formatters";

type Props = {
    currentInflow: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSplit: (inflow: number) => void;
};

function SplitInflowDialog({
    currentInflow,
    open,
    onOpenChange,
    onSplit,
}: Props) {
    const [newInflow, setNewInflow] = useState("");
    const splitInflow = Number(newInflow);
    const canSplit =
        newInflow.trim() !== "" &&
        Number.isFinite(splitInflow) &&
        splitInflow > 0 &&
        splitInflow < currentInflow;
    const remainingInflow = canSplit
        ? Math.round((currentInflow - splitInflow) * 100) / 100
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Split transaction inflow</DialogTitle>
                    <DialogDescription>
                        Move part of this inflow to a duplicate transaction.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="rounded-md border bg-muted/40 p-3 text-sm">
                        <span className="text-muted-foreground">
                            Current inflow
                        </span>
                        <div className="mt-1 font-medium">
                            {formatCurrency(currentInflow)}
                        </div>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="split-transaction-inflow">
                            New inflow
                        </FieldLabel>
                        <NumberInput
                            id="split-transaction-inflow"
                            autoFocus
                            min="0.01"
                            max={String(currentInflow - 0.01)}
                            step="0.01"
                            value={newInflow}
                            onChange={(event) =>
                                setNewInflow(event.target.value)
                            }
                        />
                    </Field>
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                        {remainingInflow === null
                            ? "Enter an amount greater than zero and less than the current inflow."
                            : `The original transaction will have an inflow of ${formatCurrency(remainingInflow)}, and a duplicate transaction will be created with an inflow of ${formatCurrency(splitInflow)}.`}
                    </p>
                </div>
                <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>
                        Cancel
                    </DialogClose>
                    <Button
                        type="button"
                        disabled={!canSplit}
                        onClick={() => onSplit(splitInflow)}
                    >
                        Split transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default SplitInflowDialog;
