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
} from '@mui/material'
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded'
import GroupCardContent from './GroupCardContent'
import { GroupDetails } from '@/actions/group'
import ExpenseForm from '@/forms/ExpenseForm'

const GroupCard = ({
	group,
	onClick,
	...props
}: {
	group: GroupDetails
	onClick?: React.MouseEventHandler<HTMLButtonElement>
} & Omit<CardProps, 'onClick'>) => {
	const [openForm, setOpenForm] = React.useState(false)

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
