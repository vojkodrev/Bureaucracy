import ErrorAlert from "@/components/ErrorAlert";

export default function InventoryItemErrors({
    loadError,
    saveError,
}: {
    loadError: string | null;
    saveError: string | null;
}) {
    if (!loadError && !saveError) return null;
    return (
        <div className="mb-6 space-y-2">
            {loadError && (
                <ErrorAlert
                    title="Inventory item could not be loaded"
                    description="The inventory item data could not be retrieved."
                    error={loadError}
                />
            )}
            {saveError && (
                <ErrorAlert
                    title="Inventory item could not be saved"
                    description="Your changes were not saved."
                    error={saveError}
                />
            )}
        </div>
    );
}
