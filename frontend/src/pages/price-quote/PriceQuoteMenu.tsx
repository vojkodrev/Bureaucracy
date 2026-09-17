import { Copy, Printer, Save, Undo2 } from 'lucide-react'
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
}

export default function PriceQuoteMenu(props: Props) {
    return (
        <Menubar className="w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
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
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem
                        disabled={!props.canRevert}
                        onClick={props.onRevert}
                    >
                        <Undo2 />
                        Revert
                    </MenubarItem>
                    <MenubarItem
                        disabled={!props.canDuplicate || props.isDuplicating}
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
