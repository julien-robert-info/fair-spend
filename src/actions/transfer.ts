'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { USD } from '@dinero.js/currencies'
import { add, dinero, equal, isNegative, isZero } from 'dinero.js'
import { calcultatePaybacks, PaybackDetails } from '@/actions/payback'
import { repayDebts } from './debt'
import { FormAction } from '@/components/Form'
import * as Sentry from '@sentry/nextjs'
import { parse } from 'date-fns'
import { getTransferNetAmount } from '@/utils/debt'
import { Prisma } from '@prisma/client'

export type TransferDetail = {
	id: number
	amount: number
	date: Date
	sender: { name: string | null; image: string | null }
	receiver: { name: string | null; image: string | null }
	paybacks?: PaybackDetails[]
}

export const getTransfers = async (
	groupId: number
): Promise<TransferDetail[]> => {
	const user = await authOrError()

	const transfers = await prisma.transfer.findMany({
		select: {
			id: true,
			amount: true,
			date: true,
			sender: { select: { name: true, image: true } },
			receiver: { select: { name: true, image: true } },
		},
		where: {
			groupId: groupId,
			OR: [
				{ sender: { email: user?.email! } },
				{ receiver: { email: user?.email! } },
			],
		},
	})

	return transfers
}

export const getReceivedTransfers = async (
	groupId: number
): Promise<
	Array<
		Omit<TransferDetail, 'date' | 'receiver' | 'paybacks'> & {
			paybacks: { amount: number }[]
		}
	>
> => {
	const user = await authOrError()

	const transfers = await prisma.transfer.findMany({
		select: {
			id: true,
			amount: true,
			sender: { select: { name: true, image: true, email: true } },
			paybacks: { select: { amount: true } },
		},
		where: {
			groupId: groupId,
			receiver: { email: user?.email! },
			isConsumed: false,
		},
	})

	return transfers
}

export const getsendedTransfers = async (
	groupId: number
): Promise<
	{
		amount: number
		receiver: { name: string | null }
		paybacks: {
			amount: number
		}[]
	}[]
> => {
	const user = await authOrError()

	const transfers = await prisma.transfer.findMany({
		select: {
			amount: true,
			receiver: { select: { name: true, image: true, email: true } },
			paybacks: { select: { amount: true } },
		},
		where: {
			groupId: groupId,
			sender: { email: user?.email! },
			isConsumed: false,
		},
	})

	return transfers
}

export const createTransfer: FormAction = async (prevState, formData) => {
	return await Sentry.withServerActionInstrumentation(
		'createTransfer',
		{
			formData,
		},
		async () => {
			const user = await authOrError()

			const groupId = Number(formData.get('groupId'))
			const rawDate = formData.get('date') as string
			const date = parse(rawDate, 'dd/MM/yyyy', new Date())
			const receiver = formData.get('receiver') as string
			const rawAmount = Number(
				(formData.get('amount') as string).replace(',', '.')
			)
			if (isNaN(rawAmount) || rawAmount <= 0) {
				return { message: 'Montant invalide' }
			}

			const amount = Math.round(rawAmount * 100)

			let transfer
			try {
				const paybacks = await calcultatePaybacks(
					groupId,
					amount,
					user?.email!,
					receiver
				)

				const isConsumed = equal(
					paybacks.reduce(
						(acc, { amount }) =>
							add(acc, dinero({ amount: amount, currency: USD })),
						dinero({ amount: 0, currency: USD })
					),
					dinero({ amount: amount, currency: USD })
				)

				transfer = await prisma.transfer.create({
					data: {
						amount,
						date,
						group: { connect: { id: groupId } },
						sender: { connect: { email: user?.email! } },
						receiver: { connect: { email: receiver } },
						paybacks: {
							createMany: {
								data: paybacks,
							},
						},
						isConsumed: isConsumed,
					},
				})

				await repayDebts(paybacks.map((payback) => payback.debtId))
			} catch (error) {
				throw error
			}
			revalidatePath('/')

			return { message: 'success', result: transfer }
		}
	)
}

export const consumeTransfers = async (transferIds: number[]) => {
	try {
		const transfers = await prisma.transfer.findMany({
			select: {
				id: true,
				amount: true,
				isConsumed: true,
				paybacks: {
					select: { amount: true },
				},
			},
			where: { id: { in: transferIds } },
		})

		await Promise.all(
			transfers.map(async (transfer) => {
				const netAmount = getTransferNetAmount(transfer)
				const isConsumed = isNegative(netAmount) || isZero(netAmount)

				if (isConsumed !== transfer.isConsumed) {
					await prisma.transfer.update({
						data: { isConsumed: isConsumed },
						where: { id: transfer.id },
					})
				}
			})
		)
	} catch (error) {
		throw error
	}
}

export const deleteTransfer = async (transferId: number) => {
	const user = await authOrError()

	try {
		//recalculate isRepay for debts deleted paybacks
		const debts = await prisma.debt.findMany({
			select: { id: true },
			where: { paybacks: { some: { transferId } } },
		})

		await prisma.transfer.delete({
			where: { id: transferId, sender: { email: user?.email! } },
		})

		await repayDebts(debts.map((debt) => debt.id))
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { message: 'Transfert non trouvée' }
			}
		}
		throw error
	}
	revalidatePath('/')

	return { message: 'success' }
}
