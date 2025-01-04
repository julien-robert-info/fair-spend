'use client'
import React from 'react'
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	IconButton,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PriceCheckIcon from '@mui/icons-material/PriceCheck'
import MoneyOffIcon from '@mui/icons-material/MoneyOff'
import { GroupDetails } from '@/actions/group'
import { HistoryData, getHistoryData } from '@/utils/history'
import UserAvatar from './UserAvatar'

export const MemberHistory = ({ group }: { group: GroupDetails }) => {
	const [data, setData] = React.useState<HistoryData[] | undefined>()

	React.useEffect(() => {
		const updatedata = async (groupId: number) => {
			setData(await getHistoryData(groupId))
		}

		if (group) {
			updatedata(group.id)
		}
	}, [group])

	return data?.map((item, i) => (
		<>
			{item.hType === 'transfer' ? (
				<Box sx={{ px: 2, my: '12px' }}>
					<Typography component='span'>
						{`${item.sender.name} à transféré ${item.amount}€ à ${item.receiver.name}`}
					</Typography>
					<Typography
						component='span'
						sx={{ color: 'text.secondary', ml: 2 }}
					>
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
						<Typography
							component='span'
							sx={{ color: 'text.secondary', ml: 2 }}
						>
							({item.date.toLocaleDateString()})
						</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>description: {item.description}</Typography>
						<List>
							{item.debts.map((debt, j) => (
								<ListItem
									key={`e${i}d${j}`}
									secondaryAction={
										<IconButton
											edge='end'
											aria-label='repayed'
										>
											{debt.isRepayed ? (
												<PriceCheckIcon />
											) : (
												<MoneyOffIcon />
											)}
										</IconButton>
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
									<ListItemText primary={`${debt.amount}€`} />
								</ListItem>
							))}
						</List>
					</AccordionDetails>
				</Accordion>
			)}
		</>
	))
}
