import { SettingsContext } from "./SettingsContext";
import React, { useState, useRef, useContext, useEffect } from "react";

const Tokens = () => {
  const { settings, updateSettings } = useContext(SettingsContext);
  const timeoutRef = useRef(null);

  // State variables
  const [value, setValue] = useState(settings.Tokens.value || 512);
  const [data, setData] = useState(`Max. tokens set to ${settings.Tokens.value}`);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize `value` and `data` with `settings.Tokens`
  useEffect(() => {
    setValue(settings.Tokens.value || 512);
    setData(`Max. tokens set to ${settings.Tokens.value || 512}`);
  }, [settings.Tokens.value]);

  const handleChange = (event) => {
    const newValue = parseFloat(event.target.value);
    setValue(newValue); // Update the slider value immediately

    // Clear previous timeout and set a new one for debouncing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
    }, 200);
  };

  const invoke_temp = async (e) => {
    e.preventDefault();

    setIsLoading(true); // Disable button during API call
    setData(`Setting max. tokens to ${value.toFixed(1)}...`);

    try {
      const response = await fetch(`${settings.PROD_API.value}/prompt/${settings.Project.value}/tokens?tokens=${value}`);
      const result = await response.text();
      setData(result); // Update the data with the server's response
      updateSettings({ key: "Tokens", value: value }); // Update the context
    } catch (error) {
      console.error("Error setting tokens:", error);
      setData("Failed to set max. tokens. Please try again.");
    } finally {
      setIsLoading(false); // Re-enable the button after API call completes
    }
  };

  const isDisabled = isLoading || value === (settings.Tokens.value || 512);

  return (
    <>
      <tr>
        <td>
          Max. Tokens
        </td>
        <td>
          {value}
        </td>
        <td>
          <input
            onChange={handleChange}
            value={value}
            step="10"
            type="range"
            min="512"
            max="32768"
          />
        </td>
      </tr>
      <tr className="settings_row">
        <td></td>
        <td>{data}</td>
        <td>
          <form onSubmit={invoke_temp}>
            <button className="btn btn-primary btn-sm" type="submit" disabled={isDisabled}>
              {isLoading ? "Setting..." : "Set"}
            </button>
          </form>
        </td>
      </tr>
    </>
  );
};

export default Tokens;
