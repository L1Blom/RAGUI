import React, { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

const Upload = ({ onUpload }) => {
  const { settings } = useContext(SettingsContext);
  const [data, setData] = useState("Upload file");

  const handleFileSubmit = (e) => {
    e.preventDefault();
    setData("Uploading file...");
    const formData = new FormData(e.target);
    let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/upload`;

    fetch(`${api}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        setData(data);
        // Clear the file input field
        e.target.reset();
        // Call onUpload after a successful upload
        if (onUpload) {
          onUpload();
        }
      })
      .catch((error) => {
        console.error("Error uploading the file:", error);
      });
  };

  return (
    <tr>
      <td className="upload-status">{data}</td>
      <td>
        <form id="uploadForm" encType="multipart/form-data" onSubmit={handleFileSubmit}>
          <input
            name="file"
            className="form-control"
            type="file"
            id="formFile"
          />
        </form>
      </td>
      <td>
        <button className="btn btn-primary btn-sm" type="submit" form="uploadForm">
          Submit
        </button>
      </td>
    </tr>
  );
};

export default Upload;