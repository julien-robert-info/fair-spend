'use server'
import { Group, Prisma, ShareMode } from '@prisma/client'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'
import { FormAction } from '@/components/Form'

export type UserDetails = {
	name: string | null
	email: string
	image: string | null
}

export type GroupDetails = Omit<Group, 'ownerId'> & {
	members: { isIncomeSet: boolean; user: UserDetails }[]
	owner: { email: string }
	isOwner: boolean
}

export const getGroups = async (): Promise<GroupDetails[]> => {
	const user = await authOrError()

	const groups = prisma.group.findMany({
		select: {
			id: true,
			name: true,
			shareMode: true,
			owner: { select: { email: true } },
			members: {
				select: {
					isIncomeSet: true,
					user: { select: { name: true, image: true, email: true } },
				},
				where: { enabled: true },
			},
		},
		where: {
			members: { some: { user: { email: user?.email! }, enabled: true } },
		},
	})

	return (await groups).map((group) => {
		return { ...group, isOwner: group.owner.email === user?.email }
	})
}

export const upsertGroup: FormAction = async (prevState, formData) => {
	const user = await authOrError()

	const id = Number(formData.get('id'))
	const name = formData.get('name') as string
	const shareMode = formData.get('shareMode') as ShareMode
	let group

	try {
		group = await prisma.group.upsert({
			create: {
				name: name,
				shareMode: shareMode,
				owner: { connect: { email: user?.email! } },
				members: {
					create: { user: { connect: { email: user?.email! } } },
				},
			},
			update: {
				name: name,
				shareMode: shareMode,
			},
			where: {
				id: id,
			},
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return { message: 'Nom déjà utilisé' }
			}
		}
		throw error
	}
	revalidatePath('/')

	return { message: 'success', result: group }
}

export const deleteGroup = async (id: number) => {
	const user = await authOrError()

	try {
		const group = await prisma.group.findUniqueOrThrow({
			select: {
				id: true,
			},
			where: { id: id, owner: { email: user?.email! } },
		})

		await prisma.group.delete({
			where: { id: group.id },
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { message: 'Budget partagé non trouvé' }
			}
		}
		throw error
	}
	revalidatePath('/')

	return { message: 'success' }
}

export const transferGroup: FormAction = async (prevState, formData) => {
	const user = await authOrError()

	const id = Number(formData.get('id'))
	const newOwner = formData.get('newOwner') as string

	try {
		const group = await prisma.group.findUniqueOrThrow({
			select: {
				owner: { select: { email: true } },
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

		if (group.owner.email !== user?.email) {
			return { message: "Vous n'êtes pas propriétaire du group" }
		}

		const IsMember =
			group.members.findIndex(
				(member) => member.user.email === newOwner
			) !== -1
		if (!IsMember) {
			return { message: "La personne choisie n'est pas membre du group" }
		}

		await prisma.group.update({
			data: {
				owner: { connect: { email: newOwner } },
			},
			where: {
				id: id,
			},
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { message: 'Budget partagé non trouvé' }
			}
		}
		throw error
	}

	return { message: 'success' }
}
