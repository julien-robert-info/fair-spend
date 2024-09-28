import GroupDashboard from './GroupDashboard'
import { getGroups } from '@/actions/group'
import { getInvites } from '@/actions/invite'

const Dashboard = async () => {
	const invites = await getInvites()
	const groups = await getGroups()

	return <GroupDashboard groups={groups} invites={invites} />
}

export default Dashboard
