'use client'
import React from 'react'
import { useFormState } from 'react-dom'
import { Alert, Backdrop, Box, CircularProgress } from '@mui/material'

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
	const [state, formAction, isPending] = useFormState(action, {
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
				display: 'flex',
				flexDirection: 'column',
				gap: 1,
			}}
		>
			<Backdrop open={isPending}>
				<CircularProgress />
			</Backdrop>
			{state.message !== '' && state.message !== 'success' && (
				<Alert severity='error'>{state.message}</Alert>
			)}
			{children}
		</Box>
	)
}

export default Form
