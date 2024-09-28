'use client'
import React from 'react'
import {
	Box,
	Card,
	CardActionArea,
	CardContent,
	Dialog,
	DialogContent,
	DialogTitle,
	Fab,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { GroupDetails } from '@/actions/group'
import { GroupForm, GroupFormFields } from '@/forms/GroupForm'
import GroupCard from './GroupCard'
import { InviteDetail } from '@/actions/invite'
import InviteCard from './InviteCard'
import Carousel from 'react-material-ui-carousel'

const GroupDashboard = ({
	groups,
	invites,
}: {
	groups: GroupDetails[]
	invites: InviteDetail[]
}) => {
	const theme = useTheme()
	const isDesktop = useMediaQuery(theme.breakpoints.up('sm'))
	const [openForm, setOpenForm] = React.useState(false)
	const [formValues, setFormValues] = React.useState<GroupFormFields>({})
	const [formTitle, setFormTitle] = React.useState('Nouveau groupe')
	const [currentGroup, setCurrentGroup] = React.useState<string | undefined>()
	const [carouselIndex, setCarouselIndex] = React.useState(0)

	React.useEffect(() => {
		setCarouselIndex((carouselIndex) =>
			currentGroup
				? invites.length +
				  groups.findIndex((group) => group.id === currentGroup)
				: carouselIndex
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [groups, currentGroup])

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

	const handleChange = (now?: number) => {
		if (now && now > invites.length) {
			setCurrentGroup(groups[now - invites.length]?.id)
		} else {
			now && setCarouselIndex(now)
		}
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
							group={group}
							edit={handleOpenForm}
							sx={{ minWidth: 180 }}
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
			) : (
				<Carousel
					index={carouselIndex}
					onChange={handleChange}
					autoPlay={false}
					navButtonsAlwaysVisible={true}
					cycleNavigation={false}
				>
					{...[
						...invites.map((invite, i) => (
							<InviteCard
								key={`invite-${i}`}
								group={invite.group}
								sx={{ minWidth: 180 }}
							/>
						)),
						...groups.map((group, i) => (
							<GroupCard
								key={`group-${i}`}
								group={group}
								edit={handleOpenForm}
								sx={{ minWidth: 180 }}
							/>
						)),
					]}
				</Carousel>
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

export default GroupDashboard
