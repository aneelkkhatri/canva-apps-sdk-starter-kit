import { Rows, FormField, Button, Slider } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import { useOverlay } from "utils/use_overlay_hook";
import { appProcess } from "@canva/platform";
import React from "react"

export const ObjectPanel = () => {
  const overlay = useOverlay("image_selection");

  if (overlay.isOpen) {
    return <OverlayOpen overlay={overlay}/>
  }

  return <OverlayClosed overlay={overlay}/>
}


function OverlayOpen({overlay}) {
  const [isImageReady, setIsImageReady] = React.useState(false);

  React.useEffect(() => {
    appProcess.registerOnMessage((sender, message) => {
      const isImageReady = Boolean(message.isImageReady);
      setIsImageReady(isImageReady);
    });
  }, []);

  function handleInvert() {
    appProcess.broadcastMessage("invert");
  }

  function handleSave() {
    overlay.close({ reason: "completed" });
  }

  function handleClose() {
    overlay.close({ reason: "aborted" });
  }

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="1u">
        <Button variant="primary" onClick={handleInvert} disabled={!isImageReady}>
          Invert
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save and close
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close without saving
        </Button>
      </Rows>
    </div>
  );
}

function OverlayClosed({overlay}) {
  function handleOpen() {
    overlay.open();
  }

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Button
          variant="primary" 
          disabled={!overlay.canOpen}
          onClick={handleOpen}>
          Edit image
        </Button>
      </Rows>
    </div>
  );
}