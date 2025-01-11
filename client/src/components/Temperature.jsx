import { SettingsContext } from "./SettingsContext";
import React, { useState, useRef, useContext, useEffect } from "react";

const Temperature = () => {
  const { settings , updateSettings } = useContext(SettingsContext);
  const timeoutRef = useRef(null);

  // State variables
  const [value, setValue] = useState(settings.Temperature.value || 0.0);
  const [data, setData] = useState(`Temperature set to ${settings.Temperature.value || 0.0}`);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize `value` and `data` with `settings.Temperature`
  useEffect(() => {
    setValue(settings.Temperature.value || 0.0);
    setData(`Temperature set to ${settings.Temperature.value.value || 0.0}`);
  }, [settings.Temperature.value]);

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
    setData(`Setting temperature to ${value.toFixed(1)}...`);

    try {
      const response = await fetch(`${settings.PROD_API.value}/prompt/${settings.Project.value}/temp?temp=${value.toFixed(1)}`);
      const result = await response.text();
      setData(result); // Update the data with the server's response
      updateSettings({ key: "Temperature", value: value }); // Update the context
    } catch (error) {
      console.error("Error setting temperature:", error);
      setData("Failed to set temperature. Please try again.");
    } finally {
      setIsLoading(false); // Re-enable the button after API call completes
    }
  };

  const isDisabled = isLoading || parseFloat(value.toFixed(1)) === parseFloat((settings.Temperature.value || 0.0).toFixed(1));

  return (
    <tr className="settings_row">
    <td>
      Temperature
    </td>
    <td>
      {value.toFixed(1)}
    </td>

    <td>
        <form onSubmit={invoke_temp}>
          <input
            onChange={handleChange}
            value={value}
            step="0.1"
            type="range"
            min="0.0"
            max="2.0"
          />
          <div>{data}</div>
          <button className="btn btn-primary btn-sm" type="submit" disabled={isDisabled}>
              {isLoading ? "Setting..." : "Set"}
            </button>
        </form>
      </td>
      </tr>
  );
};

export default Temperature;
