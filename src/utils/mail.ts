import { createTransport } from 'nodemailer'

export const inviteMail = async (email: string, groupName: string) => {
	const transport = createTransport(process.env.EMAIL_SERVER)
	const result = await transport.sendMail({
		subject: `You have been invited to join ${groupName}`,
		to: email,
		html: `<p>You have been invited to join ${groupName}.</p>
        Click <a href="${process.env.NEXTAUTH_URL}">here</a> to accept the invitation or copy and paste the following link into your browser: ${process.env.NEXTAUTH_URL}
        <br />
        <p>If you did not request this invitation, please ignore this email.</p>
        `,
	})
	const failed = result.rejected.concat(result.pending).filter(Boolean)
	if (failed.length) {
		throw new Error(`Email (${failed.join(', ')}) could not be sent`)
	}
}
