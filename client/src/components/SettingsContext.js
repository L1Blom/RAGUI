import React, { createContext, useState, useEffect } from "react";
import config from '../config.json'; // Import config.json

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

    const initialSettings = {
        CONFIG_API: {
            value: config.CONFIG_API, type: 'string', prio: 'client' // Use value from config.json
        },
        PROD_API: {
            value: '', type: 'string', prio: 'server'
        },
        Project: {
            value: config.CONFIG_PROJECT, type: 'string', prio: 'server'
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

    const [loading, setLoading] = useState(true);
    const [stop, setStop] = useState(false);

    async function fetchData() {
        let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/globals`;
        try {
            const response = await fetch(api);
            if (response.status !== 200) {
                setStop(true);
                return null;
            } else {
                return response.json();
            }
        } catch (error) {
            console.error('Error:', error);
            setStop(true);
            return null;
        }
    }

    async function fetchConfig() {
        let api = `${settings.CONFIG_API.value}/get?project=${settings.Project.value}`;
        try {
            const response = await fetch(api);
            if (response.status !== 200) {
                setStop(true);
                return null;
            } else {
                return response.json();
            }
        } catch (error) {
            console.error('Error:', error);
            setStop(true);
            return null;
        }
    }

    useEffect(() => {
        const invoke_globals = async () => {
            try {
                const configResult = await fetchConfig();
                if (stop || !configResult) {
                    console.log('Error config')
                    throw new Error('Could not access config server');
                } else {
                    const host = 'http://' + configResult['host'] + ':' + configResult['port']
                    updateSettings({
                        key: 'PROD_API',
                        value: host
                    })
                }
                const dataResult = await fetchData();
                if (stop || !dataResult) {
                    console.log('Error data');
                    throw new Error('Could not fetch data');
                } else {
                    const savedSettings = JSON.parse(localStorage.getItem("settings"));
                    if (savedSettings &&
                        deepEqual(savedSettings, initialSettings) &&
                        savedSettings['timestamp'] === dataResult['timestamp'] &&
                        savedSettings['Project'].value === configResult['project']) {
                        setSettings(savedSettings);
                    } else {
                        const updatedSettings = { ...settings };
                        Object.entries(dataResult).forEach(([key, value]) => {
                            if (key in updatedSettings) {
                                if (key !== 'State') {
                                    if (settings[key].prio === 'server') {
                                        if (updatedSettings[key].type === 'number') {
                                            value = Number(value);
                                        } else if (updatedSettings[key].type === 'float') {
                                            value = parseFloat(value);
                                        }
                                        updatedSettings[key].value = value;
                                    }
                                }
                            }
                        });
                        updatedSettings['Provider'].value = dataResult['USE_LLM'];
                        updatedSettings['State'] = 'initialized';
                        updatedSettings['timestamp'] = dataResult['timestamp'];
                        setSettings(updatedSettings);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                setStop(true)
            } finally {
                if (stop) {
                    setLoading(true);
                } else {
                    setLoading(false);
                }
            }
        };
        invoke_globals();
    }, [stop]); // Add stop to dependency array to re-run if stop changes

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

    if (stop) {
        return <div>
            <h2>No RAG server found</h2>
            check errors:
            <ul>
                <li>missing config.json?</li>
                <li>Configserver not runnig?</li>
                <li>RAG server not running?</li>
            </ul>
        </div>;
    } else {
        if (loading) {
            return <div>Loading...</div>;
        } else {

            return (
                <SettingsContext.Provider value={{ settings, updateSettings }}>
                    {children}
                </SettingsContext.Provider>
            );
        }
    }
};