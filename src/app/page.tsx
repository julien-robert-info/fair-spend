import Dashboard from '@/components/Dashboard'
import Home from '@/components/Home'
import { auth } from '@/utils/auth'
import { getGroups } from '@/actions/group'
import { getInvites } from '@/actions/invite'
import { Box } from '@mui/material'

const Page = async () => {
	const session = await auth()
	const invites = (session && (await getInvites())) ?? []
	const groups = (session && (await getGroups())) ?? []

	return (
		<Box component='main'>
			{session !== null ? (
				<Dashboard groups={groups} invites={invites} />
			) : (
				<Home />
			)}
		</Box>
	)
}

export default Page
