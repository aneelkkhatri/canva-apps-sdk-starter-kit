import { useSelection } from "utils/use_selection_hook";
import { getTemporaryUrl, upload } from "@canva/asset";
import type { AppProcessInfo, CloseParams } from "@canva/platform";
import { appProcess } from "@canva/platform";

import React from "react"
import PixelsJS from "./lib"

// export type CloseOpts = CloseParams;

// type OverlayProps = {
//   context1: AppProcessInfo<LaunchParams>;
// };

let orig = null;
export const SelectedImageOverlay = () => { //(props: OverlayProps) => {
  // const { context1: appContext } = props;

  const selection = useSelection("image");
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    return void appProcess.registerOnMessage((sender, message) => {
      console.log(message);
      if (message.action == "filter") {
        const { canvas, context } = getCanvas(canvasRef.current);
        const { width, height } = canvas;
        // context.filter = "invert(100%)";
        // context.drawImage(canvas, 0, 0, width, height);
        try {
          let filters = PixelsJS.getFilterList();
          let imageData = orig.context.getImageData(0, 0, orig.canvas.width, orig.canvas.height);
          let newImgData = PixelsJS.filterImgData(imageData, message.key);
          // let newImgData = PixelsJS.filterImgData(imageData, "solange");
          context.putImageData(newImgData, 0, 0);
        } catch (e) {
          console.log(e);
        }
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
        console.log("saved", new Date());
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
      context.drawImage(img, 0, 0);

      orig = newCanvasFromImage(img);
      appProcess.broadcastMessage({ isImageReady: true, imageUrl: clipAndDownscaleCanvasToImageURL(canvas, context) });
    };

    initializeCanvas();
  }, [selection]);


	return <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />;
}

function newCanvasFromImage(img) {
  const { width, height } = img;
  var canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  context.drawImage(img, 0, 0);
  return {canvas, context};
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

function clipAndDownscaleCanvasToImageURL(originalCanvas, originalContext) {
    // Determine the dimensions of the square to clip
    const minDimension = Math.min(originalCanvas.width, originalCanvas.height);
    const offsetX = (originalCanvas.width - minDimension) / 2;
    const offsetY = (originalCanvas.height - minDimension) / 2;

    // Create a new canvas element for the square clipping
    const squareCanvas = document.createElement('canvas');
    squareCanvas.width = minDimension;
    squareCanvas.height = minDimension;

    // Get the context of the square canvas
    const squareContext = squareCanvas.getContext('2d');


    // Draw the clipped square content from the original canvas onto the square canvas
    squareContext.drawImage(
        originalCanvas,
        offsetX, offsetY, minDimension, minDimension,  // Source rectangle
        0, 0, minDimension, minDimension                // Destination rectangle
    );

    // Create a new canvas element for downscaling to 100x100
    const newCanvas = document.createElement('canvas');
    newCanvas.width = 200;
    newCanvas.height = 200;

    // Get the context of the new canvas
    const newContext = newCanvas.getContext('2d');
    newContext.imageSmoothingEnabled = true;
    newContext.imageSmoothingQuality = 'high';

    // Draw the downscaled content from the square canvas to the new canvas
    newContext.drawImage(squareCanvas, 0, 0, minDimension, minDimension, 0, 0, 200, 200);

    // Convert the new canvas to a data URL (image URL)
    const imageURL = newCanvas.toDataURL();

    // Return the image URL
    return imageURL;
}
