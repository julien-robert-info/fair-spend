'use server'
import { createTransport } from 'nodemailer'
import { transportOptions } from './auth'

export const inviteMail = async (email: string, groupName: string) => {
	const transport = createTransport(transportOptions)

	const result = await transport.sendMail({
		from: process.env.EMAIL_FROM,
		to: email,
		subject: `Invitation à rejoindre Fair spend`,
		html: mailContent(groupName),
	})

	const failed = result.rejected.concat(result.pending).filter(Boolean)

	if (failed.length) {
		throw new Error(`Email (${failed.join(', ')}) could not be sent`)
	}
}

const mailContent = (groupName: string) => `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à rejoindre FairSpend</title>
    <style>
        @media only screen and (max-width: 620px) {
            table[class=body] h1 {
                font-size: 28px !important;
                margin-bottom: 10px !important;
            }
            table[class=body] p,
            table[class=body] ul,
            table[class=body] ol,
            table[class=body] td,
            table[class=body] span,
            table[class=body] a {
                font-size: 16px !important;
            }
            table[class=body] .wrapper,
            table[class=body] .article {
                padding: 10px !important;
            }
            table[class=body] .content {
                padding: 0 !important;
            }
            table[class=body] .container {
                padding: 0 !important;
                width: 100% !important;
            }
            table[class=body] .main {
                border-left-width: 0 !important;
                border-radius: 0 !important;
                border-right-width: 0 !important;
            }
            table[class=body] .btn table {
                width: 100% !important;
            }
            table[class=body] .btn a {
                width: 100% !important;
				text-decoration: "none";
            }
            table[class=body] .app-name {
                font-weight: 700;
            }
        }
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            word-spacing: normal;
            background-color: #f5f5f5;
			color: rgba(0, 0, 0, 0.8);
        }
    </style>
</head>
<body>
    <table border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
            <td>&nbsp;</td>
            <td class="container">
                <div class="content">
                    <table class="main">
                        <tr>
                            <td class="wrapper">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <h1 class="app-name" style="max-width: 200px;">
												Fair spend
											</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table class="main" bgcolor="#ffffff">
                        <tr>
                            <td class="wrapper">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <h1>Rejoignez le budget partagé ${groupName}</h1>
                                            <p>[Nom de l'expéditeur] vous invite à rejoindre le budget partagé sur FairSpend.</p>
                                            <table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                                                <tbody>
                                                    <tr>
                                                        <td align="left">
                                                            <table border="0" cellpadding="0" cellspacing="0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td>
																			<a href="${process.env.NEXTAUTH_URL}" target="_blank">Rejoindre le budget partagé</a>
																		</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table class="main" bgcolor="#ffffff">
                        <tr>
                            <td class="wrapper">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td>
                                            <h2>Qu'est-ce que FairSpend ?</h2>
                                            <p>FairSpend est une application qui vous aide à gérer facilement le partage des dépenses avec vos colocataires ou amis. Grâce à différents modes de répartition des coûts, un suivi simplifié des dettes et un compte commun optionnel, FairSpend rend la gestion budgétaire équitable et transparente pour tous.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </td>
            <td>&nbsp;</td>
        </tr>
    </table>
</body>
</html>`
