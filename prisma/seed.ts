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

	//group owned with members
	await prisma.group.create({
		data: {
			name: randWord(),
			owner: { connect: me },
			shareMode: shareModes[randNumber({ max: 1 })] as ShareMode,
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

	//group not owned
	await prisma.group.create({
		data: {
			name: randWord(),
			owner: { connect: alice },
			shareMode: shareModes[randNumber({ max: 1 })] as ShareMode,
			members: {
				createMany: {
					data: [
						{ userEmail: me?.email ?? '' },
						{ userEmail: alice?.email ?? '' },
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
			Invite: { create: { email: me?.email ?? '' } },
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
