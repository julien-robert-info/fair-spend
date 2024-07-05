'use server'
import { Group, Member, Prisma, ShareMode } from '@prisma/client'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'
import { revalidatePath } from 'next/cache'

export type GroupDetails = Omit<Group, 'ownerId'> & {
	members: { user: { name: string | null; image: string | null } }[]
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
				select: { user: { select: { name: true, image: true } } },
			},
		},
		where: {
			members: { some: { user: { email: user?.email! } } },
		},
	})

	return (await groups).map((group) => {
		return { ...group, isOwner: group.owner.email === user?.email }
	})
}

export const upsertGroup = async (prevState: any, formData: FormData) => {
	const user = await authOrError()
	console.log(formData)

	try {
		await prisma.group.upsert({
			create: {
				name: formData.get('name') as string,
				shareMode: formData.get('shareMode') as ShareMode,
				owner: { connect: { email: user?.email! } },
				members: {
					create: { user: { connect: { email: user?.email! } } },
				},
			},
			update: {
				name: formData.get('name') as string,
				shareMode: formData.get('shareMode') as ShareMode,
			},
			where: {
				id: formData.get('id') as string,
			},
		})
		revalidatePath('/')

		return { message: 'success' }
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return { message: 'Nom déjà utilisé' }
			}
		}
		throw error
	}
}

export const deleteGroup = async (id: string) => {
	const user = await authOrError()

	try {
		const group = await prisma.group.findUniqueOrThrow({
			select: {
				id: true,
				members: true,
				owner: true,
			},
			where: { id: id, owner: { email: user?.email! } },
		})

		if (group.members.length > 2) {
			return {
				errors: 'Veuillez tranférer la propriété du group à un autre membre',
			}
		}

		await prisma.group.delete({
			where: { id: id },
		})
		revalidatePath('/')

		return { errors: undefined }
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { errors: 'Groupe non trouvé' }
			}
		}
		throw error
	}
}
