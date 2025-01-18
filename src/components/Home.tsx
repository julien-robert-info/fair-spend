'use client'
import { Box, Typography } from '@mui/material'

const Home = () => {
	return (
		<Box sx={{ textAlign: 'center' }}>
			<Typography variant='h4' sx={{ fontWeight: '700', m: 3 }}>
				Partagez vos dépenses équitablement avec FairSpend
			</Typography>
			<Typography variant='h5'>
				La solution de gestion de budget partagé sans stress
			</Typography>
		</Box>
	)
}

export default Home
