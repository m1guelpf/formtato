import axios from 'axios'
import { BigNumber } from 'ethers'
import UploadFile from './UploadFile'
import ConnectWallet from './ConnectWallet'
import { useAccount, useTransaction } from 'wagmi'
import ExternalLinkIcon from './Icons/ExternalLinkIcon'
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Card, Field, FieldSet, Heading, IconUpload, Input, Tag, Text } from 'degen'

enum FORM_STATES {
	ENTER_DETAILS,
	REVIEW,
	CONFIRMED,
}

const PotatoForm: FC = () => {
	const [formState, setFormState] = useState<FORM_STATES>(FORM_STATES.ENTER_DETAILS)
	const [name, setName] = useState('')
	const [twitterUsername, setTwitterUsername] = useState('')
	const [inspirationURI, setInspirationURI] = useState<string>(null)
	const [inspirationFileName, setInspirationFileName] = useState<string>(null)
	const [walletAddress, setWalletAddress] = useState('')
	const [comissionID, setComissionID] = useState<number>(null)

	const onTransaction = async (tx: string) => {
		const id = await axios
			.post('/api/request', { name, twitterUsername, txHash: tx, inspirationURI })
			.then(res => res.data)

		setComissionID(id)
		setFormState(FORM_STATES.CONFIRMED)
	}

	const formPage = useMemo(() => {
		switch (formState) {
			case FORM_STATES.ENTER_DETAILS:
				return (
					<EnterDataState
						{...{
							name,
							setName,
							twitterUsername,
							setTwitterUsername,
							setInspirationURI,
							setInspirationFileName,
							walletAddress,
							setWalletAddress,
							submitForm: () => setFormState(FORM_STATES.REVIEW),
						}}
					/>
				)
			case FORM_STATES.REVIEW:
				return (
					<ReviewPotatoDetails
						{...{
							name,
							twitterUsername,
							inspirationFileName,
							walletAddress,
							onTransaction,
						}}
					/>
				)

			case FORM_STATES.CONFIRMED:
				return <PotatoConfirmationState comissionID={comissionID} />
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, twitterUsername, walletAddress, comissionID, formState])

	return (
		<Card padding="6" shadow>
			<Heading>Request a Potato</Heading>
			<Text>Get your own hand-made potato avatar for 0.1 ETH (0.05 ETH now &amp; 0.05 ETH after mint).</Text>
			{formPage}
		</Card>
	)
}

const EnterDataState: FC<{
	name: string
	setName: Dispatch<SetStateAction<string>>
	twitterUsername: string
	setTwitterUsername: Dispatch<SetStateAction<string>>
	setInspirationURI: Dispatch<SetStateAction<string>>
	setInspirationFileName: Dispatch<SetStateAction<string>>
	walletAddress: string
	setWalletAddress: Dispatch<SetStateAction<string>>
	submitForm: () => void
}> = ({
	name,
	setName,
	twitterUsername,
	setTwitterUsername,
	setInspirationURI,
	setInspirationFileName,
	walletAddress,
	setWalletAddress,
	submitForm,
}) => {
	const [errors, setErrors] = useState({ name: null, twitterUsername: null, walletAddress: null })
	const [{ data: account }] = useAccount()

	const validateAndSubmit = event => {
		event.preventDefault()

		setErrors({ name: !name, twitterUsername: !twitterUsername, walletAddress: !walletAddress })

		if (name && twitterUsername && walletAddress) submitForm()
	}

	return (
		<form onSubmit={validateAndSubmit}>
			<FieldSet legend="">
				<Input
					label="Name"
					placeholder="Ana Rueda"
					required={true}
					value={name}
					error={errors.name && 'The name field is required.'}
					onChange={event => setName(event.target.value)}
					onBlur={() => setErrors({ ...errors, name: null })}
				/>
				<Input
					label="Twitter"
					placeholder="ruedart"
					prefix="https://twitter.com/"
					textTransform="lowercase"
					description="I'll tag you there once your potato is finished, and use your avatar as inspiration if you don't provide one below."
					required
					value={twitterUsername}
					error={errors.twitterUsername && 'I need your twitter to deliver your potato!'}
					onChange={event => setTwitterUsername(event.target.value)}
					onBlur={() => setErrors({ ...errors, twitterUsername: null })}
				/>
				<Field
					label={
						<div className="flex items-center">
							<span>Avatar Inspiration</span>
							<Tag as="span" size="small" tone="secondary">
								optional
							</Tag>
						</div>
					}
					description="The avatar you want your potato to be inspired on."
				>
					<UploadFile
						onChange={imageURI => setInspirationURI(imageURI)}
						onFileLoad={file => setInspirationFileName(file?.name)}
					/>
				</Field>
				<Input
					label="Wallet Address"
					description="I'll send your potato to this address, so make sure it's right!"
					placeholder="0xf3C56cdDf1A64aaA15DC6F2d137E79F74Dd07C41"
					error={errors.walletAddress && 'I need your wallet address to deliver your potato!'}
					value={walletAddress}
					onChange={event => setWalletAddress(event.target.value)}
					onBlur={() => setErrors({ ...errors, walletAddress: null })}
				/>
			</FieldSet>
			<div className="mt-6 flex justify-end">
				{account?.address ? <Button variant="primary">Review Details</Button> : <ConnectWallet />}
			</div>
		</form>
	)
}

const ReviewPotatoDetails: FC<{
	name: string
	twitterUsername: string
	inspirationFileName?: string
	walletAddress: string
	onTransaction: (string) => void
}> = ({ name, twitterUsername, inspirationFileName, walletAddress, onTransaction }) => {
	const [{ data: transaction, error: txError, loading }, payOrder] = useTransaction({
		request: {
			to: process.env.NEXT_PUBLIC_WALLET_ADDRESS,
			value: BigNumber.from('50000000000000000'), // 0.05 ETH
		},
	})

	useEffect(() => {
		if (!transaction?.hash) return

		onTransaction(transaction.hash)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transaction])

	useEffect(() => {
		if (!txError) return
		if (/User rejected request/.test(txError.message)) return

		alert(txError.message)
	}, [txError])

	return (
		<div className="px-4 py-5 sm:px-6">
			<dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
				<div className="sm:col-span-1">
					<dt className="font-medium text-gray-400">Name</dt>
					<dd className="mt-1 text-gray-300">{name}</dd>
				</div>
				<div className="sm:col-span-1">
					<dt className="font-medium text-gray-400">Twitter Username</dt>
					<a href={`https://twitter.com/${twitterUsername}`} target="_blank" rel="noreferrer">
						<dd className="mt-1 text-gray-300 flex items-center space-x-1">
							<span>{twitterUsername}</span>
							<ExternalLinkIcon className="h-5 w-5 text-gray-400" />
						</dd>
					</a>
				</div>
				<div className="sm:col-span-1">
					<dt className="font-medium text-gray-400">Wallet Address</dt>
					<a href={`https://etherscan.io/address/${walletAddress}`} target="_blank" rel="noreferrer">
						<dd className="mt-1 text-gray-300 flex items-center space-x-1">
							<span className="truncate">{walletAddress}</span>
							<ExternalLinkIcon className="h-5 w-5 text-gray-400" />
						</dd>
					</a>
				</div>
				{inspirationFileName && (
					<div className="sm:col-span-2">
						<dt className="text-sm font-medium text-gray-400">Attachments</dt>
						<dd className="mt-1 text-sm text-gray-900">
							<ul role="list" className="border border-gray-800 rounded-md">
								<li className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
									<div className="w-0 flex-1 flex items-center">
										<IconUpload
											className="flex-shrink-0 h-5 w-5 text-gray-400"
											aria-hidden="true"
										/>
										<span className="ml-2 flex-1 w-0 truncate text-gray-200">
											{inspirationFileName}
										</span>
									</div>
								</li>
							</ul>
						</dd>
					</div>
				)}
			</dl>
			<div className="mt-8">
				<p className="mt-1 text-xs text-gray-100">
					You pay 0.05 ETH when submitting the form, and the other 0.05 ETH after your hand-made potato has
					been crafted &amp; minted to receive your potato. I&apos;ll reach out to you with a proposed design
					to get feedback before the mint.{' '}
					<span className="font-semibold">Hope you enjoy the potato-ness!</span>
				</p>
			</div>
			<div className="mt-6 flex justify-end">
				<Button loading={loading} disabled={loading} onClick={() => payOrder()}>
					Order Potato
				</Button>
			</div>
		</div>
	)
}

const PotatoConfirmationState: FC<{ comissionID: number }> = ({ comissionID }) => {
	return (
		<div className="mt-4">
			<p className="text-white text-lg mb-6">
				I&apos;ve planted the seed, and will reach out once your potato grows out of it. Hope you enjoy! ☺️
			</p>
			<div className="flex justify-center">
				<Button
					as="a"
					variant="secondary"
					href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
						'https://potato.anarueda.art'
					)}&text=${encodeURIComponent('🌱 Just ordered a hand-painted potato from @ruedart\n\n')}`}
					target="_blank"
					rel="noreferrer"
				>
					Share on Twitter
				</Button>
			</div>
			<div className="mt-8">
				<p className="mt-1 text-xs text-gray-100">
					For reference, your order ID is {comissionID}.{' '}
					<span className="font-semibold">Hope you enjoy the potato-ness!</span>
				</p>
			</div>
		</div>
	)
}

export default PotatoForm
