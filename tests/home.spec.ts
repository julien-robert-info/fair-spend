import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
	test('Show login button if not logged in', async ({ browser }) => {
		const context = await browser.newContext({
			storageState: { cookies: [], origins: [] },
		})
		const page = await context.newPage()
		await page.goto('/')

		await expect(
			page.getByRole('button', { name: /Commencer\/Se connecter/ })
		).toBeVisible()

		await context.close()
	})

	test('Show Dashboard if logged in', async ({ page }) => {
		await page.goto('/')
		page.waitForURL('/')

		await expect(page.getByText('Dashboard')).toBeVisible()
	})
})
