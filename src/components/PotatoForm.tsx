import { Button, Card, Field, FieldSet, Heading, IconUpload, Input, MediaPicker, Stack, Stat, Tag, Text } from 'degen'
import { BigNumber } from 'ethers'
import { FC, useEffect, useMemo, useState } from 'react'
import { useAccount, useTransaction } from 'wagmi'
import ConnectWallet from './ConnectWallet'

enum FORM_STATES {
	ENTER_DETAILS,
	CONFIRM,
}

const PotatoForm: FC = () => {
	const [formState, setFormState] = useState<FORM_STATES>(FORM_STATES.ENTER_DETAILS)
	const [name, setName] = useState('')
	const [twitterUsername, setTwitterUsername] = useState('')
	const [inspiration, setInspiration] = useState<File>(null)
	const [walletAddress, setWalletAddress] = useState('')

	const onTransaction = (tx: string) => {
		console.log(tx)
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
							setInspiration,
							walletAddress,
							setWalletAddress,
							submitForm: () => setFormState(FORM_STATES.CONFIRM),
						}}
					/>
				)
			case FORM_STATES.CONFIRM:
				return (
					<ReviewPotatoDetails
						{...{
							name,
							twitterUsername,
							inspiration,
							walletAddress,
							onTransaction,
						}}
					/>
				)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, twitterUsername, walletAddress, formState])

	return (
		<Card padding="6" shadow>
			<Heading>Request a Potato</Heading>
			<Text>Get your own hand-made potato avatar for 0.1 ETH (0.05 ETH now &amp; 0.05 ETH after mint).</Text>
			{formPage}
		</Card>
	)
}

const EnterDataState = ({
	name,
	setName,
	twitterUsername,
	setTwitterUsername,
	setInspiration,
	walletAddress,
	setWalletAddress,
	submitForm,
}) => {
	const [errors, setErrors] = useState({ name: null, twitterUsername: null, walletAddress: null })
	const [{ data, error, loading }, disconnect] = useAccount()

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
					<MediaPicker
						accept="image/jpeg, image/png, image/webp, image/gif"
						label="Upload inspiration"
						required
						onChange={file => setInspiration(file)}
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
				{data?.address ? <Button variant="primary">Review Details</Button> : <ConnectWallet />}
			</div>
		</form>
	)
}

const ReviewPotatoDetails: FC<{
	name: string
	twitterUsername: string
	inspiration?: File
	walletAddress: string
	onTransaction: (string) => void
}> = ({ name, twitterUsername, inspiration, walletAddress, onTransaction }) => {
	const [{ data, error, loading }, payOrder] = useTransaction({
		request: {
			to: 'anarueda.eth',
			value: BigNumber.from('50000000000000000'), // 1 ETH
		},
	})

	useEffect(() => {
		if (!data?.hash) return

		onTransaction(data.hash)
	}, [data])

	useEffect(() => {
		if (!error) return
		if (/User rejected request/.test(error.message)) return

		alert(error.message)
	}, [error])

	return (
		<div className="px-4 py-5 sm:px-6">
			<dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
				<div className="sm:col-span-1">
					<dt className="font-medium text-gray-400">Name</dt>
					<dd className="mt-1 text-gray-300">{name}</dd>
				</div>
				<div className="sm:col-span-1">
					<dt className="font-medium text-gray-400">Twitter Username</dt>
					<dd className="mt-1 text-gray-300">{twitterUsername}</dd>
				</div>
				<div className="sm:col-span-1">
					<dt className="font-medium text-gray-400">Wallet Address</dt>
					<dd className="mt-1 text-gray-300">{walletAddress}</dd>
				</div>
				{inspiration && (
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
											{inspiration.name}
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

export default PotatoForm
