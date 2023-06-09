import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores";
import { Document } from "langchain/document";
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const chat = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const SerpApi = require("google-search-results-nodejs");
const search1 = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);

const callback = async function (data) {
  const extractedText = await new Promise((resolve, reject) => {
    // need to use serp to get a search result for diff firms
    fetch("https://www.ycombinator.com/people")
      .then((response) => response.text())
      .then((html) => {
        const $ = cheerio.load(html);
        const textTags = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "span"];
        let extractedText = [];
        textTags.forEach((tag) => {
          $(tag).each((_, element) => {
            extractedText.push($(element).text().trim());
          });
        });
        resolve(extractedText);
      })
      .catch((error) => {
        reject(error);
      });
  });

  return extractedText;
};

export default async function handler(req, res) {
  const text = await callback();

  // remove brief text
  text.forEach((element) => {
    console.log(element);
    if (element.length < 10) {
      text.splice(text.indexOf(element), 1);
    }
  });

  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENVIRONMENT,
    apiKey: process.env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.Index("startup-data");

  // get summaries for VCs
  console.log("Summarizing VC Partners...");
  let ventureDescriptions = await chat.call([
    new SystemChatMessage(
      "You are a masterful data summarizer. You excel at taking in textual data and extracting useful information about venture capitalists given only the input text and nothing else. You ignore all irrelevant information."
    ),
    new HumanChatMessage(
      "Return analyses of the following VCs while infering personality characteristics that would influence their decision making: " +
        text.join(" ")
    ),
  ]);
  console.log(
    "\n\nHere are the summaries of the VCs: \n\n" +
      ventureDescriptions.text +
      "\n\n"
  );

  // split text for founder and company descs
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([
    req.body.companyDescription,
    req.body.founderDescription,
  ]);

  docs.forEach((element) => {
    console.log(element.pageContent);
    element.metadata.text = element.pageContent;
  });

  // prob use this for each to upload comp desc to vector db to access on form fill

  await PineconeStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    {
      pineconeIndex,
    }
  );

  console.log("uplodade to db");
  // // upsert element.pageContent here

  // // get summary of company
  console.log("Summarizing company description...");
  let summary = await chat.call([
    new SystemChatMessage(
      "You are a masterful summarizer of company descriptions. You take in large amounts of text and return at most 300 characters describing the company."
    ),
    new HumanChatMessage(
      "Summarize the following company description: " +
        req.body.companyDescription
    ),
  ]);
  console.log(
    "\n\nHere is the summary of the company: \n\n" + summary.text + "\n\n"
  );

  // match a partner to company
  console.log("Thinking about what partner to match you with...");
  let partnerMatch = await chat.call([
    new SystemChatMessage(
      "You are a liasion between venture capitalists and potential founders making a perfect match based on personality and industry. You only select names from the list of partners and their corresponding description. "
    ),
    new HumanChatMessage(
      `Match the following company portfolio to the correct venture capitalist and return a psychological analysis of the venture capitalist's personality:

        Potential Venture Capitalists
        ${ventureDescriptions.text}

        Company Portfolio
        ${summary.text}
         `
    ),
  ]);
  console.log("\n\nThe match is: " + partnerMatch.text);

  const relevantData = [
    new Document({
      metadata: {
        id: "partner-match",
        text: `${partnerMatch.text}`,
      },
      pageContent: `${partnerMatch.text}`,
    }),
    new Document({
      metadata: {
        id: "company-summary",
        text: `${summary.text}`,
      },
      pageContent: `${summary.text}`,
    }),
  ];

  await PineconeStore.fromDocuments(
    relevantData,
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    {
      pineconeIndex,
    }
  );

  // const queryResponse = await pineconeIndex.query({
  //   queryRequest: {
  //     topK: 10,
  //     filter: { id: { $eq: 1500 } },
  //     includeValues: true,
  //     includeMetadata: true,
  //     vector: new Array(1536).fill(0),
  //   },
  // });

  // console.log(queryResponse["matches"][0]["metadata"]);

  // const vectorStore = await PineconeStore.fromExistingIndex(
  //   new OpenAIEmbeddings(),
  //   { pineconeIndex }
  // );

  // const results = await vectorStore.similaritySearch("", 1, {
  //   id: 1500,
  // });

  // console.log(results);

  // // somehow need to pipe this into the form -> local storage?
  return res.status(200).json({
    partnerMatch: "",
    companySummary: "",
  });
}
