import { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";
import Upload from "../components/Upload";

const Directory = () => {
    const [files, setFiles] = useState({});
    const [urls, setUrls] = useState({});
    const [xposts, setXposts] = useState([]);
    const [mode, setMode] = useState("file"); // "file", "url", or "x"
    const { settings } = useContext(SettingsContext);

    // Helper to refresh current mode
    const refreshCurrent = () => {
        if (mode === "file") {
            refreshFiles();
        } else if (mode === "url") {
            refreshUrls();
        } else if (mode === "x") {
            refreshXposts();
        }
    };

    const file_action = (e, item) => {
        e.preventDefault();
        const api = settings.PROD_API.value + '/prompt/' + settings.Project.value + '/context?file=' + item + '&action=delete&mode=' + mode;
        fetch(api).then((res) => res.json()).then((data) => {
            if (mode === "file") {
                setFiles(data);
            } else {
                setUrls(data);
            }
            refreshCurrent(); // Always refresh after delete
        })
            .catch((error) => console.error("Error deleting file:", error));
        console.log('Delete file', item);
        return;
    }

    const refreshFiles = () => {
        const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/context?file=&action=list&mode=${mode}`;
        fetch(api).then((res) => res.json()).then((data) => {
            setFiles(data);
        })
            .catch((error) => console.error("Error fetching files:", error));
    }

    const refreshUrls = () => {
        const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/context?file=urls.json&action=list&mode=${mode}`;
        fetch(api)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched URLs:", data);
                setUrls(data);
            })
            .catch((error) => {
                setUrls([]);
                console.error("Error fetching urls.json:", error);
            });
    }

    const refreshXposts = () => {
        const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/file?file=x.json`;
        fetch(api)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched X-posts:", data);
                setXposts(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                setXposts([]);
                console.error("Error fetching x.json:", error);
            });
    }

    useEffect(() => {
        if (mode === "file") {
            refreshFiles();
        } else if (mode === "url") {
            refreshUrls();
        } else if (mode === "x") {
            refreshXposts();
        }
    }, [mode, settings.PROD_API.value, settings.Project.value]);

    return (
        <div>
            <Navbar />
            <div className="small bg-light">
                Project: <b>{settings.Project.value} </b>
                - Provider: <b>{settings.Provider.value} </b>
                - Model: <b>{settings.ModelText.value} </b>
                - Temperature: <b>{settings.Temperature.value} </b>
                - Similar: <b>{settings.Similar.value} </b>
                - Score: <b>{settings.Score.value} </b>
                - Chunk size: <b>{settings.ChunkSize.value} </b>
                - Chunk overlap: <b>{settings.ChunkOverlap.value} </b>
                - # Chunks: <b>{settings.NoChunks.value}</b>
            </div>

            <div style={{ margin: "10px 0" }}>
                <button
                    className={`btn btn-sm ${mode === "file" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setMode("file")}
                    style={{ marginRight: "5px" }}
                >
                    Files
                </button>
                <button
                    className={`btn btn-sm ${mode === "url" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setMode("url")}
                    style={{ marginRight: "5px" }}
                >
                    URLs
                </button>
                <button
                    className={`btn btn-sm ${mode === "x" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => setMode("x")}
                >
                    X
                </button>
            </div>
            {mode === "file" && files && files.type === 'folder' && (
                <div>
                    {files.name}:
                    <table border={1} width={'100%'}>
                        <thead>
                            <tr><th>No</th><th>Filename</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {files.items
                                .filter(item => item.name !== "urls.json")
                                .map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="file-name">{item.name}</td>
                                        <td>
                                            <span style={{ display: 'flex', gap: '2px' }}>
                                                <a className="btn btn-primary btn-sm" target="RAGUI" href={settings.PROD_API.value + '/prompt/' + settings.Project.value + '/file?file=' + item.name}>View</a>
                                                <form onSubmit={(e) => file_action(e, item.name)}>
                                                    <button id="delete" className="btn btn-primary btn-sm">Delete</button>
                                                </form>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            <Upload onUpload={refreshFiles} initialInputType={mode} />
                        </tbody>
                    </table>
                </div>
            )}
            {mode === "url" && Array.isArray(urls.items) && urls.type === 'urls' && (
                <div>
                    URLs:
                    <table border={1} width={'100%'}>
                        <thead>
                            <tr><th>No</th><th>URL</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {urls.items.map((url, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td className="file-name">{typeof url === "string" ? url : url.name}</td>
                                    <td>
                                        <span style={{ display: 'flex', gap: '2px' }}>
                                            <a className="btn btn-primary btn-sm" target="RAGUI" href={typeof url === "string"
                                                ? url
                                                : url.name}>View</a>
                                            <form onSubmit={(e) => file_action(e, typeof url === "string" ? url : url.name)}>
                                                <button id="delete" className="btn btn-primary btn-sm">Delete</button>
                                            </form>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            <Upload onUpload={refreshUrls} initialInputType={mode} />
                        </tbody>
                    </table>
                </div>
            )}
            {mode === "x" && Array.isArray(xposts) && xposts.length > 0 && (
                <div>
                    X-posts:
                    <table border={1} width={'100%'}>
                        <thead>
                            <tr><th>No</th><th>URL</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {xposts.map((url, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td className="file-name">{typeof url === "string" ? url : url.name}</td>
                                    <td>
                                        <span style={{ display: 'flex', gap: '2px' }}>
                                            <a className="btn btn-primary btn-sm" target="RAGUI" href={typeof url === "string"
                                                ? url
                                                : url.name}>View</a>
                                            <form onSubmit={(e) => file_action(e, typeof url === "string" ? url : url.name)}>
                                                <button id="delete" className="btn btn-primary btn-sm">Delete</button>
                                            </form>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            <Upload onUpload={refreshXposts} initialInputType={mode} />
                        </tbody>
                    </table>
                </div>
            )}
            {mode === "x" && (!Array.isArray(xposts) || xposts.length === 0) && (
                <div>
                    <p>No X-posts found.</p>
                    <table border={1} width={'100%'}>
                        <thead>
                            <tr><th>No</th><th>URL</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={3}>No X-posts found.</td>
                            </tr>
                            <Upload onUpload={refreshXposts} initialInputType={mode} />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Directory;