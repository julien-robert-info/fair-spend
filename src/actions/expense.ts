'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { calculateDebts } from '@/actions/debt'
import { Expense } from '@prisma/client'

export const createExpense = async (
	prevState: any,
	formData: FormData
): Promise<{ message: string; result?: Expense }> => {
	const user = await authOrError()

	const groupId = Number(formData.get('groupId'))
	const description = formData.get('description') as string
	const rawAmount = Number(
		(formData.get('amount') as string).replace(',', '.')
	)
	if (isNaN(rawAmount) || rawAmount <= 0) {
		return { message: 'Montant invalide' }
	}

	const amount = rawAmount * 100

	let expense
	try {
		expense = await prisma.expense.create({
			data: {
				amount,
				description,
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
		})
	} catch (error) {
		throw error
	}
	revalidatePath('/')

	return { message: 'success', result: expense }
}