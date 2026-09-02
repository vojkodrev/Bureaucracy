import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
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
            <Popover>
                <PopoverTrigger
                    render={
                        <Button
                            id={id}
                            type="button"
                            variant="outline"
                            data-empty={!date}
                            className="w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
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
            <input
                type="hidden"
                name={name}
                value={date ? format(date, 'yyyy-MM-dd') : ''}
            />
        </Field>
    )
}

export default DatePickerField
