import React from "react";

function Message(props) {
  let dataRoll = props.position === "left_bubble" ? "ASSISTANT" : "USER";
  let thisClass = `chat-bubble ${props.position}`;
  let data = props.data
  const rows = () => {
    if (data != null) {
      return data.map(({ metadata, page_content, score }) => {
        return <div style={{ border: 'solid thin' }}>
          <table width="100%">
          <tr><th width="10%">Page</th><th>Source</th></tr>
          <tr>
              <td  width="10%">{metadata.page}</td><td>{metadata.source}</td>
            </tr>
          </table>
          <table width="100%">
            <tr>
              <th width="10%">Score</th><th>Content</th></tr>
            <tr>
              <td width="10%">{score.toFixed(2)}</td><td>{page_content}</td>
            </tr>
          </table>
        </div>
      })
    } else {
      return <div></div>
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
