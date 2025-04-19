'use client'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { fr } from 'date-fns/locale/fr'

const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
			{children}
		</LocalizationProvider>
	)
}

export default LocaleProvider
