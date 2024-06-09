'use client'
import { Breadcrumbs, Typography } from '@mui/material'
import { usePathname } from 'next/navigation'

const HeaderTitle = () => {
	const pathName = usePathname()

	return (
		<Breadcrumbs aria-label='breadcrumb' sx={{ flexGrow: 1 }}>
			<Typography color='text.primary'>
				{pathName === '/' ? 'Dashboard' : pathName}
			</Typography>
		</Breadcrumbs>
	)
}

export default HeaderTitle
