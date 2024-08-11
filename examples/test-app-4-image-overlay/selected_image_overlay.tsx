import { useSelection } from "utils/use_selection_hook";
import { getTemporaryUrl, upload } from "@canva/asset";
import { appProcess } from "@canva/platform";

import React from "react"

export const SelectedImageOverlay = (props: { launchParams: LaunchParams }) => {
  console.log(props)
  const selection = useSelection("image");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    appProcess.registerOnMessage((sender, message) => {
      console.log(message);
      if (message == "invert") {
        const { canvas, context } = getCanvas(canvasRef.current);
        const { width, height } = canvas;
        context.drawImage(canvas, 0, 0, width, height);
        context.filter = "invert(100%)";
      }
    });
  }, []);

  React.useEffect(() => {
    return void appProcess.current.setOnDispose(async (context) => {
      if (context.reason == "completed") {
        const { canvas } = getCanvas(canvasRef.current);
        const dataUrl = canvas.toDataURL();
        
        const asset = await upload({
          type: "IMAGE",
          mimeType: "image/png",
          url: dataUrl,
          thumbnailUrl: dataUrl,
        });

        const draft = await selection.read();
        draft.contents[0].ref = asset.ref;
        draft.save();
      } else if (context.reason = "aborted") {

      }
      
      appProcess.broadcastMessage({ isImageReady: false });
    });
  }, [selection]);

  React.useEffect(() => {
    const initializeCanvas = async () => {
      const draft = await selection.read();
      const [image] = draft.contents;

      if (!image) {
        return;
      }

      const { url } = await getTemporaryUrl({ type: "IMAGE", ref: image.ref });

      const img = await downloadImage(url);
      const { width, height } = img;

      const { canvas, context } = getCanvas(canvasRef.current);
      canvas.width = width;
      canvas.height = height;
      context.drawImage(img, 0, 0, width, height);

      appProcess.broadcastMessage({ isImageReady: true });
    };

    initializeCanvas();
  }, [selection]);


	return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

function getCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) {
    throw new Error("HTMLCanvasElement does not exist");
  }

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("CanvasRenderingContext2D does not exist");
  }

  return { canvas, context };
}

async function downloadImage(url: string) {
  const response = await fetch(url, { mode: "cors" });
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Image could not be loaded"));
    img.src = objectUrl;
  });

  URL.revokeObjectURL(objectUrl);

  return img;
}
