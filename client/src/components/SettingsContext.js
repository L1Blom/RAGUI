import React, { createContext, useState, useEffect } from "react";
import Config from "./Config";
import Navbar from "./Navbar";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

    var config_server = process.env.REACT_APP_CONFIG_SERVER || '/';
    var rag_service = process.env.REACT_APP_RAG_SERVER || config_server;
    var project = localStorage.getItem('project') || 'azure';

    const initialSettings = {
        PROD_API: {
            value: '', type: 'string', prio: 'server'
        },
        Project: {
            value: project, type: 'string', prio: 'server'
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
        const savedSettings = localStorage.getItem(project);
        return savedSettings ? JSON.parse(savedSettings) : initialSettings;
    });

    const [loading, setLoading] = useState(true);
    const [stop, setStop] = useState(false);

    async function fetchData(api) {
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
            //setStop(true);
            return null;
        }
    }

    async function fetchConfig(project) {
        let api = `${config_server}/get?project=${project}`;
        try {
            const response = await fetch(api);
            if (response.status !== 200) {
                return null;
            } else {
                return response.json();
            }
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    useEffect(() => {
        const invoke_globals = async () => {
            try {
                const configResult = await fetchConfig(project);
                if (!configResult) {
                    console.log('Error config')
                    throw new Error('Could not access config server');
                } else {
                    let host = `${rag_service}/${configResult.port}` 
                    let api = host + `/prompt/${project}/globals`;
                    const dataResult = await fetchData(api);
                    if (!dataResult) {
                        console.log('Error data');
                        throw new Error('Could not fetch data');
                    } else {
                        const savedSettings = JSON.parse(localStorage.getItem(project));
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
                            updatedSettings['PROD_API'].value = host;
                            updatedSettings['Provider'].value = dataResult['USE_LLM'];
                            updatedSettings['State'] = 'initialized';
                            updatedSettings['timestamp'] = dataResult['timestamp'];
                            setSettings(updatedSettings);
                        }
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                //setStop(true)
            } finally {
                setLoading(false);
            }
        };
        invoke_globals();
    }, [project]); // Add necessary dependencies

    useEffect(() => {
        if (settings.State === 'initialized') {
            localStorage.setItem('project',project)
            localStorage.setItem(settings.Project.value, JSON.stringify(settings));
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
    const switchSettings = async (project) => {
        if (settings.Project.value !== project) {
            var newSettings = JSON.parse(localStorage.getItem(project));
            if (newSettings) {
                setSettings(newSettings);
            } else {
                const configResult = await fetchConfig(project);
                if (!configResult) {
                    console.log('Error config')
                    throw new Error('Could not access config server');
                } else {
                    const updatedInitialSettings = {
                        ...initialSettings,
                        Project: { ...initialSettings.Project, value: project },
                        PROD_API: { ...initialSettings.PROD_API, value: `${config_server}:${configResult.port}` }
                    };
                    setSettings(updatedInitialSettings);
                    localStorage.setItem(project, JSON.stringify(updatedInitialSettings)); // Store new settings in localStorage
                }
            }
            localStorage.setItem('project',project)
            setStop(false); // Reset stop to false to re-run useEffect
        }
    };

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
        return <>
            <Navbar />
            <Config highlightedProject={project} /> {/* Pass highlightedProject prop */}
        </>
    } else {
        if (loading) {
            return <div>Loading...</div>;
        } else {

            return (
                <SettingsContext.Provider value={{ settings, updateSettings, switchSettings }}>
                    {children}
                </SettingsContext.Provider>
            );
        }
    }
};