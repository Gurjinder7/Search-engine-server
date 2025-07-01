import {QdrantClient} from '@qdrant/js-client-rest';
import { pipeline } from '@xenova/transformers'
import { loadJsonFile } from 'load-json-file';
import { v4 as uuidv4 } from 'uuid';



const client = new QdrantClient({ host: "localhost", port: 6333 });

const generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small')

const title = 'First post!'
const body = 'Bombay'

let jsonData = null
const readJson = async () => {
     const data = await loadJsonFile('./data/science_tech.json')
    // console.log(data)
    jsonData = data
}

await readJson();

await client.createCollection("collection_science", {
        vectors: { size: 384, distance: "Cosine"}
    })

const makeEmbeds = () => {

    let count = 0
    for (const val in jsonData) {
        
        console.log(jsonData[val])

        if (count > 49) break;

        if (jsonData[val].description && count < 50) {
            getEmbeddings(jsonData[val])
        }  
        count++
        
    }
}

const getEmbeddings = async (data) => {
    const output = await generateEmbedding(data.description, {
            pooling: 'mean',
            normalize: true
    })

    const embedding = Array.from(output.data)

    await client.upsert('collection_science', {
        wait: true,
        points:[
            {id: uuidv4(), vector: embedding, payload: data}
        ]
    })
}


// MAKE EMBEDDINGS
// makeEmbeds()