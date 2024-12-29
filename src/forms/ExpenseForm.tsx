'use client'
import React from 'react'
import { Alert, Box, Button, TextField } from '@mui/material'
import { useFormState } from 'react-dom'
import { createExpense } from '@/actions/expense'

export type ExpenseFormFields = {
	groupId: number
	amount?: number
	description?: string
	onSuccess?: () => void
}

export const ExpenseForm = ({
	initialValues,
}: {
	initialValues: ExpenseFormFields
}) => {
	const [state, formAction] = useFormState(createExpense, {
		message: '',
	})

	React.useEffect(() => {
		if (state.message === 'success' && initialValues.onSuccess) {
			initialValues.onSuccess()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state])

	return (
		<Box
			component='form'
			action={formAction}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
			}}
		>
			{state.message !== '' && state.message !== 'success' && (
				<Alert severity='error'>{state.message}</Alert>
			)}
			<TextField
				name='groupId'
				value={initialValues.groupId}
				sx={{ display: 'none' }}
			/>
			<TextField
				name='amount'
				type='text'
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
		</Box>
	)
}
