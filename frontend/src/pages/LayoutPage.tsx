import { useEffect } from 'react'
import { CalendarRange, FileSearch, PackageSearch, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

const breadcrumbLabels: Record<string, string> = {
    '/business-years': 'Business years',
    '/customers/search': 'Customer search',
    '/invoices/search': 'Invoice search',
    '/products/search': 'Product search',
}

const searchParameterLabels: Record<string, string> = {
    customerId: 'Customer ID',
    customerName: 'Customer name',
    from: 'Invoice date from',
    invoiceNumber: 'Invoice number',
    page: 'Page',
    pageSize: 'Page size',
    productCode: 'Product code',
    productName: 'Product name',
    to: 'Invoice date to',
}

function searchParameterLabel(name: string): string {
    return (
        searchParameterLabels[name] ??
        name
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/^./, (character) => character.toUpperCase())
    )
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

function LayoutPage() {
    const { pathname, search } = useLocation()
    const invoiceNumber = invoiceNumberFromPathname(pathname)
    const isInvoicePage = pathname === '/invoice' || Boolean(invoiceNumber)
    const breadcrumbLabel =
        breadcrumbLabels[pathname] ??
        (invoiceNumber ? `Invoice ${invoiceNumber}` : undefined) ??
        (isInvoicePage ? 'Invoice' : undefined)

    useEffect(() => {
        const searchDetails = Array.from(new URLSearchParams(search))
            .filter(([, value]) => value.trim() !== '')
            .map(
                ([name, value]) =>
                    `${searchParameterLabel(name)}: ${value}`,
            )
        document.title = ['Bureaucracy', breadcrumbLabel, ...searchDetails]
            .filter(Boolean)
            .join(' - ')
    }, [breadcrumbLabel, search])

    return (
        <TooltipProvider>
            <SidebarProvider>
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
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={
                                                pathname ===
                                                '/products/search'
                                            }
                                            tooltip="Product search"
                                            render={
                                                <NavLink to="/products/search" />
                                            }
                                        >
                                            <PackageSearch />
                                            <span>Product search</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={
                                                pathname ===
                                                '/customers/search'
                                            }
                                            tooltip="Customer search"
                                            render={
                                                <NavLink to="/customers/search" />
                                            }
                                        >
                                            <Users />
                                            <span>Customer search</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={
                                                pathname ===
                                                '/invoices/search' ||
                                                isInvoicePage
                                            }
                                            tooltip="Invoice search"
                                            render={
                                                <NavLink to="/invoices/search" />
                                            }
                                        >
                                            <FileSearch />
                                            <span>Invoice search</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
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
