import { ChevronLeft, ChevronRight, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";

type Props = {
    canSave: boolean;
    canRevert: boolean;
    canNavigatePrevious: boolean;
    canNavigateNext: boolean;
    isSaving: boolean;
    onSave: () => void;
    onRevert: () => void;
    onNavigatePrevious: () => void;
    onNavigateNext: () => void;
};

function BankStatementMenu({
    canSave,
    canRevert,
    canNavigatePrevious,
    canNavigateNext,
    isSaving,
    onSave,
    onRevert,
    onNavigatePrevious,
    onNavigateNext,
}: Props) {
    return (
        <div className="mb-6 flex items-center gap-2">
            <Menubar className="w-fit">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem disabled={!canSave} onClick={onSave}>
                            <Save />
                            {isSaving ? "Saving…" : "Save"}
                            <MenubarShortcut>Ctrl+S</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem disabled={!canRevert} onClick={onRevert}>
                            <Undo2 />
                            Revert
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Previous bank statement"
                disabled={!canNavigatePrevious}
                onClick={onNavigatePrevious}
            >
                <ChevronLeft />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next bank statement"
                disabled={!canNavigateNext}
                onClick={onNavigateNext}
            >
                <ChevronRight />
            </Button>
        </div>
    );
}

export default BankStatementMenu;
