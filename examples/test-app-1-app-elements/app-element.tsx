import { initAppElement } from "@canva/design";

const appElementClient = initAppElement<AppElementData>({
  render: (data) => {
    const dataUrl = createGradient(data.color1, data.color2);
    return [
      {
        type: "IMAGE",
        dataUrl,
        width: 640,
        height: 360,
        top: 0,
        left: 0,
      },
    ];
  },
});

function createGradient(color1: string, color2: string): string {
  const canvas = document.createElement("canvas");

  canvas.width = 640;
  canvas.height = 360;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Can't get CanvasRenderingContext2D");
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas.toDataURL();
}


export default appElementClient
