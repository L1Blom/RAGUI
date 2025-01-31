import Navbar from "../components/Navbar";
import Message from "../components/Message";

import React, { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../components/SettingsContext";

import "./Chat.css";

function Chat() {
  // this function opens the chat
  const { settings } = useContext(SettingsContext);

  function saveMessages(messages) {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }

  function loadMessages() {
    const messages = localStorage.getItem('chatMessages');
    return messages ? JSON.parse(messages) : [];
  }

  function clearMessages() {
    localStorage.removeItem('chatMessages');
    setChatMessages(initialMessage);
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

  function last_prompt() {
    var prompt_input = document.getElementById("chat-input");
    if (chatMessages.length < 2) {
      return;
    }
    var last_message = chatMessages[chatMessages.length - 2].message;
    prompt_input.value = last_message;
  }

  const initialMessage = [{
    position: "left_bubble",
    message: "Hello there, I am your assistant. How can I help you today? ",
    score: "",
    page_content: ""
  }]

  const savedMessages = loadMessages();
  const [chatMessages, setChatMessages] = useState(
    savedMessages.length === 0 ? initialMessage : savedMessages
  );

  useEffect(() => {
    saveMessages(chatMessages);
    console.log("chatMessages updated");
  }, [chatMessages]);

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
    setChatMessages(messages);
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
        setChatMessages(messages);
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
              <svg viewBox="0 2 28 28" fill="none">
                <g id="Page-1" stroke="currentColor" strokeWidth="1" fill="none" fillRule="evenodd">
                  <path fillRule="evenodd" clipRule="evenodd" d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z" fill="currentColor">
                  </path>
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
              <svg viewBox="0 -4 20 20" version="1.1" fill="currentColor">
                <g id="Page-1" stroke="currentColor" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round"
                    strokeLinejoin="round" />
                  <g id="SVGRepo_iconCarrier">
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="currentColor" fillRule="evenodd">
                      <g id="Dribbble-Light-Preview" transform="translate(-260.000000, -4563.000000)" fill="currentColor">
                        <g id="icons" transform="translate(56.000000, 160.000000)">
                          <path d="M216,4409.00052 C216,4410.14768 215.105,4411.07682 214,4411.07682 C212.895,4411.07682 212,4410.14768 212,4409.00052 C212,4407.85336 212.895,4406.92421 214,4406.92421 C215.105,4406.92421 216,4407.85336 216,4409.00052 M214,4412.9237 C211.011,4412.9237 208.195,4411.44744 206.399,4409.00052 C208.195,4406.55359 211.011,4405.0763 214,4405.0763 C216.989,4405.0763 219.805,4406.55359 221.601,4409.00052 C219.805,4411.44744 216.989,4412.9237 214,4412.9237 M214,4403 C209.724,4403 205.999,4405.41682 204,4409.00052 C205.999,4412.58422 209.724,4415 214,4415 C218.276,4415 222.001,4412.58422 224,4409.00052 C222.001,4405.41682 218.276,4403 214,4403" id="view_simple-[#815]">
                          </path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </a>
            <a
              onClick={() => last_prompt()}
              href="#last_prompt"
              id="send-it"
              title="Fill in last prompt"
              className="send_it"
            >
              <svg viewBox="-5 -4 28 28">
                <g id="Page-1" stroke="currentColor" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g id="Dribbble-Light-Preview" transform="translate(-302.000000, -7080.000000)" fill="currentColor">
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path d="M260,6930 C260,6933 257.308,6936 254,6936 C250.692,6936 248,6933.308 248,6930 C248,6926.692 250.692,6924 254,6924 L254,6926 L259,6923 L254,6920 L254,6922 C249.582,6922 246,6925.582 246,6930 C246,6934.418 249.582,6938 254,6938 C258.418,6938 262,6935 262,6930 L260,6930 Z" id="arrow_repeat-[#236]">
                      </path>
                    </g>
                  </g>
                </g>
              </svg>
            </a>
            <a
              onClick={() => clearMessages()}
              href="#clear_message"
              id="send-it"
              title="Clear messages"
              className="send_it"
            >
              <svg viewBox="-1 -4 28 28">
              <g id="Page-1" stroke="currentColor" strokeWidth="1" fill="currentColor" fillRule="evenodd">
                  <g id="Dribbble-Light-Preview" transform="translate(-60.000000, -919.000000)" fill="currentColor">
                    <g id="icons" transform="translate(56.000000, 160.000000)">
                      <path d="M13.9577278,759 C7.99972784,759 3.26472784,764.127 4.09472784,770.125 C4.62372784,773.947 7.52272784,777.156 11.3197278,778.168 C12.7337278,778.545 14.1937278,778.625 15.6597278,778.372 C16.8837278,778.16 18.1397278,778.255 19.3387278,778.555 L20.7957278,778.919 L20.7957278,778.919 C22.6847278,779.392 24.4007278,777.711 23.9177278,775.859 C23.9177278,775.859 23.6477278,774.823 23.6397278,774.79 C23.3377278,773.63 23.2727278,772.405 23.5847278,771.248 C23.9707278,769.822 24.0357278,768.269 23.6887278,766.66 C22.7707278,762.415 18.8727278,759 13.9577278,759 M13.9577278,761 C17.9097278,761 21.0047278,763.71 21.7337278,767.083 C22.0007278,768.319 21.9737278,769.544 21.6547278,770.726 C20.3047278,775.718 24.2517278,777.722 19.8237278,776.614 C18.3507278,776.246 16.8157278,776.142 15.3187278,776.401 C14.1637278,776.601 12.9937278,776.544 11.8347278,776.236 C8.80772784,775.429 6.49272784,772.863 6.07572784,769.851 C5.40472784,764.997 9.26872784,761 13.9577278,761 L13.9577278,761" id="message-[#1579]">
                      </path>
                    </g>
                  </g>
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
