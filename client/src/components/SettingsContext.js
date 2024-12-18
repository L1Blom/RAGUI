import React, { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        DEV_API: 'http://192.168.2.200:5000',
        PROD_API: 'https://home.lblom.nl',
        Project: 'centric',
        Provider: '',
        Similar: 10,
        Score: 0.2,
        Temperature: 0.0,
        ModelText: ""
    });

    // Fetch initial settings from an API
    useEffect(() => {
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
                });
                setSettings(settings)
            });
        };
        invoke_globals();
    }, []);
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("settings"));
        if (savedSettings) {
            setSettings(savedSettings);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("settings", JSON.stringify(settings));
    }, [settings]);

    // Function to update settings via an API
    const updateSettings = async (newSettings) => {
        try {
            const response = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings),
            });

            if (response.ok) {
                const updatedSettings = await response.json();
                setSettings(updatedSettings); // Update local state
            } else {
                console.error("Failed to update settings");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
            </SettingsContext.Provider>
    );
};