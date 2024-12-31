import React, { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const initialSettings = {
        DEV_API: 'http://192.168.2.22:5000',
        PROD_API: 'https://home.lblom.nl',
        Project: 'centric',
        Provider: '',
        Similar: 10,
        Score: 0.2,
        Temperature: 0.0,
        ModelText: "",
        State: 'initial'
    }
    const savedSettings = JSON.parse(localStorage.getItem("settings"));
    console.log("Saved settings:", savedSettings); // Log the saved settings
    const [settings, setSettings] =
        useState(savedSettings === undefined ? initialSettings: savedSettings);    
    
    useEffect(() => {
        // Fetch initial settings from an API
        const invoke_globals = () => {
            async function fetchData() {
                let api = `${settings.PROD_API}/prompt/${settings.Project}/globals`
                const response = await fetch(
                    `${api}`
                );
                return response.json();
            }
            fetchData().then(result => {
                Object.entries(result).map(([key, value]) => {
                    if (key in settings) {
                        if (key === 'Temperature' || key === 'Score') {
                            settings[key] = parseFloat(value);
                        } else {
                            if (key === 'Similar') {
                                settings[key] = Number(value);
                            } else {
                                settings[key] = value
                            }
                        }
                    }
                    return settings;
                });
                settings['Provider'] = result['USE_LLM'];
                settings['State'] = 'initialized';
                setSettings(settings)
            });
        };
        if (settings.State === 'initial') {
            console.log("state",settings.State)
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
        localStorage.setItem("settings", JSON.stringify(settings));
        console.log("Settings updated:", settings); // Log the updated settings
    }, [settings]);


    // Function to update settings via an API
    const updateSettings = (newSettings) => {
        setSettings((prevSettings) => {
            console.log("Updating settings:", newSettings); // Log the updated settings  
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