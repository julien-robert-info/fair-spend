import { ExpenseDetail, getExpenses } from '@/actions/expense'
import { getTransfers, TransferDetail } from '@/actions/transfer'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import { dineroFormat } from '@/utils/dinero'
import { Debt } from '@prisma/client'

type expenseHistory = Omit<ExpenseDetail, 'amount' | 'debts'> & {
	hType: 'expense'
	amount: string
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
}

export type HistoryData = expenseHistory | transferHistory

export const getHistoryData = async (
	groupId: number
): Promise<HistoryData[]> => {
	const expenses: expenseHistory[] = (await getExpenses(groupId)).map(
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
	const transfer: transferHistory[] = (await getTransfers(groupId)).map(
		(transfer) => ({
			...transfer,
			hType: 'transfer',
			amount: dineroFormat(
				dinero({ amount: transfer.amount, currency: USD })
			),
		})
	)

	const history = [...expenses, ...transfer].sort(
		(a, b) => b.date.valueOf() - a.date.valueOf()
	)

	return history
}
