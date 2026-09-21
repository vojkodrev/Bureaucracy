import CustomerSearch from '@/components/customer-search/CustomerSearch'
import { ComponentMode } from '@/lib/component-mode'

function CustomerSearchPage() {
    return <CustomerSearch mode={ComponentMode.Page} />
}

export default CustomerSearchPage
