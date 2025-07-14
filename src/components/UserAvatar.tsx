'use client'
import React from 'react'
import { DefaultSession } from 'next-auth'
import { Avatar, AvatarProps, Tooltip } from '@mui/material'
import { stringAvatar } from '@/utils'

type UserAvatarProps = AvatarProps & { user: DefaultSession['user'] }

const UserAvatar: React.FC<UserAvatarProps> = ({ user, ...props }) => {
	return (
		<Tooltip title={user?.name}>
			<Avatar
				{...props}
				{...(user?.image
					? { alt: user.name!, src: user.image }
					: stringAvatar(user?.name!))}
			/>
		</Tooltip>
	)
}

export default UserAvatar
