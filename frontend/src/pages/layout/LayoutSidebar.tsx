import { useEffect, useState } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import {
    CalendarRange,
    ChevronRight,
    FileDown,
    FileText,
    Landmark,
    PackageSearch,
    Plus,
    ReceiptText,
    Search,
    Upload,
    Users,
    type LucideIcon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";

type Section = {
    key: string;
    label: string;
    icon: LucideIcon;
    searchPath: string;
    entityPath?: string;
    entityLabel?: string;
    additionalItem?: { path: string; label: string; icon: LucideIcon };
};

const sections: Section[] = [
    {
        key: "inventory-items",
        label: "Inventory items",
        icon: PackageSearch,
        searchPath: "/inventory-items/search",
        entityPath: "/inventory-item",
        entityLabel: "Inventory item",
    },
    {
        key: "products",
        label: "Products",
        icon: PackageSearch,
        searchPath: "/products/search",
        entityPath: "/product",
        entityLabel: "Product",
    },
    {
        key: "customers",
        label: "Customers",
        icon: Users,
        searchPath: "/customers/search",
        entityPath: "/customer",
        entityLabel: "Customer",
    },
    {
        key: "price-quotes",
        label: "Price quotes",
        icon: ReceiptText,
        searchPath: "/price-quotes/search",
        entityPath: "/price-quote",
        entityLabel: "Price quote",
    },
    {
        key: "invoices",
        label: "Invoices",
        icon: FileText,
        searchPath: "/invoices/search",
        entityPath: "/invoice",
        entityLabel: "Invoice",
    },
    {
        key: "bank-statements",
        label: "Bank statements",
        icon: Landmark,
        searchPath: "/bank-statements/search",
        entityPath: "/bank-statement",
        entityLabel: "Bank statement",
        additionalItem: {
            path: "/bank-statements/import",
            label: "Import",
            icon: Upload,
        },
    },
];

function sectionIsActive(section: Section, pathname: string) {
    return (
        pathname === section.searchPath ||
        (section.entityPath != null &&
            (pathname === section.entityPath ||
                pathname.startsWith(`${section.entityPath}/`))) ||
        pathname === section.additionalItem?.path
    );
}

export default function LayoutSidebar({
    pathname,
    sidebarOpen,
}: {
    pathname: string;
    sidebarOpen: boolean;
}) {
    const navigate = useNavigate();
    const activeSection =
        sections.find((section) => sectionIsActive(section, pathname))?.key ??
        null;
    const [openMenu, setOpenMenu] = useState<string | null>(activeSection);

    useEffect(() => {
        if (activeSection) setOpenMenu(activeSection);
    }, [activeSection]);

    return (
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
                            <span className="font-semibold">Bureaucracy</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <Collapsible.Root
                                        key={section.key}
                                        open={openMenu === section.key}
                                        onOpenChange={(open) => {
                                            if (!sidebarOpen)
                                                return navigate(
                                                    section.searchPath,
                                                );
                                            setOpenMenu(
                                                open ? section.key : null,
                                            );
                                        }}
                                        render={<SidebarMenuItem />}
                                    >
                                        <Collapsible.Trigger
                                            render={
                                                <SidebarMenuButton
                                                    isActive={sectionIsActive(
                                                        section,
                                                        pathname,
                                                    )}
                                                    tooltip={section.label}
                                                    className="cursor-pointer data-open:[&>svg:last-child]:rotate-90"
                                                    render={
                                                        !sidebarOpen ? (
                                                            <NavLink
                                                                to={
                                                                    section.searchPath
                                                                }
                                                            />
                                                        ) : undefined
                                                    }
                                                />
                                            }
                                        >
                                            <Icon />
                                            <span>{section.label}</span>
                                            <ChevronRight className="ml-auto transition-transform" />
                                        </Collapsible.Trigger>
                                        <Collapsible.Panel
                                            render={<SidebarMenuSub />}
                                        >
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    isActive={
                                                        pathname ===
                                                        section.searchPath
                                                    }
                                                    render={
                                                        <NavLink
                                                            to={
                                                                section.searchPath
                                                            }
                                                        />
                                                    }
                                                >
                                                    <Search />
                                                    <span>Search</span>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            {section.entityPath && (
                                                <SidebarMenuSubItem>
                                                    <SidebarMenuSubButton
                                                        isActive={
                                                            pathname ===
                                                            section.entityPath
                                                        }
                                                        render={
                                                            <NavLink
                                                                to={
                                                                    section.entityPath
                                                                }
                                                            />
                                                        }
                                                    >
                                                        <Plus />
                                                        <span>
                                                            {
                                                                section.entityLabel
                                                            }
                                                        </span>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            )}
                                            {section.additionalItem &&
                                                (() => {
                                                    const ItemIcon =
                                                        section.additionalItem
                                                            .icon;
                                                    return (
                                                        <SidebarMenuSubItem>
                                                            <SidebarMenuSubButton
                                                                isActive={
                                                                    pathname ===
                                                                    section
                                                                        .additionalItem
                                                                        .path
                                                                }
                                                                render={
                                                                    <NavLink
                                                                        to={
                                                                            section
                                                                                .additionalItem
                                                                                .path
                                                                        }
                                                                    />
                                                                }
                                                            >
                                                                <ItemIcon />
                                                                <span>
                                                                    {
                                                                        section
                                                                            .additionalItem
                                                                            .label
                                                                    }
                                                                </span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })()}
                                        </Collapsible.Panel>
                                    </Collapsible.Root>
                                );
                            })}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={pathname === "/business-years"}
                                    tooltip="Business years"
                                    render={<NavLink to="/business-years" />}
                                >
                                    <CalendarRange />
                                    <span>Business years</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={pathname === "/export"}
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
    );
}
