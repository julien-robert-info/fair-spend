import { test, expect } from '@playwright/test'
import { SwipeToLocator } from '@/utils/test'
import { randNumber } from '@ngneat/falso'
import prisma from '@/utils/prisma'

test.describe('Debts features', () => {
	test.beforeEach(async () => {
		await prisma.payback.deleteMany({})
		await prisma.transfer.deleteMany({})
		await prisma.debt.deleteMany({})
		await prisma.expense.deleteMany({})
	})

	test('Can set Income on Fair group', async ({ page, isMobile }) => {
		await page.goto('/')

		const fairModeCard = page
			.locator('.MuiCard-root')
			.filter({ has: page.getByTestId('VolunteerActivismIcon') })
			.first()
		const settingButton = page.getByRole('button', { name: 'settings' })
		const incomeFormFields = page.getByLabel('Montant *')
		const submitButton = page.getByRole('button', { name: 'Enregistrer' })

		if (isMobile) {
			SwipeToLocator(page, fairModeCard)
		} else {
			fairModeCard.click()
		}
		await expect(settingButton).toBeVisible()

		const income = randNumber({ fraction: 2 }).toString()

		await settingButton.click()
		await incomeFormFields.fill(income)
		await submitButton.click()

		await settingButton.click()
		await expect(incomeFormFields).toHaveValue(income)
	})

	test('Can add expense, then debt appear', async ({ page, isMobile }) => {
		await page.goto('/')

		const groupCard = page.locator('.MuiCard-root').first()
		const addExpenseButton = groupCard.getByRole('button', {
			name: 'add_expense',
		})
		const amountFormField = page.getByLabel('Montant *')
		const descriptionFormField = page.getByLabel('Description')
		const submitButton = page.getByRole('button', { name: 'Enregistrer' })

		if (!isMobile) {
			groupCard.click()
		}

		await addExpenseButton.click()
		await amountFormField.fill(
			randNumber({ min: 1, max: 100, fraction: 2 }).toString()
		)
		await descriptionFormField.fill('test')
		await submitButton.click()

		await expect(
			page.getByText(/\w+ vous doit \d+\.\d+€/).first()
		).toBeVisible()
	})

	test('Can repay a debt with a transfer', async ({
		browser,
		page,
		isMobile,
	}) => {
		await page.goto('/')

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
		const addExpenseButton = secondGroupCard.getByRole('button', {
			name: 'add_expense',
		})

		if (!isMobile) {
			secondGroupCard.click()
		}

		await addExpenseButton.click()
		await secondUserPage.getByLabel('Montant *').fill('100')
		await secondUserPage.getByLabel('Description').fill('test')
		await secondUserPage
			.getByRole('button', { name: 'Enregistrer' })
			.click()

		await page.goto('/')

		if (!isMobile) {
			groupCard.click()
		}

		await expect(repayButton).toBeVisible()
		await repayButton.click()
		await submitButton.click()

		await expect(repayButton).toBeHidden()
	})
})
