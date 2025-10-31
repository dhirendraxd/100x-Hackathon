/**
 * Firebase Cloud Function: Generate AI Cheat Sheet
 * 
 * Creates personalized cheat sheets for government forms including:
 * - Summary of required documents
 * - Step-by-step instructions
 * - Common mistakes to avoid
 * - Tips for faster processing
 * - Important deadlines and fees
 * 
 * @param {Object} data - { formId: string }
 * @returns {Object} - { success: boolean, cheatSheet: object, message: string }
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Hugging Face API configuration
const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

/**
 * Generate cheat sheet content using LLM
 */
async function generateCheatSheetContent(formData) {
  const token = process.env.HUGGING_FACE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HUGGING_FACE_ACCESS_TOKEN not configured");
  }

  const prompt = `You are a helpful assistant that creates cheat sheets for government forms in Nepal.

Form Information:
- Form Name: ${formData.name}
- Department: ${formData.department}
- Document Type: ${formData.documentType}
- Difficulty: ${formData.difficulty}
- Number of Fields: ${formData.originalFields?.length || 0}
- Required Documents: ${formData.requiredDocuments?.map((d) => d.name).join(", ") || "None specified"}

Task: Create a comprehensive cheat sheet to help citizens complete this form successfully.

Provide your response in this exact JSON format (no markdown, no code blocks):
{
  "title": "Quick Guide to [Form Name]",
  "summary": "A 2-3 sentence overview of what this form is for and who needs it",
  "preparationChecklist": [
    "Item 1 to prepare before starting",
    "Item 2 to prepare before starting",
    "Item 3 to prepare before starting"
  ],
  "stepByStepGuide": [
    {
      "step": 1,
      "title": "Step title",
      "description": "What to do in this step",
      "tip": "Helpful tip for this step"
    }
  ],
  "commonMistakes": [
    {
      "mistake": "Description of common mistake",
      "solution": "How to avoid or fix it"
    }
  ],
  "requiredDocumentsGuide": [
    {
      "document": "Document name",
      "purpose": "Why it's needed",
      "format": "Acceptable formats",
      "tips": "Tips for this document"
    }
  ],
  "importantReminders": [
    "Important reminder 1",
    "Important reminder 2",
    "Important reminder 3"
  ],
  "processingTime": "Estimated time for processing",
  "fees": "Any fees or costs involved",
  "whereToSubmit": "Where to submit the completed form"
}

Guidelines:
- Be specific and actionable
- Use simple language (8th-grade reading level)
- Include practical tips from local context
- Mention common issues faced by citizens
- Provide realistic timelines
- Include cost information if applicable

JSON response:`;

  try {
    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    let generatedText = "";
    
    if (Array.isArray(result) && result.length > 0) {
      generatedText = result[0].generated_text || "";
    } else if (result.generated_text) {
    }

    // Parse JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in LLM response, using fallback");
      return generateFallbackCheatSheet(formData);
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return parsedData;

  } catch (error) {
    console.error("Error generating cheat sheet:", error);
    return generateFallbackCheatSheet(formData);
  }
}

/**
 * Fallback cheat sheet generation (rule-based)
 */
function generateFallbackCheatSheet(formData) {
  const requiredDocs = formData.requiredDocuments || [];
  
  return {
    title: `Quick Guide to ${formData.name}`,
    summary: `This form is used for ${formData.documentType} purposes under the ${formData.department} department. Complete this form carefully to avoid delays in processing.`,
    preparationChecklist: [
      "Gather all required documents",
      "Have clear photocopies ready",
      "Keep passport-sized photos handy",
      "Note down important dates and reference numbers",
    ],
    stepByStepGuide: [
      {
        step: 1,
        title: "Collect Required Documents",
        description: "Gather all documents mentioned in the checklist",
        tip: "Make 2-3 photocopies of each document",
      },
      {
        step: 2,
        title: "Fill Personal Information",
        description: "Start with basic details like name, address, and contact",
        tip: "Use BLOCK LETTERS for better clarity",
      },
      {
        step: 3,
        title: "Complete All Fields",
        description: "Go through each section systematically",
        tip: "Don't leave any required field blank",
      },
      {
        step: 4,
        title: "Review and Verify",
        description: "Double-check all information for accuracy",
        tip: "Get someone else to review it too",
      },
      {
        step: 5,
        title: "Submit Application",
        description: "Submit at the designated office with all documents",
        tip: "Keep a copy of the submitted form for your records",
      },
    ],
    commonMistakes: [
      {
        mistake: "Incomplete or missing signatures",
        solution: "Sign in all designated places and get witness signatures where required",
      },
      {
        mistake: "Unclear photocopies",
        solution: "Use good quality copies, avoid faded or blurry documents",
      },
      {
        mistake: "Incorrect date formats",
        solution: "Use DD/MM/YYYY format consistently throughout the form",
      },
      {
        mistake: "Missing supporting documents",
        solution: "Attach all required documents and make a checklist before submission",
      },
    ],
    requiredDocumentsGuide: requiredDocs.map((doc) => ({
      document: doc.name,
      purpose: doc.description || "Required for verification",
      format: doc.acceptedFormats?.join(", ") || "Physical copy",
      tips: doc.required ? "This is mandatory" : "Include if applicable",
    })),
    importantReminders: [
      "Keep photocopies of all submitted documents",
      "Note down the application/reference number",
      "Ask for a receipt or acknowledgment",
      "Follow up if processing takes longer than expected",
    ],
    processingTime: formData.aiAnalysis?.estimatedCompletionMinutes 
      ? `${formData.aiAnalysis.estimatedCompletionMinutes} minutes to fill, ${formData.aiAnalysis.estimatedCompletionMinutes * 2} to ${formData.aiAnalysis.estimatedCompletionMinutes * 4} days for processing`
      : "Processing time varies, usually 7-15 working days",
    fees: "Contact the office for current fee structure",
    whereToSubmit: `${formData.department} department office or designated service center`,
  };
}

/**
 * Main callable function to generate cheat sheet
 */
exports.generateCheatSheet = onCall(
  { 
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async (request) => {
    try {
      const { formId } = request.data;

      if (!formId) {
        throw new HttpsError("invalid-argument", "formId is required");
      }

      // Fetch the form document
      const formRef = db.collection("government_forms").doc(formId);
      const formDoc = await formRef.get();

      if (!formDoc.exists) {
        throw new HttpsError("not-found", `Form with ID ${formId} not found`);
      }

      const formData = formDoc.data();

      console.log(`Generating cheat sheet for form: ${formId}`);

      // Generate cheat sheet content using AI
      const cheatSheetContent = await generateCheatSheetContent(formData);

      // Create cheat sheet object
      const cheatSheet = {
        id: `cheatsheet_${formId}_${Date.now()}`,
        formId,
        formName: formData.name,
        ...cheatSheetContent,
        generatedAt: new Date(),
        version: "1.0",
      };

      // Store cheat sheet in Firestore (optional - for caching)
      await db.collection("form_cheat_sheets").doc(cheatSheet.id).set(cheatSheet);

      // Also update the form document with reference to cheat sheet
      await formRef.update({
        cheatSheetId: cheatSheet.id,
        cheatSheetGeneratedAt: new Date(),
      });

      console.log(`Successfully generated cheat sheet for form ${formId}`);

      return {
        success: true,
        cheatSheet,
        message: "Cheat sheet generated successfully",
      };

    } catch (error) {
      console.error("Error in generateCheatSheet:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        "internal",
        `Failed to generate cheat sheet: ${error.message}`
      );
    }
  }
);

/**
 * Batch function to generate cheat sheets for multiple forms
 */
exports.batchGenerateCheatSheets = onCall(
  { 
    timeoutSeconds: 540,
    memory: "1GiB",
  },
  async (request) => {
    try {
      const { formIds } = request.data;

      if (!Array.isArray(formIds) || formIds.length === 0) {
        throw new HttpsError("invalid-argument", "formIds array is required");
      }

      const results = [];

      for (const formId of formIds) {
        try {
          const result = await exports.generateCheatSheet.run({
            data: { formId },
          });
          results.push({ formId, ...result });
        } catch (error) {
          results.push({
            formId,
            success: false,
            error: error.message,
          });
        }

        // Wait between forms to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const successCount = results.filter((r) => r.success).length;

      return {
        success: true,
        message: `Processed ${formIds.length} forms, ${successCount} successful`,
        results,
      };

    } catch (error) {
      console.error("Error in batchGenerateCheatSheets:", error);
      throw new HttpsError(
        "internal",
        `Batch generation failed: ${error.message}`
      );
    }
  }
);
