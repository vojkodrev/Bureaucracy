import { useEffect, useState } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import {
    CalendarRange,
    ChevronsUpDown,
    ChevronRight,
    FileDown,
    FileText,
    Landmark,
    LogOut,
    PackageCheck,
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
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAuthUser, logout } from "@/lib/auth";

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
        key: "goods-receipts",
        label: "Goods receipts",
        icon: PackageCheck,
        searchPath: "/goods-receipts/search",
        entityPath: "/goods-receipt",
        entityLabel: "Goods receipt",
    },
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

const sectionGroups = [
    {
        label: "Billing",
        sectionKeys: ["customers", "products", "price-quotes", "invoices"],
    },
    {
        label: "Storage",
        sectionKeys: ["inventory-items", "goods-receipts"],
    },
    { label: "Accounting", sectionKeys: ["bank-statements"] },
] as const;

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
    const user = getAuthUser();
    const initials = user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

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
                {sectionGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.sectionKeys.map((sectionKey) => {
                                    const section = sections.find(
                                        ({ key }) => key === sectionKey,
                                    )!;
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
                                {group.label === "Accounting" && (
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
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
                <SidebarGroup>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
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
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <SidebarMenuButton
                                        size="lg"
                                        tooltip={user.name}
                                        className="cursor-pointer data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                                    />
                                }
                            >
                                {user.picture ? (
                                    <img
                                        src={user.picture}
                                        alt=""
                                        className="size-8 rounded-lg object-cover"
                                    />
                                ) : (
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                                        {initials || "U"}
                                    </span>
                                )}
                                <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>
                                    {user.email && (
                                        <span className="truncate text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                    )}
                                </span>
                                <ChevronsUpDown className="ml-auto" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="min-w-56"
                            >
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="flex items-center gap-2 p-2 font-normal">
                                        {user.picture ? (
                                            <img
                                                src={user.picture}
                                                alt=""
                                                className="size-8 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                                                {initials || "U"}
                                            </span>
                                        )}
                                        <span className="grid min-w-0 flex-1 leading-tight">
                                            <span className="truncate font-medium text-foreground">
                                                {user.name}
                                            </span>
                                            {user.email && (
                                                <span className="truncate text-xs">
                                                    {user.email}
                                                </span>
                                            )}
                                        </span>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
