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
    canNavigatePreviousDate: boolean;
    canNavigateNextDate: boolean;
    isSaving: boolean;
    onSave: () => void;
    onRevert: () => void;
    onNavigatePreviousDate: () => void;
    onNavigateNextDate: () => void;
};

function BankStatementMenu({
    canSave,
    canRevert,
    canNavigatePreviousDate,
    canNavigateNextDate,
    isSaving,
    onSave,
    onRevert,
    onNavigatePreviousDate,
    onNavigateNextDate,
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
                aria-label="Previous day"
                title="Previous day"
                disabled={!canNavigatePreviousDate}
                onClick={onNavigatePreviousDate}
            >
                <ChevronLeft />
            </Button>
            <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Next day"
                title="Next day"
                disabled={!canNavigateNextDate}
                onClick={onNavigateNextDate}
            >
                <ChevronRight />
            </Button>
        </div>
    );
}

export default BankStatementMenu;
