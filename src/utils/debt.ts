import { DefaultSession } from 'next-auth'
import { DebtDetails, getDebts, getOwnedDebts } from '@/actions/debt'
import { getReceivedTransfers, getsendedTransfers } from '@/actions/transfer'
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
	debt: Omit<DebtDetails, 'expense' | 'debtor'>
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

export const getTransferNetAmount = (transfer: {
	amount: number
	paybacks: {
		amount: number
	}[]
}): Dinero<number> => {
	return subtract(
		dinero({ amount: transfer.amount, currency: USD }),
		transfer.paybacks.reduce(
			(acc, { amount }) =>
				add(
					acc,
					dinero({
						amount: amount,
						currency: USD,
					})
				),
			dinero({ amount: 0, currency: USD })
		)
	)
}

export const getPanelData = async (groupId: number): Promise<PanelData> => {
	const debts = await getDebts(groupId)
	const ownedDebts = await getOwnedDebts(groupId)
	const sendedTransfers = await getsendedTransfers(groupId)
	const receivedTransfers = await getReceivedTransfers(groupId)

	const balance = dineroFormat(
		add(
			subtract(
				sendedTransfers
					.map((transfer) => getTransferNetAmount(transfer))
					.reduce(
						(acc, amount) => add(acc, amount),
						dinero({ amount: 0, currency: USD })
					),
				receivedTransfers
					.map((transfer) => getTransferNetAmount(transfer))
					.reduce(
						(acc, amount) => add(acc, amount),
						dinero({ amount: 0, currency: USD })
					)
			),
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
	)

	const debtList = [
		...new Set([
			...debts.map((debt) => debt.expense.payer?.user.name!),
			...ownedDebts.map((debt) => debt.debtor?.user.name!),
			...sendedTransfers.map((transfer) => transfer.receiver.user.name!),
			...receivedTransfers.map((transfer) => transfer.sender.user.name!),
		]),
	].map((name) => {
		const balance = add(
			subtract(
				sendedTransfers
					.filter((transfer) => transfer.receiver.user.name === name)
					.map((transfer) => getTransferNetAmount(transfer))
					.reduce(
						(acc, amount) => add(acc, amount),
						dinero({ amount: 0, currency: USD })
					),
				receivedTransfers
					.filter((transfer) => transfer.sender.user.name === name)
					.map((transfer) => getTransferNetAmount(transfer))
					.reduce(
						(acc, amount) => add(acc, amount),
						dinero({ amount: 0, currency: USD })
					)
			),
			subtract(
				ownedDebts
					.filter((debt) => debt.debtor?.user.name === name)
					.map((ownedDebt) => getDebtNetAmount(ownedDebt))
					.reduce(
						(acc, amount) => add(acc, amount),
						dinero({ amount: 0, currency: USD })
					),
				debts
					.filter((debt) => debt.expense.payer?.user.name === name)
					.map((debt) => getDebtNetAmount(debt))
					.reduce(
						(acc, amount) => add(acc, amount),
						dinero({ amount: 0, currency: USD })
					)
			)
		)

		return {
			user:
				debts.find((debt) => debt.expense.payer?.user.name === name)
					?.expense.payer?.user ??
				ownedDebts.find((debt) => debt.debtor?.user.name === name)
					?.debtor?.user ??
				sendedTransfers.find(
					(transfer) => transfer.receiver.user.name === name
				)?.receiver.user ??
				receivedTransfers.find(
					(transfer) => transfer.sender.user.name === name
				)?.sender.user,
			amount: dineroFormat(balance, true),
			isNegative: isNegative(balance),
		}
	})

	return { debts, ownedDebts, balance, debtList }
}
