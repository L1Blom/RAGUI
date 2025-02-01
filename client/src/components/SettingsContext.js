import React, { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

    const initialSettings = {
        PROD_API: {
            value: 'https://home.lblom.nl', type: 'string', prio: 'server'
        },
        Project: {
            value: 'azure', type: 'string', prio: 'server'
        },
        Provider: {
            value: '', type: 'string', prio: 'server'
        },
        Similar: {
            value: 4, type: 'number', prio: 'client'
        },
        Score: {
            value: 0.2, type: 'float', prio: 'client'
        },
        NoChunks: {
            value: 0, type: 'number', prio: 'server'
        },
        ChunkSize: {
            value: 100, type: 'number', prio: 'server'
        },
        ChunkOverlap: {
            value: 20, type: 'number', prio: 'server'
        },
        Temperature: {
            value: 0.0, type: 'float', prio: 'server'
        },
        ModelText: {
            value: '', type: 'string', prio: 'server'
        },
        Embedding: {
            value: '', type: 'string', prio: 'server'
        },
        State: 'initial',
        timestamp: new Date().getTime()
    }

    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem("settings");
        return savedSettings ? JSON.parse(savedSettings) : initialSettings;
    });

    async function fetchData() {
        let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/globals`;
        const response = await fetch(api);
        return response.json();
    }

    const invoke_globals = () => {
        fetchData().then(result => {
            const savedSettings = JSON.parse(localStorage.getItem("settings"));
            if (savedSettings &&
                deepEqual(savedSettings, initialSettings) &&
                savedSettings['timestamp'] === result['timestamp']) {
                console.log('Settings are the same');
                setSettings(savedSettings);
            } else {
                console.log('Settings are different');
                const updatedSettings = { ...settings };
                Object.entries(result).forEach(([key, value]) => {
                    if (key in updatedSettings) {
                        if (key !== 'State') {
                            if (settings[key].prio === 'server') {
                                console.log('Updating', key, 'from server:', value);
                                if (updatedSettings[key].type === 'number') {
                                    value = Number(value);
                                } else if (updatedSettings[key].type === 'float') {
                                    value = parseFloat(value);
                                }
                                updatedSettings[key].value = value;
                            }
                        }
                    }
                    ;
                    updatedSettings['Provider'].value = result['USE_LLM'];
                    updatedSettings['State'] = 'initialized';
                    updatedSettings['timestamp'] = result['timestamp'];
                    setSettings(updatedSettings);
                });
            };
        });
    }

    useEffect(() => {
        if (settings.State === 'initial') {
            invoke_globals();
        }
    }, []);

    useEffect(() => {
        if (settings.State === 'initialized') {
            localStorage.setItem("settings", JSON.stringify(settings));
        }
    }, [settings]);

    function deepEqual(object1, object2) {
        // keys from object1 are leading
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            if (!keys2.includes(key)) {
                return false;
            }
            const val1 = object1[key];
            const val2 = object2[key];
            const areObjects = isObject(val1) && isObject(val2);
            if (
                areObjects && !deepEqual(val1, val2)
            ) {
                return false;
            }
        }

        return true;
    }

    function isObject(object) {
        return object != null && typeof object === 'object';
    }

    // Function to update settings via an API
    const updateSettings = (newSettings) => {
        console.log('Updating settings', newSettings);
        setSettings((prevSettings) => {
            const updatedSettings = {
                ...prevSettings
            }
            if (updatedSettings[newSettings.key]) {
                updatedSettings[newSettings.key].value = newSettings.value;

            }
            return updatedSettings;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};