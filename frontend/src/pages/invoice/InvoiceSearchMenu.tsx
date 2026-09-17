import { Printer } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from '@/components/ui/menubar'

type InvoiceSearchMenuProps = {
    reportDisabled?: boolean
    remindersDisabled?: boolean
    onPrintReport: () => void
    onPrintReminders: () => void
}

function InvoiceSearchMenu({
    reportDisabled = false,
    remindersDisabled = false,
    onPrintReport,
    onPrintReminders,
}: InvoiceSearchMenuProps) {
    return (
        <Menubar className="mb-6 w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                    <MenubarSub>
                        <MenubarSubTrigger><Printer />Print</MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem disabled={reportDisabled} onClick={onPrintReport}>
                                Report
                                <MenubarShortcut>Ctrl+P</MenubarShortcut>
                            </MenubarItem>
                            <MenubarItem disabled={remindersDisabled} onClick={onPrintReminders}>
                                Reminders
                            </MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default InvoiceSearchMenu
