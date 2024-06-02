import Dashboard from '@/components/Dashboard'
import { auth } from '@/utils/auth'
import { Box } from '@mui/material'

const Home = async () => {
	const session = await auth()

	return <Box component='main'>{session ? <Dashboard /> : <Home />}</Box>
}

export default Home
