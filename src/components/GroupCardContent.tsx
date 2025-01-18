'use client'
import {
	AvatarGroup,
	Backdrop,
	CardContent,
	CardContentProps,
	Tooltip,
	Typography,
} from '@mui/material'
import UserAvatar from './UserAvatar'
import { InviteDetail } from '@/actions/invite'
import { ShareMode } from '@prisma/client'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import BalanceIcon from '@mui/icons-material/Balance'

const GroupCardContent = ({
	group,
	isInvite,
	...props
}: {
	group: InviteDetail['group']
	isInvite?: Boolean
} & CardContentProps) => {
	return (
		<CardContent {...props}>
			{isInvite && (
				<Backdrop
					open={true}
					sx={{
						position: 'absolute',
						zIndex: (theme) => theme.zIndex.tooltip + 1,
						bgcolor: 'rgba(255, 255, 255, 0.5)',
						alignItems: 'end',
					}}
				>
					<Typography sx={{ mb: -1 }}>
						Invitation en attente
					</Typography>
				</Backdrop>
			)}
			{group.shareMode === ShareMode.FAIR ? (
				<Tooltip
					title={`${
						group.members.some((member) => !member.isIncomeSet) &&
						!isInvite
							? 'tous les membres doivent définir leur revenu'
							: 'Mode équitable'
					}`}
				>
					<VolunteerActivismIcon
						color={
							group.members.some(
								(member) => !member.isIncomeSet
							) && !isInvite
								? 'error'
								: 'disabled'
						}
						sx={{
							position: 'absolute',
							right: 16,
						}}
					/>
				</Tooltip>
			) : (
				<Tooltip title='Mode égalitaire'>
					<BalanceIcon
						color='disabled'
						sx={{ position: 'absolute', right: 16 }}
					/>
				</Tooltip>
			)}
			<Typography sx={{ fontSize: 20 }} gutterBottom>
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
