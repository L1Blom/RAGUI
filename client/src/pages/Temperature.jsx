import { SettingsContext } from "../components/SettingsContext";
import React, { useState, useRef, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";

const Temperature = () => {
  const { settings } = useContext(SettingsContext);
  const timeoutRef = useRef(null);

  // Initialize state from settings.Temperature
  const [value, setValue] = useState(settings.Temperature || 0.0);
  const [data, setData] = useState(`Temperature set to ${settings.Temperature.toFixed(1) || 0.0}`);

  // Synchronize state when settings.Temperature changes
  useEffect(() => {
    setValue(settings.Temperature || 0.0);
    setData(`Temperature set to ${settings.Temperature || 0.0}`);
  }, [settings.Temperature]);

  const handleChange = (event) => {
    const newValue = parseFloat(event.target.value);
    setValue(newValue); // Update slider value immediately

    // Clear previous timeout and set a new one for debouncing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      console.log("Debounced value:", newValue); // Optional: debug logging
    }, 200);
  };

  const invoke_temp = async (e) => {
    e.preventDefault();

    setData(`Setting temperature to ${value.toFixed(1)}...`);

    try {
      const response = await fetch(`${settings.PROD_API}/prompt/${settings.Project}/temp?temp=${value.toFixed(1)}`);
      const result = await response.text();
      setData(result); // Update the data with the server's response
    } catch (error) {
      console.error("Error setting temperature:", error);
      setData("Failed to set temperature. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container pt-5">
        <form onSubmit={invoke_temp}>
          <input
            onChange={handleChange}
            value={value}
            step="0.1"
            type="range"
            min="0.0"
            max="2.0"
          />
          {value.toFixed(1)} {/* Display the slider value */}
          <div className="form-group mt-3">
            <button className="btn btn-primary" type="submit">
              Set
            </button>
          </div>
          <div className="container pt-5">
            <div>{data}</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Temperature;
