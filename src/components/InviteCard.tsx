'use client'
import React from 'react'
import { Card, CardActions, IconButton, Grid, CardProps } from '@mui/material'
import { deleteInvite, InviteDetail } from '@/actions/invite'
import { joinGroup } from '@/actions/group'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import GroupCardContent from './GroupCardContent'

const InviteCard = ({ group, ...props }: InviteDetail & CardProps) => {
	const handleAccept = async () => {
		await joinGroup(group.id)
		await deleteInvite(group.id)
	}

	const handleDecline = async () => {
		await deleteInvite(group.id)
	}

	return (
		<Card {...props}>
			<GroupCardContent
				group={group}
				sx={{ position: 'relative', opacity: 0.5 }}
			/>
			<CardActions disableSpacing>
				<Grid container justifyContent='space-around'>
					<Grid item>
						<IconButton
							aria-label='accept'
							color='success'
							onClick={handleAccept}
						>
							<CheckIcon />
						</IconButton>
					</Grid>
					<Grid item>
						<IconButton
							aria-label='decline'
							color='error'
							onClick={handleDecline}
						>
							<CloseIcon />
						</IconButton>
					</Grid>
				</Grid>
			</CardActions>
		</Card>
	)
}

export default InviteCard
