'use client'
import React from 'react'
import { DefaultSession } from 'next-auth'
import { Avatar, AvatarProps, Tooltip } from '@mui/material'
import { stringToColor } from '@/utils'

type UserAvatarProps = AvatarProps & { user: DefaultSession['user'] }

const UserAvatar: React.FC<UserAvatarProps> = ({ user, ...props }) => {
	const name = React.useMemo(() => user?.name ?? 'Utilisateur', [user])

	return (
		<Tooltip title={name}>
			<Avatar
				{...props}
				alt={name}
				{...(user?.image
					? { src: user.image }
					: {
							children: `${name.charAt(0)}`,
							sx: { ...props.sx, bgcolor: stringToColor(name) },
					  })}
			/>
		</Tooltip>
	)
}

export default UserAvatar
