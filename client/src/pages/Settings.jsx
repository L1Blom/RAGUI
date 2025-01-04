import React, { useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";
import Models from "./Models";
import Temperature from "./Temperature";
import Upload from "./Upload";
import Score from "../components/Score";
import Similar from "../components/Similar";
import Clear from "./Clear";
import Reload from "./Reload";

function Settings() {

  const { settings } = useContext(SettingsContext);

  return (
    <div>
      <Navbar />
      <div className="container pt-5">
        <table border={1}>
          <thead>
            <tr className="settings_row"><th>Topic</th><th>Value</th><th>Set</th></tr>
          </thead>
          <tbody>
            <tr className="settings_row">
              <td>Project</td><td>{settings.Project}</td><td></td>
            </tr>
            <tr className="settings_row">
              <td>Provider</td><td>{settings.Provider}</td><td></td>
            </tr>
            <tr className="settings_row">
              <td>Server API</td><td>{settings.PROD_API}</td>
            </tr>
            <Similar />
            <Score />
            <Clear />
            <Reload />
            <Models />
            <Temperature />
            <Upload />
          </tbody>
        </table>
        </div>
    </div>
  );
}

export default Settings;
