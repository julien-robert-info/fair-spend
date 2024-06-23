'use client'
import { GroupDetails } from '@/utils/actions/group'
import {
	Avatar,
	Box,
	Button,
	Card,
	CardActionArea,
	CardActions,
	CardContent,
	Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

const GroupDashboard = ({ groups }: { groups: GroupDetails[] }) => {
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
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					gap: 1,
					m: 1,
				}}
			>
				{groups.map((group) => (
					<Card key={group.id} sx={{ minWidth: 275 }}>
						<CardContent>
							<Typography
								sx={{ fontSize: 14 }}
								color='text.secondary'
								gutterBottom
							>
								{group.name}
							</Typography>
							<Typography variant='h5' component='div'>
								{group.members.length} membres
							</Typography>
						</CardContent>
						<CardActions>
							<Button size='small'>Détails</Button>
						</CardActions>
					</Card>
				))}
			</Box>
		</Box>
	)
}

export default GroupDashboard
