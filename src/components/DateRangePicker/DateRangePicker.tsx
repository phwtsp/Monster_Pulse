'use client'

import React from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { ptBR } from 'date-fns/locale/pt-BR'
import { Calendar as CalendarIcon } from 'lucide-react'
import styles from './DateRangePicker.module.css'
import './datepicker-custom.css' // We will create this for deep overrides

registerLocale('pt-BR', ptBR)

interface DateRangePickerProps {
    startDate: Date | null
    endDate: Date | null
    onChange: (dates: [Date | null, Date | null]) => void
    minDate?: Date
    maxDate?: Date
}

export default function DateRangePicker({ startDate, endDate, onChange, minDate, maxDate }: DateRangePickerProps) {
    const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
        <div className={styles.inputWrapper} onClick={onClick} ref={ref}>
            <CalendarIcon size={16} className={styles.icon} />
            <span className={styles.text}>
                {value || "Selecione o período"}
            </span>
        </div>
    ))
    CustomInput.displayName = 'CustomInput'

    return (
        <div className={styles.container}>
            <span className={styles.label}>Período</span>
            <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={onChange}
                locale="pt-BR"
                dateFormat="dd/MM/yyyy"
                minDate={minDate}
                maxDate={maxDate}
                customInput={<CustomInput />}
                monthsShown={2}
                popperClassName={styles.datepickerPopper}
                calendarClassName="monster-datepicker" // Custom class for styling
            />
        </div>
    )
}
