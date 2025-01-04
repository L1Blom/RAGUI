import React, { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

    const initialSettings = {
        PROD_API: 'https://home.lblom.nl',
        Project: 'centric',
        Provider: '',
        Similar: 10,
        Score: 0.2,
        NoChunks: 0,
        ChunkSize: 0,
        ChunkOverlap: 0,
        Temperature: 0.0,
        ModelText: "",
        State: 'initial'
    }
    const savedSettings = JSON.parse(localStorage.getItem("settings"));
    const [settings, setSettings] =
        useState(savedSettings === null ? initialSettings : savedSettings);

    useEffect(() => {
        // Fetch initial settings from an API
        const settingsTypes = {
            default: 'string',
            Similar: 'number',
            Score: 'float',
            Temperature: 'float',
            NoChunks: 'number',
            ChunkSize: 'number',
            ChunkOverlap: 'number'
        }

        const invoke_globals = () => {
            async function fetchData() {
                let api = `${settings.PROD_API}/prompt/${settings.Project}/globals`;
                const response = await fetch(api);
                return response.json();
            }

            fetchData().then(result => {
                const updatedSettings = { ...settings };
                Object.entries(result).forEach(([key, value]) => {
                    if (key in updatedSettings) {
                        if (key in settingsTypes) {
                            if (settingsTypes[key] === 'number') {
                                value = Number(value);
                            } else if (settingsTypes[key] === 'float') {
                                value = parseFloat(value);
                            }
                        }
                        updatedSettings[key] = value;
                    }
                });
                updatedSettings['Provider'] = result['USE_LLM'];
                updatedSettings['State'] = 'initialized';
                setSettings(updatedSettings);
            });
        };
        if (settings.State === 'initial') {
            invoke_globals();
        }
    }, [settings]);

    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("settings"));
        if (savedSettings) {
            setSettings(savedSettings);
        }
    }, []);

    useEffect(() => {
        if (settings.State === 'initialized') {
            localStorage.setItem("settings", JSON.stringify(settings));
        }
    }, [settings]);


    // Function to update settings via an API
    const updateSettings = (newSettings) => {
        setSettings((prevSettings) => {
            const updatedSettings = {
                ...prevSettings, // Keep the existing settings
                [newSettings.key]: newSettings.value, // Update the specific key with the new value
            };
            return updatedSettings;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};