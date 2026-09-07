import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>

function NumberInput({ className, ...props }: NumberInputProps) {
    return (
        <Input
            type="number"
            className={cn(
                '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                className,
            )}
            {...props}
        />
    )
}

export { NumberInput }
