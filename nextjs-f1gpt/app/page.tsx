"use client";

import React, { useState } from "react";
import Image from "next/image";
import f1logo from "./assets/f1logo.jpeg";
import Bubble from "./components/Bubble";
import LoadingBubble from "./components/LoadingBubble";
import PromptSuggestionsRow from "./components/PromptSuggestionsRow";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const noMessages = messages.length === 0;

  const handleInputChange = (e) => setInput(e.target.value);

  const handlePrompt = (promptText) => {
    setInput(promptText);
    handleSubmit(null, promptText);
  };

  const handleSubmit = async (e, overrideInput = null) => {
    if (e) e.preventDefault();

    const userMessage = overrideInput || input;
    if (!userMessage.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      const chunk = decoder.decode(value || new Uint8Array(), { stream: true });
      fullText += chunk;

      setMessages((prev) => [
        ...updatedMessages,
        { role: "assistant", content: fullText },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <main className="layout">
      <div className="logo-box">
        <Image src={f1logo} width={150} height={150} alt="F1GPT LOGO" />
      </div>

      <div className="chat-box">
        <section className={noMessages ? "" : "populated"}>
          {noMessages ? (
            <>
              <p className="starter-text">
                The ultimate place for Formula 1 fans to get answers to their questions.
                Ask your questions below and let F1GPT do the rest.
              </p>
              <br />
              <PromptSuggestionsRow onPromptClick={handlePrompt} />
            </>
          ) : (
            <>
              {messages.map((message, index) => (
                <Bubble key={`message-${index}`} message={message} />
              ))}
              {isLoading && <LoadingBubble />}
            </>
          )}
        </section>

        <form onSubmit={handleSubmit}>
          <input
            className="question-box"
            onChange={handleInputChange}
            value={input}
            placeholder="Ask me something"
          />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </main>
  );
};

export default Home;
