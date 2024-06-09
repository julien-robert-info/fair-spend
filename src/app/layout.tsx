import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import type { Metadata } from 'next'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from '@/theme'
import { auth } from '@/utils/auth'
import Header from '@/components/Header'

export const metadata: Metadata = {
	title: 'Fair Spend',
	description: 'Partagez vos dépenses équitablement avec FairSpend',
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const session = await auth()

	return (
		<html lang='fr' suppressHydrationWarning={true}>
			<body>
				<AppRouterCacheProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{session?.user && <Header user={session.user} />}
						{children}
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	)
}
