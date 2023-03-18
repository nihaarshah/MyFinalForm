import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");


  const getResponseFromOpenAI = async () => {
    setResponse("");
    console.log("Getting response from OpenAI...");
    setIsLoading(true);
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    const data = await response.json();
    setIsLoading(false);
    console.log(data.text);
    setResponse(data.text);
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.main}>
        <div className={styles.description}>
          <h1 className={styles.title}>Summarize this webpage for me </h1>
        </div>

        <div>
          <textarea 
            className={styles.response}
            row="15" 
            cols="50"
            value= {(isLoading) ? 'Waiting' :  JSON.stringify(response) }
          />
        </div>

        <div className={styles.center}>
          <textarea
            className={styles.promptInput}
            placeholder="Enter a prompt"
            onChange={(e) => setPrompt(e.target.value)}
            row="5"
            cols="50"
          />


          <button className={styles.button} onClick={getResponseFromOpenAI}>
            Get Response
          </button>


        </div>
      </main>
    </>
  );
}