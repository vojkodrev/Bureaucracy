import UnsavedProductAlert from "../product/UnsavedProductAlert";

export default function UnsavedInventoryItemAlert(
    props: React.ComponentProps<typeof UnsavedProductAlert>,
) {
    return (
        <UnsavedProductAlert
            {...props}
            description={
                props.description ??
                "This inventory item has changes that have not been saved. If you continue, those changes will be lost."
            }
        />
    );
}
