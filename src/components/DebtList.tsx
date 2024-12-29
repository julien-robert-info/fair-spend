'use client'
import { List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import UserAvatar from './UserAvatar'

export const DebtList = ({ debts }: { debts: any[] }) => {
	return (
		<List>
			{debts.map((debt, i) => (
				<ListItem
					key={i}
					sx={{
						bgcolor: debt.amount.includes('-')
							? 'error.light'
							: 'success.light',
					}}
				>
					<ListItemAvatar>
						<UserAvatar user={debt.user} />
					</ListItemAvatar>
					<ListItemText primary={`Montant : ${debt.amount}€`} />
				</ListItem>
			))}
		</List>
	)
}
