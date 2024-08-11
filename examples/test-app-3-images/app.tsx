import { upload } from "@canva/asset"
import { addNativeElement } from "@canva/design";
import { Rows, FormField, Button, Slider } from "@canva/app-ui-kit";
import styles from "styles/components.css";

export function App() {
	async function uploadImage() {
		const result = await upload({
		  type: "IMAGE",
		  title: "Example image",
		  url: "https://www.canva.dev/example-assets/image-import/image.jpg",
		  thumbnailUrl: "https://www.canva.dev/example-assets/image-import/thumbnail.jpg",
		  mimeType: "image/jpeg",
		});
		console.log(result.ref);
		await addNativeElement({
			type: "IMAGE",
			ref: result.ref
		})
	}
	return (
		<div className={styles.scrollContainer}>
			<Rows>
				<Button type="submit" onClick={uploadImage}>Upload Image</Button>
			</Rows>
		</div>
	)
}
