'use client'
import React from 'react'
import {
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Paper,
	Stack,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import HistoryIcon from '@mui/icons-material/History'
import CloseIcon from '@mui/icons-material/Close'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import { GroupDetails } from '@/actions/group'
import { ShareMode } from '@prisma/client'
import IncomeForm from '@/forms/IncomeForm'
import { getIncome } from '@/actions/member'
import { DebtSummary } from '@/components/DebtSummary'
import { DebtHistory } from '@/components/DebtHistory'
import GroupMenu from './GroupMenu'
import { dineroFormat } from '@/utils/dinero'

const DebtsPanel = ({
	group,
	isDesktop,
}: {
	group?: GroupDetails
	isDesktop: boolean
}) => {
	const [tab, setTab] = React.useState(0)
	const [openForm, setOpenForm] = React.useState(false)
	const [income, setIncome] = React.useState('')

	if (!group) {
		return
	}

	const handleOpenForm = async () => {
		const fetchedIncome = await getIncome(group.id)
		setIncome(
			dineroFormat(
				dinero({ amount: fetchedIncome ?? 0, currency: USD })
			) ?? income
		)
		setOpenForm(true)
	}

	return (
		<Paper
			sx={{
				position: 'relative',
				// minHeight: '10em',
				width: isDesktop ? '46.5vw' : '97vw',
				my: 2,
				mx: isDesktop ? 1 : 'auto',
				p: 2,
			}}
		>
			{group && (
				<>
					<Stack direction='row' justifyContent='end'>
						{group.shareMode === ShareMode.FAIR && (
							<IconButton
								aria-label='settings'
								onClick={() => handleOpenForm()}
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
								aria-label='history-close'
								onClick={() => setTab(0)}
							>
								<CloseIcon />
							</IconButton>
						)}
						<GroupMenu group={group} />
					</Stack>
					{tab === 0 ? (
						<DebtSummary group={group} />
					) : (
						<DebtHistory group={group} />
					)}
					<Dialog open={openForm} onClose={() => setOpenForm(false)}>
						<DialogTitle>Saisir votre revenu mensuel</DialogTitle>
						<DialogContent>
							<IncomeForm
								initialValues={{
									groupId: group.id,
									income: income,
								}}
								onSuccess={() => setOpenForm(false)}
							/>
						</DialogContent>
					</Dialog>
				</>
			)}
		</Paper>
	)
}

export default DebtsPanel
