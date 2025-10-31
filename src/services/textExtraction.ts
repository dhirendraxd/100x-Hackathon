import Tesseract from 'tesseract.js';

// Lazy import to avoid bundling PDF worker until needed
let pdfjsLib: unknown | null = null;
let mammothLib: unknown | null = null;

export type ExtractionPage = {
  index: number;
  method: 'pdf-text' | 'pdf-ocr' | 'image-ocr' | 'docx';
  text: string;
  chars: number;
  words: number;
};

export type ExtractionResult = {
  method: 'pdf-text' | 'pdf-ocr' | 'image-ocr' | 'docx';
  mimeType: string;
  pages: ExtractionPage[];
  fullText: string;
  summary: {
    pages: number;
    chars: number;
    words: number;
  };
};

const getMimeFromBase64 = (base64: string): string => {
  const header = base64.split(',')[0] || '';
  const match = header.match(/^data:([^;]+);base64/);
  return match ? match[1] : 'application/octet-stream';
};

const base64ToUint8Array = (base64: string): Uint8Array => {
  const data = base64.split(',')[1] || base64;
  const binary = atob(data);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const countWords = (text: string): number => {
  return (text.trim().match(/\S+/g) || []).length;
};

async function ensurePdfJs() {
  if (!pdfjsLib) {
    // Use legacy build for better browser compatibility
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    // Set the workerSrc via CDN to avoid bundling issues
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/legacy/build/pdf.worker.min.js`;
    } catch { /* noop */ }
  }
  return pdfjsLib;
}

async function ensureMammoth() {
  if (!mammothLib) {
    mammothLib = await import('mammoth/mammoth.browser');
  }
  return mammothLib;
}

// Basic image preprocessing using canvas (grayscale + simple threshold)
const preprocessImage = async (src: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(src);
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Grayscale
        const gray = (r + g + b) / 3;
        // Simple contrast and threshold
        const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.2 + 128));
        const val = contrasted > 160 ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
};

async function ocrImageBase64(imageBase64: string): Promise<ExtractionResult> {
  const src = imageBase64.startsWith('data:') ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  const preprocessed = await preprocessImage(src);
  const { data } = await Tesseract.recognize(preprocessed, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });
  const text = data?.text || '';
  return {
    method: 'image-ocr',
    mimeType: getMimeFromBase64(src),
    pages: [{ index: 1, method: 'image-ocr', text, chars: text.length, words: countWords(text) }],
    fullText: text,
    summary: { pages: 1, chars: text.length, words: countWords(text) },
  };
}

async function extractPdfText(base64: string): Promise<ExtractionResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await ensurePdfJs();
  const bytes = base64ToUint8Array(base64);
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;

  const pages: ExtractionPage[] = [];
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
  const items = (textContent as { items?: Array<{ str?: string }> }).items || [];
  const pageText = items.map((it) => (it && typeof it.str === 'string' ? it.str : '')).join(' ').replace(/\s+\n/g, '\n');

    if (pageText.trim().length > 20) {
      pages.push({ index: i, method: 'pdf-text', text: pageText, chars: pageText.length, words: countWords(pageText) });
      fullText += (fullText ? '\n\n' : '') + pageText;
      continue;
    }

    // Fallback: render and OCR
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      pages.push({ index: i, method: 'pdf-text', text: pageText, chars: pageText.length, words: countWords(pageText) });
      fullText += (fullText ? '\n\n' : '') + pageText;
      continue;
    }
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const imageDataUrl = canvas.toDataURL('image/png');
    const ocr = await Tesseract.recognize(imageDataUrl, 'eng');
    const ocrText = ocr?.data?.text || '';
    pages.push({ index: i, method: 'pdf-ocr', text: ocrText, chars: ocrText.length, words: countWords(ocrText) });
    fullText += (fullText ? '\n\n' : '') + ocrText;
  }

  return {
    method: 'pdf-text',
    mimeType: 'application/pdf',
    pages,
    fullText,
    summary: { pages: pages.length, chars: fullText.length, words: countWords(fullText) },
  };
}

async function extractDocxText(base64: string): Promise<ExtractionResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mammoth: any = await ensureMammoth();
  const bytes = base64ToUint8Array(base64);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = (result?.value || '').trim();
  return {
    method: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pages: [{ index: 1, method: 'docx', text, chars: text.length, words: countWords(text) }],
    fullText: text,
    summary: { pages: 1, chars: text.length, words: countWords(text) },
  };
}

export async function extractTextSmartFromBase64(base64: string): Promise<ExtractionResult> {
  const mime = getMimeFromBase64(base64);
  console.log('Smart extraction - detected mime:', mime);

  if (mime === 'application/pdf') {
    try {
      return await extractPdfText(base64);
    } catch (e) {
      console.warn('PDF text extraction failed, falling back to OCR of first page image', e);
      return await ocrImageBase64(base64);
    }
  }

  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mime.endsWith('/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
    try {
      return await extractDocxText(base64);
    } catch (e) {
      console.warn('DOCX extraction failed', e);
      return { method: 'docx', mimeType: mime, pages: [], fullText: '', summary: { pages: 0, chars: 0, words: 0 } };
    }
  }

  // Default: treat as image
  return await ocrImageBase64(base64);
}
