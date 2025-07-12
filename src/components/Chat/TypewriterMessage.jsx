// TypewriterMessage.tsx
import React, { useEffect, useState } from "react";

const TypewriterMessage = ({ text, onDone, speed = 18 }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayed}</span>;
};

export default TypewriterMessage;
