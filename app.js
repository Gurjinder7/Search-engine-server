import {QdrantClient} from '@qdrant/js-client-rest';
import express from 'express'
import { pipeline } from '@xenova/transformers'
import bodyParser from 'body-parser';
import cors from 'cors'

// TO connect to Qdrant running locally
// const client = new QdrantClient({url: 'http://127.0.0.1:6333'});

const client = new QdrantClient({ host: "localhost", port: 6333 });
const generateQueryEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small')

const app = express()
app.use(bodyParser.json())
app.use(cors())

// console.log(client)
// or connect to Qdrant Cloud
// const client = new QdrantClient({
//     url: 'https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.us-east-0-1.aws.cloud.qdrant.io',
//     apiKey: '<your-api-key>',
// });

// console.log(client.collectionExists)

const body = "NASA latest news"
const userEmbedding = async (userQuery) => await generateQueryEmbedding(userQuery, {
  pooling: 'mean',
  normalize: true,
})


 const searchResults = async (embedding) => await client.query(
    "collection_science", {
    query: embedding,
    limit: 5,
    with_payload: true
    });


app.post('/search', async (req, res) => {
    console.log(req.body)

     console.log(req.body)
    let embed = await userEmbedding(req.body.query)
    
    const embedding = Array.from(embed.data)

    let results = await searchResults(embedding)

    console.log(results)

    if (results) {
        res.status(200).json(results)
    } else {
        res.status(500).send("Error")
    }
})

app.get('/', (req, res) => {
  


    res.status(200).send('Hi')
})

app.listen(3000, () => {
    console.log('The application is listening...')
})


