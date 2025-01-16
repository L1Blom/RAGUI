import React, { useState, useContext, useEffect } from "react";
import { SettingsContext } from "./SettingsContext";
import AsyncSelect from "react-select/async";

function Embeddings() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const [isLoading, setIsLoading] = useState(false);

  const [state, setState] = useState({
    inputValue: "",
    selectedOption: null, // Initially null until options are loaded
    data: "Select value from dropdown",
    options: [],
  });

  const isDisabled = isLoading ||
    state.selectedOption === null ? false : state.selectedOption.value === settings.Embedding.value;

  useEffect(() => {
    if (settings.Embedding.value) {
      setState((prevState) => ({
        ...prevState,
        selectedOption: { value: settings.Embedding.value, label: settings.Embedding.value },
      }));
    }
  }, [settings.Embedding.value]);

  // Fetch models once when the component mounts
  useEffect(() => {
    const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/embeddingnames`;

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
        .catch((error) => console.error("Error fetching embeddings:", error));
    }
  }, [settings.PROD_API.value, settings.Project.value, state.options.length]);

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
        data: "Please select an embedding first!",
      }));
      return;
    }

    setIsLoading(true); // Disable button during API call

    setState((prevState) => ({
      ...prevState,
      data: "Setting embedding...",
    }));

    const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/embeddings?embedding=${state.selectedOption.value}`;

    try {
      fetch(api)
        .then((response) => response.text())
        .then((data) => {
          setState((prevState) => ({
            ...prevState,
            data,
          }));
          updateSettings({ key: "Embedding", value: state.selectedOption.value });
        })
        .catch((error) => {
          console.error("Error setting embedding:", error);
          setState((prevState) => ({
            ...prevState,
            data: "Failed to set embedding",
          }));
        });
    } catch (error) {
      console.error("Error setting embedding:", error);
      setState("Failed to set embedding. Please try again.");
    } finally {
      setIsLoading(false); // Re-enable the button after API call completes
    }
  };

  return (
    <>
      <tr>
        <td>
          Embedding
        </td>
        <td>
          {settings.Embedding.value}
        </td>
        <td>
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
        </td>
      </tr>
      <tr className="settings_row">
        <td>
        </td>
        <td>
          {state.data}
        </td>
        <td>
          <form onSubmit={invoke_model}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={isDisabled}>
              Set model
            </button>
          </form>
        </td>
      </tr>
    </>
  );
}

export default Embeddings;
