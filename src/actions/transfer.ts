'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { USD } from '@dinero.js/currencies'
import { add, dinero, equal } from 'dinero.js'
import { calcultatePaybacks } from '@/actions/payback'
import { repayDebts } from './debt'
import { FormAction } from '@/components/Form'
import * as Sentry from '@sentry/nextjs'

export type TransferDetail = {
	amount: number
	date: Date
	sender: { name: string | null; image: string | null }
	receiver: { name: string | null; image: string | null }
}

export const getTransfers = async (
	groupId: number
): Promise<TransferDetail[]> => {
	const user = await authOrError()

	const transfers = await prisma.transfer.findMany({
		select: {
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

export const createTransfer: FormAction = async (prevState, formData) => {
	return await Sentry.withServerActionInstrumentation(
		'createTransfer',
		{
			formData,
		},
		async () => {
			const user = await authOrError()

			const groupId = Number(formData.get('groupId'))
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
						date: new Date(),
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
