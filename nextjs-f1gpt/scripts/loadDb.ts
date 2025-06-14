import { DataAPIClient, CollectionAlreadyExistsError } from "@datastax/astra-db-ts"
import {PuppeteerWebBaseLoader} from "langchain/document_loaders/web/puppeteer"
import OpenAI from "openai"

import { RecursiveCharacterTextSplitter} from "langchain/text_splitter"

import "dotenv/config"
import { launch } from "puppeteer"
import { create } from "domain"

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"

const { ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY 
} = process.env

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.skysports.com/f1',
    'https://www.formula1.com/en/racing/2024.html',
    'https://www.formula1.com/en/latest/all',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions',
    'https://frontofficesports.com/the-10-highest-paid-formula-1-drivers-for-2024/',
    'https://www.motorsport.com/f1/news/'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { keyspace: ASTRA_DB_NAMESPACE})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
})

const createCollection = async (similarityMetric: SimilarityMetric = "dot_product") => {
  try {
    const res = await db.createCollection(ASTRA_DB_COLLECTION, {
      vector: {
        dimension: 1536,
        metric: similarityMetric
      }
    });
    console.log("Collection created:", res);
  } catch (error) {
    if (error instanceof CollectionAlreadyExistsError) {
      console.log(`Collection '${ASTRA_DB_COLLECTION}' already exists, skipping creation.`);
    } else {
      // rethrow if it's a different error
      throw error;
    }
  }
}


const loadSampleData = async () => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of f1Data) {
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await (const chunk of chunks) {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float"
            })
            const vector = embedding.data[0].embedding
            
            const res = await collection.insertOne({
                $vector: vector,
                text: chunk
            })
            console.log(res)
        }
}
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async (page, browser) => {
            const result = await page.evaluate(() => document.body.innerHTML)
            await browser.close()
            return result
        }
    })
    return (await loader.scrape())?.replace(/<[^>]*>?/gm, '')

}
createCollection().then(() => loadSampleData())
