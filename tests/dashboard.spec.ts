import { test, expect } from '@playwright/test'

test('Show Groups Dashboard', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { name: /Groupes/ })).toBeVisible()
})

test.describe('Groups Dashboard', () => {
	test('can create, update and delete a group', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: 'Nouveau groupe' }).click()

		const nameFormField = page.getByLabel('nom *')
		const shareModeFormField = page.getByLabel('Mode de répartition')

		await expect(nameFormField).toBeVisible()
		await expect(shareModeFormField).toBeVisible()

		// create
		await nameFormField.fill('testGroup')
		await shareModeFormField.click()
		await page.getByRole('option', { name: 'équitable' }).click()
		await page.getByRole('button', { name: 'enregistrer' }).click()

		await expect(
			page.getByRole('button', { name: 'testGroup' })
		).toBeVisible()

		// update
		await page.getByRole('button', { name: 'edit' }).click()
		await nameFormField.fill('myGroup')
		await page.getByRole('button', { name: 'enregistrer' }).click()

		await expect(
			page.getByRole('button', { name: 'myGroup' })
		).toBeVisible()

		// delete
		await page.getByRole('button', { name: 'delete' }).click()

		await expect(page.getByRole('button', { name: 'myGroup' })).toBeHidden()
	})
})
