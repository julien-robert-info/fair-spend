'use client'
import React from 'react'
import {
	Box,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Paper,
	Typography,
} from '@mui/material'
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded'
import SettingsIcon from '@mui/icons-material/Settings'
import { GroupDetails } from '@/actions/group'
import { ExpenseForm } from '@/forms/ExpenseForm'
import { ShareMode } from '@prisma/client'
import { IncomeForm } from '@/forms/IncomeForm'
import { getIncome } from '@/actions/member'
import { DebtList } from './DebtList'
import { getPanelData, PanelData } from '@/utils/debt'

const DebtsPanel = ({ group }: { group?: GroupDetails }) => {
	const [data, setData] = React.useState<PanelData | undefined>()
	const [openForm, setOpenForm] = React.useState(false)
	const [formTitle, setFormTitle] = React.useState('Saisir une dépense')
	const [form, setForm] = React.useState<React.ReactNode>()

	React.useEffect(() => {
		const updatedata = async (groupId: number) => {
			setData(await getPanelData(groupId))
		}

		if (group) {
			updatedata(group.id)
		}
	}, [group])

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
						onSuccess: () => setOpenForm(false),
					}}
				/>
			)
		} else {
			setFormTitle('Saisir votre revenu mensuel')
			setForm(
				<IncomeForm
					initialValues={{
						groupId: groupId,
						income: await getIncome(groupId),
						onSuccess: () => setOpenForm(false),
					}}
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
					{group.shareMode === ShareMode.FAIR && (
						<IconButton
							aria-label='settings'
							onClick={() => handleOpenForm('income', group.id)}
							sx={{ float: 'right' }}
						>
							<SettingsIcon />
						</IconButton>
					)}
					<Box sx={{ textAlign: 'center' }}>
						<IconButton
							aria-label='add_expense'
							onClick={() => handleOpenForm('expense', group.id)}
						>
							<AddCardRoundedIcon />
						</IconButton>
					</Box>
					{data && (
						<>
							<Typography>{`Solde : ${data.balance}€`}</Typography>
							{data.debtList.length > 0 && (
								<DebtList group={group} debts={data.debtList} />
							)}
						</>
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
