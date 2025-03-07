'use client'
import React from 'react'
import {
	Card,
	CardActions,
	IconButton,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Alert,
	CardProps,
	Grid,
	CardActionArea,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import LogoutIcon from '@mui/icons-material/Logout'
import InviteForm from '@/forms/InviteForm'
import GroupCardContent from './GroupCardContent'
import TransferGroupForm from '@/forms/TransferGroupForm'
import { deleteGroup, GroupDetails } from '@/actions/group'
import { leaveGroup } from '@/actions/member'

const GroupCard = ({
	group,
	edit,
	onClick,
	...props
}: {
	group: GroupDetails
	edit: (id?: number) => void
	onClick?: React.MouseEventHandler<HTMLButtonElement>
} & Omit<CardProps, 'onClick'>) => {
	const [openConfirm, setOpenConfirm] = React.useState(false)
	const [confirmError, setConfirmError] = React.useState<string | undefined>()
	const [confirmText, setConfirmText] = React.useState(
		'Souhaitez vous quitter ce budget partagé'
	)
	const [confirmAction, setConfirmAction] =
		React.useState<() => Promise<void>>()
	const [openForm, setOpenForm] = React.useState(false)
	const [formTitle, setFormTitle] = React.useState(
		'Inviter un nouveau membre'
	)
	const [form, setForm] = React.useState<React.ReactNode>()

	const handleOpenConfirm = (action: 'delete' | 'leave') => {
		if (action === 'delete') {
			setConfirmText('Souhaitez vous supprimer ce budget partagé')
			setConfirmAction(() => handleDelete)
		} else {
			setConfirmText('Souhaitez vous quitter ce budget partagé')
			setConfirmAction(() => handleLeave)
		}
		setConfirmError(undefined)
		setOpenConfirm(true)
	}

	const handleOpenForm = (form: 'invite' | 'transfer') => {
		if (form === 'invite') {
			setFormTitle('Inviter un nouveau membre')
			setForm(
				<InviteForm
					initialValues={{
						groupId: group.id,
					}}
					onSuccess={() => setOpenForm(false)}
				/>
			)
		} else {
			setFormTitle(
				'Souhaitez vous transférer et quitter ce budget partagé'
			)
			setForm(
				<TransferGroupForm
					initialValues={{
						id: group.id,
						members: group.members,
					}}
					onSuccess={async () => {
						await leaveGroup(group.id)
						setOpenForm(false)
					}}
				/>
			)
		}
		setOpenForm(true)
	}

	const handleDelete = async () => {
		const result = await deleteGroup(group.id)
		if (result.message === 'success') {
			setConfirmError(undefined)
			setOpenConfirm(false)
		} else {
			setConfirmError(result.message)
		}
	}

	const handleLeave = async () => {
		await leaveGroup(group.id)
	}

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
								aria-label='share'
								onClick={() => handleOpenForm('invite')}
							>
								<ShareIcon />
							</IconButton>
						</Grid>
						{group.isOwner ? (
							<>
								<Grid item>
									<IconButton
										aria-label='edit'
										onClick={() => edit(group.id)}
									>
										<EditIcon />
									</IconButton>
								</Grid>
								{group.members.length > 0 ? (
									<Grid item>
										<IconButton
											aria-label='leave'
											onClick={() =>
												handleOpenForm('transfer')
											}
										>
											<LogoutIcon />
										</IconButton>
									</Grid>
								) : (
									<Grid item>
										<IconButton
											aria-label='delete'
											onClick={() =>
												handleOpenConfirm('delete')
											}
										>
											<DeleteIcon />
										</IconButton>
									</Grid>
								)}
							</>
						) : (
							<Grid item>
								<IconButton
									aria-label='leave'
									onClick={() => handleOpenConfirm('leave')}
								>
									<LogoutIcon />
								</IconButton>
							</Grid>
						)}
					</Grid>
				</CardActions>
			</Card>
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
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>{formTitle}</DialogTitle>
				<DialogContent>{form}</DialogContent>
			</Dialog>
		</>
	)
}

export default GroupCard
