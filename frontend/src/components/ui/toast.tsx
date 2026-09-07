import * as React from 'react'
import { Toast as ToastPrimitive } from '@base-ui/react/toast'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
    return <ToastPrimitive.Viewport className={cn('pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full', className)} {...props} />
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
    return (
        <ToastPrimitive.Root
            className={cn(
                'group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border bg-popover text-popover-foreground shadow-lg outline-none',
                '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
                'h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]',
                'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))] data-limited:opacity-0 data-starting-style:[transform:translateY(150%)] data-ending-style:[transform:translateY(150%)]',
                className,
            )}
            {...props}
        />
    )
}

function ToastIcon({ type }: { type?: string }) {
    const Icon = type === 'success' ? CircleCheckIcon
        : type === 'info' ? InfoIcon
            : type === 'warning' ? TriangleAlertIcon
                : type === 'error' ? OctagonXIcon
                    : type === 'loading' ? Loader2Icon
                        : null
    return Icon ? <Icon className={cn('size-4 shrink-0', type === 'loading' && 'animate-spin', type === 'error' && 'text-destructive')} aria-hidden="true" /> : null
}

function ToastList() {
    const { toasts } = ToastPrimitive.useToastManager()
    return toasts.map((toastItem) => (
        <Toast key={toastItem.id} toast={toastItem}>
            <ToastPrimitive.Content className="flex h-full items-center gap-3 overflow-hidden p-4">
                <ToastIcon type={toastItem.type} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <ToastPrimitive.Title className="text-sm font-medium" />
                    <ToastPrimitive.Description className="text-sm text-muted-foreground" />
                </div>
                <ToastPrimitive.Close aria-label="Close toast" render={<Button variant="ghost" size="icon-sm" />}>
                    <XIcon aria-hidden="true" />
                </ToastPrimitive.Close>
            </ToastPrimitive.Content>
        </Toast>
    ))
}

function Toaster() {
    return (
        <ToastPrimitive.Provider toastManager={toast}>
            <ToastPrimitive.Portal>
                <ToastViewport><ToastList /></ToastViewport>
            </ToastPrimitive.Portal>
        </ToastPrimitive.Provider>
    )
}

export { Toaster }
