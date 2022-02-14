import { Chain, Connector, normalizeChainId, SwitchChainError, UserRejectedRequestError } from 'wagmi'
import Web3Modal, { ICoreOptions } from 'web3modal'
import { Web3Provider, JsonRpcSigner } from '@ethersproject/providers'
import { getAddress } from 'ethers/lib/utils'

export class Web3ModalConnector extends Connector {
	readonly id = 'web3modal'
	readonly name = 'Web3Modal Connector'
	readonly ready = true

	modal?: Web3Modal
	provider?: Web3Provider

	constructor(config: { chains?: Chain[]; options: Partial<ICoreOptions> }) {
		super(config)
	}

	async connect() {
		// try {
		const modal = this.getModal(true)
		modal.on('accountsChanged', this.onAccountsChanged)
		modal.on('chainChanged', this.onChainChanged)
		modal.on('disconnect', this.onDisconnect)

		this.provider = new Web3Provider(await modal.connect())
		const id = await this.getChainId()
		const unsupported = this.isChainUnsupported(id)

		return {
			provider: this.provider,
			chain: { id, unsupported },
			account: await this.getAccount(),
		}
		// } catch (error) {
		// 	console.log({ error })
		// 	if (/Modal closed by user/i.test((<ProviderRpcError>error).message)) throw new UserRejectedRequestError()

		// 	throw error
		// }
	}

	getModal(create?: boolean): Web3Modal {
		if (!this.modal || create) this.modal = new Web3Modal({ ...this.options, cacheProvider: true })

		return this.modal
	}

	getProvider(create?: boolean): Web3Provider {
		if (!this.provider || create) throw 'not initialised yet'

		return this.provider
	}

	async disconnect() {
		this.provider = null

		const modal = this.getModal()
		await modal.clearCachedProvider()

		modal.off('accountsChanged', this.onAccountsChanged)
		modal.off('chainChanged', this.onChainChanged)
		modal.off('disconnect', this.onDisconnect)

		typeof localStorage !== 'undefined' && localStorage.removeItem('walletconnect')
	}

	async isAuthorized() {
		return !!this.getModal().cachedProvider
	}

	async getAccount() {
		return this.getProvider().getSigner().getAddress()
	}

	async getChainId() {
		return this.getProvider().getSigner().getChainId()
	}

	async getSigner() {
		return Promise.resolve(this.getProvider().getSigner())
	}

	protected onAccountsChanged = (accounts: string[]) => {
		if (accounts.length === 0) this.emit('disconnect')
		else this.emit('change', { account: getAddress(accounts[0]) })
	}

	protected onChainChanged = (chainId: number | string) => {
		const id = normalizeChainId(chainId)
		const unsupported = this.isChainUnsupported(id)

		this.emit('change', { chain: { id, unsupported } })
	}

	protected onDisconnect = () => {
		this.emit('disconnect')
	}
}
