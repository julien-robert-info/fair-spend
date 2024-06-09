import Dashboard from '@/components/Dashboard'
import Home from '@/components/Home'
import { auth } from '@/utils/auth'
import { Box } from '@mui/material'

const Page = async () => {
	const session = await auth()

	return (
		<Box component='main'>
			{session !== null ? <Dashboard /> : <Home />}
		</Box>
	)
}

export default Page
