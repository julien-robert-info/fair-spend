import { Page, Locator, expect } from '@playwright/test'

export const SwipeToLocator = async (page: Page, locator: Locator) => {
	await expect(async () => {
		const nextButton = page.getByRole('button', {
			name: 'Next',
		})
		if (await nextButton.isVisible()) {
			await nextButton.click()
		}
		await expect(locator).toBeVisible({ timeout: 2000 })
	}).toPass({ timeout: 12000 })
}
