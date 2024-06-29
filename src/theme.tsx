'use client'
import React from 'react'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import { LinkProps as MuiLinkProps } from '@mui/material/Link'
import { Roboto } from 'next/font/google'
import { Shadows, createTheme } from '@mui/material/styles'

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
	palette: {
		mode: 'light',
		primary: {
			main: '#99c1de',
		},
		secondary: {
			main: '#c5dedd',
		},
		error: {
			main: '#e49c9c',
		},
		warning: {
			main: '#fbd0ab',
		},
		info: {
			main: '#99c1de',
		},
		success: {
			main: '#aec9c9',
		},
		background: {
			default: '#f0efeb',
		},
	},
	typography: {
		fontFamily: roboto.style.fontFamily,
	},
	shadows: Array(25).fill('none') as Shadows,
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
