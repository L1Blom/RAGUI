import React, { useRef, useContext, useState, useEffect } from "react";
import { SettingsContext } from "./SettingsContext";


function Prompt() {
    const { settings, updateSettings } = useContext(SettingsContext);
    const [value, setValue] = useState(settings.Prompt.value);
    const timeoutRef = useRef(null);
    const [data, setData] = useState("");                                   // Initialize the data state
    const [isLoading, setIsLoading] = useState(false);                      // Initialize the isLoading state
  
    const inputStyle = {
        width: '100%',
    };

    const handleChange = (event) => {
        const newValue = event.target.value;
        setValue(newValue); // Update the slider value immediately
        // Clear previous timeout and set a new one for debouncing
        if (timeoutRef.current) {                                           // Clear previous timeout and set a new one for debouncing
            clearTimeout(timeoutRef.current);                               // Clear the previous timeout
        }
        timeoutRef.current = setTimeout(() => {                             // Set a new timeout                   
        }, 200);
    };
    const invoke_prompt = async (e) => {                                     // Handle the chunk size form submission
        e.preventDefault();                                                 // Prevent the form from submitting

        setIsLoading(true);                                                 // Disable button during API call
        setData("Setting system prompt...");                                // Display a message while the API call is in progress

        const encodedValue = encodeURIComponent(value);                     // Encode the value to make it URL safe
        const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/systemprompt?systemprompt=${encodedValue}`; // Construct the API URL
        fetch(api)                                                          // Fetch the API
            .then((response) => {                                           // Handle the API response
                if (!response.ok) {                                         // If the response is not OK (HTTP 200)
                    throw new Error("Failed to system prompt. Please try again."); // Throw an error
                }
                return response.text();                                     // Return the response as text
            })
            .then((result) => {                                             // Handle the result
                setData(result);                                            // Update the data with the server's response
                updateSettings({ key: "Prompt", value: value });            // Update the context with the new chunk size
            })
            .catch((error) => {                                             // Handle any errors
                setData(">Failed to set system prompt. Please try again.");  // Display an error message
                setValue(settings.Prompt.value);                            // Reset the chunk size to the previous value
            })
            .finally(() => {                                                // Finally block
                setIsLoading(false);                                        // Re-enable the button after API call completes
            });
    };

    const isDisabled = isLoading || (value === (settings.Prompt.value || ''))

    return (<>
        <tr>
            <td>
                System Prompt
            </td>
            <td colSpan={2}>
                <input onChange={handleChange}
                    value={value}
                    type="text"
                    style={inputStyle} // Apply the style here
                />
            </td>
        </tr>
        <tr className="settings_row">
            <td>
                
            </td>
            <td>
                {settings.Prompt.value}
            </td>
            <td>
                <form onSubmit={invoke_prompt}>
                    <button id="chunk_overlap" className="btn btn-primary btn-sm" type="submit" disabled={isDisabled}>
                        {isLoading ? "Setting..." : "Set"}
                    </button>
                </form>
                <div>{data}</div>
            </td>
        </tr>
    </>
    );
}
export default Prompt;
