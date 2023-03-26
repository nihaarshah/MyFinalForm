import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";


export default function Home() {
  const [prompt, setPrompt] = useState("");
  
  const [URL, setURL] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");


const getResponseFromModal = async () => {
    setResponse("");
    console.log("Processing your question...");
    setIsLoading(true);

  const params2 = new URLSearchParams({
    'query': String(prompt),
    'url' : String(URL)
  });
  
  const response = await fetch(`https://nihaarshah--example-kasakai-qanda.modal.run?${params2}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
    const data = await response.json();
    
    console.log(data);
    setResponse(data);
  };


  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <div className={styles.description}>
          <h1 className={styles.title}> <div> Question Answer my website </div></h1>
        </div>

        <div>
          <textarea 
            className={styles.center}
            row="15" 
            cols="50"
            placeholder="Enter a URL"
            value = {URL}
            onChange={(e) => setURL(e.target.value)}
          />
        </div>

        <div>
          <textarea 
            className={styles.center}
            row="15" 
            cols="50"
            placeholder="Your answer will appear here"
            value= {isLoading ? response : 'Processing your question' }
            readOnly={true}
          />
        </div>

        <div className={styles.center}>
          <textarea
            className={styles.promptInput}
            placeholder="Enter a prompt"
            onChange={(e) => setPrompt(e.target.value)}
            value = {prompt}
            row="5"
            cols="50"
          />

        <div>
          <button className={styles.button} onClick={getResponseFromModal}>
            Get Response
          </button>
        </div>

        </div>
      </main>
    </>
  );
}

