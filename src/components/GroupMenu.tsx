'use client'
import React from 'react'
import { deleteGroup, GroupDetails } from '@/actions/group'
import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import LogoutIcon from '@mui/icons-material/Logout'
import InviteForm from '@/forms/InviteForm'
import TransferGroupForm from '@/forms/TransferGroupForm'
import { leaveGroup } from '@/actions/member'
import GroupForm from '@/forms/GroupForm'

const GroupMenu = ({ group }: { group: GroupDetails }) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
	const openMenu = Boolean(anchorEl)
	const [openForm, setOpenForm] = React.useState(false)
	const [formTitle, setFormTitle] = React.useState(
		'Inviter un nouveau membre'
	)
	const [form, setForm] = React.useState<React.ReactNode>()
	const [openConfirm, setOpenConfirm] = React.useState(false)
	const [confirmError, setConfirmError] = React.useState<string | undefined>()
	const [confirmText, setConfirmText] = React.useState(
		'Souhaitez vous quitter ce budget partagé'
	)
	const [confirmAction, setConfirmAction] =
		React.useState<() => Promise<void>>()

	const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget)
	}
	const handleCloseMenu = () => {
		setAnchorEl(null)
	}

	const menuItems = React.useMemo(
		() => [
			{
				icon: <ShareIcon />,
				name: 'Inviter',
				action: () => handleOpenForm('invite'),
			},
			...(group.isOwner
				? [
						{
							icon: <EditIcon />,
							name: 'Modifier',
							action: () => handleOpenForm('edit'),
						},
						...(group.members.length > 1
							? [
									{
										icon: <LogoutIcon />,
										name: 'Quitter',
										action: () =>
											handleOpenForm('transfer'),
									},
							  ]
							: [
									{
										icon: <DeleteIcon />,
										name: 'Supprimer',
										action: () =>
											handleOpenConfirm('delete'),
									},
							  ]),
				  ]
				: [
						{
							icon: <LogoutIcon />,
							name: 'Quitter',
							action: () => handleOpenConfirm('leave'),
						},
				  ]),
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[group]
	)

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

	const handleOpenForm = (form: 'edit' | 'invite' | 'transfer') => {
		switch (form) {
			case 'edit':
				setFormTitle('Modifier le budget partagé')
				setForm(
					<GroupForm
						initialValues={{
							id: group.id,
							name: group.name,
							shareMode: group.shareMode,
						}}
						onSuccess={() => {
							setOpenForm(false)
							handleCloseMenu()
						}}
					/>
				)
				break
			case 'invite':
				setFormTitle('Inviter un nouveau membre')
				setForm(
					<InviteForm
						initialValues={{
							groupId: group.id,
						}}
						onSuccess={() => setOpenForm(false)}
					/>
				)
				break
			case 'transfer':
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

	return (
		<>
			<IconButton
				aria-label='menu'
				aria-controls={openMenu ? 'group-menu' : undefined}
				aria-haspopup='true'
				onClick={handleOpenMenu}
			>
				<MoreHorizIcon />
			</IconButton>
			<Menu
				id='group-menu'
				anchorEl={anchorEl}
				open={openMenu}
				onClose={handleCloseMenu}
				MenuListProps={{
					'aria-labelledby': 'group-menu',
				}}
			>
				{menuItems.map((item) => (
					<MenuItem key={item.name} onClick={item.action}>
						<ListItemIcon>{item.icon}</ListItemIcon>
						{item.name}
					</MenuItem>
				))}
			</Menu>
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

export default GroupMenu
