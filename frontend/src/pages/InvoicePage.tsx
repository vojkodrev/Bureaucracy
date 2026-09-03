import { useEffect, useState } from 'react'
import { Printer, Save, Undo2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import CustomerPickerField from '@/components/CustomerPickerField'
import DatePickerField from '@/components/DatePickerField'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function dateFromInvoiceValue(value: string | null | undefined): Date | undefined {
    return value ? dateFromSearchValue(value.slice(0, 10)) : undefined
}

function InvoicePage() {
    const { invoiceNumber: routeInvoiceNumber } = useParams()
    const [invoiceNumber, setInvoiceNumber] = useState(routeInvoiceNumber ?? '')
    const [customerId, setCustomerId] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [customerPostalCode, setCustomerPostalCode] = useState('')
    const [customerCity, setCustomerCity] = useState('')
    const [customerCountry, setCustomerCountry] = useState('')
    const [invoiceDate, setInvoiceDate] = useState<Date | undefined>()
    const [serviceDate, setServiceDate] = useState<Date | undefined>()
    const [paymentDate, setPaymentDate] = useState<Date | undefined>()
    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
    const [reloadVersion, setReloadVersion] = useState(0)
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
                        <MenubarItem disabled>
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
                            <Field>
                                <FieldLabel htmlFor="invoice-number">Number</FieldLabel>
                                <Input
                                    id="invoice-number"
                                    value={invoiceNumber}
                                    onChange={(event) => setInvoiceNumber(event.target.value)}
                                />
                            </Field>

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

            <div className="mt-8">
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    Loading invoice items…
                                </TableCell>
                            </TableRow>
                        )}
                        {error && (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && !error && invoiceItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    No invoice items found.
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading &&
                            !error &&
                            invoiceItems.map((item) => (
                                <TableRow key={item.id}>
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
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default InvoicePage
