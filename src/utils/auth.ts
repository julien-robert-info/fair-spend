import {
	GetServerSidePropsContext,
	NextApiRequest,
	NextApiResponse,
} from 'next'
import { NextAuthOptions, getServerSession } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import prisma from './prisma'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Adapter } from 'next-auth/adapters'

export const authConfig = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			profile: (profile) => {
				return {
					id: profile.sub,
					name: profile.name,
					firstname: profile.given_name,
					lastname: profile.family_name,
					email: profile.email,
					image: profile.picture,
				}
			},
		}),
	],
	adapter: PrismaAdapter(prisma) as Adapter,
} satisfies NextAuthOptions

export const auth = async (
	...args:
		| [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
		| [NextApiRequest, NextApiResponse]
		| []
) => {
	'use server'

	return getServerSession(...args, authConfig)
}
