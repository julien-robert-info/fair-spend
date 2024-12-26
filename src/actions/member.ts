'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

export const getIncome = async (groupId: number): Promise<number | null> => {
	const user = await authOrError()

	const member = await prisma.member.findUnique({
		select: {
			income: true,
		},
		where: {
			groupId_userEmail: {
				groupId: groupId,
				userEmail: user?.email!,
			},
		},
	})

	return member?.income ?? null
}

export const setIncome = async (
	prevState: any,
	formData: FormData
): Promise<{ message: string }> => {
	const user = await authOrError()

	const groupId = Number(formData.get('groupId'))
	const income = Number(formData.get('income'))

	try {
		await prisma.member.update({
			data: { income: income },
			where: {
				groupId_userEmail: {
					groupId: groupId,
					userEmail: user?.email!,
				},
			},
		})
	} catch (error) {
		throw error
	}
	revalidatePath('/')

	return { message: 'success' }
}