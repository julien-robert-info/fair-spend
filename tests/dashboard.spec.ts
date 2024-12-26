import { test, expect } from '@playwright/test'
import { SwipeToLocator } from '@/utils/test'

test('Show Groups Dashboard', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { name: /Groupes/ })).toBeVisible()
})

test('Show debt panel when select group', async ({ page, isMobile }) => {
	await page.goto('/')

	const fairModeCard = page
		.locator('.MuiCard-root')
		.filter({ has: page.getByTestId('VolunteerActivismIcon') })
		.first()
	const equitableModeCard = page
		.locator('.MuiCard-root')
		.filter({ has: page.getByTestId('BalanceIcon') })
		.first()
	const addExpenseButton = page.getByRole('button', { name: 'add_expense' })
	const settingButton = page.getByRole('button', { name: 'settings' })

	if (isMobile) {
		SwipeToLocator(page, equitableModeCard)
	} else {
		equitableModeCard.click()
	}

	await expect(addExpenseButton).toBeVisible()
	await expect(settingButton).toBeHidden()

	page.reload()
	if (isMobile) {
		SwipeToLocator(page, fairModeCard)
	} else {
		fairModeCard.click()
	}

	await expect(addExpenseButton).toBeVisible()
	await expect(settingButton).toBeVisible()
})
