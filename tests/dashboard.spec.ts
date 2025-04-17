import { test, expect } from '@playwright/test'
import { SwipeToLocator } from '@/utils/test'

test('Show Groups Dashboard', async ({ page }) => {
	await page.goto('/')

	await expect(
		page.getByRole('heading', { name: /Budgets partagés/ })
	).toBeVisible()
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
	const menuButton = page.getByRole('button', { name: 'menu' })
	const settingButton = page.getByRole('button', { name: 'settings' })

	if (isMobile) {
		SwipeToLocator(page, equitableModeCard)
	} else {
		equitableModeCard.click()
	}

	await expect(menuButton).toBeVisible()
	await expect(settingButton).toBeHidden()

	await page.reload()
	if (isMobile) {
		SwipeToLocator(page, fairModeCard)
	} else {
		fairModeCard.click()
	}

	await expect(menuButton).toBeVisible()
	await expect(settingButton).toBeVisible()
})
