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
import { transferGroup } from '@/actions/group'

export type TransferGroupFormFields = {
	id: string
	members: { user: DefaultSession['user'] }[]
	onSuccess?: () => void
}

export const TransferGroupForm = ({
	initialValues,
}: {
	initialValues: TransferGroupFormFields
}) => {
	const [state, formAction] = useFormState(transferGroup, {
		message: '',
	})
	const [newOwner, setNewOwner] = React.useState('')

	const handleChange = (event: SelectChangeEvent) => {
		setNewOwner(event.target.value)
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
				name='id'
				value={initialValues.id}
				sx={{ display: 'none' }}
			/>
			<FormControl fullWidth>
				<InputLabel id='new-owner-label'>
					Nouveau propriétaire
				</InputLabel>
				<Select
					labelId='new-owner-label'
					name='newOwner'
					value={newOwner}
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
			<Button type='submit'>Transférer</Button>
		</Box>
	)
}
