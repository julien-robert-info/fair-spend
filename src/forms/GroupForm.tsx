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
} from '@mui/material'
import { ShareMode } from '@prisma/client'
import { upsertGroup } from '@/actions/group'
import { useFormState } from 'react-dom'

export type GroupFormFields = {
	id?: string
	name?: string
	shareMode?: ShareMode
	onSuccess?: () => void
}

export const GroupForm = ({
	initialValues,
}: {
	initialValues: GroupFormFields
}) => {
	const [state, formAction] = useFormState(upsertGroup, {
		message: '',
	})
	const [mode, setMode] = React.useState<ShareMode | ''>(
		initialValues.shareMode ?? ''
	)

	const handleChange = (event: SelectChangeEvent) => {
		setMode(event.target.value as ShareMode)
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
			<TextField
				name='name'
				label='Nom'
				variant='standard'
				required={true}
				defaultValue={initialValues.name}
			/>
			<FormControl fullWidth>
				<InputLabel id='mode-label'>Mode de répartition</InputLabel>
				<Select
					labelId='mode-label'
					name='shareMode'
					value={mode}
					onChange={handleChange}
					required={true}
				>
					{Object.keys(ShareMode).map((mode) => (
						<MenuItem key={mode} value={mode}>
							{mode === 'FAIR' ? 'équitable' : 'égalitaire'}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Button type='submit'>Enregistrer</Button>
		</Box>
	)
}
