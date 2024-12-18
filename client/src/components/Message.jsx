import React from "react";
import myConfig from "./config";
import ReactMarkdown from "react-markdown";
import { useState} from "react";


function Message(props) {
  let dataRoll = props.position === "left_bubble" ? "ASSISTANT" : "USER";
  let thisClass = `chat-bubble ${props.position}`;
  let data = props.data
  let myTime = new Date().getTime()
  let api = myConfig.PROD_API + '/prompt/' + myConfig.Project
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const toggleContentExpansion = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  const rows = () => {
    if (data != null) {
      let output = data.filter(row => row.score >= myConfig.Score)
        .map(({ metadata, page_content, score }, index) => {
          let href = api + '/file?file=' + metadata.source
          let tpage = ''
          let page = metadata.page
          if (typeof page === 'number') {
            page = parseInt(metadata.page) + 1
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

  return (
    <div data-role={dataRoll} className="bubble-container">
      <div className={thisClass}>
        <div className="text_message">
          {props.message.replace(/<\/?[^>]+(>|$)/g, "")}
          {rows()}
        </div>
      </div>
      <div className="clear"></div>
    </div>
  );
}
export default Message;
