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
	AlertTitle,
} from '@mui/material'
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded'
import EditIcon from '@mui/icons-material/Edit'
import GroupCardContent from './GroupCardContent'
import { GroupDetails } from '@/actions/group'
import ExpenseForm from '@/forms/ExpenseForm'
import { ShareMode } from '@prisma/client'
import { getIncome } from '@/actions/member'
import { dineroFormat } from '@/utils/dinero'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import IncomeForm from '@/forms/IncomeForm'

const GroupCard = ({
	group,
	onClick,
	...props
}: {
	group: GroupDetails
	onClick?: React.MouseEventHandler<HTMLButtonElement>
} & Omit<CardProps, 'onClick'>) => {
	const [formTitle, setFormTitle] = React.useState('Saisir une dépense')
	const [form, setForm] = React.useState<React.ReactNode>()
	const [openForm, setOpenForm] = React.useState(false)
	const [income, setIncome] = React.useState<
		| {
				amount: string
				updatedAt: Date
		  }
		| undefined
	>()

	const handleOpenForm = async (form: 'expense' | 'income') => {
		if (
			form === 'expense' &&
			(income || group.shareMode === ShareMode.EGALITARIAN)
		) {
			setFormTitle('Saisir une dépense')
			setForm(
				<ExpenseForm
					initialValues={{
						groupId: group.id,
					}}
					onSuccess={() => setOpenForm(false)}
				/>
			)
		} else {
			setFormTitle('Saisir votre revenu mensuel')
			setForm(
				<IncomeForm
					initialValues={{
						groupId: group.id,
						income: income?.amount,
					}}
					onSuccess={() => {
						setOpenForm(false)
						handleOpenForm('expense')
					}}
				/>
			)
		}
		setOpenForm(true)
	}

	React.useEffect(() => {
		const fetchIncome = async () => {
			const fetchedIncome = await getIncome(group.id)
			console.log('fetchIncome', fetchedIncome)
			fetchedIncome?.income &&
				setIncome({
					amount: dineroFormat(
						dinero({
							amount: fetchedIncome.income,
							currency: USD,
						})
					),
					updatedAt: fetchedIncome.updatedAt,
				})
		}

		group.shareMode === ShareMode.FAIR && fetchIncome()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [group])

	React.useEffect(() => {
		console.log('income', income)
	}, [income])

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
								onClick={() => handleOpenForm('expense')}
								size='large'
								disabled={
									group.members.length === 1 ||
									(group.shareMode === ShareMode.FAIR &&
										income &&
										group.members.some(
											(member) => !member.isIncomeSet
										))
								}
							>
								<AddCardRoundedIcon fontSize='inherit' />
							</IconButton>
						</Grid>
					</Grid>
				</CardActions>
			</Card>
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>{formTitle}</DialogTitle>
				<DialogContent>
					{formTitle === 'Saisir une dépense' && income && (
						<Alert
							severity='info'
							action={
								<IconButton
									aria-label='edit'
									color='inherit'
									size='small'
									onClick={() => {
										setOpenForm(false)
										handleOpenForm('income')
									}}
								>
									<EditIcon />
								</IconButton>
							}
							sx={{
								fontSize: '.7em',
								mb: 2,
								alignContent: 'center',
							}}
						>
							<AlertTitle sx={{ fontSize: '1em' }}>
								Revenus : {income.amount}€
							</AlertTitle>
							Mis à jour le{' '}
							{new Date(income.updatedAt).toLocaleDateString(
								'fr-FR'
							)}
						</Alert>
					)}
					{form}
				</DialogContent>
			</Dialog>
		</>
	)
}

export default GroupCard
