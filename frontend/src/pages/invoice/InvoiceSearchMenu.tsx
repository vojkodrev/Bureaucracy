import { Mail, Printer } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'

type InvoiceSearchMenuProps = {
    reportDisabled?: boolean
    remindersDisabled?: boolean
    onPrintReport: () => void
    onPrintReminders: () => void
    onEmailReminders: () => void
}

function InvoiceSearchMenu({
    reportDisabled = false,
    remindersDisabled = false,
    onPrintReport,
    onPrintReminders,
    onEmailReminders,
}: InvoiceSearchMenuProps) {
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
            <MenubarMenu>
                <MenubarTrigger>Reminders</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={remindersDisabled} onClick={onPrintReminders}>
                        <Printer />
                        Print
                    </MenubarItem>
                    <MenubarItem disabled={remindersDisabled} onClick={onEmailReminders}>
                        <Mail />
                        Email
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default InvoiceSearchMenu
