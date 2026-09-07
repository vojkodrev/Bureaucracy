import { Printer, Save, Undo2 } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar'

type InvoiceMenuProps = {
    canPrint: boolean
    canRevert: boolean
    onPrint: () => void
    onRevert: () => void
}

function InvoiceMenu({ canPrint, canRevert, onPrint, onRevert }: InvoiceMenuProps) {
    return (
        <Menubar className="mb-6 w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled><Save />Save</MenubarItem>
                    <MenubarItem disabled={!canPrint} onClick={onPrint}>
                        <Printer />Print
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={!canRevert} onClick={onRevert}>
                        <Undo2 />Revert
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default InvoiceMenu
