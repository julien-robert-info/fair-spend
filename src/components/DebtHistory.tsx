'use client'
import React from 'react'
import {
	Alert,
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Stack,
	Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PriceCheckIcon from '@mui/icons-material/PriceCheck'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import DeleteIcon from '@mui/icons-material/Delete'
import { GroupDetails } from '@/actions/group'
import {
	HType,
	HistoryData,
	HistoryPeriod,
	getHistoryData,
} from '@/utils/history'
import UserAvatar from './UserAvatar'
import { deleteExpense } from '@/actions/expense'
import { deleteTransfer } from '@/actions/transfer'
import Loader from './Loader'

type DebtHistoryProps = {
	group: GroupDetails
	historyPeriod: HistoryPeriod
}

export const DebtHistory: React.FC<DebtHistoryProps> = ({
	group,
	historyPeriod,
}) => {
	const [data, setData] = React.useState<HistoryData[] | undefined>()
	const [openConfirm, setOpenConfirm] = React.useState(false)
	const [confirmError, setConfirmError] = React.useState<string | undefined>()
	const [confirmText, setConfirmText] = React.useState(
		'Souhaitez-vous vraiment supprimer cette dépense ?'
	)
	const [confirmAction, setConfirmAction] =
		React.useState<() => Promise<void>>()

	React.useEffect(() => {
		const updatedata = async (
			groupId: number,
			historyPeriod: HistoryPeriod
		) => {
			setData(await getHistoryData(groupId, historyPeriod))
		}

		if (group) {
			updatedata(group.id, historyPeriod)
		}
	}, [group, historyPeriod])

	const handleOpenConfirm = (hType: HType, itemId: number) => {
		if (hType === 'transfer') {
			setConfirmText('Souhaitez vous supprimer ce budget partagé')
			setConfirmAction(() => () => handleDeleteTransfer(itemId))
		} else {
			setConfirmText('Souhaitez vous supprimer ce budget partagé')
			setConfirmAction(() => () => handleDeleteExpense(itemId))
		}
		setConfirmError(undefined)
		setOpenConfirm(true)
	}

	const handleDeleteExpense = async (expenseId: number) => {
		const result = await deleteExpense(expenseId)
		if (result.message === 'success') {
			setConfirmError(undefined)
			setOpenConfirm(false)
		} else {
			setConfirmError(result.message)
		}
	}

	const handleDeleteTransfer = async (transferId: number) => {
		const result = await deleteTransfer(transferId)
		if (result.message === 'success') {
			setConfirmError(undefined)
			setOpenConfirm(false)
		} else {
			setConfirmError(result.message)
		}
	}

	return (
		<>
			<Loader
				open={!data}
				sx={{
					position: 'absolute',
					zIndex: (theme) => theme.zIndex.tooltip + 1,
					bgcolor: 'rgba(255, 255, 255, 0.5)',
				}}
			/>
			{data?.map((item) => (
				<Accordion key={`e${item.id}`}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls={`panel${item.id}-content`}
						id={`panel${item.id}-header`}
					>
						<Typography component='span'>
							{item.hType === 'transfer'
								? `${item.sender.name} à remboursé ${item.amount}€`
								: `${item.payer.name} à dépensé ${item.amount}€`}
						</Typography>
						<Typography component='span' sx={{ ml: 2 }}>
							({item.date.toLocaleDateString()})
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Stack direction='row' alignItems='center'>
							{item.hType === 'expense' ? (
								<Typography sx={{ flexGrow: 1 }}>
									description: {item.description}
								</Typography>
							) : (
								<Stack
									direction='row'
									alignItems='center'
									gap={2}
									sx={{
										flexGrow: 1,
										bgcolor: 'success.light',
										py: 1,
										px: 2,
									}}
								>
									<UserAvatar user={item.receiver} />
									<Typography>{`${item.amount}€`}</Typography>
								</Stack>
							)}
							{item.owned && (
								<IconButton
									aria-label={`delete_${item.hType}`}
									onClick={() =>
										handleOpenConfirm(item.hType, item.id)
									}
								>
									<DeleteIcon />
								</IconButton>
							)}
						</Stack>
						{item.hType === 'expense' && item.debts.length > 0 && (
							<List>
								{item.debts.map((debt) => (
									<ListItem
										key={`e${item.id}d${debt.debtor.name}`}
										secondaryAction={
											debt.isRepayed ? (
												<PriceCheckIcon
													sx={{
														color: 'text.secondary',
													}}
												/>
											) : (
												<MoneyOffIcon
													sx={{
														color: 'text.secondary',
													}}
												/>
											)
										}
										sx={{
											bgcolor: debt.isRepayed
												? 'success.light'
												: 'error.light',
										}}
									>
										<ListItemAvatar>
											<UserAvatar user={debt.debtor} />
										</ListItemAvatar>
										<ListItemText
											primary={`${debt.amount}€`}
										/>
									</ListItem>
								))}
							</List>
						)}
					</AccordionDetails>
				</Accordion>
			))}
			<Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
				<DialogTitle>Confirmation</DialogTitle>
				<DialogContent>
					{confirmError && (
						<Alert severity='error'>{confirmError}</Alert>
					)}
					<DialogContentText>{confirmText}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenConfirm(false)}>Non</Button>
					<Button onClick={confirmAction} autoFocus>
						Oui
					</Button>
				</DialogActions>
			</Dialog>
		</>
	)
}
