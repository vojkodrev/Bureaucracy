import { Copy, FileOutput, Printer, Save, Undo2 } from 'lucide-react'
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
    canDuplicate: boolean
    isSaving: boolean
    isDuplicating: boolean
    onSave: () => void
    onPrint: () => void
    onRevert: () => void
    onDuplicate: () => void
    onConvertToInvoice: () => void
}

export default function DeliveryNoteMenu(props: Props) {
    return (
        <Menubar className="w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent className="min-w-52 whitespace-nowrap">
                    <MenubarItem
                        disabled={!props.canSave || props.isSaving}
                        onClick={props.onSave}
                    >
                        <Save />
                        {props.isSaving ? 'Saving…' : 'Save'}
                        <MenubarShortcut>Ctrl+S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem
                        disabled={!props.canPrint}
                        onClick={props.onPrint}
                    >
                        <Printer />
                        Print
                        <MenubarShortcut>Ctrl+P</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem onClick={props.onConvertToInvoice}>
                        <FileOutput />
                        Convert to invoice
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent className="min-w-52 whitespace-nowrap">
                    <MenubarItem
                        disabled={!props.canRevert}
                        onClick={props.onRevert}
                    >
                        <Undo2 />
                        Revert
                    </MenubarItem>
                    <MenubarItem
                        disabled={
                            !props.canDuplicate || props.isDuplicating
                        }
                        onClick={props.onDuplicate}
                    >
                        <Copy />
                        {props.isDuplicating ? 'Duplicating…' : 'Duplicate'}
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}
