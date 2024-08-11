import React from "react"
import { initAppElement } from "@canva/design";

import appElementClient from "./app-element"

export function App() {
  const [state, setState] = React.useState({
    color1: "",
    color2: "",
    isSelected: false,
  });

  React.useEffect(() => {
    appElementClient.registerOnElementChange((element) => {
      console.log(element);
      if (element != null) {
        setState((prevState) => {
          return {
            ...element.data,
            isSelected: element != null,
          };
        });
      } else {
        setState((prevState) => {
          return {
            color1: "",
            color2: "",
            isSelected: false,
          }
        })
      }
      
    });
  }, []);

  function handleClick() {
    appElementClient.addOrUpdateElement({
      color1: state.color1,
      color2: state.color2,
    });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setState((prevState) => {
      return {
        ...prevState,
        [event.target.name]: event.target.value,
      };
    });
  }

  return (
    <div>
      <div>
        <input
          type="text"
          name="color1"
          value={state.color1}
          placeholder="Color #1"
          onChange={handleChange}
        />
      </div>
      <div>
        <input
          type="text"
          name="color2"
          value={state.color2}
          placeholder="Color #2"
          onChange={handleChange}
        />
      </div>
      <button type="submit" onClick={handleClick}>
        {state.isSelected ? "Update element" : "Add element"}
      </button>
    </div>
  );
}
