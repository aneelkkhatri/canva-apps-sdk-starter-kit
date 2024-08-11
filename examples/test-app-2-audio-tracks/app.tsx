import { upload } from "@canva/asset"
import { addAudioTrack } from "@canva/design";

export function App() {
	async function uploadAudio() {
		const result = await upload({
		  type: "AUDIO",
		  title: "Example audio",
		  url: "https://www.canva.dev/example-assets/audio-import/audio.mp3",
		  mimeType: "audio/mp3",
		  durationMs: 86047,
		});
		console.log(result.ref);
		await addAudioTrack({
			ref: result.ref
		})
	}
	return (
		<div>
			<button type="submit" onClick={uploadAudio}>Upload Audio</button>
		</div>
	)
}
