import { useEffect, useEffectEvent } from 'react'

export function useCreditNoteKeyboardShortcuts(
    onSave: () => void,
    onPrint: () => void,
) {
    const save = useEffectEvent(onSave)
    const print = useEffectEvent(onPrint)
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (!(event.ctrlKey || event.metaKey)) return
            const key = event.key.toLowerCase()
            if (key !== 's' && key !== 'p') return
            event.preventDefault()
            if (key === 's') save()
            if (key === 'p') print()
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [])
}
