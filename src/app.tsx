import { ObjectPanel } from "./object_panel"
import { SelectedImageOverlay } from "./selected_image_overlay"


import { Button, Rows } from "@canva/app-ui-kit";
import { getTemporaryUrl, upload } from "@canva/asset";
import { appProcess } from "@canva/platform";
import * as React from "react";
import styles from "styles/components.css";
import { useOverlay } from "utils/use_overlay_hook";
import { useSelection } from "utils/use_selection_hook";
import PixelsJS from "./lib"

let orig = null;

export function App() {
  const context = appProcess.current.getInfo();

  if (context.surface === "object_panel") {
    return <ObjectPanel />;
  }

  if (context.surface === "selected_image_overlay") {
    return <SelectedImageOverlay />;
  }

  throw new Error(`Invalid surface: ${context.surface}`);
}
