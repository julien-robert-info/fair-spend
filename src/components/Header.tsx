'use client'
import React from 'react'
import {
	AppBar,
	Divider,
	Box,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
	Button,
	Link,
	Typography,
	Breadcrumbs,
	Dialog,
	DialogContent,
	DialogTitle,
} from '@mui/material'
import { signOut } from 'next-auth/react'
import { DefaultSession } from 'next-auth'
import UserAvatar from './UserAvatar'
import { usePathname } from 'next/navigation'
import FeedbackForm from '@/forms/FeedbackForm'

const Header = ({ user }: { user: DefaultSession['user'] }) => {
	const pathName = usePathname()
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
	const [openForm, setOpenForm] = React.useState(false)

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	const handleLogout = () => {
		handleClose()
		signOut()
	}

	const handleContact = () => {
		setOpenForm(true)
		handleClose()
	}

	return (
		<>
			<AppBar position='static'>
				<Toolbar>
					<Typography
						variant='h5'
						color='text.primary'
						sx={{ fontWeight: '700' }}
					>
						Fair spend
					</Typography>
					{user && (
						<Breadcrumbs aria-label='breadcrumb' sx={{ ml: 2 }}>
							<Typography color='text.primary'>
								{pathName === '/' ? 'Dashboard' : pathName}
							</Typography>
						</Breadcrumbs>
					)}
					<Box sx={{ flexGrow: 1 }}></Box>
					<Box>
						{user ? (
							<>
								<IconButton
									size='large'
									aria-label='account'
									aria-controls='menu-appbar'
									aria-haspopup='true'
									aria-expanded={
										anchorEl ? 'true' : undefined
									}
									onClick={handleMenu}
									color='inherit'
								>
									<UserAvatar
										user={{
											name: user?.name!,
											image: user?.image!,
										}}
									/>
								</IconButton>
								<Menu
									id='menu-appbar'
									anchorEl={anchorEl}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'right',
									}}
									keepMounted
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									open={Boolean(anchorEl)}
									onClose={handleClose}
								>
									<MenuItem onClick={handleContact}>
										contact
									</MenuItem>
									<MenuItem onClick={handleLogout}>
										Logout
									</MenuItem>
								</Menu>
							</>
						) : (
							<Link href='/api/auth/signin'>
								<Button
									sx={{
										color: 'secondary.dark',
										bgcolor: 'white',
									}}
								>
									Commencer / Se connecter
								</Button>
							</Link>
						)}
					</Box>
				</Toolbar>
				<Divider />
			</AppBar>
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>Envoyer un message</DialogTitle>
				<DialogContent>
					<FeedbackForm onSuccess={() => setOpenForm(false)} />
				</DialogContent>
			</Dialog>
		</>
	)
}

export default Header
