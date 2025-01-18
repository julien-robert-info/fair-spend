'use client'
import React from 'react'
import { useFormState } from 'react-dom'
import { Alert, Box } from '@mui/material'
import FormLoader from './FormLoader'

type FormState = {
	message: string
	result?: any
}

export type FormAction = (
	prevState: FormState,
	formData: FormData
) => FormState | Promise<FormState>

type FormProps = {
	children: React.ReactNode
	action: FormAction
	onSuccess?: (result?: any) => void
}

const Form: React.FC<FormProps> = ({ children, action, onSuccess }) => {
	const [state, formAction] = useFormState(action, {
		message: '',
	})

	React.useEffect(() => {
		if (state.message === 'success' && onSuccess) {
			onSuccess(state.result)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state])

	return (
		<Box
			component='form'
			action={formAction}
			sx={{
				position: 'relative',
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
			}}
		>
			<FormLoader />
			{state.message !== '' && state.message !== 'success' && (
				<Alert severity='error'>{state.message}</Alert>
			)}
			{children}
		</Box>
	)
}

export default Form
