'use client'
import {
	AvatarGroup,
	CardContent,
	CardContentProps,
	Typography,
} from '@mui/material'
import UserAvatar from './UserAvatar'
import { InviteDetail } from '@/actions/invite'

const GroupCardContent = ({
	group,
	...props
}: {
	group: InviteDetail['group']
} & CardContentProps) => {
	return (
		<CardContent {...props}>
			<Typography
				sx={{ fontSize: 20 }}
				color='text.secondary'
				gutterBottom
			>
				{group.name}
			</Typography>

			{group.members.length > 0 ? (
				<AvatarGroup max={3} sx={{ justifyContent: 'center' }}>
					{group.members.map((member) => (
						<UserAvatar
							key={`${group.id}-${member.user.name}`}
							user={member.user}
						/>
					))}
				</AvatarGroup>
			) : (
				<Typography
					variant='body1'
					sx={{ textAlign: 'center', lineHeight: '2.7em' }}
				>
					Invitez des membres
				</Typography>
			)}
		</CardContent>
	)
}

export default GroupCardContent
