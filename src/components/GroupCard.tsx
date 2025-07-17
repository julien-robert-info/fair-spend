'use client'
import React from 'react'
import {
	Card,
	CardActions,
	CardProps,
	Grid,
	CardActionArea,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Alert,
} from '@mui/material'
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded'
import GroupCardContent from './GroupCardContent'
import { GroupDetails } from '@/actions/group'
import ExpenseForm from '@/forms/ExpenseForm'
import { ShareMode } from '@prisma/client'
import { getIncome } from '@/actions/member'
import { dineroFormat } from '@/utils/dinero'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'

const GroupCard = ({
	group,
	onClick,
	...props
}: {
	group: GroupDetails
	onClick?: React.MouseEventHandler<HTMLButtonElement>
} & Omit<CardProps, 'onClick'>) => {
	const [openForm, setOpenForm] = React.useState(false)
	const [income, setIncome] = React.useState('')

	React.useEffect(() => {
		const fetchIncome = async () => {
			const fetchedIncome = await getIncome(group.id)
			setIncome(
				dineroFormat(
					dinero({ amount: fetchedIncome ?? 0, currency: USD })
				) ?? income
			)
		}

		group.shareMode === ShareMode.EGALITARIAN && fetchIncome()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group])

	return (
		<>
			<Card {...props}>
				{onClick ? (
					<CardActionArea onClick={onClick}>
						<GroupCardContent group={group} />
					</CardActionArea>
				) : (
					<GroupCardContent group={group} />
				)}
				<CardActions disableSpacing>
					<Grid container justifyContent='space-around'>
						<Grid item>
							<IconButton
								aria-label='add_expense'
								onClick={() => setOpenForm(true)}
								size='large'
							>
								<AddCardRoundedIcon />
							</IconButton>
						</Grid>
					</Grid>
				</CardActions>
			</Card>
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>Saisir une dépense</DialogTitle>
				<DialogContent>
					{group.shareMode === ShareMode.EGALITARIAN && (
						<Alert severity='info'>
							Montant de vos revenus : {}
						</Alert>
					)}
					<ExpenseForm
						initialValues={{
							groupId: group.id,
						}}
						onSuccess={() => setOpenForm(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	)
}

export default GroupCard
