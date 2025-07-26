import { Backdrop, BackdropProps, CircularProgress } from '@mui/material'

const Loader: React.FC<BackdropProps> = (props) => {
	return (
		<Backdrop {...props}>
			<CircularProgress />
		</Backdrop>
	)
}

export default Loader
