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
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Stack,
	Typography,
	AccordionActions,
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
import UserAvatar from '../UserAvatar'
import { deleteExpense } from '@/actions/expense'
import { deleteTransfer } from '@/actions/transfer'
import Loader from '../Loader'

type HistoryPanelProps = {
	group: GroupDetails
	historyPeriod: HistoryPeriod
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
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
	const [expanded, setExpanded] = React.useState<string | false>(false)

	const handleChange =
		(panel: string) =>
		(event: React.SyntheticEvent, isExpanded: boolean) => {
			setExpanded(isExpanded ? panel : false)
		}

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
			setConfirmText('Souhaitez vous supprimer ce transfert')
			setConfirmAction(() => () => handleDeleteTransfer(itemId))
		} else {
			setConfirmText('Souhaitez vous supprimer cette dépense')
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
				<Accordion
					key={`${item.hType.charAt(0)}${item.id}`}
					expanded={expanded === `${item.hType.charAt(0)}${item.id}`}
					onChange={handleChange(`${item.hType.charAt(0)}${item.id}`)}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls={`panel${item.id}-content`}
						id={`panel${item.id}-header`}
					>
						<Stack
							direction='row'
							alignItems='center'
							gap={1}
							width='100%'
						>
							{item.hType === 'expense' ? (
								<>
									<UserAvatar user={item.payer.user} />
									<Typography>{item.description}</Typography>
									<Typography
										sx={{ flexGrow: 1, textAlign: 'end' }}
									>
										{item.amount}€
									</Typography>
									<Typography>
										({item.date.toLocaleDateString()})
									</Typography>
								</>
							) : (
								<>
									<UserAvatar user={item.sender.user} />
									<Typography>{item.amount}€ à</Typography>
									<UserAvatar user={item.receiver.user} />
									<Typography
										sx={{ flexGrow: 1, textAlign: 'end' }}
									>
										({item.date.toLocaleDateString()})
									</Typography>
								</>
							)}
						</Stack>
					</AccordionSummary>
					<AccordionDetails>
						{item.hType === 'transfer' ? (
							<>
								<Typography>Rembourse :</Typography>
								<List>
									{item.paybacks.map((payback, i) => (
										<ListItem
											key={`${item.hType.charAt(0)}${
												item.id
											}p${i}`}
											secondaryAction={
												payback.debt.isRepayed ? (
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
												bgcolor: payback.debt.isRepayed
													? 'success.light'
													: 'error.light',
											}}
										>
											<ListItemText
												primary={`${
													payback.debt.expense
														.description
												} (${payback.debt.expense.date.toLocaleDateString()}) ${
													payback.amount
												}€`}
											/>
										</ListItem>
									))}
								</List>
							</>
						) : (
							<>
								{item.debts.filter(
									(debt) => debt.amount !== '0.00'
								).length > 0 && (
									<>
										<Typography>Dettes :</Typography>
										<List>
											{item.debts
												.filter(
													(debt) =>
														debt.amount !== '0.00'
												)
												.map((debt, i) => (
													<ListItem
														key={`e${item.id}d${i}`}
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
															bgcolor:
																debt.isRepayed
																	? 'success.light'
																	: 'error.light',
														}}
													>
														<ListItemAvatar>
															<UserAvatar
																user={
																	debt.debtor
																		.user
																}
															/>
														</ListItemAvatar>
														<ListItemText
															primary={`${debt.amount}€`}
														/>
													</ListItem>
												))}
										</List>
									</>
								)}
								{item.debts.flatMap((debt) => debt.payinback)
									.length > 0 && (
									<>
										<Typography>Rembourse :</Typography>
										<List>
											{item.debts
												.flatMap(
													(debt) => debt.payinback
												)
												.map((payinback, i) => (
													<ListItem
														key={`e${item.id}p${i}`}
														secondaryAction={
															payinback.debt
																.isRepayed ? (
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
															bgcolor: payinback
																.debt.isRepayed
																? 'success.light'
																: 'error.light',
														}}
													>
														<ListItemAvatar>
															<UserAvatar
																user={
																	payinback
																		.debt
																		.expense
																		.payer
																		.user
																}
															/>
														</ListItemAvatar>
														<ListItemText
															primary={`${
																payinback.debt
																	.expense
																	.description
															} (${payinback.debt.expense.date.toLocaleDateString()}) ${
																payinback.amount
															}€`}
														/>
													</ListItem>
												))}
										</List>
									</>
								)}
							</>
						)}
					</AccordionDetails>
					{item.owned && (
						<AccordionActions>
							<Button
								aria-label={`delete_${item.hType}`}
								onClick={() =>
									handleOpenConfirm(item.hType, item.id)
								}
								startIcon={<DeleteIcon />}
								sx={{
									color: 'text.secondary',
									fontSize: 16,
									fontWeight: 400,
								}}
							>
								Supprimer
							</Button>
						</AccordionActions>
					)}
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
