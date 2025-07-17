'use client'
import React from 'react'
import {
	Backdrop,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Typography,
} from '@mui/material'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import UserAvatar from './UserAvatar'
import TransferForm, { TransferFormProps } from '@/forms/TransferForm'
import { getPanelData, PanelData } from '@/utils/debt'
import { GroupDetails } from '@/actions/group'

export const DebtSummary = ({ group }: { group: GroupDetails }) => {
	const [data, setData] = React.useState<PanelData | undefined>()
	const [openForm, setOpenForm] = React.useState(false)
	const [formValues, setFormValues] = React.useState<
		Omit<TransferFormProps['initialValues'], 'groupId' | 'members'>
	>({ amount: '', receiver: '' })

	React.useEffect(() => {
		const updatedata = async (groupId: number) => {
			setData(await getPanelData(groupId))
		}

		if (group) {
			updatedata(group.id)
		}
	}, [group])

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
			{data && (
				<>
					<Typography>{`Solde : ${data.balance}€`}</Typography>
					<List>
						{data.debtList.map((debt) => (
							<ListItem
								key={debt.user?.name}
								{...(debt.isNegative && {
									secondaryAction: (
										<IconButton
											onClick={() => {
												setFormValues({
													amount: debt.amount,
													receiver: debt.user?.email!,
												})
												setOpenForm(true)
											}}
											edge='end'
											aria-label='payback'
										>
											<PointOfSaleIcon />
										</IconButton>
									),
								})}
								sx={{
									bgcolor: debt.isNegative
										? 'error.light'
										: 'success.light',
								}}
							>
								<ListItemAvatar>
									<UserAvatar user={debt.user} />
								</ListItemAvatar>
								<ListItemText
									primary={
										debt.isNegative
											? `vous devez ${debt.amount}€ à ${debt.user?.name}`
											: `${debt.user?.name} vous doit ${debt.amount}€`
									}
								/>
							</ListItem>
						))}
					</List>
				</>
			)}
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>Saisissez un transfert</DialogTitle>
				<DialogContent>
					<TransferForm
						initialValues={{
							amount: formValues.amount,
							receiver: formValues.receiver,
							groupId: group.id,
							members: group.members,
						}}
						onSuccess={() => setOpenForm(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	)
}
