'use client'
import React from 'react'
import {
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Paper,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { GroupDetails } from '@/actions/group'
import { ShareMode } from '@prisma/client'
import { IncomeForm } from '@/forms/IncomeForm'
import { getIncome } from '@/actions/member'

const DebtsPanel = ({ group }: { group?: GroupDetails }) => {
	const [openForm, setOpenForm] = React.useState(false)
	const [formTitle, setFormTitle] = React.useState(
		'Saisir votre niveau de revenu'
	)
	const [form, setForm] = React.useState<React.ReactNode>()

	const handleOpenForm = async (
		groupId: number
	) => {
		setFormTitle('Saisir votre niveau de revenu')
		setForm(
			<IncomeForm
				initialValues={{
					groupId: groupId,
					income: await getIncome(groupId),
					onSuccess: () => setOpenForm(false),
				}}
			/>
		)
		setOpenForm(true)
	}

	return (
		<Paper
			sx={{ minHeight: '10em', width: '97vw', my: 2, mx: 'auto', p: 2 }}
		>
			{group && (
				<>
					{group.shareMode === ShareMode.FAIR && (
						<IconButton
							aria-label='settings'
							onClick={() => handleOpenForm(group.id)}
							sx={{ float: 'right' }}
						>
							<SettingsIcon />
						</IconButton>
					)}
					<Dialog open={openForm} onClose={() => setOpenForm(false)}>
						<DialogTitle>{formTitle}</DialogTitle>
						<DialogContent>{form}</DialogContent>
					</Dialog>
				</>
			)}
		</Paper>
	)
}

export default DebtsPanel
