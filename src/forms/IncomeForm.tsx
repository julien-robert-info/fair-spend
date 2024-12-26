'use client'
import React from 'react'
import { Box, Button, TextField } from '@mui/material'
import { useFormState } from 'react-dom'
import { setIncome } from '@/actions/member'

export type IncomeFormFields = {
	groupId: number
	income?: number | null
	onSuccess?: () => void
}

export const IncomeForm = ({
	initialValues,
}: {
	initialValues: IncomeFormFields
}) => {
	const [state, formAction] = useFormState(setIncome, {
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
			<TextField
				name='groupId'
				value={initialValues.groupId}
				sx={{ display: 'none' }}
			/>
			<TextField
				name='income'
				type='number'
				label='Montant'
				variant='standard'
				required={true}
				defaultValue={initialValues.income}
			/>
			<Button type='submit'>Enregistrer</Button>
		</Box>
	)
}
