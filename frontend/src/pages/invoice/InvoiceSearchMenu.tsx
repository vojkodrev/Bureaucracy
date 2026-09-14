import { Printer } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'

type InvoiceSearchMenuProps = {
    onPrint: () => void
}

function InvoiceSearchMenu({ onPrint }: InvoiceSearchMenuProps) {
    return (
        <Menubar className="mb-6 w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onClick={onPrint}>
                        <Printer />Print
                        <MenubarShortcut>Ctrl+P</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default InvoiceSearchMenu
