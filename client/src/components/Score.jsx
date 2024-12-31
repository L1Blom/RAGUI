import React, { useRef, useContext, useState, useEffect } from "react";
import { SettingsContext } from "../components/SettingsContext";

function Score() {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [value, setValue] = useState(settings.Score);
    const timeoutRef = useRef(null);

    const handleChange = (event) => {
        const newValue = parseFloat(event.target.value);
        setValue(newValue); // Update the slider value immediately
        // Clear previous timeout and set a new one for debouncing
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            console.log("Debounced value:", newValue); // Optional: debug logging 
        }, 200);
    };

    useEffect(() => {
        updateSettings({ key: "Score", value: value });
    }, [value]);

    return (<tr className="settings_row">
        <td>
            Min. score
        </td>
        <td>
            {value.toFixed(1)}
        </td>
        <td>
            <input
                onChange={handleChange}
                value={value}
                step="0.1"
                type="range"
                min="0.0"
                max="1.0"
            />
            {value.toFixed(1)} {/* Display the slider value */}
        </td>
    </tr>
    );
}
export default Score;
