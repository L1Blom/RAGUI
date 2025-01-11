import React, { useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";
import Models from "../components/Models";
import Temperature from "../components/Temperature";
import Upload from "../components/Upload";
import Score from "../components/Score";
import Similar from "../components/Similar";
import Clear from "../components/Clear";
import Reload from "../components/Reload";
import Chunk from "../components/Chunk";

function Settings() {

  const { settings } = useContext(SettingsContext);

  return (
    <div>
      <Navbar />
      <div className="container pt-5">
        <table border={1}>
          <thead>
            <tr className="settings_row"><th width={'25%' }>Topic</th><th>Value</th><th>Set</th></tr>
          </thead>
          <tbody>
            <tr className="settings_row">
              <td className="settings-cell">Project</td>
              <td className="settings-cell">{settings.Project.value}</td>
              <td></td>
            </tr>
            <tr className="settings_row">
              <td className="settings-cell">Provider</td>
              <td className="settings-cell">{settings.Provider.value}</td>
              <td></td>
            </tr>
            <tr className="settings_row">
              <td className="settings-cell">Server API</td>
              <td className="settings-cell">{settings.PROD_API.value}</td>
            </tr>
            <Temperature />
            <Similar />
            <Score />
            <Chunk />
            <tr className="settings_row">
              <td className="settings-cell">No. chunks</td>
              <td className="settings-cell">{settings.NoChunks.value}</td>
            </tr>
            <Clear />
            <Reload />
            <Models />
            <Upload />
          </tbody>
        </table>
        </div>
    </div>
  );
}

export default Settings;
