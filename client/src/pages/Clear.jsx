import React, { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";

function Clear() {
  const { settings }  = useContext(SettingsContext);
  const [data, setData] = useState(null);

  const invoke_clear = (e) => {
    e.preventDefault();
    setData("Clearing history...")
    async function fetchData() {
      let api = `${settings.PROD_API}/prompt/${settings.Project}/clear`
      const response = await fetch(
        `${api}`
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
        <form onSubmit={invoke_clear}>
          <div className="form-group">
            <button className="btn btn-primary" type="submit">Clear history</button>
          </div>
          <div className="container pt-5">
            <div>{data}</div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Clear;
