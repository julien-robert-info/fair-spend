import { Box } from '@mui/material'
import GroupDashboard from './dashboard/GroupDashboard'
import { getGroups } from '@/utils/actions/group'

const Dashboard = async () => {
	const groups = await getGroups()

	return (
		<Box>
			<GroupDashboard groups={groups} />
		</Box>
	)
}

export default Dashboard
