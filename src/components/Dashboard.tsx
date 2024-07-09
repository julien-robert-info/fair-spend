import { Box } from '@mui/material'
import GroupDashboard from './GroupDashboard'
import { getGroups } from '@/actions/group'
import { getInvites } from '@/actions/invite'

const Dashboard = async () => {
	const invites = await getInvites()
	const groups = await getGroups()

	return (
		<Box>
			<GroupDashboard groups={groups} invites={invites} />
		</Box>
	)
}

export default Dashboard
