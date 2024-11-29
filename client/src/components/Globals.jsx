import React from "react";
import { useState } from "react";

function Globals() {

  const [provider, setProvider] = useState(null);
  const [llm, setLlm] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const invoke_globals = () => {
    async function fetchData() {
      const response = await fetch(
        "http://192.168.2.200:5000/prompt/centric/globals"
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
      <div>Provider: { provider }</div>
      <div>LLM: { llm }</div>
      <div>Temperature: { temperature }</div>
    </div>
  );
}

export default Globals;
