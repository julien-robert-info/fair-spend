import {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from 'next'
import {
	DefaultSession,
	NextAuthOptions,
	Session,
	getServerSession,
} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import prisma from '@/utils/prisma'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

export const transportOptions = {
	name:
		process.env.NODE_ENV === 'production'
			? process.env.EMAIL_NAME
			: process.env.EMAIL_SERVER,
	host: process.env.EMAIL_SERVER,
	port: Number(process.env.EMAIL_PORT),
	secure: false,
	...(process.env.NODE_ENV === 'production' && {
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PWD,
		},
	}),
}

export const authConfig = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			profile: (profile) => {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
				}
			},
		}),
		// EmailProvider({
		// 	server: transportOptions,
		// 	from: process.env.EMAIL_FROM,
		// }),
	],
	adapter: PrismaAdapter(prisma as unknown as PrismaClient),
	theme: {
		colorScheme: 'light',
		brandColor: '#99c1de',
	},
} satisfies NextAuthOptions

export const auth = async (
	...args:
		| [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
		| [NextApiRequest, NextApiResponse]
		| []
): Promise<Session | null> => {
	'use server'

	return getServerSession(...args, authConfig)
}

export const authOrError = async (): Promise<DefaultSession['user']> => {
	'use server'
	const session = await auth()

	if (!session?.user) {
		throw new Error('Unauthorized')
	}

	return session.user
}
