import { test, expect } from '@playwright/test'
import { SwipeToLocator } from '@/utils/test'
import { randNumber } from '@ngneat/falso'

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
