'use client'
import React from 'react'
import { Alert, Box, Button, TextField } from '@mui/material'
import { useFormState } from 'react-dom'
import { createInvite } from '@/actions/invite'

export type InviteFormFields = {
	groupId: number
	email?: string
	onSuccess?: () => void
}

export const InviteForm = ({
	initialValues,
}: {
	initialValues: InviteFormFields
}) => {
	const [state, formAction] = useFormState(createInvite, {
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
				name='email'
				type='email'
				label='Email'
				variant='standard'
				required={true}
				defaultValue={initialValues.email}
			/>
			<Button type='submit'>Inviter</Button>
		</Box>
	)
}
