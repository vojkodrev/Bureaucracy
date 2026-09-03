import { useEffect } from 'react'
import { CalendarRange, FileSearch, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
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
}

const searchParameterLabels: Record<string, string> = {
    customerId: 'Customer ID',
    customerName: 'Customer name',
    from: 'Invoice date from',
    invoiceNumber: 'Invoice number',
    page: 'Page',
    pageSize: 'Page size',
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

function LayoutPage() {
    const { pathname, search } = useLocation()
    const breadcrumbLabel = breadcrumbLabels[pathname]

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
                                                '/invoices/search'
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
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>
                                            {breadcrumbLabel}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
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
