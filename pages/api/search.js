import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const chat = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const SerpApi = require("google-search-results-nodejs");
const search1 = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);

let returnData;

const callback = async function (data) {
  const extractedText = await new Promise((resolve, reject) => {
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

export default async function search(req, res) {
  const text = await callback();

  // remove brief text
  text.forEach((element) => {
    if (element.length < 10) {
      text.splice(text.indexOf(element), 1);
    }
  });

  // get summaries for VCs
  let ventureDescriptions = await chat.call([
    new SystemChatMessage(
      "You are a masterful data summarizer. You excel at taking in textual data and extracting useful information about venture capitalists given only the input text and nothing else. You ignore all irrelevant information."
    ),
    new HumanChatMessage(
      "Return analyses of the following VCs while infering personality characteristics that would influence their decision making: " +
        text.join(" ")
    ),
  ]);

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([
    req.body.companyDescription,
  ]);

  // prob use this for each to upload comp desc to vector db to access on form fill
  // docs.forEach((element) => {
  // upsert element.pageContent here
  // });

  // get summary of company
  let summary = await chat.call([
    new SystemChatMessage(
      "You are a masterful summarizer of company descriptions. You take in large amounts of text and return at most 300 characters describing the company."
    ),
    new HumanChatMessage(
      "Summarize the following company description: " + req.body
    ),
  ]);

  // match a partner to company
  // LOG THIS FOR DEMO
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

  localStorage.setItem("partnerMatch", partnerMatch.text);

  // somehow need to pipe this into the form -> local storage?
  return res.status(200).json({ message: "" });
}
