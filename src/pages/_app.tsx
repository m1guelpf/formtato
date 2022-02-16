import 'degen/styles'
import { FC } from 'react'
import 'tailwindcss/tailwind.css'
import { AppProps } from 'next/app'
import { ThemeProvider } from 'degen'
import { WagmiProvider, chain } from 'wagmi'
import { Web3ModalConnector } from '@/lib/Web3ModalConnector'
import WalletConnectProvider from '@walletconnect/web3-provider'

const web3Modal = new Web3ModalConnector({
	chains: [chain.mainnet],
	options: {
		network: 'mainnet',
		providerOptions: {
			walletconnect: {
				display: {
					description: 'Use Rainbow & other popular wallets',
				},
				package: WalletConnectProvider,
				options: {
					infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
				},
			},
		},
	},
})

const App: FC<AppProps> = ({ Component, pageProps }) => (
	<ThemeProvider forcedMode="dark" forcedAccent="blue">
		<WagmiProvider autoConnect connectorStorageKey="formtato.wallet" connectors={[web3Modal]}>
			<Component {...pageProps} />
		</WagmiProvider>
	</ThemeProvider>
)

export default App
