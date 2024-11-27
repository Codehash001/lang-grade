import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs/promises';
import { createHash } from 'crypto';
import AdmZip from 'adm-zip';
import { JSDOM } from 'jsdom';
import { ensureDirectoryExists } from './ensureDirectories';

interface EPubMetadata {
  title?: string;
  creator?: string;
  language?: string;
}

export async function convertEPUBtoPDF(epubPath: string): Promise<{ pdfPath: string; metadata: EPubMetadata }> {
  console.log('Starting EPUB to PDF conversion:', epubPath);
  
  // Create a hash of the epub path to use as a unique identifier
  const hash = createHash('md5').update(epubPath).digest('hex');
  const tempDir = path.join('docs', 'tmp');
  const pdfPath = path.join(tempDir, `${hash}.pdf`);

  console.log('Temp directory:', tempDir);
  console.log('Output PDF path:', pdfPath);

  // Check if converted PDF already exists
  try {
    await fs.access(pdfPath);
    console.log('Found existing converted PDF');
    return { pdfPath, metadata: {} };
  } catch (error) {
    console.log('No existing PDF found, proceeding with conversion');
  }

  // Ensure temp directory exists
  const convertedDir = ensureDirectoryExists(tempDir);

  try {
    // Read EPUB file
    console.log('Reading EPUB file');
    const zip = new AdmZip(epubPath);
    const entries = zip.getEntries();

    // Find content files (HTML/XHTML)
    console.log('Extracting content files');
    const contentFiles = entries.filter(entry => 
      entry.entryName.endsWith('.html') || 
      entry.entryName.endsWith('.xhtml') || 
      entry.entryName.endsWith('.htm')
    );

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;
    const margin = 50;
    const pageWidth = 612; // Letter size width
    const pageHeight = 792; // Letter size height
    const textWidth = pageWidth - 2 * margin;
    
    // Limit total text content to ~15000 words (approximately 20 pages)
    const MAX_WORDS = 15000;
    let totalWords = 0;

    console.log(`Processing ${contentFiles.length} content files`);

    for (let i = 0; i < contentFiles.length && totalWords < MAX_WORDS; i++) {
      const entry = contentFiles[i];
      console.log(`Processing file ${i + 1}/${contentFiles.length}: ${entry.entryName}`);

      try {
        // Extract text content from HTML
        const content = entry.getData().toString('utf8');
        const dom = new JSDOM(content);
        const text = dom.window.document.body.textContent || '';
        
        if (!text.trim()) {
          console.log('File is empty, skipping');
          continue;
        }

        // Split text into words and check limit
        const words = text.split(/\s+/);
        const remainingWords = MAX_WORDS - totalWords;
        const wordsToProcess = words.slice(0, remainingWords);
        totalWords += wordsToProcess.length;

        // Split text into lines that fit within the page width
        let currentLine = '';
        let lines: string[] = [];

        for (const word of wordsToProcess) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);

          if (textWidth <= pageWidth - 2 * margin) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }

        console.log(`Created ${lines.length} lines for file ${i + 1}`);

        // Add lines to pages
        let y = pageHeight - margin;
        let page = pdfDoc.addPage([pageWidth, pageHeight]);

        for (let j = 0; j < lines.length; j++) {
          const line = lines[j];
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }

          page.drawText(line, {
            x: margin,
            y,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
          });

          y -= lineHeight;
        }
      } catch (fileError) {
        console.error(`Error processing file ${entry.entryName}:`, fileError);
        continue;
      }
    }

    console.log('Saving PDF');
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(pdfPath, pdfBytes);
    console.log('PDF saved successfully');

    // Extract basic metadata from OPF file
    const metadata: EPubMetadata = {};
    const opfEntry = entries.find(entry => entry.entryName.endsWith('.opf'));
    if (opfEntry) {
      const opfContent = opfEntry.getData().toString('utf8');
      const dom = new JSDOM(opfContent);
      const doc = dom.window.document;

      metadata.title = doc.querySelector('dc\\:title, title')?.textContent || undefined;
      metadata.creator = doc.querySelector('dc\\:creator, creator')?.textContent || undefined;
      metadata.language = doc.querySelector('dc\\:language, language')?.textContent || undefined;
    }

    return { pdfPath, metadata };
  } catch (error) {
    console.error('Error converting EPUB to PDF:', error);
    throw error;
  }
}
