import { Printer } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'

type BankStatementSearchMenuProps = {
    reportDisabled: boolean
    onPrintReport: () => void
}

function BankStatementSearchMenu({ reportDisabled, onPrintReport }: BankStatementSearchMenuProps) {
    return (
        <Menubar className="mb-6 w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={reportDisabled} onClick={onPrintReport}>
                        <Printer />
                        Print
                        <MenubarShortcut>Ctrl+P</MenubarShortcut>
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default BankStatementSearchMenu
