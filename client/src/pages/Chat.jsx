import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Globals from "../components/Globals";
import Message from "../components/Message";
import Svg from "../components/Svg";
import "./Chat.css";
function Chat() {
  // this function opens the chat
  function openChart() {
    document.getElementById("assistant-chat").classList.add("show");
    document.getElementById("assistant-chat").classList.remove("hide");
  }

  // this function opens the chat
  function closeChart() {
    document.getElementById("assistant-chat").classList.add("hide");
    document.getElementById("assistant-chat").classList.remove("show");
  }

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
      message: "Hello there, I am your assistant. How can i help you today? ",
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

    let api = "http://192.168.2.200:5000/prompt/centric"
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

    fetch(api, {
      method: "POST",
      body: "prompt="+prompt,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
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
      <Navbar />
      <Globals />
      <div>
        <div id="assistant-chat" className="hide ai_chart">
          <div className="header-chat">
            <div className="head-home">
              <div className="info-avatar">
                <Svg />
              </div>
              <p>
                <span className="assistant-name"> Assistant</span>
                <br />
                <small>Online</small>
              </p>
            </div>
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
            <div className="blanter-msg">
              <input
                type="text"
                id="chat-input"
                placeholder="How can I help..."
                maxLength="400"
              />
              <a
                onClick={() => askAI('search')}
                href="#send_message"
                id="send-it"
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
              <a
                onClick={() => askAI('prompt')}
                href="#send_message"
                id="send-it"
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
            </div>
          </div>
          <a className="close-chat" href="#close" onClick={closeChart}>
            &times;
          </a>
        </div>
        <a
          onClick={openChart}
          className="blantershow-chat"
          href="#load_chart"
          title="Show Chat"
        >
          <Svg />
          Chat with Us
        </a>
      </div>
    </div>
  );
}

export default Chat;
