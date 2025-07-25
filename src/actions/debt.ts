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
		payer?: { name: string | null; image: string | null }
	}
	debtor?: { name: string | null; image: string | null }
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
					payer: { select: { name: true, image: true, email: true } },
				},
			},
			paybacks: { select: { amount: true } },
			payingBack: { select: { amount: true } },
		},
		where: {
			isRepayed: false,
			debtor: { email: user?.email! },
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
			debtor: { select: { name: true, image: true, email: true } },
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
			expense: { groupId: groupId, payer: { email: user?.email! } },
		},
	})
}

export const calculateDebts = async (
	groupId: number,
	amount: Dinero<number>,
	payerEmail: string
): Promise<{ amount: number; debtorId: string }[]> => {
	const debtors = shuffleArray(
		await prisma.member.findMany({
			select: {
				user: { select: { id: true, email: true } },
				income: true,
			},
			where: { groupId: groupId },
		})
	)

	//handle shareMode
	const group = await prisma.group.findUniqueOrThrow({
		select: {
			shareMode: true,
		},
		where: { id: groupId },
	})

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
			debtorId: debtors.filter(
				(debtor) => debtor.user.email !== payerEmail
			)[index].user.id,
			amount: toSnapshot(debtShare).amount,
		}))

	return debts
}

export const repayDebts = async (debtIds: number[]) => {
	for (const debtId of debtIds) {
		const debt = await prisma.debt.findFirst({
			select: {
				amount: true,
				isRepayed: true,
				paybacks: { select: { amount: true } },
				payingBack: { select: { amount: true } },
			},
			where: { id: debtId },
		})

		if (debt) {
			const netAmount = getDebtNetAmount(debt)
			const isRepayed = isNegative(netAmount) || isZero(netAmount)

			if (isRepayed !== debt.isRepayed) {
				await prisma.debt.update({
					data: { isRepayed: isRepayed },
					where: { id: debtId },
				})
			}
		}
	}
}
