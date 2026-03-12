import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";
import Upload from "../components/Upload";

const Directory = () => {
    const [files, setFiles] = useState({});
    const [urls, setUrls] = useState({});
    const [xposts, setXposts] = useState([]);
    const [xpostDetails, setXpostDetails] = useState({});
    const [expandedXposts, setExpandedXposts] = useState({});
    const [loadingXpostDetails, setLoadingXpostDetails] = useState({});
    const [mode, setMode] = useState("file"); // "file", "url", or "x"
    const { settings } = useContext(SettingsContext);

    const normalizeXpostUrl = (value) => {
        if (typeof value === "string") return value;
        if (value && typeof value.name === "string") return value.name;
        return "";
    };

    const extractTweetId = (url) => {
        const match = String(url || "").match(/\/status\/(\d+)/i);
        return match ? match[1] : null;
    };

    const getAssetArray = (detail, type) => {
        if (!detail || !detail.assets || !Array.isArray(detail.assets[type])) {
            return [];
        }
        return detail.assets[type];
    };

    const getAssetFilename = (asset) => {
        if (asset && typeof asset.local_path === "string") {
            const parts = asset.local_path.split("/");
            return parts[parts.length - 1] || "";
        }
        if (asset && typeof asset.url === "string") {
            try {
                const pathParts = new URL(asset.url).pathname.split("/");
                return pathParts[pathParts.length - 1] || "";
            } catch {
                return "";
            }
        }
        return "";
    };

    const getAssetFilePath = (tweetId, type, asset) => {
        const filename = getAssetFilename(asset);
        if (!tweetId || !filename) return null;
        return `${tweetId}/${type}/${filename}`;
    };

    const getAssetViewUrl = (tweetId, type, asset) => {
        const assetPath = getAssetFilePath(tweetId, type, asset);
        if (!assetPath) return null;
        return `${settings.PROD_API.value}/prompt/${settings.Project.value}/file?file=${encodeURIComponent(assetPath)}`;
    };

    const loadXpostDetails = async (tweetId) => {
        if (!tweetId || xpostDetails[tweetId] || loadingXpostDetails[tweetId]) {
            return;
        }

        setLoadingXpostDetails((prev) => ({ ...prev, [tweetId]: true }));
        try {
            const filePath = encodeURIComponent(`${tweetId}/post.json`);
            const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/file?file=${filePath}`;
            const response = await fetch(api);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            setXpostDetails((prev) => ({ ...prev, [tweetId]: data }));
        } catch (error) {
            setXpostDetails((prev) => ({ ...prev, [tweetId]: { error: "Failed to load post.json" } }));
            console.error(`Error fetching X-post details for ${tweetId}:`, error);
        } finally {
            setLoadingXpostDetails((prev) => ({ ...prev, [tweetId]: false }));
        }
    };

    const toggleXpostDetails = (tweetId) => {
        if (!tweetId) return;
        setExpandedXposts((prev) => {
            const nextExpanded = !prev[tweetId];
            if (nextExpanded) {
                loadXpostDetails(tweetId);
            }
            return { ...prev, [tweetId]: nextExpanded };
        });
    };

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
                            {xposts.map((url, idx) => {
                                const normalizedUrl = normalizeXpostUrl(url);
                                const tweetId = extractTweetId(normalizedUrl);
                                const detail = tweetId ? xpostDetails[tweetId] : null;
                                const isExpanded = tweetId ? !!expandedXposts[tweetId] : false;
                                const isLoading = tweetId ? !!loadingXpostDetails[tweetId] : false;
                                const images = getAssetArray(detail, "images");
                                const videos = getAssetArray(detail, "videos");
                                const audio = getAssetArray(detail, "audio");

                                return (
                                    <React.Fragment key={`${tweetId || idx}`}>
                                        <tr key={`${tweetId || idx}-row`}>
                                            <td>{idx + 1}</td>
                                            <td className="file-name">
                                                <div>{normalizedUrl}</div>
                                                {tweetId && (
                                                    <small className="text-muted">tweet_id={tweetId}</small>
                                                )}
                                                {detail && !detail.error && (
                                                    <div className="mt-1" style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                                                        <span className="badge bg-info text-dark">images={images.length}</span>
                                                        <span className="badge bg-primary">videos={videos.length}</span>
                                                        <span className="badge bg-warning text-dark">audio={audio.length}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                                                    <a className="btn btn-primary btn-sm" target="RAGUI" href={normalizedUrl}>View</a>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        type="button"
                                                        disabled={!tweetId}
                                                        onClick={() => toggleXpostDetails(tweetId)}
                                                    >
                                                        {isExpanded ? "Hide details" : "Show details"}
                                                    </button>
                                                    <button className="btn btn-secondary btn-sm" type="button" disabled title="Delete in X mode is not supported by backend">
                                                        Delete
                                                    </button>
                                                </span>
                                            </td>
                                        </tr>
                                        {isExpanded && tweetId ? (
                                            <tr key={`${tweetId || idx}-detail`}>
                                                <td colSpan={3}>
                                                    {isLoading && <div>Loading post details...</div>}
                                                    {!isLoading && detail && detail.error && <div>{detail.error}</div>}
                                                    {!isLoading && detail && !detail.error && (
                                                        <div>
                                                            <div>
                                                                <b>Created:</b> {detail.created_at || "n/a"}
                                                                {detail.author && detail.author.username && (
                                                                    <span> | <b>Author:</b> @{detail.author.username}</span>
                                                                )}
                                                            </div>
                                                            <div className="mt-1" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                                <a
                                                                    className="btn btn-primary btn-sm"
                                                                    target="RAGUI"
                                                                    href={`${settings.PROD_API.value}/prompt/${settings.Project.value}/file?file=${encodeURIComponent(`${tweetId}/post.json`)}`}
                                                                >
                                                                    post.json
                                                                </a>
                                                                <a
                                                                    className="btn btn-primary btn-sm"
                                                                    target="RAGUI"
                                                                    href={`${settings.PROD_API.value}/prompt/${settings.Project.value}/file?file=${encodeURIComponent(`${tweetId}/post.txt`)}`}
                                                                >
                                                                    post.txt
                                                                </a>
                                                            </div>

                                                            {images.length > 0 && (
                                                                <div className="mt-2">
                                                                    <b>Image previews</b>
                                                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                                                                        {images.map((asset, previewIdx) => {
                                                                            const imageUrl = getAssetViewUrl(tweetId, "images", asset);
                                                                            if (!imageUrl || asset.status !== "downloaded") {
                                                                                return null;
                                                                            }
                                                                            return (
                                                                                <a
                                                                                    key={`${tweetId}-image-preview-${previewIdx}`}
                                                                                    target="RAGUI"
                                                                                    href={imageUrl}
                                                                                    title={getAssetFilename(asset) || `image-${previewIdx + 1}`}
                                                                                >
                                                                                    <img
                                                                                        src={imageUrl}
                                                                                        alt={getAssetFilename(asset) || `tweet image ${previewIdx + 1}`}
                                                                                        loading="lazy"
                                                                                        style={{ width: "140px", maxHeight: "100px", objectFit: "cover", border: "1px solid #ccc", borderRadius: "4px" }}
                                                                                    />
                                                                                </a>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {["images", "videos", "audio"].map((type) => {
                                                                const assets = getAssetArray(detail, type);
                                                                if (!assets.length) {
                                                                    return null;
                                                                }
                                                                return (
                                                                    <div key={`${tweetId}-${type}`} className="mt-2">
                                                                        <b>{type}</b>
                                                                        <ul className="mb-1">
                                                                            {assets.map((asset, assetIdx) => {
                                                                                const assetPath = getAssetFilePath(tweetId, type, asset);
                                                                                const assetUrl = getAssetViewUrl(tweetId, type, asset);
                                                                                const fileName = getAssetFilename(asset) || `${type}-${assetIdx + 1}`;
                                                                                return (
                                                                                    <li key={`${tweetId}-${type}-${assetIdx}`}>
                                                                                        <span>[{asset.status || "unknown"}] </span>
                                                                                        {assetPath && assetUrl ? (
                                                                                            <a
                                                                                                target="RAGUI"
                                                                                                href={assetUrl}
                                                                                            >
                                                                                                {fileName}
                                                                                            </a>
                                                                                        ) : (
                                                                                            <span>{fileName}</span>
                                                                                        )}
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </React.Fragment>
                                );
                            })}
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