'use server'
import { FormAction } from '@/components/Form'
import { authOrError } from '@/utils/auth'
import TelegramBot from 'node-telegram-bot-api'

export const sendFeedback: FormAction = async (prevState, formData) => {
	const user = await authOrError()

	const message = formData.get('message') as string

	const text = `📬 *Nouveau feedback*

👤 *De :* <${user?.name}> ${user?.email}

📝 *Message :*
${message}`

	try {
		const bot = new TelegramBot(process.env.TELEGRAM_TOKEN!, {
			polling: true,
		})
		await bot.sendMessage(process.env.TELEGRAM_CHAT_ID!, text, {
			parse_mode: 'Markdown',
		})
	} catch (error) {
		throw error
	}

	return { message: 'success' }
}
