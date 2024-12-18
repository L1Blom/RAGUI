import React, { useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";

function Settings() {

  const { settings } = useContext(SettingsContext);
  console.log(settings)
  return (
    <div>
      <Navbar/>
      <div className="container pt-5">
        <table>
          <thead>
            <tr><th width="40%">Topic</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Project</td><td>{settings.Project}</td>
            </tr>
            <tr>
              <td>Provider</td><td>{settings.Provider}</td>
            </tr>
            <tr>
              <td>LLM</td><td>{settings.ModelText}</td>
            </tr>
            <tr>
              <td>Temperature</td><td>{settings.Temperature}</td>
            </tr>
            <tr>
              <td>Max. results</td><td>{settings.Similar}</td>
            </tr>
            <tr>
              <td>Max. score</td><td>{settings.Score}</td>
            </tr>
            <tr>
              <td>Server API</td><td>{settings.PROD_API}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Settings;
