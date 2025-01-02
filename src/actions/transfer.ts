'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { Transfer } from '@prisma/client'
import { USD } from '@dinero.js/currencies'
import { add, dinero, equal } from 'dinero.js'
import { calcultatePaybacks } from '@/actions/payback'
import { repayDebts } from './debt'

export const createTransfer = async (
	prevState: any,
	formData: FormData
): Promise<{ message: string; result?: Transfer }> => {
	const user = await authOrError()

	const groupId = Number(formData.get('groupId'))
	const receiver = formData.get('receiver') as string
	const rawAmount = Number(
		(formData.get('amount') as string).replace(',', '.')
	)
	if (isNaN(rawAmount) || rawAmount <= 0) {
		return { message: 'Montant invalide' }
	}

	const amount = rawAmount * 100

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
