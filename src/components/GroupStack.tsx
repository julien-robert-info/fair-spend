'use client'
import React from 'react'
import {
	Avatar,
	Card,
	CardActionArea,
	CardContent,
	Stack,
	Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import GroupCard from './GroupCard'
import InviteCard from './InviteCard'
import { DashboardProps } from './Dashboard'

export type GroupDashboardProps = DashboardProps & {
	currentGroup: number | undefined
	setCurrentGroup: React.Dispatch<React.SetStateAction<number | undefined>>
	handleOpenForm: () => void
}

const GroupStack: React.FC<GroupDashboardProps> = ({
	groups,
	invites,
	currentGroup,
	setCurrentGroup,
	handleOpenForm,
}) => {
	React.useEffect(() => {
		if (groups.length > 0) {
			setCurrentGroup(groups[0]?.id)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Stack
			direction='row'
			spacing={1}
			sx={{
				overflow: 'auto',
				p: 1,
			}}
		>
			{invites.map((invite) => (
				<InviteCard
					key={invite.group.name}
					group={invite.group}
					sx={{ minWidth: 180 }}
				/>
			))}
			{groups.map((group) => (
				<GroupCard
					key={group.id}
					onClick={() => setCurrentGroup(group.id)}
					group={group}
					sx={{
						minWidth: 180,
						...(currentGroup === group.id && {
							border: 2,
							borderColor: 'secondary.main',
						}),
					}}
				/>
			))}
			<Card sx={{ minWidth: 180, textAlign: 'center' }}>
				<CardActionArea
					onClick={() => handleOpenForm()}
					sx={{ height: '100%' }}
				>
					<CardContent>
						<Typography sx={{ fontSize: 20 }} gutterBottom>
							Nouveau budget
						</Typography>
						<Avatar
							aria-label='add'
							sx={{
								color: 'white',
								bgcolor: 'secondary.dark',
								':hover': { bgcolor: 'secondary.dark' },
								mx: 'auto',
							}}
						>
							<AddIcon />
						</Avatar>
					</CardContent>
				</CardActionArea>
			</Card>
		</Stack>
	)
}

export default GroupStack
