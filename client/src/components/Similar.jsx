import React, { useRef, useContext, useState, useEffect } from "react";
import { SettingsContext } from "./SettingsContext";

function Similar() {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [value, setValue] = useState(settings.Similar);
    const timeoutRef = useRef(null);

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

    useEffect(() => {
        updateSettings({ key: "Similar", value: value });
    }, [value]);

    return (<tr className="settings_row">
        <td>
            Max. results
        </td>
        <td>
            {value}
        </td>
        <td>
            <input
                onChange={handleChange}
                value={value}
                step="1"
                type="range"
                min="0"
                max="10"
            />
            {value} {/* Display the slider value */}
        </td>
    </tr>
    );
}
export default Similar;
