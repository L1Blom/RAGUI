import React, { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

const Upload = ({ onUpload, initialInputType = "file" }) => {
  const { settings } = useContext(SettingsContext);
  const [inputType, setInputType] = useState(initialInputType);
  const [data, setData] = useState(initialInputType === "file" ? "Upload file" : initialInputType === "url" ? "Upload URL" : "Upload X-post");
  const [existingUrls, setExistingUrls] = useState([]);

  // Fetch existing URLs when in URL or X-post mode
  React.useEffect(() => {
    if (inputType === "url" || inputType === "xpost") {
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
    }
  }, [inputType, settings.PROD_API.value, settings.Project.value]);

  const handleFileSubmit = (e) => {
    e.preventDefault();
    
    if (inputType === "file") {
      setData("Uploading file...");
      console.log("File upload initiated");
      let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/upload`;
      const formData = new FormData(e.target);
      fetch(api, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.text())
        .then((data) => {
          setData(data);
          e.target.reset();
          if (onUpload) onUpload();
        })
        .catch((error) => {
          console.error("Error uploading the file:", error);
        });
    } else if (inputType === "url") {
      setData("Uploading URL...");
      console.log("URL upload initiated");
      const url = e.target.url.value;
      if (!isSafeUrl(url)) {
        setData("URL not allowed.");
        return;
      }
      if (existingUrls.includes(url)) {
        setData("This URL has already been uploaded.");
        return;
      }
      let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/uploadurl?data=${encodeURIComponent(url)}`;
      fetch(api)
        .then((response) => response.text())
        .then((data) => {
          setData(data);
          e.target.reset();
          if (onUpload) onUpload();
        })
        .catch((error) => {
          console.error("Error uploading the URL:", error);
        });
    } else if (inputType === "xpost") {
      setData("Uploading X-post...");
      console.log("X-post upload initiated");
      const url = e.target.url.value;
      if (!isValidXPostUrl(url)) {
        setData("Invalid X-post URL. Use format: https://x.com/username/status/...");
        return;
      }
      if (existingUrls.includes(url)) {
        setData("This X-post has already been uploaded.");
        return;
      }
      let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/uploadx?url=${encodeURIComponent(url)}`;
      fetch(api)
        .then((response) => response.text())
        .then((data) => {
          setData(data);
          e.target.reset();
          if (onUpload) onUpload();
        })
        .catch((error) => {
          console.error("Error uploading the X-post:", error);
        });
    }
  };

  const handleToggle = () => {
    // Cycle through: file -> url -> xpost -> file
    const types = ["file", "url", "xpost"];
    const currentIndex = types.indexOf(inputType);
    const nextIndex = (currentIndex + 1) % types.length;
    const nextType = types[nextIndex];
    
    setInputType(nextType);
    setData(nextType === "file" ? "Upload file" : nextType === "url" ? "Upload URL" : "Upload X-post");
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
    <tr>
      <td className="upload-status">{data}</td>
      <td>
        {inputType === "file" ? (
          <form id="uploadForm" encType="multipart/form-data" onSubmit={handleFileSubmit}>
            <input
              name="file"
              className="form-control"
              type="file"
              id="formFile"
            />
          </form>
        ) : (
          <form id="uploadForm" encType="application/json" onSubmit={handleFileSubmit}>
          <input
            name="url"
            className="form-control"
            type="url"
            id="formUrl"
            placeholder={inputType === "xpost" ? "Paste X-post URL here (https://x.com/.../status/...)" : "Paste file URL here"}
            required
          />
          </form>
        )}
      </td>
      <td>
        <button className="btn btn-primary btn-sm" type="submit" form="uploadForm">
          Submit
        </button>
        <button
          className={`btn btn-secondary btn-sm`}
          type="button"
          onClick={handleToggle}
          style={{ marginLeft: "5px" }}
        >
          {inputType === "file" ? "Switch to URL" : inputType === "url" ? "Switch to X-post" : "Switch to File"}
        </button>
      </td>
    </tr>
  );
};

export default Upload;