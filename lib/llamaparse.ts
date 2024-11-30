import { LlamaParseReader, Document, SummaryIndex } from "llamaindex";
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import 'dotenv/config';
import * as fs from 'fs/promises';
import * as path from 'path';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

// Define the schema for book analysis
const bookAnalysisSchema = z.object({
  bookName: z.string(),
  author: z.string(),
  languageLevel: z.string(),
  bookLanguage: z.string(),
  summary: z.string()
});

type DocumentAnalysis = z.infer<typeof bookAnalysisSchema>;

const analysisParser = new JsonOutputParser<DocumentAnalysis>();

const formatInstructions = `Respond only in valid JSON. Extract the following information from the text and return it in this exact format:
{
  "bookName": "exact name of the book",
  "author": "name of the author",
  "languageLevel": "language proficiency level range in CEFR language level (A1, A2, B1, etc.), generating a grade (ideally a range, e.g. A2 - B1)",
  "bookLanguage": "the language in which the book is written (e.g., English, Spanish, French, etc.)",
  "summary": "leave empty string, will be filled later"
}`;

const analysisPrompt = ChatPromptTemplate.fromTemplate(
  `You are an expert language learning book analyzer. Your task is to carefully extract the book name, author name, language proficiency level range, and the language of the book from the provided text. If the language level is not explicitly stated, analyze the content complexity to determine the appropriate CEFR language level (A1, A2, B1, etc.), generating a grade (ideally a range, e.g. A2 - B1)

{format_instructions}

Text to analyze: {text}

Return the analysis in the specified JSON format.`
);

async function getStructuredAnalysis(text: string): Promise<DocumentAnalysis> {
  const model = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0
  });

  try {
    const response = await model.invoke(
      await analysisPrompt.format({
        format_instructions: formatInstructions,
        text: text
      })
    );

  return analysisParser.parse(`${response.content}`);
  } catch (error) {
    console.error('Error in analysis:', error);
    throw error;
  }
}

export async function parseDocument(filePath: string, summaryLength: string) {
  try {
    // Parse PDF using LlamaIndex
    console.log('Parsing document...');
    const reader = new LlamaParseReader();
    const documents = await reader.loadData(filePath);

    if (!documents || documents.length === 0) {
      throw new Error('No documents returned from parser');
    }
    
    if (!documents[0]?.text) {
      throw new Error('Parsed document contains no text');
    }

    // Get structured analysis using LangChain
    console.log('Getting structured analysis...');
    const analysis = await getStructuredAnalysis(documents[0].text);

    // Create SummaryIndex from documents for summary generation
    console.log('Creating summary index...');
    const summaryIndex = await SummaryIndex.fromDocuments(documents);
    
    // Generate summary using the index
    console.log('Generating summary...');
    const query = await summaryIndex.asQueryEngine().query({
      query: `Please provide a ${summaryLength} summary of the document and give a idea about language complexity of the document in approximately ${
        summaryLength === 'short' ? '100' : 
        summaryLength === 'long' ? '450' : '250'
      } words. Use only English.`,
    });
    
    const summary = query.message.content;
    console.log('Summary generated successfully');
    console.log('Analysis results:', analysis);

    // Return the complete analysis
    return {
      summary,
      metadata: {
        bookName: analysis.bookName,
        author: analysis.author,
        languageLevel: analysis.languageLevel,
        bookLanguage: analysis.bookLanguage || 'English'
      }
    };

  } catch (error) {
    console.error('Error in parseDocument:', error);
    throw error;
  }
}
