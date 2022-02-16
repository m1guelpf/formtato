import { PrismaClient } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'

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

	res.status(200).send(comission.id)
}

export default handler
