import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import type { Metadata } from 'next'
import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from '@/theme'

export const metadata: Metadata = {
	title: 'Fair Spend',
	description: 'Share your household expenses fairly',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='fr' suppressHydrationWarning={true}>
			<body>
				<AppRouterCacheProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{children}
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	)
}
