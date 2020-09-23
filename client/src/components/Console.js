import React from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Console.css";

const Console = ({ consoleText }) => {
  const newLine = (consoleText) => {
    return consoleText.split("\n").map((data, index) => (
      <span key={index}>
        {data}
        <br />
      </span>
    ));
  };

  return (
    <ScrollToBottom className="console" >{newLine(consoleText)}</ScrollToBottom>
  );
};
export default Console;
