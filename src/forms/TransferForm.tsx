'use client'
import React from 'react'
import {
	Alert,
	Box,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	Typography,
} from '@mui/material'
import { useFormState } from 'react-dom'
import { DefaultSession } from 'next-auth'
import UserAvatar from '@/components/UserAvatar'
import { createTransfer } from '@/actions/transfer'

export type TransferFormFields = {
	groupId: number
	amount: string
	receiver?: string
	members: { user: DefaultSession['user'] }[]
	onSuccess?: () => void
}

export const TransferForm = ({
	initialValues,
}: {
	initialValues: TransferFormFields
}) => {
	const [state, formAction] = useFormState(createTransfer, {
		message: '',
	})
	const [receiver, setReceiver] = React.useState(initialValues.receiver ?? '')

	const handleChange = (event: SelectChangeEvent) => {
		setReceiver(event.target.value)
	}

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
			<FormControl fullWidth>
				<InputLabel id='receiver-label'>Réceptionnaire</InputLabel>
				<Select
					labelId='receiver-label'
					name='receiver'
					value={receiver}
					onChange={handleChange}
					required={true}
					inputProps={{
						sx: {
							display: 'flex',
							alignItems: 'center',
						},
					}}
				>
					{initialValues.members.map((member) => (
						<MenuItem
							key={member.user?.email}
							value={member.user?.email!}
						>
							<UserAvatar user={member.user} />
							<Typography ml={2}>{member.user?.name}</Typography>
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Button type='submit'>Enregistrer</Button>
		</Box>
	)
}
