import { test, expect, Page, Locator } from '@playwright/test'
import { randNumber } from '@ngneat/falso'
import prisma from '@/utils/prisma'

const createExpense = async (
	page: Page,
	groupCard: Locator,
	amount: number,
	description: string
) => {
	const addExpenseButton = groupCard.getByRole('button', {
		name: 'add_expense',
	})
	const amountFormField = page.getByLabel('Montant *')
	const descriptionFormField = page.getByLabel('Description')
	const submitButton = page.getByRole('button', { name: 'Enregistrer' })

	await addExpenseButton.click()
	await amountFormField.fill(amount.toString())
	await descriptionFormField.fill(description)
	await submitButton.click()
}

test.describe('Debts features', () => {
	test.beforeEach(async () => {
		await prisma.transfer.deleteMany({})
		await prisma.expense.deleteMany({})
	})

	test('Debts are correctly calculated', async ({ page, isMobile }) => {
		await page.goto('/')
		const groupCard = page.locator('.MuiCard-root').first()
		if (!isMobile) {
			await groupCard.click()
		}
		await expect(page.getByText('Solde :')).toBeVisible()

		const amount = randNumber({ min: 1, max: 100, fraction: 2 })
		await createExpense(page, groupCard, amount, 'test')

		await expect(
			page.getByText(/[Bob|Alice] vous doit \d+\.\d+€/)
		).toBeVisible()

		const expense = await prisma.expense.findFirst({
			select: {
				amount: true,
				debts: {
					select: {
						amount: true,
						isRepayed: true,
						paybacks: true,
						payingBack: true,
					},
				},
				payer: { select: { group: { select: { members: true } } } },
			},
		})

		expect(expense?.amount).toBe(Math.round(amount * 100))
		expect(expense?.debts.length).toBe(
			(expense?.payer.group.members.length ?? 0) - 1
		)
		expense?.debts.map((debt) => {
			expect(Math.round(debt.amount / 100)).toBeCloseTo(
				Math.round(amount / expense?.payer.group.members.length),
				1
			)
			expect(debt.isRepayed).toBeFalsy()
			expect(debt.paybacks.length).toBe(0)
			expect(debt.payingBack.length).toBe(0)
		})
	})

	test('Paybacks are correctly calculated with counterDebts', async ({
		browser,
		page,
		isMobile,
	}) => {
		const groupCard = page.locator('.MuiCard-root').first()
		const repayButton = page.getByRole('button', { name: 'payback' })

		const secondUserContext = await browser.newContext({
			storageState: isMobile
				? 'playwright/.auth/bob.json'
				: 'playwright/.auth/alice.json',
		})
		const secondUserPage = await secondUserContext.newPage()
		await secondUserPage.goto('/')

		const secondGroupCard = secondUserPage.locator('.MuiCard-root').first()

		if (!isMobile) {
			await secondGroupCard.click()
		}
		await expect(secondUserPage.getByText('Solde :')).toBeVisible()

		await createExpense(secondUserPage, secondGroupCard, 100, 'test')

		await expect(
			secondUserPage.getByText(/[Bob|Alice] vous doit \d+\.\d+€/)
		).toBeVisible()
		await secondUserContext.close()

		await page.goto('/')

		if (!isMobile) {
			await groupCard.click()
		}
		await expect(page.getByText('Solde :')).toBeVisible()

		await expect(repayButton).toBeVisible()

		await createExpense(page, groupCard, 100, 'test2')

		await expect(repayButton).toBeHidden()
		await page.waitForTimeout(1000)

		const paybacks = await prisma.payback.findMany({
			select: {
				amount: true,
				debt: {
					select: {
						amount: true,
						isRepayed: true,
						debtor: {
							select: { user: { select: { name: true } } },
						},
						expense: {
							select: {
								payer: {
									select: {
										user: { select: { name: true } },
									},
								},
							},
						},
					},
				},
				counterDebt: {
					select: {
						amount: true,
						isRepayed: true,
						debtor: {
							select: {
								user: { select: { name: true } },
							},
						},
						expense: {
							select: {
								payer: {
									select: {
										user: { select: { name: true } },
									},
								},
							},
						},
					},
				},
			},
		})

		expect(paybacks.length).toBe(1)

		paybacks.map((payback) => {
			if (payback.counterDebt?.amount === payback.debt.amount) {
				expect(payback.debt.isRepayed).toBeTruthy()
				expect(payback.counterDebt?.isRepayed).toBeTruthy()
			} else {
				expect(Math.round(payback.amount / 10)).toBeCloseTo(
					Math.round(payback.debt.amount / 10)
				)
				expect(Math.round(payback.amount / 10)).toBeCloseTo(
					Math.round(payback.counterDebt?.amount! / 10)
				)
				expect(payback.debt.isRepayed).toBeTruthy()
				expect(payback.counterDebt?.isRepayed).toBeFalsy()
			}
			expect(payback.debt.debtor.user.name).toBe(
				isMobile ? 'Alice' : 'Bob'
			)
			expect(payback.debt.expense.payer.user.name).toBe(
				isMobile ? 'Bob' : 'Alice'
			)
			expect(payback.counterDebt?.debtor.user.name).toBe(
				isMobile ? 'Bob' : 'Alice'
			)
			expect(payback.counterDebt?.expense.payer.user.name).toBe(
				isMobile ? 'Alice' : 'Bob'
			)
		})
	})

	test('Paybacks are correctly calculated with transfers', async ({
		browser,
		page,
		isMobile,
	}) => {
		const groupCard = page.locator('.MuiCard-root').first()
		const repayButton = page.getByRole('button', { name: 'payback' })
		const submitButton = page.getByRole('button', { name: 'Enregistrer' })

		const secondUserContext = await browser.newContext({
			storageState: isMobile
				? 'playwright/.auth/bob.json'
				: 'playwright/.auth/alice.json',
		})
		const secondUserPage = await secondUserContext.newPage()
		await secondUserPage.goto('/')

		const secondGroupCard = secondUserPage.locator('.MuiCard-root').first()

		if (!isMobile) {
			await secondGroupCard.click()
		}
		await expect(secondUserPage.getByText('Solde :')).toBeVisible()

		await createExpense(secondUserPage, secondGroupCard, 100, 'test')

		await expect(
			secondUserPage.getByText(/[Bob|Alice] vous doit \d+\.\d+€/)
		).toBeVisible()
		await secondUserContext.close()

		await page.goto('/')

		if (!isMobile) {
			await groupCard.click()
		}
		await expect(page.getByText('Solde :')).toBeVisible()

		await expect(repayButton).toBeVisible()
		await repayButton.click()
		await submitButton.click()

		await expect(repayButton).toBeHidden()
		await page.waitForTimeout(1000)

		const paybacks = await prisma.payback.findMany({
			select: {
				amount: true,
				debt: {
					select: {
						amount: true,
						isRepayed: true,
						debtor: {
							select: { user: { select: { name: true } } },
						},
						expense: {
							select: {
								payer: {
									select: {
										user: { select: { name: true } },
									},
								},
							},
						},
					},
				},
				transfer: {
					select: {
						amount: true,
						isConsumed: true,
						receiver: {
							select: {
								user: { select: { name: true } },
							},
						},
						sender: {
							select: {
								user: { select: { name: true } },
							},
						},
					},
				},
			},
		})

		expect(paybacks.length).toBe(1)

		paybacks.map((payback) => {
			expect(Math.round(payback.amount / 10)).toBeCloseTo(
				Math.round(payback.debt.amount / 10)
			)
			expect(Math.round(payback.amount / 10)).toBeCloseTo(
				Math.round(payback.transfer?.amount! / 10)
			)
			expect(payback.debt.isRepayed).toBeTruthy()
			expect(payback.transfer?.isConsumed).toBeTruthy()
			expect(payback.debt.debtor.user.name).toBe(
				isMobile ? 'Alice' : 'Bob'
			)
			expect(payback.debt.expense.payer.user.name).toBe(
				isMobile ? 'Bob' : 'Alice'
			)
			expect(payback.transfer?.receiver.user.name).toBe(
				isMobile ? 'Bob' : 'Alice'
			)
			expect(payback.transfer?.sender.user.name).toBe(
				isMobile ? 'Alice' : 'Bob'
			)
		})
	})

	test('Can add expense and delete it', async ({
		page,
		browser,
		isMobile,
	}) => {
		const groupCard = page.locator('.MuiCard-root').first()
		const historyButton = page.getByRole('button', { name: 'history' })
		const historyCloseButton = page.getByRole('button', {
			name: 'history-close',
		})
		const expenseHistory = page.getByRole('button', {
			name: `${isMobile ? 'Alice' : 'Bob'} test`,
		})
		const deleteExpenseButton = page.getByRole('button', {
			name: 'delete_expense',
		})
		const consfirmButton = page.getByRole('button', { name: 'oui' })

		const secondUserContext = await browser.newContext({
			storageState: isMobile
				? 'playwright/.auth/bob.json'
				: 'playwright/.auth/alice.json',
		})
		const secondUserPage = await secondUserContext.newPage()
		await secondUserPage.goto('/')

		const secondGroupCard = secondUserPage.locator('.MuiCard-root').first()

		if (!isMobile) {
			await secondGroupCard.click()
		}
		await expect(secondUserPage.getByText('Solde :')).toBeVisible()

		await createExpense(secondUserPage, secondGroupCard, 100, 'test')

		await expect(
			secondUserPage.getByText(/[Bob|Alice] vous doit \d+\.\d+€/)
		).toBeVisible()
		await secondUserContext.close()

		await page.goto('/')

		if (!isMobile) {
			await groupCard.click()
		}
		await expect(page.getByText('Solde :')).toBeVisible()
		await expect(
			page.getByText(/vous devez \d+\.\d+€ à [Bob|Alice]/)
		).toBeVisible()
		await expect(
			page.getByText(/vous devez \d+\.\d+€ à [Bob|Alice]/)
		).not.toContainText('0.01')

		await createExpense(page, groupCard, 100, 'test')

		await expect(async () => {
			if (
				await page
					.getByText(/vous devez \d+\.\d+€ à [Bob|Alice]/)
					.isVisible()
			) {
				await expect(
					page.getByText(/vous devez \d+\.\d+€ à [Bob|Alice]/)
				).toContainText('0.01', { timeout: 1000 })
			} else {
				await expect(
					page.getByText(/vous devez \d+\.\d+€ à [Bob|Alice]/)
				).toBeHidden()
			}
		}).toPass()

		let debts = await prisma.debt.findMany({
			select: {
				amount: true,
				isRepayed: true,
				paybacks: {
					select: {
						amount: true,
					},
				},
				payingBack: {
					select: { amount: true },
				},
			},
			where: { debtor: { user: { name: { in: ['Alice', 'Bob'] } } } },
		})

		debts.map((debt) => {
			if (debt.payingBack.length > 0) {
				if (debt.payingBack[0].amount === debt.amount) {
					expect(debt.isRepayed).toBeTruthy()
				} else {
					expect(debt.isRepayed).toBeFalsy()
					expect(Math.round(debt.amount / 10)).toBeCloseTo(
						Math.round(debt.payingBack[0].amount / 10)
					)
				}
			}
			if (debt.paybacks.length > 0) {
				if (debt.paybacks[0].amount === debt.amount) {
					expect(debt.isRepayed).toBeTruthy()
				} else {
					expect(debt.isRepayed).toBeFalsy()
					expect(Math.round(debt.amount / 10)).toBeCloseTo(
						Math.round(debt.paybacks[0].amount / 10)
					)
				}
			}
		})

		await historyButton.click()

		await expect(expenseHistory).toBeVisible()
		await expenseHistory.click()
		await expect(deleteExpenseButton).toBeVisible()
		await deleteExpenseButton.click()
		await expect(consfirmButton).toBeVisible()
		await consfirmButton.click()

		await expect(expenseHistory).toBeHidden()
		await historyCloseButton.click()

		await expect(
			page.getByText(/[Bob|Alice] vous doit \d+\.\d+€/)
		).toHaveCount(0)

		debts = await prisma.debt.findMany({
			select: {
				amount: true,
				isRepayed: true,
				debtor: { select: { user: { select: { name: true } } } },
				expense: {
					select: {
						payer: { select: { user: { select: { name: true } } } },
					},
				},
				paybacks: {
					select: {
						amount: true,
					},
				},
				payingBack: {
					select: { amount: true },
				},
			},
			where: { debtor: { user: { name: { in: ['Alice', 'Bob'] } } } },
		})

		debts.map(async (debt) => {
			expect(debt.isRepayed).toBeFalsy()
			expect(debt.paybacks).toHaveLength(0)
			expect(debt.payingBack).toHaveLength(0)
		})
	})

	test('Can repay a debt with a transfer and delete it', async ({
		browser,
		page,
		isMobile,
	}) => {
		const groupCard = page.locator('.MuiCard-root').first()
		const historyButton = page.getByRole('button', {
			name: 'history',
		})
		const historyCloseButton = page.getByRole('button', {
			name: 'history-close',
		})
		const transferHistory = page.getByRole('button', {
			name: /[Alice|Bob] \d+\.\d+€ à [Alice|Bob]/,
		})
		const deleteTransferButton = page.getByRole('button', {
			name: 'delete_transfer',
		})
		const consfirmButton = page.getByRole('button', {
			name: 'oui',
		})
		const repayButton = page.getByRole('button', { name: 'payback' })
		const submitButton = page.getByRole('button', { name: 'Enregistrer' })

		const secondUserContext = await browser.newContext({
			storageState: isMobile
				? 'playwright/.auth/bob.json'
				: 'playwright/.auth/alice.json',
		})
		const secondUserPage = await secondUserContext.newPage()
		const secondUserHistoryButton = secondUserPage.getByRole('button', {
			name: 'history',
		})
		const secondUserHistoryCloseButton = secondUserPage.getByRole(
			'button',
			{
				name: 'history-close',
			}
		)
		const expenseHistory = secondUserPage.getByRole('button', {
			name: `${isMobile ? 'Bob' : 'Alice'} test`,
		})
		const deleteExpenseButton = secondUserPage.getByRole('button', {
			name: 'delete_expense',
		})
		const secondUserConsfirmButton = secondUserPage.getByRole('button', {
			name: 'oui',
		})
		const secondUserRepayButton = secondUserPage.getByRole('button', {
			name: 'payback',
		})

		await secondUserPage.goto('/')

		const secondGroupCard = secondUserPage.locator('.MuiCard-root').first()

		if (!isMobile) {
			await secondGroupCard.click()
		}

		// Second user create expense
		await createExpense(secondUserPage, secondGroupCard, 100, 'test')

		await page.goto('/')

		if (!isMobile) {
			await groupCard.click()
		}

		// User repay with transfer
		await expect(repayButton).toBeVisible()
		await repayButton.click()
		await submitButton.click()

		await expect(repayButton).toBeHidden()
		await page.waitForTimeout(1000)

		let transfers = await prisma.transfer.findMany({
			select: {
				isConsumed: true,
				paybacks: { select: { debt: { select: { isRepayed: true } } } },
			},
		})

		expect(transfers.length).toBe(1)
		expect(transfers[0].isConsumed).toBeTruthy()
		let paybacks = transfers.flatMap((transfer) => transfer.paybacks)
		expect(paybacks.length).toBe(1)
		expect(paybacks[0].debt.isRepayed).toBeTruthy()

		await secondUserHistoryButton.click()

		// Second user delete expense
		await expect(expenseHistory).toBeVisible()
		await expenseHistory.click()
		await expect(deleteExpenseButton).toBeVisible()
		await deleteExpenseButton.click()
		await expect(secondUserConsfirmButton).toBeVisible()
		await secondUserConsfirmButton.click()

		await expect(expenseHistory).toBeHidden()
		await secondUserHistoryCloseButton.click()

		await expect(secondUserRepayButton).toBeVisible()

		transfers = await prisma.transfer.findMany({
			select: {
				isConsumed: true,
				paybacks: { select: { debt: { select: { isRepayed: true } } } },
			},
		})

		expect(transfers.length).toBe(1)
		expect(transfers[0].isConsumed).toBeFalsy()
		expect(transfers.flatMap((transfer) => transfer.paybacks).length).toBe(
			0
		)

		// Second user create expense again
		await createExpense(secondUserPage, secondGroupCard, 100, 'test')
		await page.waitForTimeout(1000)
		await secondUserContext.close()

		transfers = await prisma.transfer.findMany({
			select: {
				isConsumed: true,
				paybacks: { select: { debt: { select: { isRepayed: true } } } },
			},
		})

		expect(transfers.length).toBe(1)
		expect(transfers[0].isConsumed).toBeTruthy()
		paybacks = transfers.flatMap((transfer) => transfer.paybacks)
		expect(paybacks.length).toBe(1)
		expect(paybacks[0].debt.isRepayed).toBeTruthy()

		await historyButton.click()
		await expect(transferHistory).toBeVisible()
		await transferHistory.click()
		await expect(deleteTransferButton).toBeVisible()
		await deleteTransferButton.click()
		await expect(consfirmButton).toBeVisible()
		await consfirmButton.click()

		await expect(transferHistory).toBeHidden()

		await historyCloseButton.click()
		await expect(repayButton).toBeVisible()
	})
})
