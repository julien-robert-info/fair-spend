import { ExpenseDetail, getExpenses } from '@/actions/expense'
import { getTransfers, TransferDetail } from '@/actions/transfer'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import { dineroFormat } from '@/utils/dinero'
import { Debt } from '@prisma/client'
import { sub } from 'date-fns'

export type HType = 'expense' | 'transfer'

type expenseHistory = Omit<ExpenseDetail, 'amount' | 'debts'> & {
	hType: 'expense'
	amount: string
	owned: boolean
	debts: Array<
		Omit<Debt, 'id' | 'amount' | 'expenseId' | 'debtorId'> & {
			amount: string
			debtor: {
				name?: string | null
				image?: string | null
				email?: string | null
			}
		}
	>
}

type transferHistory = Omit<TransferDetail, 'amount'> & {
	hType: 'transfer'
	amount: string
	owned: boolean
}

export type HistoryData = expenseHistory | transferHistory

export enum HistoryPeriod {
	'1 mois' = 1,
	'6 mois' = 2,
	'1 an' = 3,
	'Tout' = 4,
}

export const getHistoryData = async (
	groupId: number,
	period: HistoryPeriod
): Promise<HistoryData[]> => {
	const expenses: expenseHistory[] = (await getExpenses(groupId, period)).map(
		(expense) => ({
			...expense,
			hType: 'expense',
			amount: dineroFormat(
				dinero({ amount: expense.amount, currency: USD })
			),
			debts: expense.debts.map((debt) => ({
				...debt,
				amount: dineroFormat(
					dinero({ amount: debt.amount, currency: USD })
				),
			})),
		})
	)
	const transfer: transferHistory[] = (
		await getTransfers(groupId, period)
	).map((transfer) => ({
		...transfer,
		hType: 'transfer',
		amount: dineroFormat(
			dinero({ amount: transfer.amount, currency: USD })
		),
	}))

	const history = [...expenses, ...transfer].sort((a, b) => {
		if (a.date.valueOf() === b.date.valueOf() && a.hType === b.hType) {
			return b.id - a.id
		}
		return b.date.valueOf() - a.date.valueOf()
	})

	return history
}

export const getDateFromPeriod = (period: HistoryPeriod): Date => {
	let date = new Date()

	switch (Number(period)) {
		case HistoryPeriod['6 mois']:
			date = sub(date, { months: 6 })
			break
		case HistoryPeriod['1 an']:
			date = sub(date, { years: 1 })
			break
		default:
			date = sub(date, { months: 1 })
			break
	}

	return date
}
