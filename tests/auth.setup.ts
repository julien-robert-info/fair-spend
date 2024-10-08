import { test as setup, BrowserContext, chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import prisma from '@/utils/prisma'

const bobAuthFile = 'playwright/.auth/bob.json'
const bobSessionToken = 'd52f0c50-b8e3-4326-b48c-4d4a66fdeb64'

const aliceAuthFile = 'playwright/.auth/alice.json'
const aliceSessionToken = '04456e41-ec3b-4edf-92c1-48c14e57cacd2'

type Cookie = Parameters<BrowserContext['addCookies']>[0][0]

const makePath = (filePath: string) => {
	if (!fs.existsSync(filePath)) {
		const ret = fs.mkdirSync(path.dirname(filePath), { recursive: true })
	}
}

setup('Authenticate Bob', async () => {
	if (!fs.existsSync(bobAuthFile)) {
		makePath(bobAuthFile)
	}

	const now = new Date()

	const bobCookie: Cookie = {
		name: 'next-auth.session-token',
		value: bobSessionToken,
		domain: 'localhost',
		path: '/',
		expires: Math.floor(
			+new Date(now.getFullYear(), now.getMonth() + 1, 0) / 1000
		),
		httpOnly: true,
		secure: false,
		sameSite: 'Lax',
	}

	await prisma.user.upsert({
		where: {
			email: 'bob@test.com',
		},
		create: {
			id: 'clgodbjcn0000y2765geepksc',
			name: 'Bob',
			email: 'bob@test.com',
			image: '',
			sessions: {
				create: {
					expires: new Date(now.getFullYear(), now.getMonth() + 1, 0),
					sessionToken: bobSessionToken,
				},
			},
			accounts: {
				create: {
					type: 'oauth',
					provider: 'google',
					providerAccountId: '123456789',
					access_token: 'ggg_sftgh98sgf9Uj872kj9srfg9k3cfde0efj5',
					token_type: 'bearer',
					scope: '',
				},
			},
		},
		update: {
			sessions: {
				update: {
					where: {
						sessionToken: bobSessionToken,
					},
					data: {
						expires: new Date(
							now.getFullYear(),
							now.getMonth() + 1,
							0
						),
					},
				},
			},
		},
	})

	const browser = await chromium.launch()
	const context = await browser.newContext()
	await context.addCookies([bobCookie])
	await context.storageState({ path: bobAuthFile })
	await browser.close()
})

setup('Authenticate Alice', async () => {
	const now = new Date()

	const aliceCookie: Cookie = {
		name: 'next-auth.session-token',
		value: aliceSessionToken,
		domain: 'localhost',
		path: '/',
		expires: Math.floor(
			+new Date(now.getFullYear(), now.getMonth() + 1, 0) / 1000
		),
		httpOnly: true,
		secure: false,
		sameSite: 'Lax',
	}

	await prisma.user.upsert({
		where: {
			email: 'alice@test.com',
		},
		create: {
			id: '5f7c8ec7c33c6c004bbafe82',
			name: 'Alice',
			email: 'alice@test.com',
			image: '',
			sessions: {
				create: {
					expires: new Date(now.getFullYear(), now.getMonth() + 1, 0),
					sessionToken: aliceSessionToken,
				},
			},
			accounts: {
				create: {
					type: 'oauth',
					provider: 'google',
					providerAccountId: '234567876543',
					access_token: 'ggg_zZl1pWIvKkf3UDynZ09zLvuyZsm1yC0YoRPt',
					token_type: 'bearer',
					scope: '',
				},
			},
		},
		update: {
			sessions: {
				update: {
					where: {
						sessionToken: aliceSessionToken,
					},
					data: {
						expires: new Date(
							now.getFullYear(),
							now.getMonth() + 1,
							0
						),
					},
				},
			},
		},
	})

	const browser = await chromium.launch()
	const context = await browser.newContext({})
	await context.addCookies([aliceCookie])
	await context.storageState({ path: aliceAuthFile })
	await browser.close()
})
