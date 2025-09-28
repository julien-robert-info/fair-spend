import prisma from '@/utils/prisma'
import { swipeToLocator } from '@/utils/test'
import { randNumber } from '@ngneat/falso'
import { test, expect } from '@playwright/test'

test.describe('Groups features', () => {
	test.afterEach(async () => {
		await prisma.group.deleteMany({
			where: {
				name: {
					in: [
						'alice testGroup',
						'bob testGroup',
						'testGroup',
						'myGroup',
					],
				},
			},
		})
	})

	test('Can create, update and delete a group', async ({
		page,
		isMobile,
	}) => {
		await page.goto('/')
		await page
			.getByRole('button', {
				name: isMobile ? 'add_group' : 'Nouveau budget',
			})
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

		// update
		await page.getByRole('button', { name: 'menu' }).click()
		await page.getByRole('menuitem', { name: 'modifier' }).click()
		await nameFormField.fill('myGroup')
		await page.getByRole('button', { name: 'enregistrer' }).click()

		card = page
			.locator('.MuiCard-root')
			.filter({ has: page.getByText('myGroup') })

		await expect(card).toBeVisible()

		// delete
		await page.getByRole('button', { name: 'menu' }).click()
		await page.getByRole('menuitem', { name: 'Supprimer' }).click()
		await page.getByRole('button', { name: 'oui' }).click()

		await expect(card).toBeHidden()
	})

	test('Can invite people in a group, transfert ownership, leave and come back', async ({
		page,
		browser,
		isMobile,
	}) => {
		test.setTimeout(50000)
		await page.goto('/')

		// create
		await page
			.getByRole('button', {
				name: isMobile ? 'add_group' : 'Nouveau budget',
			})
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
		await page.getByRole('button', { name: 'menu' }).click()
		await page.getByRole('menuitem', { name: 'Inviter' }).click()

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
			await swipeToLocator(page, card)
		} else {
			await card.click()
		}

		await page.getByRole('button', { name: 'menu' }).click()
		await expect(
			page.getByRole('menuitem', { name: 'Quitter' })
		).toBeVisible()

		await page.getByRole('menuitem', { name: 'Quitter' }).click()

		await expect(page.getByLabel('Nouveau propriétaire')).toBeVisible()
		await page.getByLabel('Nouveau propriétaire').click()
		await page
			.getByRole('option', { name: isMobile ? 'Bob' : 'Alice' })
			.click()
		await page.getByRole('button', { name: 'Transférer' }).click()

		await expect(card).toBeHidden()

		await secondUserPage.reload()

		if (isMobile) {
			await swipeToLocator(secondUserPage, secondUserCard)
		} else {
			await secondUserCard.click()
		}
		await expect(secondUserCard).toBeVisible()

		await secondUserPage.getByRole('button', { name: 'menu' }).click()
		await expect(
			secondUserPage.getByRole('menuitem', { name: 'Supprimer' })
		).toBeVisible()

		// reinvite
		await secondUserPage.getByRole('menuitem', { name: 'Inviter' }).click()

		await expect(secondUserPage.getByLabel('Email')).toBeVisible()

		await secondUserPage
			.getByLabel('Email')
			.fill(isMobile ? 'alice@test.com' : 'bob@test.com')
		await secondUserPage.getByRole('button', { name: 'Inviter' }).click()
		await secondUserContext.close()

		await page.reload()
		await expect(page.getByRole('button', { name: 'accept' })).toBeVisible()

		await page.getByRole('button', { name: 'accept' }).click()

		if (isMobile) {
			await swipeToLocator(page, card)
		} else {
			await card.click()
		}
		await expect(card).toBeVisible()
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
			await swipeToLocator(page, fairModeCard)
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
})
