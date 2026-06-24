import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useState, useContext } from "react";
import { SettingsContext } from "./SettingsContext";

function Message(props) {
  const { settings } = useContext(SettingsContext);
  let dataRoll = props.position === "left_bubble" ? "ASSISTANT" : "USER";
  let thisClass = `chat-bubble ${props.position}`;
  let data = props.data
  let myTime = new Date().getTime()
  let api = settings.PROD_API.value + '/prompt/' + settings.Project.value
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const toggleContentExpansion = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  const downloadMarkdown = () => {
    const raw = props.message || "";
    const fileBase = window.location.origin + api;
    const text = raw
      .replace(/https?:\/\/(?:x|twitter)\.com\/[^\s\)\[]+\/status\/\d+[^\s\)\[]*/g, (url) => `[post](${url})`)
      .replace(/\[\[IMG:([^\]]+)\]\]/g, (match, path) => `![image](${fileBase}/file?file=${path})`);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `answer_${stamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const format = (message) => {
    if (props.position === "right_bubble") {
      return props.message
    }
    let hasImages = false;
    const processed = message
      .replace(/https?:\/\/(?:x|twitter)\.com\/[^\s\)\[]+\/status\/\d+[^\s\)\[]*/g, (url) => `[post](${url})`)
      .replace(/\[\[IMG:([^\]]+)\]\]/g, (match, path) => {
        hasImages = true;
        return `<a href="${api}/file?file=${path}" target="_blank" rel="noopener noreferrer"><img class="inline-post-img" src="${api}/file?file=${path}" alt="" /></a>`;
      });
    const match = processed.match(/<think>(.*?)<\/think>/sg);
    if (match) {
      const reasoning = match
        .map(item => item.replace(/<think>/, "")
          .replace(/<\/think>/, ""))
        .join(' ');
      const remainingMessage = processed.replace(/<think>.*?<\/think>/sg, "");
      return (
        <div>
          <div className="collapsible-container">
            <div
              className="collapsible-header"
              onClick={(e) => {
                const content = e.target.nextElementSibling;
                content.style.display = content.style.display === "none" ? "block" : "none";
              }}
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            >
              Reasoning
            </div>
            <div className="collapsible-content" style={{ display: "none", fontStyle: "italic" }}>
              Reasoning: {reasoning}
            </div>
          </div>
          <div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={hasImages ? [rehypeRaw] : undefined}>
              {remainingMessage}
            </ReactMarkdown>
          </div>
        </div>
      );
    } else if (hasImages) {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {processed}
        </ReactMarkdown>
      );
    } else {
      const pattern = /[\w_-]+\.(jpeg|jpg|png|gif|bmp|webp|mp4|avi|mov|wmv|flv|mkv|mp3|wav|ogg|pdf|doc|ppt|xls|txt|docs|pptx|xlsx)/sg;
      const match = message.match(pattern);
      if (match) {
        return (
          <label>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} // Enable raw HTML rendering
            >
              {message.replace(pattern, (match) => {
                const [name, ext] = match.split('.');
                if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
                  return `<video class="media-hover" width="80%" controls><source src="${api}/file?file=images/${match}" type="video/${ext}"></video>`;
                }
                if (['mp3', 'wav', 'ogg'].includes(ext)) {
                  return `<audio class="media-hover" width="80%" controls><source src="${api}/file?file=images/${match}" type="audio/${ext}"></audio>`;
                }
                if (ext === 'pdf') {
                  return `<iframe class="media-ihover" width="80%" height="500px" src="${api}/file?file=${match}" title="${name}"></iframe>`;
                }
                if (['docx', 'doc'].includes(ext)) {
                  return `<iframe class="media-ihover" width="80%" height="500px" src="${api}/file?file=${match}" title="${name}"></iframe>`;
                }
                if (['pptx', 'ppt'].includes(ext)) {
                  return `<iframe class="media-ihover" width="80%" height="500px" src="${api}/file?file=${match}" title="${name}"></iframe>`;
                }
                if (['xlsx', 'xls'].includes(ext)) {
                  return `<iframe class="media-ihover" width="80%" height="500px" src="${api}/file?file=${match}" title="${name}"></iframe>`;
                }
                if (ext === 'txt') {
                  return `<iframe class="media-ihover" width="80%" height="500px" src="${api}/file?file=${match}" title="${name}"></iframe>`;
                }
                if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
                  return `<img class="media-hover" src="${api}/file?file=images/${match}" alt="" title="${name}" width="80%" />`;
                }
                return match; // Return the original match if no condition is met
              })}
            </ReactMarkdown>
          </label>
        );
      } else {
        return (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message}
          </ReactMarkdown>
        );
      }
    }
  };

  const rows = () => {
    if (data != null) {
      if (data.url !== undefined) {
        return <div>
          <a target="RAGUI" href={data.url}>
            <img width={'100%'} alt='from prompt' src={data.url} />
          </a>
        </div>
      } else {
        let output = data.filter(row => row.score >= settings.Score.value)
          .map(({ metadata, page_content, score }, index) => {
            let href = api + '/file?file=' + metadata.source
            let tpage = ''
            let page = 1
            if (metadata.page !== undefined) {
              page = metadata.page
            }
            if (metadata.page_number !== undefined) {
              page = metadata.page_number
            }

            if (typeof page === 'number') {
              page = parseInt(page) + 1
              tpage = 'Page ' + page + ' from: '
              href = href + '&time=' + myTime + index + '#page=' + page
            } else {
              page = 1
            }
            return <div key={index}>
              <table width="100%">
                <thead>
                  <tr>
                    <th width="4%">No.</th>
                    <th valign="top" width="6%">Score</th>
                    <th
                      className="toggle-content"
                      onClick={toggleContentExpansion}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      {isContentExpanded ? "Content (-)" : "Content (+)"}
                    </th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td valign="top">{index + 1}.</td>
                    <td valign="top">{score.toFixed(2)}</td>
                    <td>
                      <div className={`page-content ${isContentExpanded ? "expanded" : "collapsed"
                        }`}><ReactMarkdown>{page_content}</ReactMarkdown></div>

                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3}><a target="RAGUI" href={href}>{tpage} {metadata.source}</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          })
        if (output.length > 0) {
          return output
        } else {
          return <div>No relevant context data found</div>
        }
      }
    }
  }

  return (
    <div data-role={dataRoll} className="bubble-container">
      <div className={thisClass}>
        <div className="text_message">
          {data ?
            rows() :
            format(props.message)
          }
        </div>
        {props.position === "left_bubble" && !data && props.message && (
          <button
            className="msg-download-btn"
            onClick={downloadMarkdown}
            title="Download as Markdown"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}
      </div>
      <div className="clear"></div>
    </div>
  );
}
export default Message;
