'use client'
import React from 'react'
import {
	Card,
	CardActionArea,
	CardContent,
	Fab,
	Stack,
	Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import GroupCard from './GroupCard'
import InviteCard from './InviteCard'
import { DashboardProps } from './Dashboard'

export type GroupDashboardProps = DashboardProps & {
	currentGroup: string | undefined
	setCurrentGroup: React.Dispatch<React.SetStateAction<string | undefined>>
	handleOpenForm: () => void
}

const GroupStack: React.FC<GroupDashboardProps> = ({
	groups,
	invites,
	currentGroup,
	setCurrentGroup,
	handleOpenForm,
}) => {
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
					edit={handleOpenForm}
					sx={{
						minWidth: 180,
						...(currentGroup === group.id && {
							border: 2,
							borderColor: 'secondary.main',
						}),
					}}
				/>
			))}
			<Card
				onClick={() => handleOpenForm()}
				sx={{ minWidth: 180, textAlign: 'center' }}
			>
				<CardActionArea sx={{ height: '100%' }}>
					<CardContent>
						<Typography
							sx={{ fontSize: 20 }}
							color='text.secondary'
							gutterBottom
						>
							Nouveau groupe
						</Typography>
						<Fab
							size='small'
							aria-label='add'
							sx={{
								color: 'white',
								bgcolor: 'secondary.dark',
								':hover': { bgcolor: 'secondary.dark' },
							}}
						>
							<AddIcon />
						</Fab>
					</CardContent>
				</CardActionArea>
			</Card>
		</Stack>
	)
}

export default GroupStack
