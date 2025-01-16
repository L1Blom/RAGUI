import React, { useRef, useContext, useState } from "react";
import { SettingsContext } from "./SettingsContext";

function Chunk() {
    const { settings, updateSettings } = useContext(SettingsContext);       // Get the settings and updateSettings function from the context
    const [value1, setValue1] = useState(settings.ChunkSize.value);         // Initialize the state with the current chunk size
    const [value2, setValue2] = useState(settings.ChunkOverlap.value);      // Initialize the state with the current chunk overlap
    const [data, setData] = useState("");                                   // Initialize the data state
    const [isLoading, setIsLoading] = useState(false);                      // Initialize the isLoading state

    const timeoutRef = useRef(null);                                        // Create a ref to store the timeout

    const handleChange = (event) => {                                       // Handle the change event
        const newValue = parseFloat(event.target.value);                    // Parse the new value as a float

        if (event.target.id === "chunk_size") {                             // Check if the target is the chunk size slider
            setValue1(newValue);                                            // Update the chunk size state
        }
        if (event.target.id === "chunk_overlap") {                          // Check if the target is the chunk overlap slider
            setValue2(newValue);                                            // Update the chunk overlap state
        }

        if (timeoutRef.current) {                                           // Clear previous timeout and set a new one for debouncing
            clearTimeout(timeoutRef.current);                               // Clear the previous timeout
        }
        timeoutRef.current = setTimeout(() => {                             // Set a new timeout                   
        }, 200);                                                            // Set the timeout to 200ms
    };

    const invoke_chunk = async (e) => {                                     // Handle the chunk size form submission
        e.preventDefault();                                                 // Prevent the form from submitting

        setIsLoading(true);                                                 // Disable button during API call
        setData("Setting chunk sizes...");                                  // Display a message while the API call is in progress

        fetch(`${settings.PROD_API.value}/prompt/${settings.Project.value}/chunk?chunk_size=${value1}&chunk_overlap=${value2}`)
            .then((response) => {                                           // Handle the API response
                if (!response.ok) {                                         // If the response is not OK (HTTP 200)
                    throw new Error("Failed to set chunk size. Please try again."); // Throw an error
                }
                return response.text();                                     // Return the response as text
            })
            .then((result) => {                                             // Handle the result
                setData(result);                                            // Update the data with the server's response
                updateSettings({ key: "ChunkSize", value: value1 });        // Update the context with the new chunk size
                updateSettings({ key: "ChunkOverlap", value: value2 });     // Update the context with the new chunk overlap
            })
            .catch((error) => {                                             // Handle any errors
                setData("Failed to set chunk sizes. Please try again.");    // Display an error message
                setValue1(settings.ChunkSize.value);                        // Reset the chunk size to the previous value
                setValue2(settings.ChunkOverlap.value);                     // Reset the chunk overlap to the previous value
            })
            .finally(() => {                                                // Finally block
                setIsLoading(false);                                        // Re-enable the button after API call completes
            });
    };

    const isDisabled = isLoading ||
        (value1 === (settings.ChunkSize.value || 0) &&
            value2 === (settings.ChunkOverlap.value || 0));                 // Check if the button should be disabled

    return (                                                                // Return the JSX for the component
        <>
            <tr>
                <td>
                    Chunk size
                </td>
                <td>
                    {value1}
                </td>
                <td>
                    <input
                        id="chunk_size"
                        onChange={handleChange}
                        value={value1}
                        step="10"
                        type="range"
                        min="0"
                        max="1000"
                    />
                </td>
            </tr>
            <tr>
                <td>
                    Chunk overlap
                </td>
                <td>
                    {value2}
                </td>
                <td>
                    <input
                        id="chunk_overlap"
                        onChange={handleChange}
                        value={value2}
                        step="5"
                        type="range"
                        min="0"
                        max="100"
                    />
                </td>
            </tr>
            <tr className="settings_row">
                <td>
                    No chunks
                </td>
                <td>
                    {settings.NoChunks.value}
                </td>
                <td>
                    <form onSubmit={invoke_chunk}>
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
export default Chunk;
