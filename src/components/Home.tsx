'use client'

import { Button, Link, Typography } from '@mui/material'

export const Home = () => {
	return (
		<>
			<Typography variant='h4'>
				Partagez vos dépenses équitablement avec FairSpend
			</Typography>
			<Link href='/api/auth/signin'>
				<Button>Commencer/Se connecter</Button>
			</Link>
		</>
	)
}
