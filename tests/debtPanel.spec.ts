import { test, expect } from '@playwright/test'
import { SwipeToLocator } from '@/utils/test'
import { randNumber } from '@ngneat/falso'
import prisma from '@/utils/prisma'

test.describe('Debt panel features', () => {
	test.beforeAll(async () => {
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

		const income = randNumber().toString()

		await settingButton.click()
		await incomeFormFields.fill(income)
		await submitButton.click()

		await settingButton.click()
		await expect(incomeFormFields).toHaveValue(income)
	})

	test('Cannot add expense with invalid amount', async ({
		page,
		isMobile,
	}) => {
		await page.goto('/')

		const groupCard = page.locator('.MuiCard-root').first()
		const addExpenseButton = page.getByRole('button', {
			name: 'add_expense',
		})
		const amountFormField = page.getByLabel('Montant *')
		const descriptionFormField = page.getByLabel('Description')
		const submitButton = page.getByRole('button', { name: 'Enregistrer' })
		const overlay = page.getByRole('presentation')

		if (!isMobile) {
			groupCard.click()
		}

		await expect(addExpenseButton).toBeVisible()
		await addExpenseButton.click()
		await amountFormField.fill('invalid')
		await descriptionFormField.fill('test')
		await submitButton.click()

		await expect(page.getByText('Montant invalide')).toBeVisible()

		await overlay.click({ position: { x: 10, y: 10 } })
		await addExpenseButton.click()
		await amountFormField.fill('-12')
		await descriptionFormField.fill('test')

		await expect(page.getByText('Montant invalide')).toBeHidden()

		await submitButton.click()

		await expect(page.getByText('Montant invalide')).toBeVisible()
	})

	test('Can add expense, then debt appear', async ({ page, isMobile }) => {
		await page.goto('/')

		const groupCard = page.locator('.MuiCard-root').first()
		const addExpenseButton = page.getByRole('button', {
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
})
