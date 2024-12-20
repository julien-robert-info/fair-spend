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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { GroupDetails } from '@/actions/group'
import { InviteDetail } from '@/actions/invite'
import GroupStack from './GroupStack'
import { GroupForm, GroupFormFields } from '@/forms/GroupForm'
import GroupCarousel from './GroupCarousel'

export type DashboardProps = {
	groups: GroupDetails[]
	invites: InviteDetail[]
}

const Dashboard: React.FC<DashboardProps> = ({ groups, invites }) => {
	const theme = useTheme()
	const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))
	const [openForm, setOpenForm] = React.useState(false)
	const [formValues, setFormValues] = React.useState<GroupFormFields>({})
	const [formTitle, setFormTitle] = React.useState('Nouveau groupe')
	const [currentGroup, setCurrentGroup] = React.useState<string | undefined>()

	const handleOpenForm = (id?: string) => {
		const group = groups.find((group: GroupDetails) => group.id === id)

		setFormTitle(group ? 'Modifier groupe' : 'Nouveau groupe')
		setFormValues({
			id: group?.id,
			name: group?.name,
			shareMode: group?.shareMode,
			onSuccess: (resultGroup) => {
				setCurrentGroup(resultGroup?.id)
				setOpenForm(false)
			},
		})
		setOpenForm(true)
	}

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
				<Typography variant='h5'>Groupes</Typography>
				{!isDesktop && (
					<Fab
						size='small'
						color='secondary'
						aria-label='add'
						onClick={() => handleOpenForm()}
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
					handleOpenForm={handleOpenForm}
				/>
			) : (
				<GroupCarousel
					groups={groups}
					invites={invites}
					currentGroup={currentGroup}
					setCurrentGroup={setCurrentGroup}
					handleOpenForm={handleOpenForm}
				/>
			)}
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>{formTitle}</DialogTitle>
				<DialogContent>
					<GroupForm initialValues={formValues} />
				</DialogContent>
			</Dialog>
		</Box>
	)
}

export default Dashboard
