'use client'
import React from 'react'
import {
	Avatar,
	Box,
	Card,
	CardActionArea,
	CardContent,
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { GroupDetails } from '@/actions/group'
import { GroupForm, GroupFormFields } from '@/forms/GroupForm'
import GroupCard from './GroupCard'
import { InviteDetail } from '@/actions/invite'
import InviteCard from './InviteCard'

const GroupDashboard = ({
	groups,
	invites,
}: {
	groups: GroupDetails[]
	invites: InviteDetail[]
}) => {
	const [openForm, setOpenForm] = React.useState(false)
	const [formValues, setFormValues] = React.useState<GroupFormFields>({})
	const [formTitle, setFormTitle] = React.useState('Nouveau groupe')

	const handleOpenForm = (id?: string) => {
		if (!id) {
			setFormTitle('Nouveau groupe')
			setFormValues({
				onSuccess: () => setOpenForm(false),
			})
			setOpenForm(true)
			return
		}

		setFormTitle('Modifier groupe')
		const group =
			groups[groups.findIndex((group: GroupDetails) => group.id === id)]
		setFormValues({
			id: group.id,
			name: group.name,
			shareMode: group.shareMode,
			onSuccess: () => setOpenForm(false),
		})
		setOpenForm(true)
	}

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					bgcolor: 'primary.main',
					gap: 2,
					p: 1,
				}}
			>
				<Typography variant='h5'>Groupes</Typography>
			</Box>
			<Stack direction='row' spacing={1} py={1} overflow='auto'>
				{invites.map((invite) => (
					<InviteCard
						key={invite.group.name}
						group={invite.group}
						sx={{ minWidth: 150 }}
					/>
				))}
				{groups.map((group) => (
					<GroupCard
						key={group.id}
						group={group}
						edit={handleOpenForm}
						sx={{ minWidth: 150 }}
					/>
				))}
				<Card
					onClick={() => handleOpenForm()}
					sx={{ minWidth: 150, textAlign: 'center' }}
				>
					<CardActionArea>
						<CardContent>
							<Typography
								sx={{ fontSize: 20 }}
								color='text.secondary'
								gutterBottom
							>
								Nouveau groupe
							</Typography>
							<Avatar
								sx={{
									bgcolor: 'secondary.dark',
									mx: 'auto',
								}}
							>
								<AddIcon />
							</Avatar>
						</CardContent>
					</CardActionArea>
				</Card>
			</Stack>
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>{formTitle}</DialogTitle>
				<DialogContent>
					<GroupForm initialValues={formValues} />
				</DialogContent>
			</Dialog>
		</Box>
	)
}

export default GroupDashboard
