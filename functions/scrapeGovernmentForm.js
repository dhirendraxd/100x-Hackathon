import { onCall } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Initialize Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

/**
 * Helper: convert base64/data URL to Buffer
 */
function base64ToBuffer(base64Data) {
  if (!base64Data) return Buffer.from("");
  const parts = String(base64Data).split(",");
  const b64 = parts.length > 1 ? parts[1] : parts[0];
  return Buffer.from(b64, "base64");
}

/**
 * Helper: call Hugging Face Inference API
 */
async function callHuggingFace(model, token, binary, options = {}) {
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      ...options.headers,
    },
    body: binary,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Helper: call Hugging Face text generation API
 */
async function callHuggingFaceText(model, token, prompt, maxTokens = 500) {
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Extract text from image using OCR
 */
async function extractTextFromImage(binary, token) {
  try {
    // Use TrOCR model for handwritten/printed text recognition
    const result = await callHuggingFace(
      "microsoft/trocr-base-printed",
      token,
      binary
    );
    
    if (Array.isArray(result) && result.length > 0) {
      return result[0].generated_text || "";
    }
    
    return "";
  } catch (error) {
    console.error("OCR extraction error:", error);
    // Fallback: try with a different model
    try {
      const fallbackResult = await callHuggingFace(
        "nlpconnect/vit-gpt2-image-captioning",
        token,
        binary
      );
      return fallbackResult[0]?.generated_text || "";
    } catch (fallbackError) {
      console.error("Fallback OCR failed:", fallbackError);
      return "";
    }
  }
}

/**
 * Detect form fields and layout using object detection
 */
async function detectFormLayout(binary, token) {
  try {
    // Use LayoutLMv3 or DETR for document layout analysis
    const result = await callHuggingFace(
      "facebook/detr-resnet-50",
      token,
      binary
    );

    const fields = [];
    
    if (Array.isArray(result)) {
      result.forEach((detection, index) => {
        // Filter for relevant form elements
        const label = detection.label?.toLowerCase() || "";
        if (detection.score > 0.3) {
          fields.push({
            id: `field_${index}`,
            type: inferFieldType(label),
            label: detection.label || `Field ${index + 1}`,
            position: {
              x: Math.round((detection.box?.xmin || 0) * 100) / 100,
              y: Math.round((detection.box?.ymin || 0) * 100) / 100,
              width: Math.round(((detection.box?.xmax || 0) - (detection.box?.xmin || 0)) * 100) / 100,
              height: Math.round(((detection.box?.ymax || 0) - (detection.box?.ymin || 0)) * 100) / 100,
            },
            confidence: detection.score,
            page: 1, // Default to first page
          });
        }
      });
    }

    return fields;
  } catch (error) {
    console.error("Layout detection error:", error);
    return [];
  }
}

/**
 * Infer field type from detected label
 */
function inferFieldType(label) {
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes("name") || lowerLabel.includes("text")) {
    return "text";
  } else if (lowerLabel.includes("email")) {
    return "email";
  } else if (lowerLabel.includes("phone") || lowerLabel.includes("number")) {
    return "tel";
  } else if (lowerLabel.includes("date") || lowerLabel.includes("calendar")) {
    return "date";
  } else if (lowerLabel.includes("checkbox") || lowerLabel.includes("check")) {
    return "checkbox";
  } else if (lowerLabel.includes("radio") || lowerLabel.includes("option")) {
    return "radio";
  } else if (lowerLabel.includes("dropdown") || lowerLabel.includes("select")) {
    return "select";
  } else if (lowerLabel.includes("signature")) {
    return "signature";
  } else if (lowerLabel.includes("file") || lowerLabel.includes("upload")) {
    return "file";
  }
  
  return "text"; // Default
}

/**
 * Parse extracted text into structured form fields using LLM
 */
async function parseFormStructure(extractedText, token) {
  try {
    const prompt = `Analyze this government form text and extract structured information.
Format your response as JSON with the following structure:
{
  "formTitle": "form name",
  "department": "government department",
  "documentType": "type of document",
  "fields": [
    {"fieldId": "unique_id", "label": "Field Label", "type": "text|email|date|tel|etc", "required": true|false, "helpText": "helper text if any"}
  ],
  "sections": [
    {"title": "Section Title", "description": "section description", "fieldIds": ["field1", "field2"]}
  ],
  "requiredDocuments": ["document 1", "document 2"]
}

Form Text:
${extractedText.substring(0, 2000)}

JSON Response:`;

    const result = await callHuggingFaceText(
      "mistralai/Mistral-7B-Instruct-v0.2",
      token,
      prompt,
      1000
    );

    if (Array.isArray(result) && result[0]?.generated_text) {
      try {
        // Try to extract JSON from response
        const responseText = result[0].generated_text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
      }
    }

    return null;
  } catch (error) {
    console.error("Form parsing error:", error);
    return null;
  }
}

/**
 * Main scraper function - Callable from frontend
 * 
 * @param {Object} request.data
 * @param {string} request.data.imageBase64 - Base64 encoded form image/PDF
 * @param {string} request.data.formTitle - Title of the form
 * @param {string} request.data.department - Government department
 * @param {string} request.data.documentType - Type of document
 * @param {string} request.data.sourceUrl - URL where form was found
 */
export const scrapeGovernmentForm = onCall(
  { cors: true, region: "us-central1", timeoutSeconds: 300 },
  async (request) => {
    try {
      // Check authentication
      if (!request.auth) {
        throw new Error("Authentication required");
      }

      // Check admin role (you'll need to add custom claims for admin users)
      // For now, we'll allow any authenticated user
      
      const { imageBase64, formTitle, department, documentType, sourceUrl } = request.data || {};
      const token = process.env.HUGGING_FACE_ACCESS_TOKEN;

      if (!token) {
        throw new Error("HUGGING_FACE_ACCESS_TOKEN not configured");
      }

      if (!imageBase64) {
        throw new Error("imageBase64 is required");
      }

      if (!formTitle) {
        throw new Error("formTitle is required");
      }

      console.log(`Starting form scraping: ${formTitle}`);

      const binary = base64ToBuffer(imageBase64);

      // Step 1: Extract text using OCR
      console.log("Step 1: Extracting text...");
      const extractedText = await extractTextFromImage(binary, token);
      console.log(`Extracted ${extractedText.length} characters`);

      // Step 2: Detect form layout and fields
      console.log("Step 2: Detecting form layout...");
      const detectedFields = await detectFormLayout(binary, token);
      console.log(`Detected ${detectedFields.length} fields`);

      // Step 3: Parse structure using LLM
      console.log("Step 3: Parsing form structure...");
      const parsedStructure = await parseFormStructure(extractedText, token);

      // Step 4: Merge detected fields with parsed structure
      const originalFields = [];
      
      if (parsedStructure && Array.isArray(parsedStructure.fields)) {
        // Use parsed fields as base
        parsedStructure.fields.forEach((field, index) => {
          const detectedField = detectedFields[index];
          originalFields.push({
            id: field.fieldId || `field_${index}`,
            label: field.label || `Field ${index + 1}`,
            type: field.type || "text",
            section: "section_1",
            position: {
              page: 1,
              x: detectedField?.position?.x || 0,
              y: detectedField?.position?.y || index * 50,
              width: detectedField?.position?.width || 200,
              height: detectedField?.position?.height || 30,
            },
            required: field.required || false,
            helpText: field.helpText || "",
          });
        });
      } else {
        // Fallback to detected fields only
        detectedFields.forEach((field) => {
          originalFields.push({
            id: field.id,
            label: field.label,
            type: field.type,
            section: "section_1",
            position: {
              page: field.page || 1,
              x: field.position?.x || 0,
              y: field.position?.y || 0,
              width: field.position?.width || 200,
              height: field.position?.height || 30,
            },
            required: false,
            helpText: "",
          });
        });
      }

      // Step 5: Create sections
      const sections = parsedStructure?.sections || [
        {
          id: "section_1",
          title: "General Information",
          description: "Basic form fields",
          order: 1,
          fields: originalFields.map((f) => f.id),
        },
      ];

      // Step 6: Extract required documents
      const requiredDocuments = (parsedStructure?.requiredDocuments || []).map((doc, index) => ({
        id: `doc_${index}`,
        name: doc,
        type: "other",
        description: "",
        required: true,
        acceptedFormats: ["pdf", "jpg", "png"],
        maxSizeBytes: 5242880, // 5MB
      }));

      // Step 7: Create government form document
      const governmentForm = {
        name: formTitle,
        department: (department || parsedStructure?.department || "other").toLowerCase().replace(/\s+/g, '-'),
        documentType: (documentType || parsedStructure?.documentType || "other").toLowerCase().replace(/\s+/g, '-'),
        version: "1.0",
        difficulty: originalFields.length > 20 ? "hard" : originalFields.length > 10 ? "medium" : "easy",
        officialUrl: sourceUrl || null,
        pdfUrl: sourceUrl || null,
        originalFields: originalFields,
        sections: sections,
        annotations: [],
        requiredDocuments: requiredDocuments,
        aiAnalysis: {
          complexityScore: originalFields.length > 20 ? 75 : originalFields.length > 10 ? 50 : 25,
          estimatedCompletionMinutes: Math.ceil(originalFields.length * 2),
          legalTermsCount: 0,
          tips: ["Review all required documents before starting", "Fill out all mandatory fields marked with *"],
        },
        statistics: {
          totalSubmissions: 0,
          averageCompletionTime: 0,
          successRate: 0,
          popularityScore: 0,
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        scrapedAt: FieldValue.serverTimestamp(),
        isActive: true,
        isVerified: false,
        needsUpdate: false,
        tags: [],
        keywords: formTitle.toLowerCase().split(/\s+/),
      };

      // Step 8: Save to Firestore
      console.log("Step 4: Saving to Firestore...");
      const docRef = await db.collection("government_forms").add(governmentForm);
      
      console.log(`Form saved with ID: ${docRef.id}`);

      // Step 9: Create search index entry
      await db.collection("form_search_index").doc(docRef.id).set({
        formId: docRef.id,
        formTitle: formTitle.toLowerCase(),
        department: (department || "General").toLowerCase(),
        documentType: (documentType || "Application").toLowerCase(),
        keywords: [
          ...formTitle.toLowerCase().split(/\s+/),
          (department || "").toLowerCase(),
          (documentType || "").toLowerCase(),
        ],
        difficulty: governmentForm.difficulty,
        tags: [],
        popularityScore: 0,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        formId: docRef.id,
        message: `Form "${formTitle}" scraped successfully`,
        stats: {
          fieldsDetected: originalFields.length,
          sectionsCreated: sections.length,
          documentsRequired: requiredDocuments.length,
          extractedTextLength: extractedText.length,
        },
      };
    } catch (error) {
      console.error("Form scraping error:", error);
      throw new Error(`Failed to scrape form: ${error.message}`);
    }
  }
);
