import { LlamaParseReader } from "llamaindex";
import path from 'path';
import 'dotenv/config';

async function testParse() {
  try {
    // Set up the LlamaParse reader with the API key from .env
    const reader = new LlamaParseReader({
      apiKey: process.env.LLAMAPARSE_API_KEY,
      resultType: "markdown"
    });

    // Get absolute path to the document
    const documentPath = path.join(process.cwd(), 'docs', 'uploaded', 'Web_Application_Development_ITC_2223-_Lab_1_(1).pdf');
    console.log('Parsing document:', documentPath);

    // Parse the document
    const documents = await reader.loadData(documentPath);
    
    // Print the parsed content
    if (documents && documents.length > 0) {
      console.log('\nParsed Content:');
      console.log('-------------');
      console.log('Text:', documents[0].text);
      console.log('\nMetadata:', documents[0].metadata);
    } else {
      console.log('No content was parsed from the document');
    }
  } catch (error) {
    console.error('Error parsing document:', error);
  }
}

testParse();
