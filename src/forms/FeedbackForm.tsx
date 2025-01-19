'use client'
import React from 'react'
import { Button, TextField } from '@mui/material'
import Form from '@/components/Form'
import { sendFeedback } from '@/actions/feedback'

const FeedbackForm = ({ onSuccess }: { onSuccess: () => void }) => {
	return (
		<Form action={sendFeedback} onSuccess={onSuccess}>
			<TextField
				name='message'
				label='Tapez votre message'
				variant='standard'
				multiline
				minRows={4}
				required={true}
			/>
			<Button type='submit'>Envoyer</Button>
		</Form>
	)
}

export default FeedbackForm
