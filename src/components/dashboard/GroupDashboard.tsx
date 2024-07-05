'use client'
import React from 'react'
import {
	Avatar,
	Box,
	Button,
	Card,
	CardActionArea,
	CardActions,
	CardContent,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Stack,
	Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { GroupDetails, deleteGroup } from '@/actions/group'
import { GroupForm, GroupFormFields } from '@/forms/GroupForm'

const GroupDashboard = ({ groups }: { groups: GroupDetails[] }) => {
	const [openForm, setOpenForm] = React.useState(false)
	const [formValues, setFormValues] = React.useState<GroupFormFields>({})
	const [formTitle, setFormTitle] = React.useState('Nouveau groupe')
	const [openDelete, setOpenDelete] = React.useState(false)
	const [deleteId, setDeleteId] = React.useState('')

	const handleOpenForm = (id?: string) => {
		if (!id) {
			setFormTitle('Nouveau groupe')
			setFormValues({})
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

	const handleOpenDelete = (id: string) => {
		setDeleteId(id)
		setOpenDelete(true)
	}

	const handleDelete = () => {
		deleteGroup(deleteId)
		setOpenDelete(false)
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
				{groups.map((group) => (
					<Card key={group.id} sx={{ minWidth: 150 }}>
						<CardActionArea>
							<CardContent>
								<Typography
									sx={{ fontSize: 20 }}
									color='text.secondary'
									gutterBottom
								>
									{group.name}
								</Typography>
								<Typography variant='body1' component='div'>
									{group.members.length} membres
								</Typography>
							</CardContent>
						</CardActionArea>
						<CardActions disableSpacing>
							{group.isOwner && (
								<>
									<IconButton
										aria-label='edit'
										onClick={() => handleOpenForm(group.id)}
									>
										<EditIcon />
									</IconButton>
									<IconButton
										aria-label='delete'
										onClick={() =>
											handleOpenDelete(group.id)
										}
									>
										<DeleteIcon />
									</IconButton>
								</>
							)}
						</CardActions>
					</Card>
				))}
				<Card onClick={() => handleOpenForm()} sx={{ minWidth: 150 }}>
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
				<GroupForm initialValues={formValues} />
			</Dialog>
			<Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
				<DialogTitle>Confirmation</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Souhaitez vous supprimer ce groupe
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenDelete(false)}>Non</Button>
					<Button onClick={handleDelete} autoFocus>
						Oui
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	)
}

export default GroupDashboard
