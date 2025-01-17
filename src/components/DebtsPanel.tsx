'use client'
import React from 'react'
import {
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Paper,
} from '@mui/material'
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded'
import SettingsIcon from '@mui/icons-material/Settings'
import HistoryIcon from '@mui/icons-material/History'
import CloseIcon from '@mui/icons-material/Close'
import { GroupDetails } from '@/actions/group'
import { ExpenseForm } from '@/forms/ExpenseForm'
import { ShareMode } from '@prisma/client'
import { IncomeForm } from '@/forms/IncomeForm'
import { getIncome } from '@/actions/member'
import { DebtList } from '@/components/DebtList'
import { MemberHistory } from '@/components/MemberHistory'

const DebtsPanel = ({ group }: { group?: GroupDetails }) => {
	const [tab, setTab] = React.useState(0)
	const [openForm, setOpenForm] = React.useState(false)
	const [formTitle, setFormTitle] = React.useState('Saisir une dépense')
	const [form, setForm] = React.useState<React.ReactNode>()

	const handleOpenForm = async (
		form: 'expense' | 'income',
		groupId: number
	) => {
		if (form === 'expense') {
			setFormTitle('Saisir une dépense')
			setForm(
				<ExpenseForm
					initialValues={{
						groupId: groupId,
					}}
					onSuccess={() => setOpenForm(false)}
				/>
			)
		} else {
			setFormTitle('Saisir votre revenu mensuel')
			setForm(
				<IncomeForm
					initialValues={{
						groupId: groupId,
						income: await getIncome(groupId),
					}}
					onSuccess={() => setOpenForm(false)}
				/>
			)
		}
		setOpenForm(true)
	}

	return (
		<Paper
			sx={{ minHeight: '10em', width: '97vw', my: 2, mx: 'auto', p: 2 }}
		>
			{group && (
				<>
					<Box sx={{ float: 'right' }}>
						{group.shareMode === ShareMode.FAIR && (
							<IconButton
								aria-label='settings'
								onClick={() =>
									handleOpenForm('income', group.id)
								}
							>
								<SettingsIcon />
							</IconButton>
						)}
						{tab === 0 ? (
							<IconButton
								aria-label='history'
								onClick={() => setTab(1)}
							>
								<HistoryIcon />
							</IconButton>
						) : (
							<IconButton
								aria-label='close'
								onClick={() => setTab(0)}
							>
								<CloseIcon />
							</IconButton>
						)}
					</Box>
					<Box sx={{ textAlign: 'center' }}>
						<IconButton
							aria-label='add_expense'
							onClick={() => handleOpenForm('expense', group.id)}
						>
							<AddCardRoundedIcon />
						</IconButton>
					</Box>
					{tab === 0 ? (
						<DebtList group={group} />
					) : (
						<MemberHistory group={group} />
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
