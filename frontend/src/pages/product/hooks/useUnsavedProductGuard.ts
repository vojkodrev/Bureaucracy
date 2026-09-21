import { useEffect, useRef } from 'react'
import { useBlocker } from 'react-router-dom'

export function useUnsavedProductGuard(hasUnsavedChanges: boolean) {
    const allowNextNavigationRef = useRef(false)
    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        !allowNextNavigationRef.current && hasUnsavedChanges &&
        (currentLocation.pathname !== nextLocation.pathname ||
            currentLocation.search !== nextLocation.search ||
            currentLocation.hash !== nextLocation.hash),
    )

    useEffect(() => {
        if (!hasUnsavedChanges) return
        const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    return {
        blocker,
        allowNavigation: () => { allowNextNavigationRef.current = true },
        disallowNavigation: () => { allowNextNavigationRef.current = false },
        discardAndNavigate: () => {
            if (blocker.state !== 'blocked') return
            allowNextNavigationRef.current = true
            blocker.proceed()
        },
    }
}
