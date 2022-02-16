import axios from 'axios'
import { GetStaticProps } from 'next'
import Layout from '@/components/Layout'
import { PrismaClient } from '@prisma/client'
import PotatoForm from '@/components/PotatoForm'
import { FC } from 'react'

const Index: FC<{
	potatoes: Array<{ image: string; name: string; description: string; href: string }>
	comissionQueue: number
}> = ({ potatoes, comissionQueue }) => {
	return (
		<Layout>
			<div className="space-y-10">
				<header className="mb-4">
					<div className="space-y-2.5">
						<h1 className="text-white font-semibold text-5xl">Ana&apos;s Potato Form</h1>

						<p className="text-gray-500 text-xl">Request a personalised potato NFT from anarueda.eth</p>
					</div>
				</header>
				<div className="flex -space-x-6">
					{potatoes.map(potato => (
						<div className="inline-block ring-2 ring-gray-900 overflow-hidden" key={potato.name}>
							<div
								style={{
									clipPath: 'url("#hexagon-shape")',
									height: 'calc(100% - 4px)',
									width: 'calc(100% - 4px)',
								}}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={potato.image} width={200} height={200} alt={potato.name} />
							</div>
						</div>
					))}
				</div>
				{comissionQueue && (
					<p className="text-gray-500 text-lg">
						There&apos;s currently {comissionQueue} {comissionQueue == 1 ? 'potato' : 'potatoes'} in the
						queue, yours could be the next one!
					</p>
				)}
				<PotatoForm />
			</div>
		</Layout>
	)
}

export const getStaticProps: GetStaticProps = async () => {
	const prisma = new PrismaClient()
	const potatoes = await axios
		.get('https://api.opensea.io/api/v1/assets?collection=potato-but-cute&limit=50', {
			headers: { 'X-API-KEY': process.env.OPENSEA_KEY },
		})
		.then(res =>
			res.data.assets.map(nft => ({
				image: nft.image_url,
				name: nft.name,
				description: nft.description,
				href: nft.permalink,
			}))
		)

	const comissionQueue = await prisma.comission.count({ where: { finished: false } })

	return { props: { potatoes, comissionQueue }, revalidate: 30 }
}

export default Index
