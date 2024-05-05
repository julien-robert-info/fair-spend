import { auth } from '@/utils/auth'

const Dashboard = async () => {
	const session = await auth()

	if (!session) {
		return
	}

	return 'Dashboard'
}

export default Dashboard
