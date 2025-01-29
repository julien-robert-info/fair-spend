import { DefaultSession } from 'next-auth'
import { DebtDetails, getDebts, getOwnedDebts } from '@/actions/debt'
import { USD } from '@dinero.js/currencies'
import { add, Dinero, dinero, isNegative, subtract } from 'dinero.js'
import { dineroFormat } from '@/utils/dinero'

export type PanelData = {
	debts: DebtDetails[]
	ownedDebts: DebtDetails[]
	balance: string
	debtList: {
		user: DefaultSession['user']
		amount: string
		isNegative: boolean
	}[]
}

export const getDebtNetAmount = (
	debt: Omit<DebtDetails, 'expense'>
): Dinero<number> => {
	return subtract(
		dinero({ amount: debt.amount, currency: USD }),
		add(
			debt.paybacks?.reduce(
				(acc, { amount }) =>
					add(
						acc,
						dinero({
							amount: amount,
							currency: USD,
						})
					),
				dinero({ amount: 0, currency: USD })
			) ?? dinero({ amount: 0, currency: USD }),
			debt.payingBack?.reduce(
				(acc, { amount }) =>
					add(
						acc,
						dinero({
							amount: amount,
							currency: USD,
						})
					),
				dinero({ amount: 0, currency: USD })
			) ?? dinero({ amount: 0, currency: USD })
		)
	)
}

export const getPanelData = async (groupId: number): Promise<PanelData> => {
	const debts = await getDebts(groupId)
	const ownedDebts = await getOwnedDebts(groupId)

	const balance = dineroFormat(
		subtract(
			ownedDebts
				.map((ownedDebt) => getDebtNetAmount(ownedDebt))
				.reduce(
					(acc, amount) => add(acc, amount),
					dinero({ amount: 0, currency: USD })
				),
			debts
				.map((debt) => getDebtNetAmount(debt))
				.reduce(
					(acc, amount) => add(acc, amount),
					dinero({ amount: 0, currency: USD })
				)
		)
	)

	const debtList = [
		...new Set([
			...debts.map((debt) => debt.expense.payer?.name!),
			...ownedDebts.map((debt) => debt.debtor?.name!),
		]),
	].map((name) => {
		const balance = subtract(
			ownedDebts
				.filter((debt) => debt.debtor?.name === name)
				.map((debt) => getDebtNetAmount(debt))
				.reduce(
					(acc, amount) => add(acc, amount),
					dinero({ amount: 0, currency: USD })
				),
			debts
				.filter((debt) => debt.expense.payer?.name === name)
				.map((debt) => getDebtNetAmount(debt))
				.reduce(
					(acc, amount) => add(acc, amount),
					dinero({ amount: 0, currency: USD })
				)
		)

		return {
			user:
				debts.find((debt) => debt.expense.payer?.name === name)?.expense
					.payer ??
				ownedDebts.find((debt) => debt.debtor?.name === name)?.debtor!,
			amount: dineroFormat(balance, true),
			isNegative: isNegative(balance),
		}
	})

	return { debts, ownedDebts, balance, debtList }
}
