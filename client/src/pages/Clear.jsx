import React, { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";

function Clear() {
  const { settings } = useContext(SettingsContext);
  const [data, setData] = useState("Use button to clear history");

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
    <tr className="settings_row">
      <td></td><td></td>
      <td><form onSubmit={invoke_clear}>
        <div className="form-group">
          <button className="btn btn-primary" type="submit">Clear history</button>
        </div>
        <div>
          <div>{data}</div>
        </div>
      </form>
      </td>
    </tr>
  );
}
export default Clear;
