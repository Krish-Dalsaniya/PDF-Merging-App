import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/merge', upload.array('pdfs', 50), async (req, res) => {
    try {
        const pageOrder = JSON.parse(req.body.pageOrder || '[]');
        
        if (!pageOrder.length) {
            return res.status(400).json({ error: 'No pages to merge' });
        }

        const mergedPdf = await PDFDocument.create();
        const pdfBuffers = req.files;

        for (const pageInfo of pageOrder) {
            const { pdfIndex, pageIndex } = pageInfo;
            const pdfBuffer = pdfBuffers[pdfIndex];
            
            if (!pdfBuffer) {
                console.warn(`PDF at index ${pdfIndex} not found`);
                continue;
            }

            const sourcePdf = await PDFDocument.load(pdfBuffer.buffer);
            const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [pageIndex]);
            mergedPdf.addPage(copiedPage);
        }

        const mergedPdfBytes = await mergedPdf.save();
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="merged.pdf"',
            'Content-Length': mergedPdfBytes.length,
        });

        res.send(Buffer.from(mergedPdfBytes));
    } catch (error) {
        console.error('Merge error:', error);
        res.status(500).json({ error: 'Failed to merge PDFs' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`PDF Merger Server running on http://localhost:${PORT}`);
});
