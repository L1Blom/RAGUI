import React, { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

const Upload = ({ onUpload, initialInputType = "file" }) => {
  const { settings } = useContext(SettingsContext);
  const [inputType, setInputType] = useState(initialInputType);
  const [data, setData] = useState(initialInputType === "file" ? "Upload file" : "Upload URL");
  const [existingUrls, setExistingUrls] = useState([]);

  // Fetch existing URLs when in URL mode
  React.useEffect(() => {
    if (inputType === "url") {
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
    setData(inputType === "file" ? "Uploading file..." : "Uploading URL...");

    if (inputType === "file") {
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
    } else {
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
    }
  };

  const handleToggle = () => {
    setInputType(inputType === "file" ? "url" : "file");
    setData(inputType === "file" ? "Upload URL" : "Upload file");
  };

  const isSafeUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:"; //&& parsed.hostname.endsWith("trusted.com");
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
            placeholder="Paste file URL here"
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
          {inputType === "file" ? "Switch to URL" : "Switch to File"}
        </button>
      </td>
    </tr>
  );
};

export default Upload;