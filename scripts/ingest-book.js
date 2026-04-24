const fs = require('fs');
const pdfParse = require('pdf-parse');
const { createClient } = require('@supabase/supabase-js');

// 1. Initialize Supabase Client
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requires Service Role
const supabase = createClient(supabaseUrl, supabaseKey);

// Chunking function to split large text into overlapping paragraphs
function cleanAndChunkText(text, maxInputTokens = 800) {
    let cleaned = text.replace(/\n\s*\n/g, '\n\n').replace(/[^\S\r\n]+/g, ' ');
    const paragraphs = cleaned.split('\n\n').filter(p => p.trim().length > 30);
    
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;

    for (const p of paragraphs) {
        if (currentLength + p.length > maxInputTokens && currentChunk.length > 0) {
            chunks.push(currentChunk.join('\n\n').trim());
            currentChunk = [currentChunk[currentChunk.length - 1], p];
            currentLength = currentChunk[0].length + p.length;
        } else {
            currentChunk.push(p);
            currentLength += p.length;
        }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk.join('\n\n').trim());

    return chunks;
}

async function main() {
    console.log("🚀 Starting PDF Ingestion Process...");

    // Read the PDF File
    const pdfPath = './English_ArRaheeq_AlMakhtum_THE_SEALED_NECTAR.pdf';
    console.log(`📖 Reading PDF from ${pdfPath}`);
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    console.log(`✅ Extracted ${data.text.length} characters from PDF.`);

    // Chunk the text
    console.log(`🧩 Splitting text into chunks...`);
    const chunks = cleanAndChunkText(data.text);
    console.log(`✅ Generated ${chunks.length} chunks.`);

    // Load Local Embedding Pipeline
    console.log(`🧠 Loading local AI Model (all-MiniLM-L6-v2)...`);
    const { pipeline } = await import('@xenova/transformers');
    const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const BATCH_SIZE = 10; 
    let insertedCount = 0;

    console.log(`💾 Generating Vector Embeddings & Saving... (No rate limits!)`);
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        
        try {
            // Generate embeddings using local model
            const recordsToInsert = await Promise.all(batch.map(async (textChunk) => {
                const output = await embedder(textChunk, { pooling: 'mean', normalize: true });
                return {
                    content: textChunk,
                    metadata: { source: "The Sealed Nectar", model: "Xenova/all-MiniLM-L6-v2" },
                    embedding: Array.from(output.data) // Convert Float32Array to standard JS Array
                };
            }));

            // Insert into Supabase
            const { error } = await supabase.from('knowledge_documents').insert(recordsToInsert);

            if (error) {
                console.error(`❌ DB Insert Error at batch ${i}:`, error.message);
                continue;
            }

            insertedCount += batch.length;
            process.stdout.write(`\r✅ Progress: ${insertedCount}/${chunks.length} chunks saved...`);
        } catch (error) {
            console.error(`❌ Batch error at index ${i}:`, error.message);
        }
    }

    console.log(`\n🎉 Ingestion Complete! Saved ${insertedCount} document chunks to your database!`);
}

main().catch(console.error);
