'use client'
import React from 'react'
import { Button, TextField } from '@mui/material'
import { createExpense } from '@/actions/expense'
import Form from '@/components/Form'
import { DatePicker } from '@mui/x-date-pickers'

type ExpenseFormProps = {
	initialValues: {
		groupId: number
		date?: Date
		amount?: string
		description?: string
	}
	onSuccess?: () => void
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
	initialValues,
	onSuccess,
}) => {
	return (
		<Form action={createExpense} onSuccess={onSuccess}>
			<TextField
				name='groupId'
				value={initialValues.groupId}
				sx={{ display: 'none' }}
			/>
			<DatePicker
				name='date'
				label='Date'
				defaultValue={initialValues.date ?? new Date()}
				slotProps={{ textField: { variant: 'standard' } }}
			/>
			<TextField
				name='amount'
				type='number'
				inputProps={{
					step: 0.01,
				}}
				label='Montant'
				variant='standard'
				required={true}
				defaultValue={initialValues.amount}
			/>
			<TextField
				name='description'
				type='text'
				label='Description'
				variant='standard'
				defaultValue={initialValues.description}
			/>
			<Button type='submit'>Enregistrer</Button>
		</Form>
	)
}

export default ExpenseForm
