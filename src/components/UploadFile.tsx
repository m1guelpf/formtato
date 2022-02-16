import { MediaPicker } from 'degen'
import { NFTStorage } from 'nft.storage'
import { FC, useEffect, useMemo, useState } from 'react'

const UploadFile: FC<{ onChange: (string) => void; onFileLoad: (File) => void }> = ({ onChange, onFileLoad }) => {
	const [file, setFile] = useState<File>(null)
	const [fileURI, setFileURI] = useState<string>(null)
	const [isUploading, setUploading] = useState<boolean>(false)

	const client = useMemo(() => new NFTStorage({ token: process.env.NEXT_PUBLIC_IPFS_KEY }), [])

	const onFileUpload = file => {
		setUploading(true)

		setFile(file)
	}

	useEffect(() => {
		onFileLoad(file)

		if (file) client.storeBlob(file).then(fileCID => setFileURI(`ipfs://${fileCID}`))
		else setFileURI(null)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [file])

	useEffect(() => {
		setUploading(false)
		onChange(fileURI)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fileURI])

	return (
		<MediaPicker
			accept="image/jpeg, image/png, image/webp, image/gif"
			label="Upload inspiration"
			required
			uploading={isUploading}
			uploaded={!!fileURI}
			onChange={onFileUpload}
		/>
	)
}

export default UploadFile
