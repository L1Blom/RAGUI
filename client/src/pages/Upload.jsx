import React from "react";
import Navbar from "../components/Navbar";
import { useState } from "react";
import myConfig from "../components/config";

function Upload() {
  const [data, setData] = useState("Choose file to upload");
  const handleFileSubmit = (e) => {
    e.preventDefault();
    setData("Uploading file...")
    const formData = new FormData(e.target);
    let api = `${myConfig.API}/prompt/${myConfig.Project}/upload`

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
    <div>
      <Navbar />
      <div className="container pt-5">
        <form encType="multipart/form-data" onSubmit={handleFileSubmit}>
          <div className="mb-3">
            <label htmlFor="formFile" className="form-label">
              {data}
            </label>
            <input
              name="file"
              className="form-control"
              type="file"
              id="formFile"
            />
          </div>
          <div className="form-group">
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Upload;
