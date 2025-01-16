import React, { useContext } from "react";
import { SettingsContext } from "../components/SettingsContext";
import Navbar from "../components/Navbar";
import Models from "../components/Models";
import Temperature from "../components/Temperature";
import Score from "../components/Score";
import Similar from "../components/Similar";
import Clear from "../components/Clear";
import Reload from "../components/Reload";
import Chunk from "../components/Chunk";
import Embeddings from "../components/Embeddings";

function Settings() {

  const { settings } = useContext(SettingsContext);

  return (
    <div>
      <Navbar />
      <table  border={1} width={'100%'}>
        <thead>
          <tr className="settings_row">
            <th width={'25%'}>Topic</th><th>Value</th><th>Set</th></tr>
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
            <td></td>
          </tr>
          <Temperature />
          <Similar />
          <Score />
          <Chunk />
          <Clear />
          <Reload />
          <Models />
          <Embeddings />
        </tbody>
      </table>
    </div>
  );
}

export default Settings;
