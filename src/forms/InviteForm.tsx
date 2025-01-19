'use client'
import React from 'react'
import { Button, TextField } from '@mui/material'
import { createInvite } from '@/actions/invite'
import Form from '@/components/Form'

export type InviteFormProps = {
	initialValues: { groupId: number; email?: string }
	onSuccess?: () => void
}

const InviteForm: React.FC<InviteFormProps> = ({
	initialValues,
	onSuccess,
}) => {
	return (
		<Form action={createInvite} onSuccess={onSuccess}>
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
		</Form>
	)
}

export default InviteForm
