import { CalendarRange, FileSearch } from 'lucide-react'
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
    '/invoices/search': 'Invoice search',
}

function LayoutPage() {
    const { pathname } = useLocation()
    const breadcrumbLabel = breadcrumbLabels[pathname]

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
