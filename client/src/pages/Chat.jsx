import Navbar from "../components/Navbar";
import Message from "../components/Message";
import React, { useState, useContext} from "react";
import { SettingsContext } from "../components/SettingsContext";

import "./Chat.css";

function Chat() {
  // this function opens the chat
  const { settings } = useContext(SettingsContext);

  function chat_scroll_up() {
    let elem = document.querySelector(".start-chat");
    setTimeout(() => {
      elem.scrollTo({
        top: elem.scrollHeight,
        behavior: "smooth",
      });
    }, 200);
  }

  const [chatMessages, setchatMessages] = useState([
    {
      position: "left_bubble",
      message: "Hello there, I am your assistant. How can I help you today? ",
      score: "",
      page_content: ""
    },
  ]);

  function askAI(mode) {
    var prompt_input = document.getElementById("chat-input");
    var prompt = prompt_input.value;
    if (prompt.replaceAll(" ", "") === "") {
      return;
    }
    prompt_input.value = "";

    let api = `${settings.PROD_API.value}/prompt/${settings.Project.value}`
    if (mode === 'search') {
      api = `${api}/search`
    }
    const messages = [
      ...chatMessages,
      {
        position: "right_bubble",
        message: prompt,
        data: null
      }
    ];
    setchatMessages(messages);
    chat_scroll_up()

    var postData = {
      method: "POST",
      body: "prompt=" + prompt,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      }
    }
    if (mode === 'search') {
      postData.body = postData.body + "&similar=" + settings.Similar.value
    }
    fetch(api, postData)
      .then((response) => {
        if (mode === 'prompt') {
          return response.text()
        } else {
          return response.json()
        }
      })
      .then((resData) => {
        let myMessage = ""
        let data = null
        if (mode === 'prompt') {
          myMessage = resData
        } else {
          data = resData
        }
        const messages = [
          ...chatMessages,
          {
            position: "right_bubble",
            message: prompt,
          },
          {
            position: "left_bubble",
            message: myMessage,
            data: data
          },
        ];
        setchatMessages(messages);
        chat_scroll_up()
      })
      .catch((err) => {
        console.log("-->>")
        console.log(err)
      });
  }

  return (
    <div>
      <div className="pageFrame">
        <Navbar />
        <div className="small bg-light">
          Project: <b>{settings.Project.value} </b>
          - Model: <b>{settings.ModelText.value} </b>
          - Temperature: <b>{settings.Temperature.value} </b>
          - Similar: <b>{settings.Similar.value} </b>
          - Score: <b>{settings.Score.value}</b>
        </div>
        <div className="small bg-light">
          Chunk size: <b>{settings.ChunkSize.value} </b>
          - Chunk overlap: <b>{settings.ChunkOverlap.value} </b>
          - # Chunks: <b>{settings.NoChunks.value}</b>
        </div>
        <div className="start-chat">
          <div className="assistant-chat-body">
            {chatMessages.map((chatMessage, key) => (
              <Message
                key={key}
                position={chatMessage.position}
                message={chatMessage.message}
                data={chatMessage.data}
              />
            ))}
          </div>
        </div>
        <div className="chat-input">
          <div className="blanter-msg">
            <input
              type="text"
              id="chat-input"
              placeholder="How can I help..."
              maxLength="400"
            />
            <a
              onClick={() => askAI('prompt')}
              href="#send_message"
              id="send-it"
              title="Process prompt!"
              className="send_it"
            >
              <svg
                viewBox="4 3 15 15"
                fill="currentColor"
                height="1em"
                width="1em"
              >
                <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16.5 15.5v-10a2 2 0 00-2-2h-8a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2zM7.5 8.5h5M7.5 10.5h6M7.5 12.5h3" />
                </g>
              </svg>
            </a>
            <a
              onClick={() => askAI('search')}
              href="#send_message"
              id="send-it"
              title="Show context documents"
              className="send_it"
            >
              <svg
                viewBox="4 3 15 15"
                fill="currentColor"
                height="1em"
                width="1em"
              >
                <g
                  fill="none"
                  fillRule="evenodd"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16.5 15.5v-10a2 2 0 00-2-2h-8a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2zM9.5 7.5h5M6.5 7.5h1M9.5 10.5h5M6.5 10.5h1M9.5 13.5h5M6.5 13.5h1" />
                </g>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
