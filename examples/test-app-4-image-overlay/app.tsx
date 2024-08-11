import { Rows, FormField, Button, Slider } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import { appProcess } from "@canva/platform";
import { ObjectPanel } from "./object_panel"
import { SelectedImageOverlay } from "./selected_image_overlay"


export function App() {
  const context = appProcess.current.getInfo();

  if (context.surface == "object_panel") {
    return <ObjectPanel/>;
  }

  if (context.surface === "selected_image_overlay") {
    return <SelectedImageOverlay/>;
  }

  throw new Error(`Invalid surface: ${context.surface}`);
}