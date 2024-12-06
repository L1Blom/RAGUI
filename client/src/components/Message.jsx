import React from "react";
import myConfig from "./config";
import ReactMarkdown from "react-markdown";

function Message(props) {
  let dataRoll = props.position === "left_bubble" ? "ASSISTANT" : "USER";
  let thisClass = `chat-bubble ${props.position}`;
  let data = props.data
  let myTime = new Date().getTime()
  let api = myConfig.API + '/prompt/' + myConfig.Project
  const rows = () => {
    if (data != null) {
      let output = data.filter(row => row.score >= myConfig.Score)
        .map(({ metadata, page_content, score }, index) => {
          let href = api + '/file?file=' + metadata.source
          let tpage = ''
          let page = metadata.page
          if (typeof page === 'number') {
            page = parseInt(metadata.page) + 1
            tpage = 'Page '+page+' from: '
            href = href + '&time=' + myTime + index + '#page=' + page
          } else {
            page = 1
          }
          return <div key={index}>
            <table width="100%">
              <thead>
                <tr><th width="2%">No.</th><th align="middle" width="10%"> Score / Page</th><th>Content</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td  valign="top" width="2%">{index+1}.</td><td valign="top" align="middle" width="10%">{score.toFixed(2)} / {page}</td>
                  <td><ReactMarkdown>{page_content}</ReactMarkdown></td>
                </tr>
                <tr>
                  <td valign="top" width="2%"></td><td colSpan={2}><a target="RAGUI" href={href}>{tpage} {metadata.source}</a></td>
                </tr>
              </tbody>
            </table>
            <br />
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
