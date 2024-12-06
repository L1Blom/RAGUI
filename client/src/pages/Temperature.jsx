import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import myConfig from "../components/config";

function Temperature() {
  const timeoutRef = useRef(null); // Use useRef for persistent variables across renders
  const [valuetext, setValueText] = useState(1.0);
  const [value, setValue] = useState(1.0);
  const [data, setData] = useState(`Temparature setting is: ${value.toFixed(1)}`);

  const handleChange = (event) => {
    const newValue = parseFloat(event.target.value); // Ensure the value is parsed as a float
    setValue(newValue); // Update slider value immediately

    // Clear previous timeout and set a new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      console.log("Slider change detected, new value:", newValue);
      setValueText(newValue); // Update `valuetext` after debounce
    }, 100);
  };

  const invoke_temp = async (e) => {
    e.preventDefault();
    setData(`Setting temperature to ${valuetext.toFixed(1)}...`);

    try {
      const response = await fetch(`${myConfig.API}/prompt/${myConfig.Project}/temp?temp=${valuetext.toFixed(1)}`);
      const result = await response.text();
      setData(result); // Update the data with the server's response
    } catch (error) {
      console.error("Error fetching data:", error);
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
          />{ value.toFixed(1)}
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
}

export default Temperature;