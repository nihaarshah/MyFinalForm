import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { OpenAI } from "langchain/llms";
import { loadSummarizationChain } from "langchain/chains";
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

  // console.log("EXTRACTED TEXT: ", extractedText);

  return extractedText;
  // Now you can use the extracted text here
};

// response = await chat.call([
//   new SystemChatMessage(
//     "You are a helpful assistant that translates English to French."
//   ),
//   new HumanChatMessage("Translate: I love programming."),
// ]);

export default async function search(req, res) {
  const text = await callback();

  // text.forEach((element) => {
  //   if (element.length < 10) {
  //     text.splice(text.indexOf(element), 1);
  //   }
  // });

  const doc = `
  Founder/CEO linkedIn: https://www.linkedin.com/in/stevenliss/
  Co-foudner/CTO linkedin: https://www.linkedin.com/in/michael-bishop-483aa874/

  Company name: OpenAds
  Company website: https://openads.ai/

  Location: NYC

  Raised any capital yet?: yes
  Amount raised: $222k

  Revenue last year: $0
  Projected revenue this year: $10k-$100k

  What problem do you solve?:
  [OpenAds](https://openads.ai/) is search advertising for generative AI services. Every consumer AI company has a problem: compute is expensive, but they can't scale revenue via traditional ad solutions that rely on analyzing static content (AdX inventory isn’t even allowed on AI content).

  OpenAds uses zero-party data from AI prompts to target ads, and LLMs to adapt ad creatives in real-time to fit the publisher AI’s output.

  What excites you most about your company’s long-term potential? If your wildest dreams come true, what will this company be?
  AI is expanding the realm of possible search queries beyond Google's current search market (already $100B/year). Best case: we become the "AdSense for AI" that pays to keep AI free and accessible (i.e. "Open") to the public. If one of our AI clients becomes the next Google/Meta, we'll be their monetization layer.

  Calendly link: https://calendly.com/steven-openads

  Big idea:Prompt-based "search ads" let us to support and monetize the massive new ecosystem of consumer AI apps. That's an enormous business, but it positions us for a bigger shift:
  How people store data on the internet is going to shift from static text (HTTP as a protocol) to unstructured data (embeddings, data lakes, etc) that require an AI interface to consume. Today, websites are like reading a book; in 3-10 years they'll be like talking to a person. ChatGPT is a preview. The post-hypertext internet will need an AI-native ad solution like ours.
       `;

  // let response = await chat.call([
  //   new SystemChatMessage(
  //     "You are a masterful data analyst. You excel at taking in textual data and extracting useful information about people given only the input text and nothing else. You ignore all irrelevant information."
  //   ),
  //   new HumanChatMessage(
  //     "Return analyses of the following VCs while infering personality characteristics that would influence their decision making: " +
  //       text.join(" ")
  //   ),
  // ]);

  // prob upsert to db

  const model = new OpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([doc]);

  docs.forEach((element) => {
    console.log(element.pageContent);
    console.log("--------------------------------------------------");
  });

  // upsert docs content to db

  // console.log(docs);
  // const chain = loadSummarizationChain(model);
  // const langResp = await chain.call({
  //   input_documents: docs,
  // });
  // console.log(langResp);

  // let response2 = await chat.call([
  //   new SystemChatMessage(
  //     "You are a liasion between venture capitalists and potential founders. You match a founder to a venture capitalist based on fit and potential. You are a master at reading between the lines and understanding the true meaning of a founder's words. You only select names from the list of partners and their corresponding description. "
  //   ),
  //   new HumanChatMessage(
  //     `Match the following company portfolio to the correct venture capitalist:

  //     Potential Venture Capitalists
  //     ${response.text}

  //     Company Portfolio
  //      `
  //   ),
  // ]);

  // query instead of having it perform reasoning unless we want to show that

  // console.log(response);

  return res.status(200).json({ message: "" });
}
