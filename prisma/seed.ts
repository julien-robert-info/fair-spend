import { PrismaClient, ShareMode } from '@prisma/client'
import {
	rand,
	randNumber,
	randPastDate,
	randProductCategory,
	randWord,
} from '@ngneat/falso'
import { calculateDebts, repayDebts } from '@/actions/debt'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import { PaybackDetails, calcultatePaybacks } from '@/actions/payback'
import { consumeTransfers } from '@/actions/transfer'

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

	for (const group of groups) {
		const expenseCount = randNumber({ min: 10, max: 30 })
		for (let j = 0; j < expenseCount; j++) {
			const amount = randNumber({ min: 100, max: 10000 })
			const payer = rand(users)
			const expense = await prisma.expense.create({
				data: {
					amount,
					description: randProductCategory(),
					date: randPastDate(),
					payer: {
						connect: {
							groupId_userEmail: {
								groupId: group,
								userEmail: payer.email,
							},
						},
					},
					debts: {
						createMany: {
							data: await calculateDebts(
								group,
								dinero({ amount: amount, currency: USD }),
								payer.email
							),
						},
					},
				},
				select: {
					amount: true,
					description: true,
					date: true,
					groupId: true,
					payer: {
						select: {
							user: { select: { name: true, image: true } },
						},
					},
					debts: {
						select: {
							id: true,
							amount: true,
							isRepayed: true,
							debtor: {
								select: {
									user: { select: { email: true } },
								},
							},
						},
					},
				},
			})

			let paybacks: PaybackDetails[] = []
			for (const debt of expense.debts) {
				paybacks = [
					...paybacks,
					...(await calcultatePaybacks(
						group,
						debt.amount,
						payer.email,
						debt.debtor.user.email,
						debt.id
					)),
				]
			}

			await prisma.payback.createMany({ data: paybacks })
			await repayDebts([
				...expense.debts.map((debt) => debt.id),
				...paybacks.map((payback) => payback.debtId),
			])
			await consumeTransfers([
				...paybacks
					.filter((payback) => payback.transferId)
					.map((payback) => payback.transferId!),
			])
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
