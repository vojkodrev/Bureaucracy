import { useEffect, useState } from 'react'
import { Plus, Printer, Save, Trash2, Undo2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import CustomerPickerField from '@/components/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import ProductPickerField from '@/components/ProductPickerField'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { getSelectedBusinessYear } from '@/lib/business-year'
import { dateFromSearchValue } from '@/lib/dates'
import { formatCurrency } from '@/lib/formatters'
import type { Invoice, InvoiceItem } from '@/lib/invoice-types'

type InvoiceResponse = {
    data?: { invoice: Invoice | null }
    errors?: { message: string }[]
}

type LatestInvoiceResponse = {
    data?: { searchInvoices: { invoices: Pick<Invoice, 'invoiceNumber'>[] } }
    errors?: { message: string }[]
}

type BusinessYearResponse = {
    data?: { businessYear: { description: string | null } | null }
    errors?: { message: string }[]
}

type InvoiceLoadResult = {
    requestKey: string
    error: string | null
}

const invoiceQuery = `
    query Invoice($businessYear: String!, $invoiceNumber: String!) {
        invoice(
            businessYear: $businessYear
            invoiceNumber: $invoiceNumber
        ) {
            id
            invoiceNumber
            issueDate
            serviceDate
            paymentDate
            customerCode
            customerName
            customerAddress
            customerPostalCode
            customerCity
            customerCountry
            paidAmount
            introductoryText
            closingText
            items {
                id
                sequence
                productCode
                productName
                unitPrice
                unitTaxAmount
                quantity
                discount
                netAmount
                grossAmount
            }
        }
    }
`

const latestInvoiceQuery = `
    query LatestInvoice($businessYear: String!) {
        searchInvoices(
            businessYear: $businessYear
            sortBy: "invoiceNumber"
            sortDirection: "desc"
            page: 1
            pageSize: 1
        ) {
            invoices {
                invoiceNumber
            }
        }
    }
`

const businessYearQuery = `
    query BusinessYear($code: String!) {
        businessYear(code: $code) {
            description
        }
    }
`

function invoiceNumberAfter(invoiceNumber?: string): string {
    const value = Number.parseInt(invoiceNumber ?? '', 10)
    return String(Number.isNaN(value) ? 1 : value + 1).padStart(5, '0')
}

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function invoicePdfUrl(invoiceNumber: string, businessYear: string): string {
    const url = new URL(graphqlUrl)
    url.pathname = `/api/invoices/${encodeURIComponent(invoiceNumber)}/pdf`
    url.searchParams.set('businessYear', businessYear)
    url.searchParams.set('_', String(Date.now()))
    url.hash = ''
    return url.toString()
}

function dateFromInvoiceValue(value: string | null | undefined): Date | undefined {
    return value ? dateFromSearchValue(value.slice(0, 10)) : undefined
}

function InvoicePage() {
    const { invoiceNumber: routeInvoiceNumber } = useParams()
    const [invoiceNumber, setInvoiceNumber] = useState(routeInvoiceNumber ?? '')
    const [businessYearDescription, setBusinessYearDescription] = useState('')
    const [customerId, setCustomerId] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [customerPostalCode, setCustomerPostalCode] = useState('')
    const [customerCity, setCustomerCity] = useState('')
    const [customerCountry, setCustomerCountry] = useState('')
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>()
    const [serviceDate, setServiceDate] = useState<Date | undefined>()
    const [paymentDate, setPaymentDate] = useState<Date | undefined>()
    const [paidAmount, setPaidAmount] = useState('')
    const [introductoryText, setIntroductoryText] = useState('')
    const [closingText, setClosingText] = useState('')
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
    const [addProductOpen, setAddProductOpen] = useState(false)
    const [newProductCode, setNewProductCode] = useState('')
    const [newProductName, setNewProductName] = useState('')
    const [newProductUnit, setNewProductUnit] = useState('')
    const [reloadVersion, setReloadVersion] = useState(0)
    const [printError, setPrintError] = useState<string | null>(null)
    const requestKey = `${routeInvoiceNumber ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState<InvoiceLoadResult>({
        requestKey: '__initial__',
        error: null,
    })
    const isLoading = Boolean(routeInvoiceNumber) &&
        loadResult.requestKey !== requestKey
    const error = loadResult.requestKey === requestKey
        ? loadResult.error
        : null

    useEffect(() => {
        if (!routeInvoiceNumber) {
            return
        }

        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: invoiceQuery,
                variables: {
                    businessYear: getSelectedBusinessYear(),
                    invoiceNumber: routeInvoiceNumber,
                },
            }),
            signal: abortController.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Loading invoice failed (${response.status})`)
                }

                const result = (await response.json()) as InvoiceResponse
                if (result.errors?.length) {
                    throw new Error(result.errors.map(({ message }) => message).join(', '))
                }
                if (!result.data?.invoice) {
                    throw new Error(`Invoice ${routeInvoiceNumber} was not found`)
                }

                const invoice = result.data.invoice
                setInvoiceNumber(invoice.invoiceNumber)
                setCustomerId(invoice.customerCode ?? '')
                setCustomerName(invoice.customerName ?? '')
                setCustomerAddress(invoice.customerAddress ?? '')
                setCustomerPostalCode(invoice.customerPostalCode ?? '')
                setCustomerCity(invoice.customerCity ?? '')
                setCustomerCountry(invoice.customerCountry ?? '')
                setInvoiceDate(dateFromInvoiceValue(invoice.issueDate))
                setServiceDate(dateFromInvoiceValue(invoice.serviceDate))
                setPaymentDate(dateFromInvoiceValue(invoice.paymentDate))
                setPaidAmount(invoice.paidAmount == null ? '' : String(invoice.paidAmount))
                setIntroductoryText(invoice.introductoryText ?? '')
                setClosingText(invoice.closingText ?? '')
                setInvoiceItems(invoice.items ?? [])
                setLoadResult({ requestKey, error: null })
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return
                }
                setLoadResult({
                    requestKey,
                    error:
                        requestError instanceof Error
                            ? requestError.message
                            : 'Loading invoice failed',
                })
            })

        return () => abortController.abort()
    }, [requestKey, routeInvoiceNumber])

    useEffect(() => {
        if (routeInvoiceNumber) {
            return
        }

        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: latestInvoiceQuery,
                variables: { businessYear: getSelectedBusinessYear() },
            }),
            signal: abortController.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Loading latest invoice failed (${response.status})`)
                }

                const result = (await response.json()) as LatestInvoiceResponse
                if (result.errors?.length) {
                    throw new Error(result.errors.map(({ message }) => message).join(', '))
                }
                setInvoiceNumber(invoiceNumberAfter(
                    result.data?.searchInvoices.invoices[0]?.invoiceNumber,
                ))
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return
                }
                console.error(requestError)
            })

        return () => abortController.abort()
    }, [routeInvoiceNumber])

    useEffect(() => {
        const selectedBusinessYear = getSelectedBusinessYear()
        const abortController = new AbortController()

        void fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: businessYearQuery,
                variables: { code: selectedBusinessYear },
            }),
            signal: abortController.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Loading business year failed (${response.status})`)
                }

                const result = (await response.json()) as BusinessYearResponse
                if (result.errors?.length) {
                    throw new Error(result.errors.map(({ message }) => message).join(', '))
                }
                setBusinessYearDescription(result.data?.businessYear?.description ?? '')
            })
            .catch((requestError: unknown) => {
                if (requestError instanceof DOMException && requestError.name === 'AbortError') {
                    return
                }
                console.error(requestError)
            })

        return () => abortController.abort()
    }, [])

    const totalIncludingVat = invoiceItems.reduce(
        (total, item) => total + (item.grossAmount ?? 0),
        0,
    )
    const paidAmountValue = Number(paidAmount) || 0
    const balanceDue = totalIncludingVat - paidAmountValue

    const resetNewProduct = () => {
        setNewProductCode('')
        setNewProductName('')
        setNewProductUnit('')
    }

    const addProduct = () => {
        if (!newProductCode.trim()) return

        setInvoiceItems((items) => [
            ...items,
            {
                id: Math.min(0, ...items.map(({ id }) => id)) - 1,
                sequence: Math.max(0, ...items.map(({ sequence }) => sequence ?? 0)) + 1,
                productCode: newProductCode.trim(),
                productName: newProductName.trim() || null,
                unit: newProductUnit.trim() || null,
                unitPrice: null,
                unitTaxAmount: null,
                quantity: null,
                discount: null,
                netAmount: null,
                grossAmount: null,
            },
        ])
        resetNewProduct()
    }

    const printInvoice = () => {
        const numberToPrint = invoiceNumber.trim()
        if (!numberToPrint) return

        const pdfTab = window.open(
            invoicePdfUrl(numberToPrint, getSelectedBusinessYear()),
            '_blank',
        )
        if (!pdfTab) {
            setPrintError('Allow pop-ups to open the invoice PDF.')
            return
        }
        pdfTab.opener = null
        setPrintError(null)
    }

    return (
        <div className="max-w-5xl p-4">
            <Menubar className="mb-6 w-fit">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem disabled>
                            <Save />
                            Save
                        </MenubarItem>
                        <MenubarItem
                            disabled={!invoiceNumber.trim()}
                            onClick={printInvoice}
                        >
                            <Printer />
                            Print
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem
                            disabled={!routeInvoiceNumber || isLoading}
                            onClick={() => setReloadVersion((version) => version + 1)}
                        >
                            <Undo2 />
                            Revert
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>

            {printError && (
                <p className="mb-6 text-sm text-destructive" role="alert">
                    {printError}
                </p>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <CustomerPickerField
                                id="customer-id"
                                label="ID"
                                name="customerId"
                                customerId={customerId}
                                onCustomerIdChange={setCustomerId}
                                onCustomerNameChange={setCustomerName}
                                onCustomerAddressChange={setCustomerAddress}
                                onCustomerPostalCodeChange={setCustomerPostalCode}
                                onCustomerCityChange={setCustomerCity}
                                onCustomerCountryChange={setCustomerCountry}
                            />

                            <Field>
                                <FieldLabel htmlFor="customer-name">Name</FieldLabel>
                                <Input
                                    id="customer-name"
                                    value={customerName}
                                    onChange={(event) => setCustomerName(event.target.value)}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="customer-address">Address</FieldLabel>
                                <Input
                                    id="customer-address"
                                    value={customerAddress}
                                    onChange={(event) => setCustomerAddress(event.target.value)}
                                />
                            </Field>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="customer-postal-code">Postal code</FieldLabel>
                                    <Input
                                        id="customer-postal-code"
                                        value={customerPostalCode}
                                        onChange={(event) => setCustomerPostalCode(event.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="customer-city">City</FieldLabel>
                                    <Input
                                        id="customer-city"
                                        value={customerCity}
                                        onChange={(event) => setCustomerCity(event.target.value)}
                                    />
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel htmlFor="customer-country">Country</FieldLabel>
                                <Input
                                    id="customer-country"
                                    value={customerCountry}
                                    onChange={(event) => setCustomerCountry(event.target.value)}
                                />
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>General information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="invoice-number">Number</FieldLabel>
                                    <Input
                                        id="invoice-number"
                                        value={invoiceNumber}
                                        onChange={(event) => setInvoiceNumber(event.target.value)}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="business-year">Business year</FieldLabel>
                                    <Input
                                        id="business-year"
                                        value={businessYearDescription}
                                        readOnly
                                    />
                                </Field>
                            </div>

                            <DatePickerField
                                id="invoice-date"
                                label="Date"
                                name="invoiceDate"
                                date={invoiceDate}
                                onSelect={setInvoiceDate}
                            />

                            <DatePickerField
                                id="payment-date"
                                label="Payment date"
                                name="paymentDate"
                                date={paymentDate}
                                onSelect={setPaymentDate}
                            />

                            <DatePickerField
                                id="service-date"
                                label="Service date"
                                name="serviceDate"
                                date={serviceDate}
                                onSelect={setServiceDate}
                            />

                        </FieldGroup>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 space-y-6">
                <Field>
                    <FieldLabel htmlFor="introductory-text">Introductory text</FieldLabel>
                    <Textarea
                        id="introductory-text"
                        name="introductoryText"
                        value={introductoryText}
                        onChange={(event) => setIntroductoryText(event.target.value)}
                    />
                </Field>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Products</CardTitle>
                        <Dialog
                            open={addProductOpen}
                            onOpenChange={(open) => {
                                setAddProductOpen(open)
                                if (!open) resetNewProduct()
                            }}
                        >
                            <DialogTrigger render={<Button type="button" size="sm" />}>
                                <Plus />
                                Add product
                            </DialogTrigger>
                            <DialogContent
                                showCloseButton={false}
                                className="sm:max-w-2xl"
                            >
                                <DialogHeader>
                                    <DialogTitle>Add product</DialogTitle>
                                    <DialogDescription>
                                        Search for a product to add to this invoice.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_8rem]">
                                    <ProductPickerField
                                        id="new-product-code"
                                        label="Product code"
                                        name="newProductCode"
                                        productCode={newProductCode}
                                        onProductCodeChange={setNewProductCode}
                                        onProductNameChange={setNewProductName}
                                        onProductUnitChange={setNewProductUnit}
                                    />
                                    <Field>
                                        <FieldLabel htmlFor="new-product-name">Product name</FieldLabel>
                                        <Input
                                            id="new-product-name"
                                            value={newProductName}
                                            readOnly
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="new-product-unit">Unit</FieldLabel>
                                        <Input
                                            id="new-product-unit"
                                            value={newProductUnit}
                                            readOnly
                                        />
                                    </Field>
                                </div>
                                <DialogFooter>
                                    <DialogClose
                                        render={<Button type="button" variant="outline" />}
                                    >
                                        Cancel
                                    </DialogClose>
                                    <DialogClose
                                        render={
                                            <Button
                                                type="button"
                                                disabled={!newProductCode.trim()}
                                                onClick={addProduct}
                                            />
                                        }
                                    >
                                        Add
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Product code</TableHead>
                            <TableHead>Product name</TableHead>
                            <TableHead className="text-right">Unit price</TableHead>
                            <TableHead className="text-right">Unit tax</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">Net amount</TableHead>
                            <TableHead className="text-right">Gross amount</TableHead>
                            <TableHead className="w-8">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                            </TableHeader>
                            <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                    Loading invoice items…
                                </TableCell>
                            </TableRow>
                        )}
                        {error && (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && !error && invoiceItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                                    No invoice items found.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading &&
                            !error &&
                            invoiceItems.map((item, index) => (
                                <TableRow key={`${item.id}-${index}`}>
                                    <TableCell>{item.sequence ?? '—'}</TableCell>
                                    <TableCell className="font-medium">
                                        {item.productCode ?? '—'}
                                    </TableCell>
                                    <TableCell>{item.productName ?? '—'}</TableCell>
                                    <TableCell className="text-right">
                                        {item.unitPrice == null
                                            ? '—'
                                            : formatCurrency(item.unitPrice)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.unitTaxAmount == null
                                            ? '—'
                                            : formatCurrency(item.unitTaxAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.quantity ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.discount == null ? '—' : `${item.discount}%`}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.netAmount == null
                                            ? '—'
                                            : formatCurrency(item.netAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {item.grossAmount == null
                                            ? '—'
                                            : formatCurrency(item.grossAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                render={
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        aria-label={`Remove ${item.productName ?? item.productCode ?? 'product'}`}
                                                    />
                                                }
                                            >
                                                <Trash2 />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Remove product?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to remove {item.productName ?? item.productCode ?? 'this product'} from the invoice?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="destructive"
                                                        onClick={() => setInvoiceItems((items) =>
                                                            items.filter((_, itemIndex) => itemIndex !== index),
                                                        )}
                                                    >
                                                        Remove
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Field>
                    <FieldLabel htmlFor="closing-text">Closing text</FieldLabel>
                    <Textarea
                        id="closing-text"
                        name="closingText"
                        value={closingText}
                        onChange={(event) => setClosingText(event.target.value)}
                    />
                </Field>

                <Card className="ml-auto w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Total incl. VAT</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(totalIncludingVat)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Paid amount</TableCell>
                                    <TableCell>
                                        <Input
                                            aria-label="Paid amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={paidAmount}
                                            onChange={(event) => setPaidAmount(event.target.value)}
                                            className="ml-auto text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Balance due</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(balanceDue)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default InvoicePage
