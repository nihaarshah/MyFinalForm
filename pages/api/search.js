import { ChatOpenAI } from "langchain/chat_models";
import { OpenAI } from "langchain";
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const chat = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const SerpApi = require("google-search-results-nodejs");
const search1 = new SerpApi.GoogleSearch(process.env.SERP_API_KEY);

const params = {
  engine: "google",
  q: "Coffee",
  location: "Austin, Texas, United States",
  google_domain: "google.com",
  gl: "us",
  hl: "en",
};

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

  return res.status(200).json({ message: text });
}
