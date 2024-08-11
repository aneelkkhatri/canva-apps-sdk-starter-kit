import { Rows, FormField, Button, Slider, Scrollable, HorizontalContent, Box, Title, Carousel, Alert, LoadingIndicator, ProgressBar, ImageCard, Badge } from "@canva/app-ui-kit";
import styles from "styles/components.css";
import type { AppProcessInfo, CloseParams } from "@canva/platform";
import { useOverlay } from "utils/use_overlay_hook";
import { appProcess } from "@canva/platform";
import React from "react"
import PixelsJS from "./lib"


export type CloseOpts = CloseParams;

type OverlayProps = {
  context1: AppProcessInfo<LaunchParams>;
};

export const ObjectPanel = (props: OverlayProps) => {
  const { context1: appContext } = props;

  const overlay = useOverlay("image_selection");

  if (overlay.isOpen) {
    return <OverlayOpen overlay={overlay}/>
  }

  return <OverlayClosed overlay={overlay}/>
}

function OverlayOpen({overlay}) {
  const [isImageReady, setIsImageReady] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [filtersMap, setFiltersMap] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingPercentage, setLoadingPercentage] = React.useState(0);
  const [selectedFilter, setSelectedFilter] = React.useState("");

  async function filterImgData(imageData, filterKey) {
    return new Promise((resolve, reject) => {
      // setTimeout(() => resolve(PixelsJS.filterImgData(imageData, filterKey)),30 );
      resolve(PixelsJS.filterImgData(imageData, filterKey))
    });
  }
  async function gene(imageUrl) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const context = canvas.getContext('2d');

    return new Promise(async (resolve, reject) => {
      const orig = await dataURLToCanvas(imageUrl);
      const filterList = PixelsJS.getFilterList();
      const data = [];
      for (let i = 0; i < filterList.length; ++i) {
        let filterKey = filterList[i];
        let imageData = orig.context.getImageData(0, 0, orig.canvas.width, orig.canvas.height);
        let newImgData = await filterImgData(imageData, filterKey);
        context.putImageData(newImgData, 0, 0);
        setLoadingPercentage(100*(i/filterList.length));
        data.push({url: canvas.toDataURL(), key: filterKey});
      }
      
      return resolve(data);
    })
    
    
  }

  async function generateImageUrls(imageUrl) {
    if (imageUrl == null) {
      setFiltersMap(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadingPercentage(0);

    let data = await gene(imageUrl);
    let map = {};
    for (let entry of data) {
      map[entry.key] = entry;
    }

    setLoading(false);
    setLoadingPercentage(100);
    setFiltersMap(map);
  }

  React.useEffect(() => {
    appProcess.registerOnMessage((sender, message) => {
      console.log(message);
      const isImageReady = Boolean(message.isImageReady);
      setIsImageReady(isImageReady);
      generateImageUrls(message.imageUrl);
    });
  }, []);

  function handleSave() {
    setSaving(true);
    overlay.close({ reason: "completed" });
  }

  function handleClose() {
    overlay.close({ reason: "aborted" });
  }

  function handleFilterClick(key) {
    appProcess.broadcastMessage({
      action: "filter",
      key: key
    });
  }

  function FilterCard({filter, selected}) {
    return (<ImageCard
        alt="grass image"
        ariaLabel="Add image to design"
        borderRadius="standard"
        onClick={() => handleFilterClick(filter.key)}
        onDragStart={() => {}}
        selectable
        // selected={selected}
        // bottomEnd={<Badge text={filter.key} tone="contrast"/>}
        // bottomEndVisibility="always"
        // bottomEnd={selected}
        thumbnailUrl={filter.url}
        thumbnailHeight={100}
        data-key={filter.key}
        key={filter.key}
      />);
  }
  const groups = [{
    "key": "brightness",
    "title": "Brightness",
    "filters": [
      "darkify",
      "incbrightness",
      "incbrightness2",
      "invert",
      "sat_adj",
      // "a",
      "pixel_blue"
    ]
  }, {
    "key": "color_tints",
    "title": "Color Tints",
    "filters": [
      "ocean",
      "vintage",
      "perfume",
      "serenity",
      "warmth",
      "neue",
      "sunset",
      "wood",
      "lix",
      "ryo",
      "bluescale",
      "solange",
      "evening",
      "crimson",
      "phase",
      "coral",
      "lemon",
      "frontward",
      "pink_aura",
      "haze",
      "cool_twilight",
      "blues",
      // "horizon",
      "mellow",
      "solange_dark",
      "solange_grey",
      "zapt",
      "eon",
      "aeon",
      "purplescale",
      "radio",
      "twenties",
      "greyscale",
      "grime",
      "redgreyscale",
      "greengreyscale",
      "rosetint",
      "red_effect"]
  }, {
    "key": "gamma",
    "title": "Gamma",
    "filters": [
      "gamma",
      "teal_gamma",
      "purple_gamma",
      "yellow_gamma",
      "bluered_gamma",
      "green_gamma",
      "red_gamma"
    ]
  }, {
    "key": "line_gen",
    "title": "Line Generators",
    "filters": [
      "horizontal_lines",
      "diagonal_lines",
      "green_diagonal_lines"
    ]
  }, {
    "key": "noise_gen",
    "title": "Noise Generators",
    "filters": [
      "teal_min_noise",
      "dark_purple_min_noise",
      "pink_min_noise",
      "matrix",
      "cosmic",
      "min_noise",
      "red_min_noise",
      "matrix2",
      "green_med_noise",
      "green_min_noise",
      "blue_min_noise",
      "purple_min_noise"
    ]
  }, {
    "key": "offset_filters",
    "title": "Offset Filters",
    "filters":[
      "extreme_offset_blue",
      "extreme_offset_green",
      "offset_green",
      "extra_offset_blue",
      "extra_offset_red",
      "extra_offset_green",
      "extreme_offset_red",
      "offset",
      "offset_blue",
      "rgbSplit"
    ]
  }, {
    "key": "specks_gen",
    "title": "Specks Generators",
    "filters": [
      "specks_redscale",
      "eclectic",
      "green_specks",
      "casino",
      "specks",
      "yellow_casino",
      "retroviolet",
      "black_specks",
      "white_specks",
      "salt_and_pepper"
    ]
  }, {
    "key": "misc",
    "title": "Miscellaneous",
    "filters": [
      "threshold",
      "threshold75",
      "threshold125",
      "pixelate",
      "pixelate16"
    ]
  }]

  function FilterGroup({group}) {
    return (<Rows spacing="1u">
        <Title size="small">{group.title}</Title>
        
          <Carousel 
            indicator={{background: "canvas"}}
            direction="horizontal"
            style="width: 9000px">
            {group.filters.map(filter => <FilterCard filter={filtersMap[filter]} key={filter}/>)}
          </Carousel>
      </Rows>)
  }
  function Images() {
    if (filtersMap == null) {
      return;
    }

    return (<Rows spacing="2u">
      {groups.map((group, i) => (<FilterGroup group={group} key={group.key}/>))}
    </Rows>);
    return filters.map(filter => <button
      key={filter.key}
      data-key={filter.key}
      onClick={handleFilterClick}
      ><img
      src={filter.url}
      width="100"
      height="100"
      data-key={filter.key}
      onClick={handleFilterClick}
      />
      </button>);
  }

  console.log(loadingPercentage);
  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="1u">
        <Button variant="primary" onClick={handleSave}>
          {(saving || loading) && <LoadingIndicator size="medium"/>}{!saving && !loading && "Save and close"}
        </Button>
        <Button variant="secondary" onClick={handleClose}>
          Close without saving
        </Button>
        {<ProgressBar
          size="medium"
          tone="info"
          value={loadingPercentage}
        />}
        {isImageReady && filtersMap != null && <Images/>}
      </Rows>
    </div>
  );
}

function OverlayClosed({overlay}) {
  const [opening, setOpening] = React.useState(false);
  React.useEffect(() => {
    appProcess.registerOnMessage((sender, message) => {
      const isImageReady = Boolean(message.isImageReady);
      if (isImageReady) {
        setOpening(false);
      }
    });
  }, []);
  function handleOpen() {
    if (opening) {
      return;
    }
    setOpening(true)
    overlay.open();
  }
  
  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        {!overlay.canOpen && !opening && <Alert tone="info">Select an image to apply an effect.</Alert>}
        {(overlay.canOpen || opening)&& <Button
          variant="primary" 
          // disabled={!overlay.canOpen}
          onClick={handleOpen}>
          {!opening && "Edit image"}{opening && <LoadingIndicator size="medium" />}
        </Button>}
        
      </Rows>
    </div>
  );
}

async function dataURLToCanvas(dataURL) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Important for cross-origin data URLs

    // Load the image from the data URL
    img.onload = function() {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        // Get the context of the canvas
        const context = canvas.getContext('2d');

        // Draw the image onto the canvas
        context.drawImage(img, 0, 0);

        // Call the callback function with the canvas and context
        resolve({canvas, context});
    };

    // Set the source of the image to the data URL to start loading
    img.src = dataURL;
  });
    
}