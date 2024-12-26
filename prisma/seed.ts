import { PrismaClient, ShareMode } from '@prisma/client'
import { randNumber, randWord } from '@ngneat/falso'

const prisma = new PrismaClient()

const clearDb = async () => {
	await prisma.group.deleteMany({})
}

const getUsers = async () => {
	return await prisma.user.findMany({})
}

const createGroups = async () => {
	const users = await getUsers()
	const me = users.find((user) => user.name === 'julien robert')
	const bob = users.find((user) => user.name === 'Bob')
	const alice = users.find((user) => user.name === 'Alice')
	const shareModes = Object.keys(ShareMode)

	//group owned without members
	await prisma.group.create({
		data: {
			name: randWord(),
			owner: { connect: me },
			shareMode: shareModes[randNumber({ max: 1 })] as ShareMode,
			members: {
				create: { user: { connect: me } },
			},
		},
	})

	//egalitarian group owned with members
	const owned = await prisma.group.create({
		data: {
			name: randWord(),
			owner: { connect: me },
			shareMode: ShareMode.EGALITARIAN,
			members: {
				createMany: {
					data: [
						{ userEmail: me?.email ?? '' },
						{ userEmail: bob?.email ?? '' },
						{ userEmail: alice?.email ?? '' },
					],
				},
			},
		},
	})

	//fair group not owned
	const notOwned = await prisma.group.create({
		data: {
			name: randWord(),
			owner: { connect: alice },
			shareMode: ShareMode.FAIR,
			members: {
				createMany: {
					data: [
						{ userEmail: me?.email ?? '', income: 2000 },
						{ userEmail: alice?.email ?? '', income: 1500 },
					],
				},
			},
		},
	})

	//group invitation
	await prisma.group.create({
		data: {
			name: randWord(),
			owner: { connect: bob },
			shareMode: shareModes[randNumber({ max: 1 })] as ShareMode,
			members: {
				create: { user: { connect: bob } },
			},
			invites: { create: { email: me?.email ?? '' } },
		},
	})
}

const main = async () => {
	await clearDb()

	await createGroups()
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
