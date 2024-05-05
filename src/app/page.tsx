import Dashboard from '@/components/Dashboard'
import { auth } from '@/utils/auth'
import { Box, Button, Link, Typography } from '@mui/material'

const Home = async () => {
	const session = await auth()

	return (
		<Box component='main'>
			{session ? (
				<Dashboard />
			) : (
				<>
					<Typography variant='h4'>
						Partagez vos dépenses équitablement avec FairSpend
					</Typography>
					<Link href='/api/auth/signin'>
						<Button>Commencer/Se connecter</Button>
					</Link>
				</>
			)}
		</Box>
	)
}

export default Home
