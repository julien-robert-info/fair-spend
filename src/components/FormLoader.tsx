'use client'
import { useFormStatus } from 'react-dom'
import Loader from './Loader'

const FormLoader = () => {
	const { pending } = useFormStatus()

	return (
		<Loader
			open={pending}
			sx={{
				position: 'absolute',
				zIndex: (theme) => theme.zIndex.modal + 1,
				bgcolor: 'rgba(255, 255, 255, 0.5)',
			}}
		/>
	)
}

export default FormLoader
