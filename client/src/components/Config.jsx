import { useState, useEffect, useContext } from "react";
import config from '../config.json'; // Import config.json

const Config = ({ highlightedProject }) => {
    
    var host = 'http://' + window.location.hostname + ':8000'
    if (config.CONFIG_API) {
        host = config.CONFIG_API
    }
    const [myconfig, setMyConfig] = useState({}); // Initialize as an object
    const [editMode, setEditMode] = useState(null); // Track which row is in edit mode
    const [editData, setEditData] = useState({}); // Store data being edited
    const [newRowData, setNewRowData] = useState({ project: '', description: '', port: '' }); // Store data for new row
    const [selectedRow, setSelectedRow] = useState(null); // Track selected row
    const [showAddRow, setShowAddRow] = useState(false); // Track if add row input fields should be shown

    const providerOptions = ["OPENAI", "AZURE", "GROQ", "OLLAMA"];

    const refreshconfig = () => {
        const api = `${host}/get_all`;

        fetch(api).then((res) => res.json()).then((data) => {
            setMyConfig(data);
            if (highlightedProject && selectedRow !== null) {
                setSelectedRow(highlightedProject); // Highlight the project row if not already selected
            }
        })
            .catch((error) => console.error("Error fetching configurations:", error));
    }

    const handleActionClick = (key, action) => {
        const api = `${host}/${action}?project=${key}`;
        fetch(api, { method: 'GET' })
            .then((res) => res.json())
            .then((data) => {
                refreshconfig(); // Refresh the config after the action
                setSelectedRow(key);
            })
            .catch((error) => console.error(`Error ${action}ing project:`, error));
    };

    const handleEditClick = (key) => {
        setEditMode(key);
        setEditData(myconfig[key]);
    };

    const handleSaveClick = async (key) => {
        if (editData.port < 5000 || editData.port > 7999) {
            alert("Port number must be between 5000 and 7999.");
            return;
        }
        const api = `${host}/set`;
        const saveData = { ...editData, 'originalProject': key }; // Include original project name
        await fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(saveData)
        })
            .then((res) => res.json())
            .then((data) => {
                setEditMode(null);
                refreshconfig(); // Refresh the config after saving
                setSelectedRow(key);
            })
            .catch((error) => console.error("Error updating project:", error));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleAddRowClick = async () => {
        if (!newRowData.project && !newRowData.description && !newRowData.port) {
            setShowAddRow(false); // Hide the add row input fields if nothing is filled in
            return;
        }
        if (myconfig[newRowData.project]) {
            alert("Project code must be unique.");
            return;
        }
        if (newRowData.port < 5000 || newRowData.port > 7999) {
            alert("Port number must be between 5000 and 7999.");
            return;
        }
        const api = `${host}/set`;
        await fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newRowData)
        })
            .then((res) => res.json())
            .then((data) => {
                setNewRowData({ project: '', description: '', port: '', provider: '' }); // Reset new row data
                setShowAddRow(false); // Hide the add row input fields
                refreshconfig(); // Refresh the config after adding
            })
            .catch((error) => console.error("Error adding project:", error));
    };

    const handleDeleteClick = (key) => {
        const api = `${host}/delete?project=${key}`;
        fetch(api, { method: 'DELETE' })
            .then((res) => res.json())
            .then((data) => {
                refreshconfig(); // Refresh the config after deleting
                setSelectedRow(key);
            })
            .catch((error) => console.error("Error deleting project:", error));
    };

    const handleNewRowInputChange = (e) => {
        const { name, value } = e.target;
        setNewRowData({ ...newRowData, [name]: value });
    };

    const handleRowClick = (key) => {
        if (editMode !== key) {
            if (showAddRow && !newRowData.project && !newRowData.description && !newRowData.port) {
                setShowAddRow(false); // Hide the add row input fields if nothing is filled in
            }
            setSelectedRow(key); // Toggle selection
            setEditMode(null); // Exit edit mode when a new row is selected
        }
    };

    const handleAddButtonClick = () => {
        setShowAddRow(true);
    };

    // Fetch models once when the component mounts
    useEffect(() => {
        refreshconfig();
    }, []);

    useEffect(() => {
        refreshconfig();
        const interval = setInterval(() => {
            if (!editMode && !showAddRow) {
                refreshconfig();
            }
        }, 5000); // Adjusted to 10 seconds
        return () => clearInterval(interval);
    }, [editMode, showAddRow]);

    useEffect(() => {
        if (highlightedProject) {
            setSelectedRow(highlightedProject); // Highlight the project row
        }
    }, [highlightedProject]);

    const getStatusIcon = (status) => {
        if (status === "up") {
            return <span style={{ color: 'green' }}>⬤</span>;
        } else if (status === "down") {
            return <span style={{ color: 'red' }}>⬤</span>;
        } else {
            return <span style={{ color: 'gray' }}>⬤</span>;
        }
    };

    const inputStyle = {
        maxWidth: '80px',
        border: '1px solid #ccc',
        padding: '2px'
    };

    const descriptionInputStyle = {
        border: '1px solid #ccc',
        padding: '2px'
    };

    const buttonRowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '10px'
    };

    const buttonStyle = {
        flexGrow: 1,
        margin: '0 5px'
    };

    const isEditDisabled = selectedRow ? myconfig[selectedRow]?.status !== 'down' : true;
    const isActionDisabled = !selectedRow;
    const isSaveDisabled = editMode !== selectedRow;
    const isDeleteDisabled = selectedRow ? myconfig[selectedRow]?.status !== 'down' : true;
    const isChatDisabled = selectedRow ? myconfig[selectedRow]?.status !== 'up' : true;

    return (
        <div>
            <table className="config-row" border={1} width={'100%'}>
                <thead>
                    <tr><th>Project</th><th>Description</th><th>Port</th><th>Provider</th><th>Status</th><th>Started</th></tr>
                </thead>
                <tbody>
                    {Object.keys(myconfig).map((key, index) => {
                        const item = myconfig[key];
                        const isEditing = editMode === key && item.status === 'down';
                        const isSelected = selectedRow === key;
                        return (
                            <tr key={index} onClick={() => handleRowClick(key)} style={{ backgroundColor: isSelected ? '#f0f0f0' : 'transparent' }}>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="project"
                                            value={editData.project}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                        />
                                    ) : (
                                        key
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="description"
                                            value={editData.description}
                                            onChange={handleInputChange}
                                            style={descriptionInputStyle}
                                        />
                                    ) : (
                                        item.description
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            name="port"
                                            value={editData.port}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                            min="5000"
                                            max="7999"
                                        />
                                    ) : (
                                        <span>{item.port}</span>
                                    )}
                                </td>
                                <td>
                                    {isEditing ? (
                                        <select
                                            name="provider"
                                            value={editData.provider}
                                            onChange={handleInputChange}
                                            style={inputStyle}
                                        >
                                            {providerOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span>{item.provider}</span>
                                    )}
                                </td>
                                <td align="center">{getStatusIcon(item.status)}</td>
                                <td>{item.timestamp}</td>
                            </tr>
                        );
                    })}
                    {showAddRow && (
                        <tr>
                            <td>
                                <input
                                    type="text"
                                    name="project"
                                    value={newRowData.project}
                                    onChange={handleNewRowInputChange}
                                    style={inputStyle}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="description"
                                    value={newRowData.description}
                                    onChange={handleNewRowInputChange}
                                    style={descriptionInputStyle}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    name="port"
                                    value={newRowData.port}
                                    onChange={handleNewRowInputChange}
                                    style={inputStyle}
                                    min="5000"
                                    max="7999"
                                />
                            </td>
                            <td>
                                <select
                                    name="provider"
                                    value={newRowData.provider}
                                    onChange={handleNewRowInputChange}
                                    style={inputStyle}
                                >
                                    {providerOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td align="center">{getStatusIcon('')}</td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="button-row" style={buttonRowStyle}>
                <button className="btn btn-primary btn-sm" onClick={() => handleEditClick(selectedRow)} disabled={isEditDisabled} style={buttonStyle}>
                    Edit
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleActionClick(selectedRow, myconfig[selectedRow]?.status === 'up' ? 'stop' : 'start')} disabled={isActionDisabled} style={buttonStyle}>
                    {myconfig[selectedRow]?.status === 'up' ? 'Stop' : 'Start'}
                </button>
                <button className="btn btn-success btn-sm" onClick={() => handleSaveClick(selectedRow)} disabled={isSaveDisabled} style={buttonStyle}>
                    Save
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteClick(selectedRow)} disabled={isDeleteDisabled} style={buttonStyle}>
                    Delete
                </button>
                {isChatDisabled ? (
                    <button className="btn btn-info btn-sm" disabled style={buttonStyle}>
                        Chat
                    </button>
                ) : (
                    <a className="btn btn-info btn-sm" href={`/react/?project=${selectedRow}`} style={buttonStyle}>
                        Chat
                    </a>
                )}
                {!showAddRow && (
                    <button className="btn btn-success btn-sm" onClick={handleAddButtonClick} style={buttonStyle}>
                        Add
                    </button>
                )}
                {showAddRow && (
                    <button className="btn btn-success btn-sm" onClick={handleAddRowClick} style={buttonStyle}>
                        Save
                    </button>
                )}
            </div>
        </div>
    )
}

export default Config;