'use server'
import { Group, Member, ShareMode } from '@prisma/client'
import prisma from '@/utils/prisma'
import { authOrError } from '@/utils/auth'

export type GroupDetails = Group & { members: Member[] }

export const getGroups = async (): Promise<GroupDetails[]> => {
	const user = await authOrError()

	return prisma.group.findMany({
		select: {
			id: true,
			name: true,
			shareMode: true,
			ownerId: true,
			members: true,
		},
		where: {
			members: { some: { user: { email: user?.email! } } },
		},
	})
}

export const createGroup = async (formData: FormData) => {
	const user = await authOrError()

	return prisma.group.create({
		data: {
			name: formData.get('name') as string,
			shareMode: formData.get('shareMode') as ShareMode,
			owner: { connect: { email: user?.email! } },
			members: { create: { user: { connect: { email: user?.email! } } } },
		},
	})
}
