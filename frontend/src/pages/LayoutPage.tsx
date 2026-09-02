import { NavLink, Outlet, useLocation } from 'react-router-dom'

type NavigationItem = {
    label: string
    to?: string
    children?: {
        label: string
        to: string
    }[]
}

const navigation: NavigationItem[] = [
    {
        label: 'Invoices',
        children: [
            { label: 'Search', to: '/invoices/search' },
            { label: 'New invoice', to: '/invoice' },
        ],
    },
    { label: 'Products', to: '/products' },
]

function LayoutPage() {
    const { pathname } = useLocation()

    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-950">
            <header className="flex h-16 items-center border-b border-zinc-200 bg-white px-6">
                <NavLink
                    to="/invoices/search"
                    aria-label="Bureaucracy home"
                    className="flex size-9 items-center justify-center rounded-lg bg-zinc-900 text-lg font-bold text-white"
                >
                    B
                </NavLink>
            </header>

            <div className="flex min-h-[calc(100vh-4rem)]">
                <aside className="w-64 border-r border-zinc-200 bg-white p-4">
                    <nav className="space-y-1" aria-label="Main navigation">
                        {navigation.map((item) => {
                            if (item.children) {
                                const isActive = item.children.some(({ to }) =>
                                    pathname === to || pathname.startsWith(`${to}/`),
                                )

                                return (
                                    <div key={item.label}>
                                        <div
                                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                                isActive ? 'text-zinc-950' : 'text-zinc-600'
                                            }`}
                                        >
                                            {item.label}
                                        </div>
                                        <div className="ml-3 space-y-1 border-l border-zinc-200 pl-3">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.to}
                                                    to={child.to}
                                                    end
                                                    className={({ isActive: isChildActive }) =>
                                                        `block rounded-lg px-3 py-2 text-sm ${
                                                            isChildActive
                                                                ? 'bg-zinc-100 font-medium text-zinc-950'
                                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                                                        }`
                                                    }
                                                >
                                                    {child.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to!}
                                    className={({ isActive }) =>
                                        `block rounded-lg px-3 py-2 text-sm font-medium ${
                                            isActive
                                                ? 'bg-zinc-100 text-zinc-950'
                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            )
                        })}
                    </nav>
                </aside>

                <main className="flex-1 p-2 sm:p-3">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default LayoutPage
