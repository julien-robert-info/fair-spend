'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { calculateDebts, repayDebts } from '@/actions/debt'
import { Debt, Expense, Prisma } from '@prisma/client'
import { calcultatePaybacks, PaybackDetails } from '@/actions/payback'
import { dinero, toSnapshot } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import { FormAction } from '@/components/Form'
import * as Sentry from '@sentry/nextjs'
import { parse } from 'date-fns'
import { consumeTransfers } from './transfer'
import { getDateFromPeriod, HistoryPeriod } from '@/utils/history'

export type ExpenseDetail = Omit<Expense, 'payerId' | 'groupId'> & {
	payer: {
		name?: string | null
		image?: string | null
		email?: string | null
	}
	debts: Array<
		Omit<Debt, 'id' | 'expenseId' | 'debtorId'> & {
			debtor: {
				name?: string | null
				image?: string | null
				email?: string | null
			}
			payingBack: {
				amount: number
				debt: {
					isRepayed: boolean
					expense: {
						description: string
						date: Date
						payer: {
							name?: string | null
							image?: string | null
							email?: string | null
						}
					}
				}
			}[]
		}
	>
}

export const getExpenses = async (
	groupId: number,
	period?: HistoryPeriod
): Promise<(ExpenseDetail & { owned: boolean })[]> => {
	const user = await authOrError()

	let dateFilter = new Date()

	if (period && Number(period) !== HistoryPeriod.Tout) {
		dateFilter = getDateFromPeriod(period)
	}

	const expenses = await prisma.expense.findMany({
		select: {
			id: true,
			amount: true,
			date: true,
			description: true,
			payer: { select: { name: true, image: true, email: true } },
			debts: {
				select: {
					amount: true,
					isRepayed: true,
					debtor: {
						select: { name: true, image: true },
					},
					payingBack: {
						select: {
							amount: true,
							debt: {
								select: {
									isRepayed: true,
									expense: {
										select: {
											description: true,
											date: true,
											payer: {
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
						},
					},
				},
				where: {
					OR: [
						{ debtor: { email: user?.email! } },
						{ expense: { payer: { email: user?.email! } } },
					],
				},
			},
		},
		where: {
			groupId: groupId,
			...(period &&
				Number(period) !== HistoryPeriod.Tout && {
					date: { gte: dateFilter },
				}),
		},
	})

	return expenses.map((expense) => ({
		...expense,
		owned: expense.payer.email === user?.email,
	}))
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
					message: `Montant invalide : ${
						formData.get('amount') as string
					}`,
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

				let paybacks: PaybackDetails[] = []
				for (const debt of expense.debts) {
					paybacks = [
						...paybacks,
						...(await calcultatePaybacks(
							groupId,
							debt.amount,
							user?.email!,
							debt.debtor.email,
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
			} catch (error) {
				return { message: error as string }
			}
			revalidatePath('/')

			return { message: 'success', result: expense }
		}
	)
}

export const deleteExpense = async (expenseId: number) => {
	const user = await authOrError()

	try {
		//recalculate isRepay for deleted paybacks with counterdebt
		const debts = await prisma.debt.findMany({
			select: { id: true },
			where: { paybacks: { some: { counterDebt: { expenseId } } } },
		})

		//recalculate isconsumed for deleted paybacks with transfer
		const transfers = await prisma.transfer.findMany({
			select: { id: true },
			where: { paybacks: { some: { debt: { expenseId } } } },
		})

		await prisma.expense.delete({
			where: { id: expenseId, payer: { email: user?.email! } },
		})

		await repayDebts(debts.map((debt) => debt.id))
		await consumeTransfers(transfers.map((transfer) => transfer.id))
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { message: 'Dépense non trouvée' }
			}
		}
		throw error
	}
	revalidatePath('/')

	return { message: 'success' }
}
