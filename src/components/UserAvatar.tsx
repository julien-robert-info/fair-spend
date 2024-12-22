'use client'
import { stringAvatar } from '@/utils/string'
import { Avatar, Tooltip } from '@mui/material'
import { DefaultSession } from 'next-auth'

const UserAvatar = ({ user }: { user: DefaultSession['user'] }) => {
	return (
		<Tooltip title={user?.name}>
			<Avatar
				{...(user?.image
					? { alt: user.name!, src: user.image }
					: stringAvatar(user?.name!))}
			/>
		</Tooltip>
	)
}

export default UserAvatar
