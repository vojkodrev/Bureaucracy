import ErrorAlert from "@/components/ErrorAlert";

type Props = {
    loadError: string | null;
    saveError: string | null;
    duplicateError: string | null;
    nextNumberError: string | null;
};

export default function GoodsReceiptErrors(props: Props) {
    const errors = [
        [
            "receipt",
            "Goods receipt could not be loaded",
            "The receipt data could not be retrieved.",
            props.loadError,
        ],
        [
            "save",
            "Goods receipt could not be saved",
            "Your changes were not saved.",
            props.saveError,
        ],
        [
            "duplicate",
            "Goods receipt could not be duplicated",
            "The new goods receipt draft could not be prepared.",
            props.duplicateError,
        ],
        [
            "next-number",
            "Next receipt number could not be loaded",
            "Enter a receipt number manually before saving.",
            props.nextNumberError,
        ],
    ] as const;

    if (!errors.some(([, , , error]) => error)) return null;
    return (
        <div className="mb-6 space-y-2">
            {errors.map(([key, title, description, error]) =>
                error && (
                    <ErrorAlert
                        key={key}
                        title={title}
                        description={description}
                        error={error}
                    />
                ))}
        </div>
    );
}
