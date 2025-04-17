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
import SettingsIcon from '@mui/icons-material/Settings'
import HistoryIcon from '@mui/icons-material/History'
import CloseIcon from '@mui/icons-material/Close'
import { GroupDetails } from '@/actions/group'
import { ShareMode } from '@prisma/client'
import IncomeForm from '@/forms/IncomeForm'
import { getIncome } from '@/actions/member'
import { DebtList } from '@/components/DebtList'
import { MemberHistory } from '@/components/MemberHistory'
import GroupMenu from './GroupMenu'

const DebtsPanel = ({
	group,
	isDesktop,
}: {
	group?: GroupDetails
	isDesktop: boolean
}) => {
	const [tab, setTab] = React.useState(0)
	const [openForm, setOpenForm] = React.useState(false)
	const [income, setIncome] = React.useState(0)

	if (!group) {
		return
	}

	const handleOpenForm = async () => {
		const fetchedIncome = await getIncome(group.id)
		setIncome(fetchedIncome ?? income)
		setOpenForm(true)
	}

	return (
		<Paper
			sx={{
				position: 'relative',
				minHeight: '10em',
				width: isDesktop ? '46.5vw' : '97vw',
				my: 2,
				mx: isDesktop ? 1 : 'auto',
				p: 2,
			}}
		>
			{group && (
				<>
					<Box sx={{ float: 'right' }}>
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
								aria-label='close'
								onClick={() => setTab(0)}
							>
								<CloseIcon />
							</IconButton>
						)}
						<GroupMenu group={group} />
					</Box>
					{tab === 0 ? (
						<DebtList group={group} />
					) : (
						<MemberHistory group={group} />
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
