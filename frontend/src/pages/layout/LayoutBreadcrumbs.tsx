import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const labels: Record<string, string> = {
    '/bank-statements/search': 'Bank statement search', '/bank-statements/import': 'Import bank statements',
    '/business-years': 'Business years', '/customers/search': 'Customer search',
    '/inventory-items/search': 'Inventory item search', '/invoices/search': 'Invoice search',
    '/price-quotes/search': 'Price quote search',
    '/products/search': 'Product search', '/export': 'Export data',
}
type Entity = { searchPath: string; searchLabel: string; editPath: string; editLabel: string; value?: string }
type BreadcrumbContext = { label?: string; entity?: Entity }

function pathValue(pathname: string, prefix: string) {
    if (!pathname.startsWith(prefix)) return undefined
    const value = pathname.slice(prefix.length)
    try { return decodeURIComponent(value) } catch { return value }
}

function getBreadcrumbContext(pathname: string): BreadcrumbContext {
    const entities = [
        { prefix: '/invoice/', editPath: '/invoice', editLabel: 'Invoice', searchPath: '/invoices/search', searchLabel: 'Invoice search' },
        { prefix: '/price-quote/', editPath: '/price-quote', editLabel: 'Price quote', searchPath: '/price-quotes/search', searchLabel: 'Price quote search' },
        { prefix: '/product/', editPath: '/product', editLabel: 'Product', searchPath: '/products/search', searchLabel: 'Product search' },
        { prefix: '/customer/', editPath: '/customer', editLabel: 'Customer', searchPath: '/customers/search', searchLabel: 'Customer search' },
        { prefix: '/bank-statement/', editPath: '/bank-statement', editLabel: 'Bank statement', searchPath: '/bank-statements/search', searchLabel: 'Bank statement search' },
    ]
    for (const entity of entities) {
        const value = pathValue(pathname, entity.prefix)
        if (pathname === entity.editPath || value !== undefined) {
            return { label: value ? `${entity.editLabel} ${value}` : entity.editLabel, entity: { ...entity, value } }
        }
    }
    return { label: labels[pathname] }
}

export default function LayoutBreadcrumbs({ pathname }: { pathname: string }) {
    const context = getBreadcrumbContext(pathname)
    if (!context.label) return null
    const { entity } = context
    return (
        <Breadcrumb><BreadcrumbList>
            {entity ? <>
                <BreadcrumbItem><BreadcrumbLink render={<NavLink to={entity.searchPath} />}>{entity.searchLabel}</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>{entity.value
                    ? <BreadcrumbLink render={<NavLink to={entity.editPath} />}>{entity.editLabel}</BreadcrumbLink>
                    : <BreadcrumbPage>{entity.editLabel}</BreadcrumbPage>}
                </BreadcrumbItem>
                {entity.value && <Fragment><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{entity.value}</BreadcrumbPage></BreadcrumbItem></Fragment>}
            </> : <BreadcrumbItem><BreadcrumbPage>{context.label}</BreadcrumbPage></BreadcrumbItem>}
        </BreadcrumbList></Breadcrumb>
    )
}
