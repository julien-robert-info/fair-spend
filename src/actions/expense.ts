'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { calculateDebts, repayDebts } from '@/actions/debt'
import { Debt, Expense } from '@prisma/client'
import { calcultatePaybacks } from '@/actions/payback'
import { dinero, toSnapshot } from 'dinero.js'
import { USD } from '@dinero.js/currencies'

type ExpenseDetail = Omit<Expense, 'id'> & {
	debts: Array<
		Omit<Debt, 'isRepayed' | 'expenseId' | 'debtorId'> & {
			debtor: { email: string }
		}
	>
}

export const createExpense = async (
	prevState: any,
	formData: FormData
): Promise<{ message: string; result?: ExpenseDetail }> => {
	const user = await authOrError()

	const groupId = Number(formData.get('groupId'))
	const description = formData.get('description') as string
	const rawAmount = Number(
		(formData.get('amount') as string).replace(',', '.')
	)
	if (isNaN(rawAmount) || rawAmount <= 0) {
		return { message: 'Montant invalide' }
	}

	const amount = dinero({ amount: rawAmount * 100, currency: USD })

	let expense
	try {
		expense = await prisma.expense.create({
			data: {
				description,
				amount: toSnapshot(amount).amount,
				date: new Date(),
				group: { connect: { id: groupId } },
				payer: { connect: { email: user?.email! } },
				debts: {
					createMany: {
						data: await calculateDebts(
							groupId,
							amount,
							user?.email!
						),
					},
				},
			},
			select: {
				amount: true,
				description: true,
				date: true,
				groupId: true,
				payerId: true,
				debts: {
					select: {
						id: true,
						amount: true,
						debtor: { select: { email: true } },
					},
				},
			},
		})

		const paybacks = await Promise.all(
			expense.debts.map(
				async (debt) =>
					await calcultatePaybacks(
						groupId,
						debt.amount,
						user?.email!,
						debt.debtor.email,
						debt.id
					)
			)
		)

		await prisma.payback.createMany({ data: paybacks.flat() })
		await repayDebts(expense.debts.map((debt) => debt.id))
	} catch (error) {
		throw error
	}
	revalidatePath('/')

	return { message: 'success', result: expense }
}
