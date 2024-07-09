'use client'
import { stringAvatar } from '@/utils/string'
import { Avatar } from '@mui/material'
import { DefaultSession } from 'next-auth'

const UserAvatar = ({ user }: { user: DefaultSession['user'] }) => {
	return user?.image ? (
		<Avatar alt={user.name!} src={user.image} />
	) : (
		<Avatar {...stringAvatar(user?.name!)} />
	)
}

export default UserAvatar
