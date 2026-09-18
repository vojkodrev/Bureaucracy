import { useNavigate, useParams } from "react-router-dom";
import BankStatementErrors from "./BankStatementErrors";
import BankStatementGeneralInformation from "./BankStatementGeneralInformation";
import BankStatementMenu from "./BankStatementMenu";
import BankStatementNumberAlert from "./BankStatementNumberAlert";
import BankStatementSummary from "./BankStatementSummary";
import StatementTransactions from "./StatementTransactions";
import UnsavedBankStatementAlerts from "./UnsavedBankStatementAlerts";
import { useBankStatementDraft } from "./hooks/useBankStatementDraft";
import { useBankStatementKeyboardShortcuts } from "./hooks/useBankStatementKeyboardShortcuts";
import { useBankStatementLoader } from "./hooks/useBankStatementLoader";
import { useBankStatementNumberNavigation } from "./hooks/useBankStatementNumberNavigation";
import { useBankStatementRevert } from "./hooks/useBankStatementRevert";
import { useBankStatementSave } from "./hooks/useBankStatementSave";
import { useUnsavedBankStatementGuard } from "./hooks/useUnsavedBankStatementGuard";

function BankStatementPage() {
    const { statementNumber: routeStatementNumberParam } = useParams();
    const routeStatementNumber = routeStatementNumberParam
        ? Number(routeStatementNumberParam)
        : null;
    const navigate = useNavigate();
    const draftState = useBankStatementDraft();
    const { draft, setDraft, setField } = draftState;
    const guard = useUnsavedBankStatementGuard(draftState.hasUnsavedChanges);
    const loader = useBankStatementLoader({
        routeStatementNumber,
        replaceDraft: setDraft,
        markClean: draftState.markClean,
        setCleanField: draftState.setCleanField,
        disallowNavigation: guard.disallowNavigation,
    });
    const navigation = useBankStatementNumberNavigation(routeStatementNumber, navigate);
    const save = useBankStatementSave({
        statementId: loader.statementId,
        draft,
        routeStatementNumber,
        isLoading: loader.isLoading,
        loadError: loader.error,
        navigate,
        markClean: draftState.markClean,
        allowNavigation: guard.allowNavigation,
        reloadAfterSave: loader.reloadAfterSave,
    });
    const revert = useBankStatementRevert({
        routeStatementNumber,
        hasUnsavedChanges: draftState.hasUnsavedChanges,
        isLoading: loader.isLoading,
        isSaving: save.isSaving,
        clearSaveError: () => save.setSaveError(null),
        reload: loader.reload,
    });
    useBankStatementKeyboardShortcuts(() => { void save.requestSave(); });

    return (
        <div className="max-w-5xl p-4">
            <BankStatementErrors
                loadError={loader.error}
                navigationError={navigation.latestStatementNumberError}
                nextNumberError={loader.requestErrors.nextStatementNumber ?? null}
                latestNumberError={save.latestNumberError}
                saveError={save.saveError}
            />
            <BankStatementMenu
                canSave={save.canSave && !save.isSaving}
                canRevert={revert.canRevert}
                canNavigatePrevious={navigation.canNavigatePrevious}
                canNavigateNext={navigation.canNavigateNext}
                isSaving={save.isSaving}
                onSave={() => { void save.requestSave(); }}
                onRevert={revert.requestRevert}
                onNavigatePrevious={navigation.navigatePrevious}
                onNavigateNext={navigation.navigateNext}
            />
            <BankStatementGeneralInformation
                statementNumber={draft.statementNumber}
                statementDate={draft.statementDate}
                bankAccount={draft.bankAccount}
                selectDefaultAccount={routeStatementNumber === null}
                onStatementNumberChange={(value) => setField("statementNumber", value)}
                onStatementDateChange={(value) => setField("statementDate", value)}
                onBankAccountChange={(value) => setField("bankAccount", value)}
                onDefaultBankAccountChange={(value) =>
                    draftState.setCleanField("bankAccount", value)}
            />
            <StatementTransactions
                entries={draft.entries}
                statementDate={draft.statementDate}
                onChange={draftState.setEntries}
            />
            <BankStatementSummary entries={draft.entries} />
            <UnsavedBankStatementAlerts
                isNavigationBlocked={guard.blocker.state === "blocked"}
                isConfirmingRevert={revert.confirmingRevert}
                onCancelNavigation={() => {
                    if (guard.blocker.state === "blocked") guard.blocker.reset();
                }}
                onDiscardAndNavigate={guard.discardAndNavigate}
                onConfirmingRevertChange={revert.setConfirmingRevert}
                onDiscardAndRevert={revert.performRevert}
            />
            <BankStatementNumberAlert
                warning={save.numberWarning}
                onOpenChange={(open) => {
                    if (!open) save.setNumberWarning(null);
                }}
                onConfirm={() => { void save.confirmSave(); }}
            />
        </div>
    );
}

export default BankStatementPage;
