import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

export function useUnsavedDeliveryNoteGuard(
    hasUnsavedChanges: boolean,
) {
    const allowNextNavigation = useRef(false)
    const blocker = useBlocker(({ currentLocation, nextLocation }) => (
        !allowNextNavigation.current
        && hasUnsavedChanges
        && (
            currentLocation.pathname !== nextLocation.pathname
            || currentLocation.search !== nextLocation.search
            || currentLocation.hash !== nextLocation.hash
        )
    ))

    useEffect(() => {
        if (!hasUnsavedChanges) return
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [hasUnsavedChanges])

    return {
        blocker,
        allowNavigation: () => { allowNextNavigation.current = true },
        disallowNavigation: () => { allowNextNavigation.current = false },
        discardAndNavigate: () => {
            if (blocker.state !== 'blocked') return
            allowNextNavigation.current = true
            blocker.proceed()
        },
    }
}
