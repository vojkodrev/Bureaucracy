import { format } from 'date-fns'
import { CalendarIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
} from '@/components/ui/input-group'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerFieldProps = {
    date: Date | undefined
    id: string
    label: string
    name: string
    onSelect: (date: Date | undefined) => void
}

function DatePickerField({
    date,
    id,
    label,
    name,
    onSelect,
}: DatePickerFieldProps) {
    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <Popover>
                    <PopoverTrigger
                        render={
                            <Button
                                id={id}
                                type="button"
                                variant="ghost"
                                data-slot="input-group-control"
                                data-empty={!date}
                                className="h-full flex-1 justify-start rounded-r-none text-left font-normal data-[empty=true]:text-muted-foreground"
                            />
                        }
                    >
                        <CalendarIcon />
                        {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={onSelect}
                        />
                    </PopoverContent>
                </Popover>
                {date && (
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            size="icon-xs"
                            aria-label={`Clear ${label.toLowerCase()}`}
                            onClick={() => onSelect(undefined)}
                        >
                            <XIcon />
                        </InputGroupButton>
                    </InputGroupAddon>
                )}
            </InputGroup>
            <input
                type="hidden"
                name={name}
                value={date ? format(date, 'yyyy-MM-dd') : ''}
            />
        </Field>
    )
}

export default DatePickerField
