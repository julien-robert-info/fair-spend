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
} from '@mui/material'
import { Group, ShareMode } from '@prisma/client'
import { upsertGroup } from '@/actions/group'
import Form from '@/components/Form'

export type GroupFormProps = {
	initialValues: {
		id?: number
		name?: string
		shareMode?: ShareMode
	}
	onSuccess?: (group?: Group) => void
}

export const GroupForm: React.FC<GroupFormProps> = ({
	initialValues,
	onSuccess,
}) => {
	const [mode, setMode] = React.useState<ShareMode | ''>(
		initialValues.shareMode ?? ''
	)

	const handleChange = (event: SelectChangeEvent) => {
		setMode(event.target.value as ShareMode)
	}

	return (
		<Form action={upsertGroup} onSuccess={onSuccess}>
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
		</Form>
	)
}
