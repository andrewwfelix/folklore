import PDFDocument from 'pdfkit';
import { Buffer } from 'buffer';

export interface PDFSection {
  name: string;
  content: string;
  styling: {
    font?: string;
    size?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
  };
}

export interface PDFLayout {
  title: string;
  sections: PDFSection[];
  overallStyling: {
    theme?: string;
    margins?: string;
    pageSize?: string;
  };
}

export interface PDFGenerationOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
}

/**
 * Generate a PDF file from a JSON layout specification
 */
export async function generatePDF(
  layout: PDFLayout,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: layout.overallStyling.pageSize || 'A4',
        margins: {
          top: 72,    // 1 inch
          bottom: 72,
          left: 72,
          right: 72
        },
        info: {
          Title: options.title || layout.title,
          Author: options.author || 'Folklore Monster Generator',
          Subject: options.subject || 'Monster Profile',
          Keywords: options.keywords?.join(', ') || 'monster, folklore, D&D'
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add title
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(layout.title, { align: 'center' })
         .moveDown(2);

      // Process each section
      layout.sections.forEach((section, index) => {
        // Add section header
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text(section.name, { align: 'left' })
           .moveDown(0.5);

        // Add section content
        const fontSize = parseInt(section.styling.size?.replace('pt', '') || '12');
        const fontFamily = section.styling.font || 'Helvetica';
        const alignment = section.styling.alignment || 'left';

        doc.fontSize(fontSize)
           .font(fontFamily)
           .text(section.content, { align: alignment as 'left' | 'center' | 'right' | 'justify' })
           .moveDown(1);

        // Add page break between sections (except for the last one)
        if (index < layout.sections.length - 1) {
          doc.addPage();
        }
      });

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate a simple PDF from monster data (fallback method)
 */
export async function generateSimplePDF(
  monsterName: string,
  lore: string,
  statblock: any,
  citations: any[],
  artPrompt: any
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72
        },
        info: {
          Title: monsterName,
          Author: 'Folklore Monster Generator',
          Subject: 'Monster Profile'
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(monsterName, { align: 'center' })
         .moveDown(2);

      // Lore Section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Lore', { align: 'left' })
         .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica')
         .text(lore, { align: 'justify' })
         .moveDown(2);

      // Stat Block Section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Stat Block', { align: 'left' })
         .moveDown(0.5);

      doc.fontSize(10)
         .font('Courier')
         .text(JSON.stringify(statblock, null, 2), { align: 'left' })
         .moveDown(2);

      // Citations Section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('Citations', { align: 'left' })
         .moveDown(0.5);

      citations.forEach((citation, index) => {
        doc.fontSize(12)
           .font('Helvetica')
           .text(`${index + 1}. ${citation.title}`, { align: 'left' })
           .fontSize(10)
           .text(`   ${citation.url}`, { align: 'left' })
           .moveDown(0.5);
      });

      doc.moveDown(1);

      // Art Prompt Section
      doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Art Prompt', { align: 'left' })
       .moveDown(0.5);

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Style: ${artPrompt.style}`, { align: 'left' })
         .moveDown(0.5)
         .text(artPrompt.prompt, { align: 'justify' })
         .moveDown(0.5)
         .text(artPrompt.description, { align: 'justify' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
} 