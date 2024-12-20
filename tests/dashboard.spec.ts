import prisma from '@/utils/prisma'
import { test, expect } from '@playwright/test'

test('Show Groups Dashboard', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { name: /Groupes/ })).toBeVisible()
})

test.describe('Groups Dashboard', () => {
	test.beforeEach(async () => {
		await prisma.group.deleteMany({
			where: {
				name: { in: ['alice testGroup', 'bob testGroup', 'myGroup'] },
			},
		})
	})

	test('can create, update and delete a group', async ({
		page,
		isMobile,
	}) => {
		await page.goto('/')
		await page
			.getByRole('button', { name: isMobile ? 'add' : 'Nouveau groupe' })
			.click()

		const nameFormField = page.getByLabel('nom *')
		const shareModeFormField = page.getByLabel('Mode de répartition')

		await expect(nameFormField).toBeVisible()
		await expect(shareModeFormField).toBeVisible()

		// create
		await nameFormField.fill('testGroup')
		await shareModeFormField.click()
		await page.getByRole('option', { name: 'équitable' }).click()
		await page.getByRole('button', { name: 'enregistrer' }).click()

		let card = page
			.locator('.MuiCard-root')
			.filter({ has: page.getByText('testGroup') })

		await expect(card).toBeVisible()

		await card.getByRole('button', { name: 'edit' }).click()
		await nameFormField.fill('myGroup')
		await page.getByRole('button', { name: 'enregistrer' }).click()

		card = page
			.locator('.MuiCard-root')
			.filter({ has: page.getByText('myGroup') })

		await expect(card).toBeVisible()

		// delete
		await card.getByRole('button', { name: 'delete' }).click()
		await page.getByRole('button', { name: 'oui' }).click()

		await expect(card).toBeHidden()
	})

	test('can invite people in a group, transfert ownership and leave', async ({
		page,
		browser,
		isMobile,
	}) => {
		await page.goto('/')

		// create
		await page
			.getByRole('button', { name: isMobile ? 'add' : 'Nouveau groupe' })
			.click()
		await page
			.getByLabel('nom *')
			.fill(isMobile ? 'bob testGroup' : 'alice testGroup')
		await page.getByLabel('Mode de répartition').click()
		await page.getByRole('option', { name: 'équitable' }).click()
		await page.getByRole('button', { name: 'enregistrer' }).click()

		let card = page.locator('.MuiCard-root').filter({
			has: page.getByText(isMobile ? 'bob testGroup' : 'alice testGroup'),
		})

		await expect(card).toBeVisible()

		// share
		await card.getByRole('button', { name: 'share' }).click()

		await expect(page.getByLabel('Email')).toBeVisible()

		await page
			.getByLabel('Email')
			.fill(isMobile ? 'bob@test.com' : 'alice@test.com')
		await page.getByRole('button', { name: 'Inviter' }).click()

		const secondUserContext = await browser.newContext({
			storageState: isMobile
				? 'playwright/.auth/bob.json'
				: 'playwright/.auth/alice.json',
		})
		const secondUserPage = await secondUserContext.newPage()

		// with webmail
		// await secondUserPage.goto('http://localhost:8081')
		// await secondUserPage.getByRole('link', { name: 'Refresh' }).click()

		// await expect(
		// 	secondUserPage.getByRole('link', { name: 'You have been invited' })
		// ).toBeVisible()

		// await secondUserPage
		// 	.getByRole('link', { name: 'You have been invited' })
		// 	.click()

		// await expect(
		// 	secondUserPage
		// 		.frameLocator('iframe')
		// 		.first()
		// 		.getByRole('link', { name: 'here' })
		// ).toBeVisible()

		// await secondUserPage
		// 	.frameLocator('iframe')
		// 	.first()
		// 	.getByRole('link', { name: 'here' })
		// 	.click()

		await secondUserPage.goto('/')

		await expect(
			secondUserPage.getByRole('button', { name: 'accept' })
		).toBeVisible()

		await expect(
			secondUserPage.getByRole('button', { name: 'decline' })
		).toBeVisible()

		await secondUserPage.getByRole('button', { name: 'accept' }).click()

		let secondUserCard = secondUserPage.locator('.MuiCard-root').filter({
			has: secondUserPage.getByText(
				isMobile ? 'bob testGroup' : 'alice testGroup'
			),
		})
		await expect(secondUserCard).toBeVisible()

		// leave
		await page.reload()

		if (isMobile) {
			await expect(async () => {
				const nextButton = page.getByRole('button', {
					name: 'Next',
				})
				if (await nextButton.isVisible()) {
					await nextButton.click()
				}
				await expect(card).toBeVisible({ timeout: 2000 })
			}).toPass({ timeout: 12000 })
		}

		await expect(card.getByRole('button', { name: 'leave' })).toBeVisible()

		await card.getByRole('button', { name: 'leave' }).click()

		await expect(page.getByLabel('Nouveau propriétaire')).toBeVisible()
		await page.getByLabel('Nouveau propriétaire').click()
		await page
			.getByRole('option', { name: isMobile ? 'Bob' : 'Alice' })
			.click()
		await page.getByRole('button', { name: 'Transférer' }).click()

		await expect(card).toBeHidden()

		await secondUserPage.reload()

		if (isMobile) {
			await expect(async () => {
				const nextButton = secondUserPage.getByRole('button', {
					name: 'Next',
				})
				if (await nextButton.isVisible()) {
					await nextButton.click()
				}
				await expect(secondUserCard).toBeVisible({ timeout: 2000 })
			}).toPass({ timeout: 12000 })
		}

		await expect(
			secondUserCard.getByRole('button', { name: 'edit' })
		).toBeVisible()
	})
})
