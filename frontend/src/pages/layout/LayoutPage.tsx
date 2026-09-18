import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { fetchBusinessYear } from '@/lib/business-year-api'
import {
    businessYearChangedEvent,
    getSelectedBusinessYear,
} from '@/lib/business-year'
import LayoutBreadcrumbs from './LayoutBreadcrumbs'
import LayoutSidebar from './LayoutSidebar'

const businessYearCheckInterval = 1_000

const parameterLabels: Record<string, string> = {
    bankAccount: 'Bank account', customerId: 'Customer ID', customerName: 'Counterparty',
    statementNumber: 'Statement number', from: 'Date from', invoiceNumber: 'Invoice number',
    quoteNumber: 'Quote number', page: 'Page', pageSize: 'Page size', productCode: 'Product code',
    productName: 'Product name', to: 'Date to',
}
const sortLabels: Record<string, string> = {
    invoiceNumber: 'Invoice number', customer: 'Customer', amount: 'Amount', issueDate: 'Invoice date',
    dueDate: 'Due date', paymentDate: 'Payment date', productCode: 'Product code', name: 'Name', unit: 'Unit',
    netPrice: 'Net price', grossPrice: 'Gross price', taxCode: 'Tax code', taxRate: 'Tax rate',
    customerId: 'Customer ID', address: 'Address', city: 'City', contact: 'Contact', email: 'Email',
    phone: 'Phone', taxNumber: 'Tax number',
}

function parameterLabel(name: string) {
    return parameterLabels[name] ?? name.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/^./, (character) => character.toUpperCase())
}

function breadcrumbLabel(pathname: string) {
    const labels: Record<string, string> = {
        '/bank-statements/search': 'Bank statement search', '/bank-statements/import': 'Import bank statements',
        '/business-years': 'Business years', '/customers/search': 'Customer search', '/invoices/search': 'Invoice search',
        '/price-quotes/search': 'Price quote search', '/products/search': 'Product search', '/export': 'Export data',
    }
    const entities = [
        ['/invoice', 'Invoice'], ['/price-quote', 'Price quote'], ['/product', 'Product'],
        ['/customer', 'Customer'], ['/bank-statement', 'Bank statement'],
    ] as const
    for (const [path, label] of entities) {
        if (pathname === path) return label
        if (pathname.startsWith(`${path}/`)) {
            const encodedValue = pathname.slice(path.length + 1)
            try { return `${label} ${decodeURIComponent(encodedValue)}` } catch { return `${label} ${encodedValue}` }
        }
    }
    return labels[pathname]
}

export default function LayoutPage() {
    const { pathname, search } = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [openedBusinessYear, setOpenedBusinessYear] = useState(getSelectedBusinessYear)
    const [selectedBusinessYear, setSelectedBusinessYear] = useState(getSelectedBusinessYear)
    const [businessYear, setBusinessYear] = useState<number | null>(null)
    const titleLabel = breadcrumbLabel(pathname)
    const businessYearChanged = selectedBusinessYear !== openedBusinessYear

    useEffect(() => {
        const selected = getSelectedBusinessYear()
        setOpenedBusinessYear(selected)
        setSelectedBusinessYear(selected)
    }, [pathname])

    useEffect(() => {
        const controller = new AbortController()
        setBusinessYear(null)
        void fetchBusinessYear(controller.signal, openedBusinessYear)
            .then(setBusinessYear)
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return
                setBusinessYear(null)
            })
        return () => controller.abort()
    }, [openedBusinessYear])

    useEffect(() => {
        const checkBusinessYear = () => setSelectedBusinessYear(getSelectedBusinessYear())
        const acceptBusinessYearChange = (event: Event) => {
            const businessYear = (event as CustomEvent<unknown>).detail
            if (typeof businessYear !== 'string') return
            setOpenedBusinessYear(businessYear)
            setSelectedBusinessYear(businessYear)
        }
        const interval = window.setInterval(checkBusinessYear, businessYearCheckInterval)
        window.addEventListener('storage', checkBusinessYear)
        window.addEventListener('focus', checkBusinessYear)
        window.addEventListener(businessYearChangedEvent, acceptBusinessYearChange)
        return () => {
            window.clearInterval(interval)
            window.removeEventListener('storage', checkBusinessYear)
            window.removeEventListener('focus', checkBusinessYear)
            window.removeEventListener(businessYearChangedEvent, acceptBusinessYearChange)
        }
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(search)
        const details = Array.from(params)
            .filter(([name, value]) => value.trim() !== '' && name !== 'sortBy' && name !== 'sortDirection')
            .map(([name, value]) => `${parameterLabel(name)}: ${value}`)
        const sortBy = params.get('sortBy')
        const direction = params.get('sortDirection')
        if (sortBy && (direction === 'asc' || direction === 'desc')) {
            details.push(`Sort: ${sortLabels[sortBy] ?? sortBy} ${direction === 'asc' ? 'A' : 'D'}`)
        }
        document.title = ['Bureaucracy', businessYear, titleLabel, ...details].filter(Boolean).join(' - ')
    }, [businessYear, titleLabel, search])

    return (
        <TooltipProvider>
            <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <LayoutSidebar pathname={pathname} sidebarOpen={sidebarOpen} />
                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-4 px-4">
                        <SidebarTrigger />
                        <LayoutBreadcrumbs pathname={pathname} />
                    </header>
                    <div className="flex flex-1 flex-col"><Outlet /></div>
                </SidebarInset>
            </SidebarProvider>
            <AlertDialog open={businessYearChanged} onOpenChange={() => undefined}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Business year changed</AlertDialogTitle>
                        <AlertDialogDescription>
                            This page was opened for business year {businessYear ?? openedBusinessYear}.
                            Restore the selected business year to {businessYear ?? openedBusinessYear} to continue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    )
}
