'use client'
import React from 'react'
import {
	AppBar,
	Divider,
	Avatar,
	Box,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
} from '@mui/material'
import { signOut } from 'next-auth/react'
import HeaderTitle from './HeaderTitle'
import { DefaultSession } from 'next-auth'
import { stringAvatar } from '@/utils/string'
import UserAvatar from './UserAvatar'

const Header = ({ user }: { user: DefaultSession['user'] }) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

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

	return (
		<AppBar position='static'>
			<Toolbar>
				<HeaderTitle />
				<Box>
					<IconButton
						size='large'
						aria-label='account'
						aria-controls='menu-appbar'
						aria-haspopup='true'
						onClick={handleMenu}
						color='inherit'
					>
						<UserAvatar
							user={{ name: user?.name!, image: user?.image! }}
						/>
					</IconButton>
					<Menu
						id='menu-appbar'
						anchorEl={anchorEl}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'left',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'bottom',
							horizontal: 'left',
						}}
						open={Boolean(anchorEl)}
						onClose={handleClose}
					>
						<MenuItem onClick={handleLogout}>Logout</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
			<Divider />
		</AppBar>
	)
}

export default Header
