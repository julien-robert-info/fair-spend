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
import { GroupForm, GroupFormProps } from '@/forms/GroupForm'
import GroupCarousel from './GroupCarousel'
import DebtsPanel from './DebtsPanel'

export type DashboardProps = {
	groups: GroupDetails[]
	invites: InviteDetail[]
}

const Dashboard: React.FC<DashboardProps> = ({ groups, invites }) => {
	const theme = useTheme()
	const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))
	const [didmount, setDidmount] = React.useState(false)
	const [openForm, setOpenForm] = React.useState(false)
	const [formValues, setFormValues] = React.useState<GroupFormProps>({
		initialValues: {},
	})
	const [formTitle, setFormTitle] = React.useState('Nouveau groupe')
	const [currentGroup, setCurrentGroup] = React.useState<number | undefined>()

	React.useEffect(() => {
		if (!didmount) {
			setDidmount(true)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleOpenForm = (id?: number) => {
		const group = groups.find((group: GroupDetails) => group.id === id)

		setFormTitle(group ? 'Modifier groupe' : 'Nouveau groupe')
		setFormValues({
			initialValues: {
				id: group?.id,
				name: group?.name,
				shareMode: group?.shareMode,
			},
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
				{didmount && !isDesktop && (
					<Fab
						size='small'
						color='secondary'
						aria-label='add_group'
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
				didmount &&
				(invites.length > 0 || groups.length > 0) && (
					<GroupCarousel
						groups={groups}
						invites={invites}
						currentGroup={currentGroup}
						setCurrentGroup={setCurrentGroup}
						handleOpenForm={handleOpenForm}
					/>
				)
			)}
			<DebtsPanel
				group={groups.find((group) => group.id === currentGroup)}
			/>
			<Dialog open={openForm} onClose={() => setOpenForm(false)}>
				<DialogTitle>{formTitle}</DialogTitle>
				<DialogContent>
					<GroupForm {...formValues} />
				</DialogContent>
			</Dialog>
		</Box>
	)
}

export default Dashboard
