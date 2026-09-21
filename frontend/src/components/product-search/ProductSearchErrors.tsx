import ErrorAlert from '@/components/ErrorAlert'

type ProductSearchErrorsProps = {
    error: string | null
}

function ProductSearchErrors({ error }: ProductSearchErrorsProps) {
    if (!error) return null

    return (
        <div className="mb-6 max-w-2xl">
            <ErrorAlert
                title="Products could not be loaded"
                description="The product search could not be completed."
                error={error}
            />
        </div>
    )
}

export default ProductSearchErrors
