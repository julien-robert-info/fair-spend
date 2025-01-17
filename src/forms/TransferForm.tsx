'use client'
import React from 'react'
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	SelectChangeEvent,
	TextField,
	Typography,
} from '@mui/material'
import { DefaultSession } from 'next-auth'
import UserAvatar from '@/components/UserAvatar'
import { createTransfer } from '@/actions/transfer'
import Form from '@/components/Form'

export type TransferFormProps = {
	initialValues: {
		groupId: number
		amount: string
		receiver?: string
		members: { user: DefaultSession['user'] }[]
	}
	onSuccess?: () => void
}

export const TransferForm: React.FC<TransferFormProps> = ({
	initialValues,
	onSuccess,
}) => {
	const [receiver, setReceiver] = React.useState(initialValues.receiver ?? '')

	const handleChange = (event: SelectChangeEvent) => {
		setReceiver(event.target.value)
	}

	return (
		<Form action={createTransfer} onSuccess={onSuccess}>
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
		</Form>
	)
}
