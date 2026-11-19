import { Copy, FileOutput, PackageCheck, Printer, Receipt, Save, Undo2 } from 'lucide-react'
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

type Props = {
    canSave: boolean
    canPrint: boolean
    canRevert: boolean
    canDuplicate: boolean
    canConvertToGoodsReceipt: boolean
    isSaving: boolean
    isDuplicating: boolean
    onSave: () => void
    onPrint: () => void
    onRevert: () => void
    onDuplicate: () => void
    onConvertToInvoice: () => void
    onConvertToGoodsReceipt: () => void
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
                    <MenubarSub>
                        <MenubarSubTrigger>
                            <FileOutput />
                            Convert
                        </MenubarSubTrigger>
                        <MenubarSubContent className="min-w-56 whitespace-nowrap">
                            <MenubarItem onClick={props.onConvertToInvoice}>
                                <Receipt />
                                Convert to invoice
                            </MenubarItem>
                            <MenubarItem
                                disabled={!props.canConvertToGoodsReceipt}
                                onClick={props.onConvertToGoodsReceipt}
                            >
                                <PackageCheck />
                                Convert to goods receipt
                            </MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
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
