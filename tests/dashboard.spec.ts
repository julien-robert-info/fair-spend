import prisma from '@/utils/prisma'
import { test, expect } from '@playwright/test'

test('Show Groups Dashboard', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { name: /Groupes/ })).toBeVisible()
})

test.describe('Groups Dashboard', () => {
	test.beforeEach(async () => {
		await prisma.group.deleteMany({
			where: { name: { in: ['testGroup', 'myGroup'] } },
		})
	})

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

	test('can invite people in a group, transfert ownership and leave', async ({
		page,
		browser,
	}) => {
		await page.goto('/')

		// create
		await page.getByRole('button', { name: 'Nouveau groupe' }).click()
		await page.getByLabel('nom *').fill('testGroup')
		await page.getByLabel('Mode de répartition').click()
		await page.getByRole('option', { name: 'équitable' }).click()
		await page.getByRole('button', { name: 'enregistrer' }).click()

		await expect(
			page.getByRole('button', { name: 'testGroup' })
		).toBeVisible()

		// share
		await page.getByRole('button', { name: 'share' }).click()

		await expect(page.getByLabel('Email')).toBeVisible()

		await page.getByLabel('Email').fill('alice@test.com')
		await page.getByRole('button', { name: 'Inviter' }).click()

		const aliceContext = await browser.newContext({
			storageState: 'playwright/.auth/alice.json',
		})
		const alicePage = await aliceContext.newPage()

		// with webmail
		// await alicePage.goto('http://localhost:8081')
		// await alicePage.getByRole('link', { name: 'Refresh' }).click()

		// await expect(
		// 	alicePage.getByRole('link', { name: 'You have been invited' })
		// ).toBeVisible()

		// await alicePage
		// 	.getByRole('link', { name: 'You have been invited' })
		// 	.click()

		// await expect(
		// 	alicePage
		// 		.frameLocator('iframe')
		// 		.first()
		// 		.getByRole('link', { name: 'here' })
		// ).toBeVisible()

		// await alicePage
		// 	.frameLocator('iframe')
		// 	.first()
		// 	.getByRole('link', { name: 'here' })
		// 	.click()

		// await alicePage.goto('/')

		await expect(
			alicePage.getByRole('button', { name: 'accept' })
		).toBeVisible()

		await expect(
			alicePage.getByRole('button', { name: 'decline' })
		).toBeVisible()

		await alicePage.getByRole('button', { name: 'accept' }).click()

		await expect(
			alicePage.getByRole('button', { name: 'testGroup B' })
		).toBeVisible()

		// leave
		await page.reload()

		await expect(page.getByRole('button', { name: 'leave' })).toBeVisible()

		await page.getByRole('button', { name: 'leave' }).click()

		await expect(page.getByLabel('Nouveau propriétaire')).toBeVisible()
		await page.getByLabel('Nouveau propriétaire').click()
		await page.getByRole('option', { name: 'Alice' }).click()
		await page.getByRole('button', { name: 'Transférer' }).click()

		await expect(page.getByRole('button', { name: 'myGroup' })).toBeHidden()

		await alicePage.reload()

		await expect(
			alicePage.getByRole('button', { name: 'edit' })
		).toBeVisible()
	})
})
