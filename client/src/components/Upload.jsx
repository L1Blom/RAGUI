import React, { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

function Upload() {
  const { settings } = useContext(SettingsContext);
  const [data, setData] = useState("Upload file");

  const handleFileSubmit = (e) => {
    e.preventDefault();
    setData("Uploading file...")
    const formData = new FormData(e.target);
    let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/upload`

    // Send formData to your server using an HTTP request (e.g., axios or fetch).
    // Replace 'YOUR_UPLOAD_API_ENDPOINT' with your actual API endpoint.
    fetch(`${api}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        // Handle the response from the server.
        console.log(data);
        setData(data)
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
}

export default Upload;