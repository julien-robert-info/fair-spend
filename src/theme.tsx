'use client'
import React from 'react'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { LinkProps as MuiLinkProps } from '@mui/material/Link'
import { Roboto } from 'next/font/google'
import { createTheme } from '@mui/material/styles'

const roboto = Roboto({
	weight: ['300', '400', '500', '700'],
	subsets: ['latin'],
	display: 'swap',
})

// Integration of NextLink with mui Link component
const LinkBehaviour = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
	function LinkBehaviour(props, ref) {
		return <NextLink ref={ref} {...props} />
	}
)

const theme = createTheme({
	typography: {
		fontFamily: roboto.style.fontFamily,
	},
	components: {
		MuiLink: {
			defaultProps: {
				component: LinkBehaviour,
			} as MuiLinkProps,
		},
		MuiButtonBase: {
			defaultProps: {
				LinkComponent: LinkBehaviour,
			},
		},
	},
})

export default theme
