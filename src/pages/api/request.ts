import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import Sendgrid from '@sendgrid/mail'

Sendgrid.setApiKey(process.env.SENDGRID_KEY)
const prisma = new PrismaClient()

const handler = async ({ body }: NextApiRequest, res: NextApiResponse) => {
	const comission = await prisma.comission.create({
		data: {
			name: body.name,
			twitterUsername: body.twitterUsername,
			txHash: body.txHash,
			inspirationURI: body.inspirationURI,
		},
	})

	const resp = await Sendgrid.send({
		to: 'anaruedalastra@outlook.com',
		from: 'formtato@anarueda.art',
		subject: 'New Potato request!',
		html: `${comission.name} (<a href="https://twitter.com/${comission.twitterUsername}" target="_blank">@${
			comission.twitterUsername
		}</a>) has requested a custom potato${
			comission.inspirationURI
				? ` and provided <a href="${comission.inspirationURI.replace(
						'ipfs://',
						'https://ipfs.io/ipfs/'
				  )}" target="_blank">some inspiration</a>`
				: ''
		}.<br><br>You can verify their payment <a href="https://etherscan.io/tx/${
			comission.txHash
		}" target="_blank">here</a>.`,
	})

	console.log(resp)

	res.status(200).send(comission.id)
}

export default handler
