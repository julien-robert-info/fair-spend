import { PrismaClient, ShareMode } from '@prisma/client'
import { rand, randNumber, randQuote, randWord } from '@ngneat/falso'
import { calculateDebts } from '@/actions/debt'

const prisma = new PrismaClient()

const clearDb = async () => {
	await prisma.debt.deleteMany({})
	await prisma.expense.deleteMany({})
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
						{ userEmail: bob?.email ?? '', income: 1000 },
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
			invites: {
				create: { email: me?.email ?? '' },
			},
		},
	})

	return [owned, notOwned].map((group) => group.id)
}

const createExpenses = async (groups: number[]) => {
	const users = await getUsers()

	for (let i = 0; i < groups.length; i++) {
		const expenseCount = randNumber({ min: 1, max: 3 })
		for (let j = 0; j < expenseCount; j++) {
			const amount = randNumber({ min: 100, max: 10000 })
			const payer = rand(users)
			const expense = await prisma.expense.create({
				data: {
					amount,
					description: randQuote(),
					date: new Date(),
					group: { connect: { id: groups[i] } },
					payer: { connect: { email: payer.email } },
					debts: {
						createMany: {
							data: await calculateDebts(
								groups[i],
								amount,
								payer.email
							),
						},
					},
				},
			})
		}
	}
}

const main = async () => {
	await clearDb()

	const groups = await createGroups()
	await createExpenses(groups)
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
