'use server'
import { getDebtNetAmount } from '@/utils/debt'
import prisma from '@/utils/prisma'
import { USD } from '@dinero.js/currencies'
import {
	dinero,
	lessThan,
	subtract,
	add,
	isPositive,
	isZero,
	lessThanOrEqual,
	toSnapshot,
} from 'dinero.js'

export type PaybackDetails = {
	amount: number
	debtId: number
	counterDebtId?: number
}

export const calcultatePaybacks = async (
	groupId: number,
	amount: number,
	sender: string,
	receiver: string,
	counterDebtId?: number
): Promise<PaybackDetails[]> => {
	const debts = await prisma.debt.findMany({
		select: {
			id: true,
			amount: true,
			paybacks: { select: { amount: true } },
			payingBack: { select: { amount: true } },
		},
		where: {
			expense: { groupId: groupId, payer: { email: receiver } },
			debtor: { email: sender },
			isRepayed: false,
		},
	})

	const totalAmount = dinero({ amount: amount, currency: USD })
	let paybacksAmount = dinero({ amount: 0, currency: USD })
	let paybacks: PaybackDetails[] = []

	let i = 0
	while (lessThan(paybacksAmount, totalAmount) && debts.length > i) {
		const debt = debts[i]
		const remainingAmount = getDebtNetAmount(debt)

		if (isPositive(remainingAmount) && !isZero(remainingAmount)) {
			const paybackAmount = lessThanOrEqual(
				remainingAmount,
				subtract(totalAmount, paybacksAmount)
			)
				? toSnapshot(remainingAmount)
				: toSnapshot(subtract(totalAmount, paybacksAmount))

			paybacksAmount = add(
				paybacksAmount,
				dinero({ amount: paybackAmount.amount, currency: USD })
			)

			paybacks.push({
				amount: paybackAmount.amount,
				debtId: debt.id,
				counterDebtId: counterDebtId,
			})
		}

		i++
	}

	return paybacks
}
