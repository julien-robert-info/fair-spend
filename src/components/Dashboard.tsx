'use client'
import React from 'react'
import {
	useTheme,
	useMediaQuery,
	Box,
	Fab,
	Typography,
	Dialog,
	DialogContent,
	DialogTitle,
	Paper,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { GroupDetails } from '@/actions/group'
import { InviteDetail } from '@/actions/invite'
import GroupStack from './GroupStack'
import GroupForm from '@/forms/GroupForm'
import GroupCarousel from './GroupCarousel'
import GroupPanelWrapper from './Panels/GroupPanelWrapper'

export type DashboardProps = {
	groups: GroupDetails[]
	invites: InviteDetail[]
}

const Dashboard: React.FC<DashboardProps> = ({ groups, invites }) => {
	const theme = useTheme()
	const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))
	const [didmount, setDidmount] = React.useState(false)
	const [openForm, setOpenForm] = React.useState(false)
	const [currentGroup, setCurrentGroup] = React.useState<number | undefined>()

	const currentGroupDetails = React.useMemo(() => {
		return groups.find((group) => group.id === currentGroup)
	}, [groups, currentGroup])

	React.useEffect(() => {
		setDidmount(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Box>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					bgcolor: 'primary.main',
					gap: 2,
					p: 1,
				}}
			>
				<Typography variant='h5'>Budgets partagés</Typography>
				{didmount && !isDesktop && (
					<Fab
						size='small'
						color='secondary'
						aria-label='add_group'
						onClick={() => setOpenForm(true)}
					>
						<AddIcon />
					</Fab>
				)}
			</Box>
			{isDesktop ? (
				<GroupStack
					groups={groups}
					invites={invites}
					currentGroup={currentGroup}
					setCurrentGroup={setCurrentGroup}
					handleOpenForm={() => setOpenForm(true)}
				/>
			) : (
				didmount &&
				invites.length + groups.length > 0 && (
					<GroupCarousel
						groups={groups}
						invites={invites}
						currentGroup={currentGroup}
						setCurrentGroup={setCurrentGroup}
					/>
				)
			)}
			{invites.length + groups.length === 0 && (
				<Paper
					sx={{
						position: 'relative',
						minHeight: '10em',
						width: '97vw',
						my: 2,
						mx: 'auto',
						p: 2,
					}}
				>
					<Typography component={'h4'}>
						Créez un Budget et invitez des membres pour commencer
					</Typography>
				</Paper>
			)}
			<GroupPanelWrapper
				group={currentGroupDetails}
				isDesktop={isDesktop}
			/>
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>Nouveau budget partagé</DialogTitle>
				<DialogContent>
					<GroupForm
						initialValues={{}}
						onSuccess={(resultGroup) => {
							setCurrentGroup(resultGroup?.id)
							setOpenForm(false)
						}}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	)
}

export default Dashboard
