import React, { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../components/SettingsContext";
import AsyncSelect from "react-select/async";
import Navbar from "../components/Navbar";

function Models() {
  const { settings } = useContext(SettingsContext);

  const [state, setState] = useState({
    inputValue: "",
    selectedOption: null, // Initially null until options are loaded
    data: "Select value from dropdown",
    options: [],
  });

  // Update selectedOption when settings.ModelText changes
  useEffect(() => {
    if (settings.ModelText) {
      setState((prevState) => ({
        ...prevState,
        selectedOption: { value: settings.ModelText, label: settings.ModelText },
      }));
    }
  }, [settings.ModelText]);

  // Fetch models once when the component mounts
  useEffect(() => {
    const api = `${settings.PROD_API}/prompt/${settings.Project}/modelnames`;

    if (state.options.length === 0) {
      fetch(api)
        .then((res) => res.json())
        .then((data) => {
          const options = data.map((model) => ({
            value: model,
            label: model,
          }));
          setState((prevState) => ({
            ...prevState,
            options,
          }));
        })
        .catch((error) => console.error("Error fetching models:", error));
    }
  }, [settings.PROD_API, settings.Project, state.options.length]);

  const handleChange = (selectedOption) => {
    setState((prevState) => ({
      ...prevState,
      selectedOption,
    }));
  };

  const invoke_model = (e) => {
    e.preventDefault();

    if (!state.selectedOption) {
      setState((prevState) => ({
        ...prevState,
        data: "Please select a model first!",
      }));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      data: "Setting model...",
    }));

    const api = `${settings.PROD_API}/prompt/${settings.Project}/model?model=${state.selectedOption.value}`;

    fetch(api)
      .then((response) => response.text())
      .then((data) => {
        setState((prevState) => ({
          ...prevState,
          data,
        }));
      })
      .catch((error) => {
        console.error("Error setting model:", error);
        setState((prevState) => ({
          ...prevState,
          data: "Failed to set model",
        }));
      });
  };

  return (
    <div>
      <Navbar />
      <div className="container pt-5">
        <AsyncSelect
          className="select-search"
          value={state.selectedOption}
          onChange={handleChange}
          isClearable={true}
          defaultOptions={state.options}
          formatOptionLabel={(model) => (
            <div className="model-option">
              <span>{model.label}</span>
            </div>
          )}
        />
      </div>
      <div className="container pt-5">
        <form onSubmit={invoke_model}>
          <div className="form-group">
            <button className="btn btn-primary" type="submit">
              Set model
            </button>
          </div>
          <div className="container pt-5">
            <div>{state.data}</div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Models;
