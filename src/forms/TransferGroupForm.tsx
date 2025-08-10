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
import { transferGroup } from '@/actions/group'
import Form from '@/components/Form'

export type TransferGroupFormProps = {
	initialValues: { id: number; members: { user: DefaultSession['user'] }[] }
	onSuccess?: () => void
}

const TransferGroupForm: React.FC<TransferGroupFormProps> = ({
	initialValues,
	onSuccess,
}) => {
	const [newOwner, setNewOwner] = React.useState('')

	const handleChange = (event: SelectChangeEvent) => {
		setNewOwner(event.target.value)
	}

	return (
		<Form action={transferGroup} onSuccess={onSuccess}>
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
					label='Nouveau propriétaire'
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
		</Form>
	)
}

export default TransferGroupForm
