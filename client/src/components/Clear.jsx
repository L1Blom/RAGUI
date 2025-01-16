import React, { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

function Clear() {
  const { settings } = useContext(SettingsContext);
  const [data, setData] = useState("");

  const invoke_clear = (e) => {
    e.preventDefault();
    setData("Clearing history...")
    async function fetchData() {
      let api = `${settings.PROD_API.invoke_clear}/prompt/${settings.Project.value}/clear`
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
    <>
      <tr className="settings_row">
        <td>Clear history</td><td>{data}</td>
        <td><form onSubmit={invoke_clear}>
          <div className="form-group">
            <button className="btn btn-primary btn-sm" type="submit">Clear</button>
          </div>
        </form>
        </td>
      </tr>
    </>
  );
}
export default Clear;
