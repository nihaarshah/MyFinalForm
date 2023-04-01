import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores";
import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import NextCors from "nextjs-cors";
// import { middleware } from "../../middleware";

const chat = new ChatOpenAI({ temperature: 0 });

export default async function search(req, res) {
  //   middleware(req);
  let question = req.body.labelText;
  //   let question = JSON.parse(req.body);
  //   console.log(question["questionText"]);

  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const client = new PineconeClient();

  // await client.init({
  //   apiKey: process.env.PINECONE_API_KEY,
  //   environment: process.env.PINECONE_ENVIRONMENT,
  // });

  // const pineconeIndex = client.Index("startup-data");

  // const vectorStore = await PineconeStore.fromExistingIndex(
  //   new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
  //   { pineconeIndex }
  // );

  // //   query for partner
  // const partnerResp = await pineconeIndex.query({
  //   queryRequest: {
  //     topK: 1,
  //     filter: { id: { $eq: "partner-match" } },
  //     includeValues: true,
  //     includeMetadata: true,
  //     vector: new Array(1536).fill(0),
  //   },
  // });

  // // query for summary
  // const summaryResp = await pineconeIndex.query({
  //   queryRequest: {
  //     topK: 1,
  //     filter: { id: { $eq: "company-summary" } },
  //     includeValues: true,
  //     includeMetadata: true,
  //     vector: new Array(1536).fill(0),
  //   },
  // });

  // let companySummary = summaryResp["matches"][0]["metadata"]["text"];
  // let partnerMatch = partnerResp["matches"][0]["metadata"]["text"];

  const companySummary = `_[OpenAds](https://openads.ai/) is search advertising for generative AI services. Every consumer AI company has a problem: compute is expensive, but they can't scale revenue via traditional ad solutions that rely on analyzing static content (AdX inventory isn’t even allowed on AI content)._

  _OpenAds uses zero-party data from AI prompts to target ads, and LLMs to adapt ad creatives in real-time to fit the publisher AI’s output._;`

  //   let companySummary = "Great group of adtech investors";
  //   let partnerMatch = "deep adtech experience";

  // console.log(companySummary);
  // console.log(partnerMatch);

  // console.log("STARTED HALLUCINATION");

  // const hallucinatedQuery = await chat.call([
  //   new SystemChatMessage(
  //     `You come up with an answer for a company given their description even if it is fake. Answer concisely and always within the bounds of the question if it denotes the number of words.`
  //   ),
  //   new HumanChatMessage(
  //     `The company description is ${companySummary}. The question to answer is: ${question}`
  //   ),
  // ]);

  // console.log("ENDED HALLUCINATION: " + hallucinatedQuery.text);

  // const relevantData = await vectorStore.similaritySearch(
  //   `${question} ${hallucinatedQuery.text}`,
  //   3
  // );

  // console.log("RELEVANT: " + relevantData);

  // let relevantDataText = [];

  // relevantData.forEach((element) => {
  //   console.log(element.pageContent);
  //   relevantDataText.push(element.pageContent);
  // });

  console.log("STARTED ANSWER ");
  const answer = await chat.call([
    new SystemChatMessage(
      `you are a bubbly, fun tiktoker who writes mostly using emojis. you are pitching a startup to a VC. here's a summary of your startup: ${companySummary}`
    ),
    new HumanChatMessage(
      `Reply to this question from a venture capitalist you are pitching: ${question}`
    ),
  ]);
  console.log("ENDED ANSWER: " + answer.text);

  return res.status(200).json({ answer: answer.text });
}
