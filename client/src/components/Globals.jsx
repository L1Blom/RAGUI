import React from "react";
import { useState } from "react";
import myConfig from "../components/config";

function Globals() {

  const [provider, setProvider] = useState(null);
  const [llm, setLlm] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const invoke_globals = () => {
    async function fetchData() {
      let api = `${myConfig.API}/prompt/${myConfig.Project}/globals`
      const response = await fetch(
        `${api}`
      );
      return response.json();
    }

    fetchData().then(result => {
      setProvider(result['USE_LLM'])
      setLlm(result['ModelText'])
      setTemperature(result['Temperature'])
    });
  };
  if (provider == null) {
    invoke_globals();
  }
  return (
    <div className="container pt-5">
      <table>
        <thead>
          <tr><th width="10%">Topic</th><th>Value</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Project</td><td>{myConfig.Project}</td>
          </tr>
          <tr>
            <td>Provider</td><td>{provider}</td>
          </tr>
          <tr>
            <td>LLM</td><td>{llm}</td>
          </tr>
          <tr>
            <td>Temperature</td><td>{temperature}</td>
          </tr>
          <tr>
            <td>Max. results</td><td>{myConfig.Similar}</td>
          </tr>
          <tr>
            <td>Max. score</td><td>{myConfig.Score}</td>
          </tr>
          <tr>
            <td>Server API</td><td>{myConfig.API}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Globals;
