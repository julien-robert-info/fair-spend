'use server'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { FormAction } from '@/components/Form'

export const joinGroup = async (id: number) => {
	const user = await authOrError()

	try {
		const group = await prisma.group.findUniqueOrThrow({
			select: {
				members: {
					select: {
						user: {
							select: { email: true },
						},
					},
				},
			},
			where: { id: id },
		})

		const IsMember =
			group.members.findIndex(
				(member) => member.user.email === user?.email
			) !== -1
		if (IsMember) {
			return { message: 'Vous êtes déjà membre du group' }
		}

		await prisma.member.create({
			data: { groupId: id, userEmail: user?.email! },
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { message: 'Groupe non trouvé' }
			}
		}
		throw error
	}
	revalidatePath('/')

	return { message: 'success' }
}

export const leaveGroup = async (id: number) => {
	const user = await authOrError()

	try {
		const group = await prisma.group.findUniqueOrThrow({
			select: {
				members: {
					select: {
						user: {
							select: { email: true },
						},
					},
				},
			},
			where: { id: id },
		})

		const IsMember =
			group.members.findIndex(
				(member) => member.user.email === user?.email
			) !== -1
		if (!IsMember) {
			return { message: "Vous n'êtes pas membre du group" }
		}

		await prisma.member.delete({
			where: {
				groupId_userEmail: { groupId: id, userEmail: user?.email! },
			},
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { message: 'Groupe non trouvé' }
			}
		}
		throw error
	}
	revalidatePath('/')

	return { message: 'success' }
}

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

export const setIncome: FormAction = async (prevState, formData) => {
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
