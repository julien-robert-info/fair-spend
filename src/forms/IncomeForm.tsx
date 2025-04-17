'use client'
import React from 'react'
import { Button, TextField } from '@mui/material'
import { setIncome } from '@/actions/member'
import Form from '@/components/Form'

type IncomeFormProps = {
	initialValues: {
		groupId: number
		income?: string | null
	}
	onSuccess?: () => void
}

const IncomeForm: React.FC<IncomeFormProps> = ({
	initialValues,
	onSuccess,
}) => {
	return (
		<Form action={setIncome} onSuccess={onSuccess}>
			<TextField
				name='groupId'
				value={initialValues.groupId}
				sx={{ display: 'none' }}
			/>
			<TextField
				name='income'
				type='number'
				inputProps={{
					step: 0.01,
				}}
				label='Montant'
				variant='standard'
				required={true}
				defaultValue={initialValues.income}
			/>
			<Button type='submit'>Enregistrer</Button>
		</Form>
	)
}

export default IncomeForm
