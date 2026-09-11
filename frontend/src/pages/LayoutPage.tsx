import { useEffect, useState } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'
import {
    CalendarRange,
    ChevronRight,
    FileText,
    FileDown,
    Landmark,
    PackageSearch,
    Plus,
    Search,
    Users,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

const breadcrumbLabels: Record<string, string> = {
    '/bank-statements/search': 'Bank statement search',
    '/business-years': 'Business years',
    '/customers/search': 'Customer search',
    '/invoices/search': 'Invoice search',
    '/products/search': 'Product search',
    '/export': 'Export data',
}

const searchParameterLabels: Record<string, string> = {
    bankAccount: 'Bank account',
    customerId: 'Customer ID',
    customerName: 'Counterparty',
    statementNumber: 'Statement number',
    from: 'Date from',
    invoiceNumber: 'Invoice number',
    page: 'Page',
    pageSize: 'Page size',
    productCode: 'Product code',
    productName: 'Product name',
    to: 'Date to',
}

const searchParameterValues: Record<string, Record<string, string>> = {
    sortBy: {
        invoiceNumber: 'Invoice number',
        customer: 'Customer',
        amount: 'Amount',
        issueDate: 'Invoice date',
        dueDate: 'Due date',
        paymentDate: 'Payment date',
        productCode: 'Product code',
        name: 'Name',
        unit: 'Unit',
        netPrice: 'Net price',
        grossPrice: 'Gross price',
        taxCode: 'Tax code',
        taxRate: 'Tax rate',
        customerId: 'Customer ID',
        address: 'Address',
        city: 'City',
        contact: 'Contact',
        email: 'Email',
        phone: 'Phone',
        taxNumber: 'Tax number',
    },
}

const menuDefaultRoutes: Record<string, string> = {
    products: '/products/search',
    customers: '/customers/search',
    invoices: '/invoices/search',
    'bank-statements': '/bank-statements/search',
}

function searchParameterLabel(name: string): string {
    return (
        searchParameterLabels[name] ??
        name
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/^./, (character) => character.toUpperCase())
    )
}

function searchParameterValue(name: string, value: string): string {
    return searchParameterValues[name]?.[value] ?? value
}

function invoiceNumberFromPathname(pathname: string): string | undefined {
    if (!pathname.startsWith('/invoice/')) {
        return undefined
    }

    const invoiceNumber = pathname.slice('/invoice/'.length)
    try {
        return decodeURIComponent(invoiceNumber)
    } catch {
        return invoiceNumber
    }
}

function productCodeFromPathname(pathname: string): string | undefined {
    if (!pathname.startsWith('/product/')) return undefined
    const productCode = pathname.slice('/product/'.length)
    try {
        return decodeURIComponent(productCode)
    } catch {
        return productCode
    }
}

function customerIdFromPathname(pathname: string): string | undefined {
    if (!pathname.startsWith('/customer/')) return undefined
    const customerId = pathname.slice('/customer/'.length)
    try {
        return decodeURIComponent(customerId)
    } catch {
        return customerId
    }
}

function bankStatementNumberFromPathname(pathname: string): string | undefined {
    return pathname.startsWith('/bank-statement/') ? pathname.slice('/bank-statement/'.length) : undefined
}

function LayoutPage() {
    const { pathname, search } = useLocation()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const invoiceNumber = invoiceNumberFromPathname(pathname)
    const isInvoicePage = pathname === '/invoice' || Boolean(invoiceNumber)
    const productCode = productCodeFromPathname(pathname)
    const isProductPage = pathname === '/product' || Boolean(productCode)
    const customerId = customerIdFromPathname(pathname)
    const isCustomerPage = pathname === '/customer' || Boolean(customerId)
    const bankStatementNumber = bankStatementNumberFromPathname(pathname)
    const isBankStatementPage = pathname === '/bank-statement' || Boolean(bankStatementNumber)
    const [openMenu, setOpenMenu] = useState<string | null>(() =>
        pathname === '/customers/search' || isCustomerPage
            ? 'customers'
            : pathname === '/products/search' || isProductPage
            ? 'products'
            : pathname === '/invoices/search' || isInvoicePage
                ? 'invoices'
                : pathname === '/bank-statements/search' || isBankStatementPage
                    ? 'bank-statements'
                : null,
    )
    const collapsibleMenuProps = (menu: string) => ({
        open: openMenu === menu,
        onOpenChange: (open: boolean) => {
            if (!sidebarOpen) {
                navigate(menuDefaultRoutes[menu])
                return
            }

            setOpenMenu(open ? menu : null)
        },
    })
    const breadcrumbLabel =
        breadcrumbLabels[pathname] ??
        (invoiceNumber ? `Invoice ${invoiceNumber}` : undefined) ??
        (isInvoicePage ? 'Invoice' : undefined) ??
        (productCode ? `Product ${productCode}` : undefined) ??
        (isProductPage ? 'Product' : undefined) ??
        (customerId ? `Customer ${customerId}` : undefined) ??
        (isCustomerPage ? 'Customer' : undefined)
        ?? (bankStatementNumber ? `Bank statement ${bankStatementNumber}` : undefined)
        ?? (isBankStatementPage ? 'Bank statement' : undefined)

    useEffect(() => {
        const searchParams = new URLSearchParams(search)
        const searchDetails = Array.from(searchParams)
            .filter(
                ([name, value]) =>
                    value.trim() !== '' &&
                    name !== 'sortBy' &&
                    name !== 'sortDirection',
            )
            .map(
                ([name, value]) =>
                    `${searchParameterLabel(name)}: ${searchParameterValue(name, value)}`,
            )
        const sortBy = searchParams.get('sortBy')
        const sortDirection = searchParams.get('sortDirection')
        if (sortBy && (sortDirection === 'asc' || sortDirection === 'desc')) {
            searchDetails.push(
                `Sort: ${searchParameterValue('sortBy', sortBy)} ${sortDirection === 'asc' ? 'A' : 'D'}`,
            )
        }
        document.title = ['Bureaucracy', breadcrumbLabel, ...searchDetails]
            .filter(Boolean)
            .join(' - ')
    }, [breadcrumbLabel, search])

    useEffect(() => {
        if (pathname === '/customers/search' || isCustomerPage) {
            setOpenMenu('customers')
        } else if (pathname === '/products/search' || isProductPage) {
            setOpenMenu('products')
        } else if (pathname === '/invoices/search' || isInvoicePage) {
            setOpenMenu('invoices')
        } else if (
            pathname === '/bank-statements/search' ||
            isBankStatementPage
        ) {
            setOpenMenu('bank-statements')
        }
    }, [isBankStatementPage, isCustomerPage, isInvoicePage, isProductPage, pathname])

    return (
        <TooltipProvider>
            <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <Sidebar collapsible="icon">
                    <SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    tooltip="Bureaucracy"
                                    render={<NavLink to="/invoices/search" />}
                                >
                                    <img
                                        src="/favicon.svg"
                                        alt="Bureaucracy logo"
                                        className="size-8 rounded-lg"
                                    />
                                    <span className="font-semibold">
                                        Bureaucracy
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <Collapsible.Root
                                        {...collapsibleMenuProps('products')}
                                        render={<SidebarMenuItem />}
                                    >
                                        <Collapsible.Trigger
                                            render={
                                                <SidebarMenuButton
                                                    isActive={pathname === '/products/search' || isProductPage}
                                                    tooltip="Products"
                                                    className="data-open:[&>svg:last-child]:rotate-90"
                                                    render={
                                                        !sidebarOpen
                                                            ? <NavLink to="/products/search" />
                                                            : undefined
                                                    }
                                                />
                                            }
                                        >
                                            <PackageSearch />
                                            <span>Products</span>
                                            <ChevronRight className="ml-auto transition-transform" />
                                        </Collapsible.Trigger>
                                        <Collapsible.Panel render={<SidebarMenuSub />}>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={pathname === '/products/search'}
                                                    render={<NavLink to="/products/search" />}
                                                >
                                                    <Search />
                                                    <span>Search</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={pathname === '/product'}
                                                    render={<NavLink to="/product" />}
                                                >
                                                    <Plus />
                                                    <span>Product</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </Collapsible.Panel>
                                    </Collapsible.Root>
                                    <Collapsible.Root
                                        {...collapsibleMenuProps('customers')}
                                        render={<SidebarMenuItem />}
                                    >
                                        <Collapsible.Trigger
                                            render={
                                                <SidebarMenuButton
                                                    isActive={pathname === '/customers/search' || isCustomerPage}
                                                    tooltip="Customers"
                                                    className="data-open:[&>svg:last-child]:rotate-90"
                                                    render={
                                                        !sidebarOpen
                                                            ? <NavLink to="/customers/search" />
                                                            : undefined
                                                    }
                                                />
                                            }
                                        >
                                            <Users />
                                            <span>Customers</span>
                                            <ChevronRight className="ml-auto transition-transform" />
                                        </Collapsible.Trigger>
                                        <Collapsible.Panel render={<SidebarMenuSub />}>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton isActive={pathname === '/customers/search'} render={<NavLink to="/customers/search" />}>
                                                    <Search />
                                                    <span>Search</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton isActive={pathname === '/customer'} render={<NavLink to="/customer" />}>
                                                    <Plus />
                                                    <span>Customer</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </Collapsible.Panel>
                                    </Collapsible.Root>
                                    <Collapsible.Root
                                        {...collapsibleMenuProps('invoices')}
                                        render={<SidebarMenuItem />}
                                    >
                                        <Collapsible.Trigger
                                            render={
                                                <SidebarMenuButton
                                                    isActive={
                                                        pathname ===
                                                        '/invoices/search' ||
                                                        isInvoicePage
                                                    }
                                                    tooltip="Invoices"
                                                    className="data-open:[&>svg:last-child]:rotate-90"
                                                    render={
                                                        !sidebarOpen
                                                            ? <NavLink to="/invoices/search" />
                                                            : undefined
                                                    }
                                                />
                                            }
                                        >
                                            <FileText />
                                            <span>Invoices</span>
                                            <ChevronRight className="ml-auto transition-transform" />
                                        </Collapsible.Trigger>
                                        <Collapsible.Panel render={<SidebarMenuSub />}>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={
                                                        pathname ===
                                                        '/invoices/search'
                                                    }
                                                    render={
                                                        <NavLink to="/invoices/search" />
                                                    }
                                                >
                                                    <Search />
                                                    <span>Search</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={
                                                        pathname === '/invoice'
                                                    }
                                                    render={
                                                        <NavLink to="/invoice" />
                                                    }
                                                >
                                                    <Plus />
                                                    <span>Invoice</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </Collapsible.Panel>
                                    </Collapsible.Root>
                                    <Collapsible.Root
                                        {...collapsibleMenuProps('bank-statements')}
                                        render={<SidebarMenuItem />}
                                    >
                                        <Collapsible.Trigger
                                            render={
                                                <SidebarMenuButton
                                                    isActive={
                                                        pathname ===
                                                        '/bank-statements/search' ||
                                                        isBankStatementPage
                                                    }
                                                    tooltip="Bank statements"
                                                    className="data-open:[&>svg:last-child]:rotate-90"
                                                    render={
                                                        !sidebarOpen
                                                            ? <NavLink to="/bank-statements/search" />
                                                            : undefined
                                                    }
                                                />
                                            }
                                        >
                                            <Landmark />
                                            <span>Bank statements</span>
                                            <ChevronRight className="ml-auto transition-transform" />
                                        </Collapsible.Trigger>
                                        <Collapsible.Panel render={<SidebarMenuSub />}>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={
                                                        pathname ===
                                                        '/bank-statements/search'
                                                    }
                                                    render={
                                                        <NavLink to="/bank-statements/search" />
                                                    }
                                                >
                                                    <Search />
                                                    <span>Search</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={
                                                        pathname ===
                                                        '/bank-statement'
                                                    }
                                                    render={
                                                        <NavLink to="/bank-statement" />
                                                    }
                                                >
                                                    <Plus />
                                                    <span>Bank statement</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </Collapsible.Panel>
                                    </Collapsible.Root>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={
                                                pathname === '/business-years'
                                            }
                                            tooltip="Business years"
                                            render={
                                                <NavLink to="/business-years" />
                                            }
                                        >
                                            <CalendarRange />
                                            <span>Business years</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={pathname === '/export'}
                                            tooltip="Export data"
                                            render={<NavLink to="/export" />}
                                        >
                                            <FileDown />
                                            <span>Export data</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarRail />
                </Sidebar>

                <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-4 px-4">
                        <SidebarTrigger />
                        {breadcrumbLabel && (
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {isInvoicePage ? (
                                        <>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink
                                                    render={<NavLink to="/invoices/search" />}
                                                >
                                                    Invoice search
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                {invoiceNumber ? (
                                                    <BreadcrumbLink
                                                        render={<NavLink to="/invoice" />}
                                                    >
                                                        Invoice
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage>
                                                        Invoice
                                                    </BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {invoiceNumber && (
                                                <>
                                                    <BreadcrumbSeparator />
                                                    <BreadcrumbItem>
                                                        <BreadcrumbPage>
                                                            {invoiceNumber}
                                                        </BreadcrumbPage>
                                                    </BreadcrumbItem>
                                                </>
                                            )}
                                        </>
                                    ) : isProductPage ? (
                                        <>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink render={<NavLink to="/products/search" />}>
                                                    Product search
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                {productCode ? (
                                                    <BreadcrumbLink render={<NavLink to="/product" />}>
                                                        Product
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage>Product</BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {productCode && (
                                                <>
                                                    <BreadcrumbSeparator />
                                                    <BreadcrumbItem>
                                                        <BreadcrumbPage>{productCode}</BreadcrumbPage>
                                                    </BreadcrumbItem>
                                                </>
                                            )}
                                        </>
                                    ) : isCustomerPage ? (
                                        <>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink render={<NavLink to="/customers/search" />}>
                                                    Customer search
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                {customerId ? (
                                                    <BreadcrumbLink render={<NavLink to="/customer" />}>
                                                        Customer
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage>Customer</BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {customerId && (
                                                <>
                                                    <BreadcrumbSeparator />
                                                    <BreadcrumbItem>
                                                        <BreadcrumbPage>{customerId}</BreadcrumbPage>
                                                    </BreadcrumbItem>
                                                </>
                                            )}
                                        </>
                                    ) : isBankStatementPage ? (
                                        <>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink
                                                    render={<NavLink to="/bank-statements/search" />}
                                                >
                                                    Bank statement search
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                {bankStatementNumber ? (
                                                    <BreadcrumbLink
                                                        render={<NavLink to="/bank-statement" />}
                                                    >
                                                        Bank statement
                                                    </BreadcrumbLink>
                                                ) : (
                                                    <BreadcrumbPage>
                                                        Bank statement
                                                    </BreadcrumbPage>
                                                )}
                                            </BreadcrumbItem>
                                            {bankStatementNumber && (
                                                <>
                                                    <BreadcrumbSeparator />
                                                    <BreadcrumbItem>
                                                        <BreadcrumbPage>
                                                            {bankStatementNumber}
                                                        </BreadcrumbPage>
                                                    </BreadcrumbItem>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>
                                                {breadcrumbLabel}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    )}
                                </BreadcrumbList>
                            </Breadcrumb>
                        )}
                    </header>
                    <div className="flex flex-1 flex-col">
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    )
}

export default LayoutPage
