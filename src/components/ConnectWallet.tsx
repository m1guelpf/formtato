import { Button, IconLockClosed, IconWallet } from 'degen'
import { useConnect } from 'wagmi'

const ConnectWallet = () => {
	const [{ data, error }, connect] = useConnect()

	const connector = data.connectors[0]

	const connectWallet = event => {
		event.preventDefault()

		connect(connector)
	}

	return (
		<Button
			prefix={<IconLockClosed />}
			variant="primary"
			tone="blue"
			disabled={!connector.ready || data.connected ? true : null}
			onClick={connectWallet}
		>
			{data.connected ? 'Wallet Connected ' : 'Connect Wallet'}
		</Button>
	)
}

export default ConnectWallet
