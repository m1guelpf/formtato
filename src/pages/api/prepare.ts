import { NextApiRequest, NextApiResponse } from 'next'

const handler = ({ body }: NextApiRequest, res: NextApiResponse) => {
	res.status(200).json(body)
}

export default handler
