'use server'
import { authOrError } from '@/utils/auth'
import { shuffleArray } from '@/utils'
import prisma from '@/utils/prisma'
import { ShareMode } from '@prisma/client'
import { allocate, Dinero, isNegative, isZero, toSnapshot } from 'dinero.js'
import { getDebtNetAmount } from '@/utils/debt'

export type DebtDetails = {
	amount: number
	expense: {
		date: Date
		description: string
		payer?: { user: { name: string | null; image: string | null } }
	}
	debtor?: { user: { name: string | null; image: string | null } }
	paybacks?: { amount: number }[]
	payingBack?: { amount: number }[]
}

export const getDebts = async (groupId: number): Promise<DebtDetails[]> => {
	const user = await authOrError()

	return await prisma.debt.findMany({
		select: {
			amount: true,
			expense: {
				select: {
					date: true,
					description: true,
					payer: {
						select: {
							user: {
								select: {
									name: true,
									image: true,
									email: true,
								},
							},
						},
					},
				},
			},
			paybacks: { select: { amount: true } },
			payingBack: { select: { amount: true } },
		},
		where: {
			isRepayed: false,
			debtor: { user: { email: user?.email! } },
			expense: { groupId: groupId },
		},
	})
}

export const getOwnedDebts = async (
	groupId: number
): Promise<DebtDetails[]> => {
	const user = await authOrError()

	return await prisma.debt.findMany({
		select: {
			amount: true,
			debtor: {
				select: {
					user: {
						select: {
							name: true,
							image: true,
							email: true,
						},
					},
				},
			},
			expense: {
				select: {
					date: true,
					description: true,
				},
			},
			paybacks: { select: { amount: true } },
			payingBack: { select: { amount: true } },
		},
		where: {
			isRepayed: false,
			expense: {
				groupId: groupId,
				payer: { user: { email: user?.email! } },
			},
		},
	})
}

export const calculateDebts = async (
	groupId: number,
	amount: Dinero<number>,
	payerEmail: string
): Promise<{ amount: number; groupId: number; debtorEmail: string }[]> => {
	const group = await prisma.group.findUniqueOrThrow({
		select: {
			shareMode: true,
			members: {
				select: {
					user: { select: { email: true } },
					income: true,
				},
				where: { enabled: true },
			},
		},
		where: { id: groupId },
	})

	const debtors = shuffleArray(group.members)

	//handle shareMode
	let shares: number[] = []
	if (group.shareMode === ShareMode.FAIR) {
		const incomeArray = debtors.map((debtors) => debtors.income)

		if (incomeArray.every((income) => income !== null)) {
			shares = incomeArray as number[]
		}
	}

	if (shares.length === 0) {
		shares = Array(debtors.length).fill(1)
	}

	const debts = allocate(amount, shares)
		.filter((amount, index) => debtors[index].user.email !== payerEmail)
		.map((debtShare, index) => ({
			groupId,
			debtorEmail: debtors.filter(
				(debtor) => debtor.user.email !== payerEmail
			)[index].user.email,
			amount: toSnapshot(debtShare).amount,
		}))

	return debts
}

export const repayDebts = async (debtIds: number[]) => {
	const debts = await prisma.debt.findMany({
		select: {
			id: true,
			amount: true,
			isRepayed: true,
			paybacks: { select: { amount: true } },
			payingBack: { select: { amount: true } },
		},
		where: { id: { in: debtIds } },
	})

	for (const debt of debts) {
		const netAmount = getDebtNetAmount(debt)
		const isRepayed = isNegative(netAmount) || isZero(netAmount)

		if (isRepayed !== debt.isRepayed) {
			await prisma.debt.update({
				data: { isRepayed: isRepayed },
				where: { id: debt.id },
			})
		}
	}
}
