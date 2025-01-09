'use server'
import { authOrError } from '@/utils/auth'
import { inviteMail } from '@/utils/mail'
import prisma from '@/utils/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { GroupDetails, UserDetails } from '@/actions/group'

export type InviteDetail = {
	group: Omit<GroupDetails, 'members' | 'owner' | 'isOwner'> & {
		members: { isIncomeSet: Boolean; user: Omit<UserDetails, 'email'> }[]
	}
}

export const getInvites = async (): Promise<InviteDetail[]> => {
	const user = await authOrError()

	return prisma.invite.findMany({
		select: {
			group: {
				select: {
					id: true,
					name: true,
					shareMode: true,
					members: {
						select: {
							isIncomeSet: true,
							user: {
								select: {
									name: true,
									image: true,
								},
							},
						},
					},
				},
			},
		},
		where: {
			email: user?.email!,
		},
	})
}

export const createInvite = async (prevState: any, formData: FormData) => {
	const user = await authOrError()

	const groupId = Number(formData.get('groupId'))
	const email = formData.get('email') as string

	try {
		const group = await prisma.group.findUniqueOrThrow({
			select: {
				name: true,
				members: {
					select: {
						user: {
							select: { email: true },
						},
					},
				},
			},
			where: {
				id: groupId,
			},
		})

		const userIsMember =
			group.members.findIndex(
				(member) => member.user.email === user?.email
			) !== -1
		if (!userIsMember) {
			return { message: "Vous n'êtes pas membre du group" }
		}

		const emailIsMember =
			group.members.findIndex((member) => member.user.email === email) !==
			-1
		if (emailIsMember) {
			return { message: 'Cette personne est déjà membre du group' }
		}

		await prisma.invite.create({
			data: {
				email: email,
				groupId: groupId,
			},
		})

		await inviteMail(email, group.name)
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return { message: 'Invitation déjà en attente' }
			}
			if (error.code === 'P2025') {
				return { message: 'Invitation non trouvé' }
			}
		}
		throw error
	}

	return { message: 'success' }
}

export const deleteInvite = async (groupId: number) => {
	const user = await authOrError()

	try {
		await prisma.invite.delete({
			where: { email_groupId: { email: user?.email!, groupId: groupId } },
		})
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				return { message: 'Invitation non trouvé' }
			}
		}
		throw error
	}
	revalidatePath('/')

	return { message: 'success' }
}
