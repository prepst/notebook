import { uniqueId } from 'tldraw'

const multiplayerWorkerUrl = process.env.REACT_APP_MULTIPLAYER_URL || 'http://localhost:8787'

export const multiplayerAssetStore = {
	async upload(_asset, file) {
		const id = uniqueId()
		const objectName = `${id}-${file.name}`.replace(/[^a-zA-Z0-9.]/g, '-')
		const url = `${multiplayerWorkerUrl}/api/uploads/${objectName}`

		const response = await fetch(url, {
			method: 'POST',
			body: file,
		})

		if (!response.ok) {
			throw new Error(`Failed to upload asset: ${response.statusText}`)
		}

		return { src: url }
	},

	resolve(asset) {
		return asset.props.src
	},
}

