import React, { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

function Reload() {
  const { settings }  = useContext(SettingsContext);
  const [data, setData] = useState("");

  const invoke_reload = (e) => {
    e.preventDefault();
    setData("Loading...")
    async function fetchData() {
      let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}/reload`
      const response = await fetch(`${api}`);
      const data = await response.text();
      const results = data;
      setData(results);
    }
    fetchData();
  };
  
  return (
    <tr className="settings_row">
      <td>Reload documents</td>
      <td>{data}</td>
      <td>
        <form onSubmit={invoke_reload}>
          <div className="form-group">
            <button className="btn btn-primary btn-sm" type="submit">Reload</button>
          </div>
        </form>
        </td>
    </tr>
  );
}
export default Reload;
