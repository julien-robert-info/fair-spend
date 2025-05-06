'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { calculateDebts, repayDebts } from '@/actions/debt'
import { Debt, Expense } from '@prisma/client'
import { calcultatePaybacks } from '@/actions/payback'
import { dinero, toSnapshot } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import { FormAction } from '@/components/Form'
import * as Sentry from '@sentry/nextjs'
import { parse } from 'date-fns'
import { consumeTransfers } from './transfer'

export type ExpenseDetail = Omit<Expense, 'id' | 'payerId' | 'groupId'> & {
	payer: { name: string | null; image: string | null }
	debts: Array<
		Omit<Debt, 'id' | 'expenseId' | 'debtorId'> & {
			debtor: {
				name?: string | null
				image?: string | null
				email?: string | null
			}
		}
	>
}

export const getExpenses = async (
	groupId: number
): Promise<ExpenseDetail[]> => {
	const user = await authOrError()

	const expenses = await prisma.expense.findMany({
		select: {
			amount: true,
			date: true,
			description: true,
			payer: { select: { name: true, image: true } },
			debts: {
				select: {
					amount: true,
					isRepayed: true,
					debtor: { select: { name: true, image: true } },
				},
				where: { debtor: { email: user?.email! } },
			},
		},
		where: { groupId: groupId },
	})

	return expenses
}

export const createExpense: FormAction = async (prevState, formData) => {
	return await Sentry.withServerActionInstrumentation(
		'createExpense',
		{
			formData,
		},
		async () => {
			const user = await authOrError()

			const groupId = Number(formData.get('groupId'))
			const rawDate = formData.get('date') as string
			const date = parse(rawDate, 'dd/MM/yyyy', new Date())
			const description = formData.get('description') as string
			const rawAmount = Number(
				(formData.get('amount') as string).replace(',', '.')
			)
			if (isNaN(rawAmount) || rawAmount <= 0) {
				return {
					message: `Montant invalide : ${formData.get('amount')}`,
				}
			}
			const amount = dinero({
				amount: Math.round(rawAmount * 100),
				currency: USD,
			})

			let expense
			try {
				expense = await prisma.expense.create({
					data: {
						date,
						description,
						amount: toSnapshot(amount).amount,
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
						payer: { select: { name: true, image: true } },
						debts: {
							select: {
								id: true,
								amount: true,
								isRepayed: true,
								debtor: { select: { email: true } },
							},
						},
					},
				})

				const paybacks = (
					await Promise.all(
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
				).flat()

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
			} catch (error) {
				throw error
			}
			revalidatePath('/')

			return { message: 'success', result: expense }
		}
	)
}
