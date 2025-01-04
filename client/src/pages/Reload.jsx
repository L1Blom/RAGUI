import React, { useState, useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";

function Reload() {
  const { settings }  = useContext(SettingsContext);
  const [data, setData] = useState("Use button to reload the documents");

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
    <tr className="settings_row">
      <td></td><td></td>
      <td>
        <form onSubmit={invoke_reload}>
          <div className="form-group">
            <button className="btn btn-primary" type="submit">Reload</button>
          </div>
          <div>
            <div>{data}</div>
          </div>
        </form>
        </td>
    </tr>
  );
}
export default Reload;
