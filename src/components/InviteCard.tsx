'use client'
import React from 'react'
import { Card, CardActions, Grid, CardProps, Button } from '@mui/material'
import { deleteInvite, InviteDetail } from '@/actions/invite'
import GroupCardContent from './GroupCardContent'
import { joinGroup } from '@/actions/member'

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
				isInvite={true}
				sx={{ position: 'relative' }}
			/>
			<CardActions disableSpacing>
				<Grid container justifyContent='space-around'>
					<Grid item>
						<Button
							aria-label='accept'
							color='success'
							onClick={handleAccept}
						>
							Accepter
						</Button>
					</Grid>
					<Grid item>
						<Button
							aria-label='decline'
							color='error'
							onClick={handleDecline}
						>
							Refuser
						</Button>
					</Grid>
				</Grid>
			</CardActions>
		</Card>
	)
}

export default InviteCard
