'use client'
import { useFormStatus } from 'react-dom'
import { Backdrop, CircularProgress } from '@mui/material'

const FormLoader = () => {
	const { pending } = useFormStatus()

	return (
		<Backdrop
			open={pending}
			sx={{
				position: 'absolute',
				zIndex: (theme) => theme.zIndex.modal + 1,
				bgcolor: 'rgba(255, 255, 255, 0.5)',
			}}
		>
			<CircularProgress />
		</Backdrop>
	)
}

export default FormLoader
