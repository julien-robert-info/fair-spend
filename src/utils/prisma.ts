import { PrismaClient } from '@prisma/client'

export const getExtendedClient = () => {
	return new PrismaClient({
		log: ['query'],
	}).$extends({
		result: {
			member: {
				isIncomeSet: {
					needs: { income: true },
					compute(member) {
						return member.income !== null
					},
				},
			},
		},
	})
}

type ExtendedPrismaClient = ReturnType<typeof getExtendedClient>

const globalForPrisma = global as unknown as {
	prisma: ExtendedPrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? getExtendedClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
