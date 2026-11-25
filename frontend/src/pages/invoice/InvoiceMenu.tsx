import {
    BadgeCheck,
    Copy,
    Download,
    FileCode2,
    FileMinus2,
    FileOutput,
    Landmark,
    Mail,
    PackageCheck,
    Printer,
    Save,
    Undo2,
} from 'lucide-react'
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

type InvoiceMenuProps = {
    canSave: boolean
    canSaveClosingText: boolean
    canPrint: boolean
    canEmail: boolean
    canExportXml: boolean
    canRevert: boolean
    canDuplicate: boolean
    canConvertToGoodsReceipt: boolean
    isSaving: boolean
    isDuplicating: boolean
    isExportingXml: boolean
    isExportingHalcom: boolean
    canTaxConfirm: boolean
    isTaxConfirming: boolean
    onSave: () => void
    onSaveClosingText: () => void
    onPrint: () => void
    onEmail: () => void
    onExportXml: () => void
    onExportHalcom: () => void
    onRevert: () => void
    onDuplicate: () => void
    onConvertToCreditNote: () => void
    onConvertToDeliveryNote: () => void
    onConvertToGoodsReceipt: () => void
    onTaxConfirm: () => void
}

function InvoiceMenu(props: InvoiceMenuProps) {
    const {
        canSave, canSaveClosingText, canPrint, canEmail, canExportXml, canRevert, canDuplicate, canConvertToGoodsReceipt,
        isSaving, isDuplicating, isExportingXml, isExportingHalcom,
        canTaxConfirm, isTaxConfirming, onSave, onSaveClosingText, onPrint, onEmail,
        onExportXml, onExportHalcom, onRevert, onDuplicate,
        onConvertToCreditNote, onConvertToDeliveryNote, onConvertToGoodsReceipt, onTaxConfirm,
    } = props
    return (
        <Menubar className="w-fit">
            <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent className="min-w-56">
                    <MenubarItem disabled={!canSave || isSaving} onClick={onSave}>
                        <Save />{isSaving ? 'Saving…' : 'Save'}
                        <MenubarShortcut>Ctrl+S</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem className="whitespace-nowrap"
                        disabled={!canSaveClosingText || isSaving} onClick={onSaveClosingText}>
                        <Save />Save closing text only
                    </MenubarItem>
                    <MenubarItem disabled={!canPrint} onClick={onPrint}>
                        <Printer />Print
                        <MenubarShortcut>Ctrl+P</MenubarShortcut>
                    </MenubarItem>
                    <MenubarItem disabled={!canEmail} onClick={onEmail}>
                        <Mail />Send email
                    </MenubarItem>
                    <MenubarSub>
                        <MenubarSubTrigger disabled={!canExportXml}>
                            <Download />Export
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                            <MenubarItem disabled={!canExportXml || isExportingXml} onClick={onExportXml}>
                                <FileCode2 />{isExportingXml ? 'Exporting XML…' : 'XML'}
                            </MenubarItem>
                            <MenubarItem disabled={!canExportXml || isExportingHalcom} onClick={onExportHalcom}>
                                <Landmark />{isExportingHalcom ? 'Exporting Halcom package…' : 'Export for Halcom e-banking'}
                            </MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSub>
                        <MenubarSubTrigger>
                            <FileOutput />Convert
                        </MenubarSubTrigger>
                        <MenubarSubContent className="min-w-56 whitespace-nowrap">
                            <MenubarItem onClick={onConvertToDeliveryNote}>
                                <PackageCheck />Convert to delivery note
                            </MenubarItem>
                            <MenubarItem onClick={onConvertToCreditNote}>
                                <FileMinus2 />Convert to credit note
                            </MenubarItem>
                            <MenubarItem disabled={!canConvertToGoodsReceipt} onClick={onConvertToGoodsReceipt}>
                                <PackageCheck />Convert to goods receipt
                            </MenubarItem>
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarItem disabled={!canTaxConfirm || isTaxConfirming} onClick={onTaxConfirm}>
                        <BadgeCheck />{isTaxConfirming ? 'Tax confirming…' : 'Tax confirmation'}
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent className="min-w-44">
                    <MenubarItem disabled={!canRevert} onClick={onRevert}>
                        <Undo2 />Revert
                    </MenubarItem>
                    <MenubarItem disabled={!canDuplicate || isDuplicating} onClick={onDuplicate}>
                        <Copy />{isDuplicating ? 'Duplicating…' : 'Duplicate'}
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    )
}

export default InvoiceMenu
