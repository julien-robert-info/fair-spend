'use server'
import { createTransport } from 'nodemailer'

export const inviteMail = async (email: string, groupName: string) => {
	const transport = createTransport({
		host: process.env.EMAIL_SERVER,
		port: Number(process.env.EMAIL_PORT),
		secure: false,
		...(process.env.NODE_ENV === 'production' && {
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PWD,
			},
		}),
	})

	const result = await transport.sendMail({
		from: process.env.EMAIL_FROM,
		to: email,
		subject: `You have been invited to join ${groupName}`,
		text: `You have been invited to join ${groupName}. Copy and paste the following link into your browser: ${process.env.NEXTAUTH_URL}`,
	})
	console.log('inviteMail', result)

	const failed = result.rejected.concat(result.pending).filter(Boolean)

	if (failed.length) {
		throw new Error(`Email (${failed.join(', ')}) could not be sent`)
	}
}
