import { PrismaClient, ShareMode } from '@prisma/client'
import { rand, randNumber, randQuote, randWord } from '@ngneat/falso'
import { calculateDebts } from '@/actions/debt'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'

const prisma = new PrismaClient()

const clearDb = async () => {
	await prisma.payback.deleteMany({})
	await prisma.transfer.deleteMany({})
	await prisma.debt.deleteMany({})
	await prisma.expense.deleteMany({})
	await prisma.group.deleteMany({})
}

const getAllUsers = async () => {
	return await prisma.user.findMany({})
}

const createGroups = async () => {
	const users = await getAllUsers()
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
						{ userEmail: me?.email ?? '', income: 200000 },
						{ userEmail: bob?.email ?? '', income: 100000 },
						{ userEmail: alice?.email ?? '', income: 150000 },
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
	const users = await getAllUsers()

	for (let i = 0; i < groups.length; i++) {
		const expenseCount = randNumber({ min: 3, max: 10 })
		for (let j = 0; j < expenseCount; j++) {
			const amount = randNumber({ min: 100, max: 10000 })
			const payer = rand(users)
			await prisma.expense.create({
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
								dinero({ amount: amount, currency: USD }),
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
