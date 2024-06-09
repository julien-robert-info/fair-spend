'use client'
import React from 'react'
import {
	AppBar,
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

function stringToColor(string: string) {
	let hash = 0
	let i

	/* eslint-disable no-bitwise */
	for (i = 0; i < string.length; i += 1) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash)
	}

	let color = '#'

	for (i = 0; i < 3; i += 1) {
		const value = (hash >> (i * 8)) & 0xff
		color += `00${value.toString(16)}`.slice(-2)
	}
	/* eslint-enable no-bitwise */

	return color
}

function stringAvatar(name: string) {
	return {
		sx: {
			bgcolor: stringToColor(name),
		},
		children: `${name.charAt(0)}`,
	}
}

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
		<AppBar position='static' sx={{ lineHeight: '.75em' }}>
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
						{user?.image ? (
							<Avatar src={user.image} />
						) : (
							<Avatar {...stringAvatar(user?.name!)} />
						)}
					</IconButton>
					<Menu
						id='menu-appbar'
						anchorEl={anchorEl}
						anchorOrigin={{
							vertical: 'top',
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
						<MenuItem onClick={handleLogout}>Logout</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default Header
