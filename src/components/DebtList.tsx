'use client'
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import UserAvatar from './UserAvatar'
import { PanelData } from '@/utils/debt'

export const DebtList = ({
	debts,
}: {
	debts: PanelData['debtList']
}) => {
	return (
			<List>
				{debts.map((debt, i) => (
					<ListItem
						key={i}
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
	)
}
