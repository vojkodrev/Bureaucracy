import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { getSelectedBusinessYear } from '@/lib/business-year'
import type { Customer } from '@/lib/customer-types'
import { emptyToNull } from '@/lib/form-input'
import { nextPaddedNumber, numberOrNull } from '@/lib/numbers'
import { toast } from '@/lib/toast'
import CustomerMenu from './CustomerMenu'
import UnsavedCustomerAlert from './UnsavedCustomerAlert'

type CustomerResponse = { data?: { customer: Customer | null }; errors?: { message: string }[] }
type SaveCustomerResponse = { data?: { saveCustomer: Customer }; errors?: { message: string }[] }
type LatestCustomerResponse = {
    data?: { searchCustomers: { customers: Pick<Customer, 'customerId'>[] } }
    errors?: { message: string }[]
}
type LoadResult = { requestKey: string; error: string | null }

type CustomerDraft = {
    customerId: string
    name: string
    address: string
    postalCode: string
    city: string
    country: string
    contact: string
    email: string
    phone: string
    taxNumber: string
    registrationNumber: string
    paymentTerm: string
    discount: string
}

const customerFields = `
    id customerId name address postalCode city country contact email phone
    taxNumber registrationNumber paymentTerm discount
`
const customerQuery = `
    query Customer($businessYear: String!, $customerId: String!) {
        customer(businessYear: $businessYear, customerId: $customerId) { ${customerFields} }
    }
`
const latestCustomerQuery = `
    query LatestCustomer($businessYear: String!) {
        searchCustomers(businessYear: $businessYear, sortBy: "customerId", sortDirection: "desc", page: 1, pageSize: 1) {
            customers { customerId }
        }
    }
`
const saveCustomerMutation = `
    mutation SaveCustomer($businessYear: String!, $customer: CustomerInput!) {
        saveCustomer(businessYear: $businessYear, customer: $customer) { ${customerFields} }
    }
`
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

function customerDraft(customer?: Customer | null): CustomerDraft {
    return {
        customerId: customer?.customerId ?? '', name: customer?.name ?? '',
        address: customer?.address ?? '', postalCode: customer?.postalCode ?? '',
        city: customer?.city ?? '', country: customer?.country ?? '',
        contact: customer?.contact ?? '', email: customer?.email ?? '',
        phone: customer?.phone ?? '', taxNumber: customer?.taxNumber ?? '',
        registrationNumber: customer?.registrationNumber ?? '',
        paymentTerm: customer?.paymentTerm == null ? '' : String(customer.paymentTerm),
        discount: customer?.discount == null ? '' : String(customer.discount),
    }
}

function isOptionalNumberInRange(value: string, minimum: number, maximum: number): boolean {
    if (!value.trim()) return true
    const number = Number(value)
    return Number.isFinite(number) && number >= minimum && number <= maximum
}

function isOptionalIntegerInRange(value: string, minimum: number, maximum: number): boolean {
    if (!value.trim()) return true
    const number = Number(value)
    return Number.isInteger(number) && number >= minimum && number <= maximum
}

async function fetchNextCustomerId(signal?: AbortSignal): Promise<string> {
    const response = await fetch(graphqlUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: latestCustomerQuery, variables: { businessYear: getSelectedBusinessYear() } }),
        signal,
    })
    if (!response.ok) throw new Error(`Loading latest customer failed (${response.status})`)
    const result = await response.json() as LatestCustomerResponse
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return nextPaddedNumber(result.data?.searchCustomers.customers[0]?.customerId, 4)
}

function CustomerPage() {
    const { customerId: routeCustomerId } = useParams()
    const navigate = useNavigate()
    const allowNextNavigationRef = useRef(false)
    const [customerRecordId, setCustomerRecordId] = useState<number | null>(null)
    const [draft, setDraft] = useState<CustomerDraft>(() => customerDraft())
    const [cleanDraft, setCleanDraft] = useState(JSON.stringify(customerDraft()))
    const [reloadVersion, setReloadVersion] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [confirmingRevert, setConfirmingRevert] = useState(false)
    const requestKey = `${routeCustomerId ?? ''}:${reloadVersion}`
    const [loadResult, setLoadResult] = useState<LoadResult>({ requestKey: '__initial__', error: null })
    const isLoading = Boolean(routeCustomerId) && loadResult.requestKey !== requestKey
    const loadError = loadResult.requestKey === requestKey ? loadResult.error : null
    const hasUnsavedChanges = JSON.stringify(draft) !== cleanDraft
    const canSave = Boolean(draft.customerId.trim() && draft.name.trim()) &&
        isOptionalIntegerInRange(draft.paymentTerm, 0, 32767) &&
        isOptionalNumberInRange(draft.discount, 0, 100) && !isLoading && !loadError
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        !allowNextNavigationRef.current && hasUnsavedChanges &&
        (currentLocation.pathname !== nextLocation.pathname ||
            currentLocation.search !== nextLocation.search || currentLocation.hash !== nextLocation.hash),
    )

    useEffect(() => {
        if (!routeCustomerId) {
            const emptyDraft = customerDraft()
            setCustomerRecordId(null)
            setDraft(emptyDraft)
            setCleanDraft(JSON.stringify(emptyDraft))
            setSaveError(null)
            setLoadResult({ requestKey, error: null })
            allowNextNavigationRef.current = false
            const abortController = new AbortController()
            void fetchNextCustomerId(abortController.signal).then((nextCustomerId) => {
                const newDraft = { ...emptyDraft, customerId: nextCustomerId }
                setDraft(newDraft)
                setCleanDraft(JSON.stringify(newDraft))
            }).catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) console.error(requestError)
            })
            return () => abortController.abort()
        }

        const abortController = new AbortController()
        void fetch(graphqlUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: customerQuery, variables: { businessYear: getSelectedBusinessYear(), customerId: routeCustomerId } }),
            signal: abortController.signal,
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Loading customer failed (${response.status})`)
            const result = await response.json() as CustomerResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            if (!result.data?.customer) throw new Error(`Customer ${routeCustomerId} was not found`)
            const loadedDraft = customerDraft(result.data.customer)
            setCustomerRecordId(result.data.customer.id)
            setDraft(loadedDraft)
            setCleanDraft(JSON.stringify(loadedDraft))
            setLoadResult({ requestKey, error: null })
            allowNextNavigationRef.current = false
        }).catch((requestError: unknown) => {
            if (requestError instanceof DOMException && requestError.name === 'AbortError') return
            setLoadResult({ requestKey, error: requestError instanceof Error ? requestError.message : 'Loading customer failed' })
        })
        return () => abortController.abort()
    }, [requestKey, routeCustomerId])

    const setField = (field: keyof CustomerDraft, value: string) => {
        setDraft((current) => ({ ...current, [field]: value }))
    }

    const saveCustomer = async () => {
        if (!canSave || isSaving) return
        const isCreating = customerRecordId == null
        setIsSaving(true)
        setSaveError(null)
        try {
            const response = await fetch(graphqlUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: saveCustomerMutation,
                    variables: {
                        businessYear: getSelectedBusinessYear(),
                        customer: {
                            id: customerRecordId, customerId: draft.customerId.trim(),
                            name: emptyToNull(draft.name), address: emptyToNull(draft.address),
                            postalCode: emptyToNull(draft.postalCode), city: emptyToNull(draft.city),
                            country: emptyToNull(draft.country), contact: emptyToNull(draft.contact),
                            email: emptyToNull(draft.email), phone: emptyToNull(draft.phone),
                            taxNumber: emptyToNull(draft.taxNumber),
                            registrationNumber: emptyToNull(draft.registrationNumber),
                            paymentTerm: numberOrNull(draft.paymentTerm), discount: numberOrNull(draft.discount),
                        },
                    },
                }),
            })
            if (!response.ok) throw new Error(`Saving customer failed (${response.status})`)
            const result = await response.json() as SaveCustomerResponse
            if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
            if (!result.data?.saveCustomer) throw new Error('Saving customer returned no customer')
            const savedCustomer = result.data.saveCustomer
            const savedDraft = customerDraft(savedCustomer)
            setCustomerRecordId(savedCustomer.id)
            setDraft(savedDraft)
            setCleanDraft(JSON.stringify(savedDraft))
            toast.add({
                title: 'Customer saved',
                description: `${savedCustomer.customerId} was ${isCreating ? 'created' : 'updated'} successfully.`,
                type: 'success',
            })
            if (routeCustomerId === savedCustomer.customerId) {
                setReloadVersion((version) => version + 1)
            } else {
                allowNextNavigationRef.current = true
                navigate(`/customer/${encodeURIComponent(savedCustomer.customerId ?? '')}`)
            }
        } catch (requestError: unknown) {
            setSaveError(requestError instanceof Error ? requestError.message : 'Saving customer failed')
        } finally {
            setIsSaving(false)
        }
    }

    const performRevert = () => {
        setConfirmingRevert(false)
        setSaveError(null)
        if (routeCustomerId) {
            setReloadVersion((version) => version + 1)
        } else {
            const emptyDraft = customerDraft()
            setDraft(emptyDraft)
            setCleanDraft(JSON.stringify(emptyDraft))
        }
        toast.add({
            title: 'Customer reverted',
            description: routeCustomerId
                ? `${routeCustomerId} was restored to its last saved version.`
                : 'The new customer form was cleared.',
            type: 'success',
        })
    }

    const onSaveShortcut = useEffectEvent(() => { void saveCustomer() })
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return
            event.preventDefault()
            onSaveShortcut()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    useEffect(() => {
        if (!hasUnsavedChanges) return
        const handleBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault() }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    return (
        <div className="max-w-5xl p-4">
            <CustomerMenu canSave={canSave} canRevert={hasUnsavedChanges} isSaving={isSaving} onSave={() => void saveCustomer()} onRevert={() => setConfirmingRevert(true)} />
            <UnsavedCustomerAlert
                open={blocker.state === 'blocked'}
                onOpenChange={(open) => { if (!open && blocker.state === 'blocked') blocker.reset() }}
                onDiscard={() => {
                    if (blocker.state !== 'blocked') return
                    allowNextNavigationRef.current = true
                    setCleanDraft(JSON.stringify(draft))
                    blocker.proceed()
                }}
            />
            <UnsavedCustomerAlert open={confirmingRevert} onOpenChange={setConfirmingRevert} onDiscard={performRevert} actionLabel="Discard and revert" />
            {loadError && <p className="mb-6 text-sm text-destructive" role="alert">{loadError}</p>}
            {saveError && <p className="mb-6 text-sm text-destructive" role="alert">{saveError}</p>}
            <div className="grid items-start gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Customer details</CardTitle></CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field><FieldLabel htmlFor="customer-code">Customer ID</FieldLabel><Input id="customer-code" maxLength={10} required value={draft.customerId} onChange={(event) => setField('customerId', event.target.value)} /></Field>
                            <Field><FieldLabel htmlFor="customer-name">Name</FieldLabel><Input id="customer-name" maxLength={52} required value={draft.name} onChange={(event) => setField('name', event.target.value)} /></Field>
                            <Field><FieldLabel htmlFor="customer-address">Address</FieldLabel><Input id="customer-address" maxLength={32} value={draft.address} onChange={(event) => setField('address', event.target.value)} /></Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field><FieldLabel htmlFor="customer-postal-code">Postal code</FieldLabel><Input id="customer-postal-code" maxLength={10} value={draft.postalCode} onChange={(event) => setField('postalCode', event.target.value)} /></Field>
                                <Field><FieldLabel htmlFor="customer-city">City</FieldLabel><Input id="customer-city" maxLength={50} value={draft.city} onChange={(event) => setField('city', event.target.value)} /></Field>
                            </div>
                            <Field><FieldLabel htmlFor="customer-country">Country</FieldLabel><Input id="customer-country" maxLength={3} value={draft.country} onChange={(event) => setField('country', event.target.value)} /></Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Contact and business details</CardTitle></CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field><FieldLabel htmlFor="customer-contact">Contact</FieldLabel><Input id="customer-contact" maxLength={60} value={draft.contact} onChange={(event) => setField('contact', event.target.value)} /></Field>
                            <Field><FieldLabel htmlFor="customer-email">Email</FieldLabel><Input id="customer-email" type="email" maxLength={50} value={draft.email} onChange={(event) => setField('email', event.target.value)} /></Field>
                            <Field><FieldLabel htmlFor="customer-phone">Phone</FieldLabel><Input id="customer-phone" maxLength={60} value={draft.phone} onChange={(event) => setField('phone', event.target.value)} /></Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field><FieldLabel htmlFor="customer-tax-number">Tax number</FieldLabel><Input id="customer-tax-number" maxLength={22} value={draft.taxNumber} onChange={(event) => setField('taxNumber', event.target.value)} /></Field>
                                <Field><FieldLabel htmlFor="customer-registration-number">Registration number</FieldLabel><Input id="customer-registration-number" maxLength={10} value={draft.registrationNumber} onChange={(event) => setField('registrationNumber', event.target.value)} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field><FieldLabel htmlFor="customer-payment-term">Payment term (days)</FieldLabel><NumberInput id="customer-payment-term" min="0" max="32767" step="1" value={draft.paymentTerm} onChange={(event) => setField('paymentTerm', event.target.value)} /></Field>
                                <Field><FieldLabel htmlFor="customer-discount">Discount (%)</FieldLabel><NumberInput id="customer-discount" min="0" max="100" step="0.01" value={draft.discount} onChange={(event) => setField('discount', event.target.value)} /></Field>
                            </div>
                        </FieldGroup>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CustomerPage
