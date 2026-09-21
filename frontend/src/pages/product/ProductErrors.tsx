import ErrorAlert from '@/components/ErrorAlert'

type Props = {
    loadError: string | null
    saveError: string | null
}

function ProductErrors({ loadError, saveError }: Props) {
    const errors = [
        ['load', 'Product could not be loaded', 'The product data could not be retrieved.', loadError],
        ['save', 'Product could not be saved', 'Your changes were not saved.', saveError],
    ] as const

    if (!errors.some(([, , , error]) => error)) return null

    return (
        <div className="mb-6 space-y-2">
            {errors.map(([key, title, description, error]) => error && (
                <ErrorAlert key={key} title={title} description={description} error={error} />
            ))}
        </div>
    )
}

export default ProductErrors
