import Navbar from "../components/Navbar";
import React, { useState, useRef, useContext, useEffect } from "react";
import { SettingsContext } from "../components/SettingsContext";

function Reload() {
  const { settings }  = useContext(SettingsContext);
  const [data, setData] = useState(null);

  const invoke_reload = (e) => {
    e.preventDefault();
    setData("Loading...")
    async function fetchData() {
      let api = `${settings.PROD_API}/prompt/${settings.Project}/reload`
      const response = await fetch(`${api}`);
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
