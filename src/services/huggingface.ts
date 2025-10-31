/**
 * Hugging Face AI Integration
 * Uses Hugging Face Inference API for OCR, layout detection, and text generation
 */

import { HfInference } from '@huggingface/inference';
import Tesseract from 'tesseract.js';

// Initialize Hugging Face client
const getHfClient = () => {
  const token = import.meta.env.VITE_HUGGING_FACE_ACCESS_TOKEN;
  if (!token || token === 'your_hugging_face_token_here') {
    throw new Error('Hugging Face token not configured. Set VITE_HUGGING_FACE_ACCESS_TOKEN in your .env file');
  }
  return new HfInference(token);
};

/**
 * Convert base64 to Blob for Hugging Face API
 */
export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/png';
  const raw = atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Extract text from image using OCR
 */
/**
 * Extract text from image using Tesseract.js (local OCR)
 * No Hugging Face dependency - manual extraction first
 */
export const extractTextFromImage = async (imageBase64: string): Promise<string> => {
  console.log('Extracting text with Tesseract.js (manual OCR)...');
  const parts = imageBase64.split(',');
  const src = parts.length > 1 ? imageBase64 : `data:image/png;base64,${imageBase64}`;
  
  try {
    const { data } = await Tesseract.recognize(src, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    const extractedText = data?.text || '';
    console.log(`OCR completed. Extracted ${extractedText.length} characters.`);
    return extractedText;
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    throw new Error('Failed to extract text from image using Tesseract.js');
  }
};

/**
 * Detect layout and objects in form image
 * DISABLED: We extract text manually first, so layout detection is skipped
 */
export const detectFormLayout = async (imageBase64: string): Promise<Array<{ label: string; score: number; box: { xmin: number; ymin: number; xmax: number; ymax: number } }>> => {
  console.log('Layout detection skipped (manual text extraction workflow)');
  return [];
};

/**
 * Generate structured form data using LLM
 * Uses direct API calls to avoid auto-router issues with Featherless tokens
 */
export const generateFormStructure = async (extractedText: string, formTitle: string, documentType: string): Promise<string> => {
  const token = import.meta.env.VITE_HUGGING_FACE_ACCESS_TOKEN;
  
  const prompt = `You are a precise government form analysis assistant. Analyze this extracted form text and generate a JSON array of form fields.

Constraints:
- Use only fields present in the text (do not invent fields)
- Allowed types: text, number, email, phone, date, address, select, radio, checkbox
- Include options only for select/radio/checkbox

Form Title: ${formTitle}
Document Type: ${documentType}
Extracted Text: ${extractedText}

Return ONLY the JSON array (no code fences, no explanation). Example format:
[{"label":"Full Name","type":"text","required":true},{"label":"Email","type":"email","required":true}]`;

  try {
    console.log('Generating form structure with gemma-2-2b-it (via Featherless API)...');
    
    // Featherless.ai uses OpenAI-compatible chat completions endpoint
    const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-2-2b-it',
        messages: [
          {
            role: 'system',
            content: 'You are a form field extraction assistant. Return only valid JSON arrays of form fields.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    console.log('Form structure generated successfully');
    return content || '[]';
  } catch (error) {
    console.error('Form structure generation error:', error);
    throw new Error(`Failed to generate form structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate helpful hints and guidance for form fields using LLM
 * Uses direct API calls to avoid auto-router issues with Featherless tokens
 */
export const generateFieldGuidance = async (fieldLabel: string, fieldType: string, formContext: string): Promise<{ placeholder?: string; hint?: string; example?: string }> => {
  const token = import.meta.env.VITE_HUGGING_FACE_ACCESS_TOKEN;
  
  const prompt = `Generate short guidance for filling this government form field. Output only JSON.

Field Label: ${fieldLabel}
Field Type: ${fieldType}
Form Context: ${formContext}

Return ONLY a JSON object with keys: placeholder, hint, example
Example: {"placeholder":"Enter full name","hint":"Provide your complete legal name","example":"John Doe"}`;

  const parseJson = (text: string) => {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (_) { /* ignore */ }
    return null;
  };

  try {
    // Featherless.ai uses OpenAI-compatible chat completions endpoint
    const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-2-2b-it',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates form field guidance. Return only valid JSON objects.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.5,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const parsed = parseJson(content);
      if (parsed) return parsed as { placeholder?: string; hint?: string; example?: string };
    }
  } catch (error) {
    console.warn('Guidance generation failed, using defaults:', error);
  }

  // Fallback defaults
  return {
    placeholder: `Enter ${fieldLabel}`,
    hint: `Provide your ${fieldLabel.toLowerCase()}`,
  };
};

/**
 * Check if Hugging Face is properly configured
 */
export const isHuggingFaceConfigured = (): boolean => {
  const token = import.meta.env.VITE_HUGGING_FACE_ACCESS_TOKEN;
  return Boolean(token && token !== 'your_hugging_face_token_here');
};
