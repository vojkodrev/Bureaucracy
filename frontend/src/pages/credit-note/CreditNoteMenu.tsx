import { Mail, Printer, Save, Undo2 } from 'lucide-react'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar'

type Props = {
    canSave: boolean
    canPrint: boolean
    canRevert: boolean
    isSaving: boolean
    onSave: () => void
    onPrint: () => void
    onEmail: () => void
    onRevert: () => void
}

export default function CreditNoteMenu(props: Props) {
    return (
        <Menubar className="w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent className="min-w-52 whitespace-nowrap">
                    <MenubarItem
                        disabled={!props.canSave || props.isSaving}
                        onClick={props.onSave}
                    >
                        <Save />{props.isSaving ? 'Saving…' : 'Save'}
                        <MenubarShortcut>Ctrl+S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled={!props.canPrint} onClick={props.onPrint}>
                        <Printer />Print
                        <MenubarShortcut>Ctrl+P</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled={!props.canPrint} onClick={props.onEmail}>
                        <Mail />Send email
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem disabled={!props.canRevert} onClick={props.onRevert}>
                        <Undo2 />Revert
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}
