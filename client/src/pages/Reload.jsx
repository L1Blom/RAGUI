import React from "react";
import { useState } from "react";
import Navbar from "../components/Navbar";

function Reload() {
  const [data, setData] = useState(null);
  const invoke_reload = (e) => {
    e.preventDefault();
    setData("Loading...")
    async function fetchData() {
      const response = await fetch(
        "http://192.168.2.200:5000/prompt/centric/reload"
      );
      const data = await response.text();
      const results = data;
      setData(results);
    }
    fetchData();
  };
  
  return (
    <div>
      <Navbar />
      <div className="container pt-5">
        <form onSubmit={invoke_reload}>
          <div className="form-group">
            <button className="btn btn-primary" type="submit">Reload</button>
          </div>
          <div className="container pt-5">
            <div>{data}</div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Reload;
