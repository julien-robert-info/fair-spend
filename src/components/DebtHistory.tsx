'use client'
import React from 'react'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Backdrop,
	Box,
	Button,
	CircularProgress,
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
import { HistoryData, getHistoryData } from '@/utils/history'
import UserAvatar from './UserAvatar'
import { deleteExpense } from '@/actions/expense'

export const DebtHistory = ({ group }: { group: GroupDetails }) => {
	const [data, setData] = React.useState<HistoryData[] | undefined>()
	const [openConfirm, setOpenConfirm] = React.useState(false)
	const [confirmAction, setConfirmAction] =
		React.useState<() => Promise<void>>()

	React.useEffect(() => {
		const updatedata = async (groupId: number) => {
			setData(await getHistoryData(groupId))
		}

		if (group) {
			updatedata(group.id)
		}
	}, [group])

	const handleOpenConfirm = (expenseId: number) => {
		setConfirmAction(() => () => handleDeleteExpense(expenseId))
		setOpenConfirm(true)
	}

	const handleDeleteExpense = async (expenseId: number) => {
		setOpenConfirm(false)
		deleteExpense(expenseId)
	}

	return (
		<>
			<Backdrop
				open={!data}
				sx={{
					position: 'absolute',
					zIndex: (theme) => theme.zIndex.tooltip + 1,
					bgcolor: 'rgba(255, 255, 255, 0.5)',
				}}
			>
				<CircularProgress />
			</Backdrop>
			{data?.map((item, i) =>
				item.hType === 'transfer' ? (
					<Box key={`t${i}`} sx={{ px: 2, my: '12px' }}>
						<Typography component='span'>
							{`${item.sender.name} à transféré ${item.amount}€ à ${item.receiver.name}`}
						</Typography>
						<Typography component='span' sx={{ ml: 2 }}>
							({item.date.toLocaleDateString()})
						</Typography>
					</Box>
				) : (
					<Accordion key={`e${i}`}>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls={`panel${i}-content`}
							id={`panel${i}-header`}
						>
							<Typography component='span'>
								{`${item.payer.name} à dépensé ${item.amount}€`}
							</Typography>
							<Typography component='span' sx={{ ml: 2 }}>
								({item.date.toLocaleDateString()})
							</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Stack direction='row' alignItems='center'>
								<Typography sx={{ flexGrow: 1 }}>
									description: {item.description}
								</Typography>
								<Box>
									<IconButton
										aria-label='delete'
										onClick={() =>
											handleOpenConfirm(item.id)
										}
									>
										<DeleteIcon />
									</IconButton>
								</Box>
							</Stack>
							<List>
								{item.debts.map((debt, j) => (
									<ListItem
										key={`e${i}d${j}`}
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
						</AccordionDetails>
					</Accordion>
				)
			)}
			<Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
				<DialogTitle>Confirmation</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Souhaitez-vous vraiment supprimer cette dépense ?
					</DialogContentText>
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
