import React, { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

const Upload = ({ onUpload, initialInputType = "file" }) => {
  const { settings } = useContext(SettingsContext);
  const [urlData, setUrlData] = useState("Upload URL");
  const [xpostData, setXpostData] = useState("Upload X-post");
  const [batchData, setBatchData] = useState("Batch upload X-posts");
  const [existingUrls, setExistingUrls] = useState([]);
  const [existingXposts, setExistingXposts] = useState([]);

  // Fetch existing URLs from urls.json
  React.useEffect(() => {
    const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/context?file=urls.json&action=list&mode=url`;
    fetch(api)
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result.items)) {
          setExistingUrls(result.items.map(url => typeof url === "string" ? url : url.name));
        } else {
          setExistingUrls([]);
        }
      })
      .catch(() => setExistingUrls([]));
  }, [settings.PROD_API.value, settings.Project.value]);

  // Fetch existing X-posts from x.json
  React.useEffect(() => {
    const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/context?file=x.json&action=list&mode=url`;
    fetch(api)
      .then((res) => res.json())
      .then((result) => {
        if (Array.isArray(result.items)) {
          setExistingXposts(result.items.map(url => typeof url === "string" ? url : url.name));
        } else {
          setExistingXposts([]);
        }
      })
      .catch(() => setExistingXposts([]));
  }, [settings.PROD_API.value, settings.Project.value]);

  const handleFileSubmit = (e) => {
    e.preventDefault();
    
    console.log("File upload initiated");
    let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/upload`;
    const formData = new FormData(e.target);
    fetch(api, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        console.log("File upload response:", data);
        e.target.reset();
        if (onUpload) onUpload();
      })
      .catch((error) => {
        console.error("Error uploading the file:", error);
      });
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    
    setUrlData("Uploading URL...");
    console.log("URL upload initiated");
    const url = e.target.url.value;
    if (!isSafeUrl(url)) {
      setUrlData("URL not allowed.");
      return;
    }
    if (existingUrls.includes(url)) {
      setUrlData("This URL has already been uploaded.");
      return;
    }
    let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/uploadurl?data=${encodeURIComponent(url)}`;
    fetch(api)
      .then((response) => response.text())
      .then((data) => {
        setUrlData(data);
        e.target.reset();
        if (onUpload) onUpload();
      })
      .catch((error) => {
        console.error("Error uploading the URL:", error);
      });
  };

  const handleXpostSubmit = (e) => {
    e.preventDefault();
    
    setXpostData("Uploading X-post...");
    console.log("X-post upload initiated");
    const url = e.target.xpost.value;
    if (!isValidXPostUrl(url)) {
      setXpostData("Invalid X-post URL. Use format: https://x.com/username/status/...");
      return;
    }
    if (existingXposts.includes(url)) {
      setXpostData("This X-post has already been uploaded.");
      return;
    }
    let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/uploadx?url=${encodeURIComponent(url)}`;
    fetch(api)
      .then((response) => response.text())
      .then((data) => {
        setXpostData(data);
        e.target.reset();
        if (onUpload) onUpload();
      })
      .catch((error) => {
        console.error("Error uploading the X-post:", error);
      });
  };

  const handleBatchSubmit = (e) => {
    e.preventDefault();
    
    setBatchData("Batch uploading X-posts...");
    console.log("Batch X-post upload initiated");
    const fileInput = e.target.file;
    const file = fileInput.files[0];
    if (!file) {
      setBatchData("Please select a file.");
      return;
    }
    // Validate file type - accept .json or .txt files
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".json") && !fileName.endsWith(".txt")) {
      setBatchData("Invalid file type. Please upload a .json or .txt file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/uploadx/batch`;
    fetch(api, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        setBatchData(data);
        e.target.reset();
        if (onUpload) onUpload();
      })
      .catch((error) => {
        console.error("Error batch uploading X-posts:", error);
        setBatchData("Error uploading file. Please check the file format.");
      });
  };

  const isSafeUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isValidXPostUrl = (url) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return false;
      const hostname = parsed.hostname.toLowerCase();
      // Accept both x.com and twitter.com
      if (!hostname.endsWith("x.com") && !hostname.endsWith("twitter.com")) return false;
      // Check for /status/ in the path
      const path = parsed.pathname.toLowerCase();
      return path.includes("/status/");
    } catch {
      return false;
    }
  };

  return (
    <>
      {/* File Upload Row */}
      <tr>
        <td className="upload-status">Upload file</td>
        <td>
          <form id="uploadFormFile" encType="multipart/form-data" onSubmit={handleFileSubmit}>
            <input
              name="file"
              className="form-control"
              type="file"
              id="formFile"
            />
          </form>
        </td>
        <td>
          <button className="btn btn-primary btn-sm" type="submit" form="uploadFormFile">
            Submit
          </button>
        </td>
      </tr>

      {/* URL Upload Row */}
      <tr>
        <td className="upload-status">{urlData}</td>
        <td>
          <form id="uploadFormUrl" encType="application/json" onSubmit={handleUrlSubmit}>
            <input
              name="url"
              className="form-control"
              type="url"
              id="formUrl"
              placeholder="Paste file URL here"
              required
            />
          </form>
        </td>
        <td>
          <button className="btn btn-primary btn-sm" type="submit" form="uploadFormUrl">
            Submit
          </button>
        </td>
      </tr>

      {/* X-post Upload Row */}
      <tr>
        <td className="upload-status">{xpostData}</td>
        <td>
          <form id="uploadFormXpost" encType="application/json" onSubmit={handleXpostSubmit}>
            <input
              name="xpost"
              className="form-control"
              type="url"
              id="formXpost"
              placeholder="Paste X-post URL here (https://x.com/.../status/...)"
              required
            />
          </form>
        </td>
        <td>
          <button className="btn btn-primary btn-sm" type="submit" form="uploadFormXpost">
            Submit
          </button>
        </td>
      </tr>

      {/* Batch X-post Upload Row */}
      <tr>
        <td className="upload-status">{batchData}</td>
        <td>
          <form id="uploadFormBatch" encType="multipart/form-data" onSubmit={handleBatchSubmit}>
            <input
              name="file"
              className="form-control"
              type="file"
              id="formFileBatch"
              accept=".json,.txt"
            />
            <small className="text-muted d-block mt-1">
              Upload a JSON file (array of URLs) or text file (one URL per line)
            </small>
          </form>
        </td>
        <td>
          <button className="btn btn-primary btn-sm" type="submit" form="uploadFormBatch">
            Submit
          </button>
        </td>
      </tr>
    </>
  );
};

export default Upload;
