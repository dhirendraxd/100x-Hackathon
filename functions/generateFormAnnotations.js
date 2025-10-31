import { onCall } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { initializeApp, getApps } from "firebase-admin/app";

// Initialize Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

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
 * Identify complex legal/technical terms in form fields
 */
function identifyComplexTerms(fields) {
  const complexKeywords = [
    // Legal terms
    'affidavit', 'attestation', 'notarized', 'certification', 'verification',
    'declaration', 'undertaking', 'indemnity', 'waiver', 'consent',
    'authorization', 'power of attorney', 'guardian', 'custodian',
    
    // Government/bureaucratic terms
    'jurisdiction', 'domicile', 'resident', 'ordinarily resident',
    'permanent address', 'correspondence address', 'registered office',
    'statutory', 'regulatory', 'compliance', 'pursuant',
    
    // Financial/tax terms
    'PAN', 'TAN', 'GST', 'income tax', 'assessment year', 'financial year',
    'fiscal', 'remuneration', 'emoluments', 'allowances',
    
    // Technical terms
    'biometric', 'specimen signature', 'thumbprint', 'iris scan',
    'demographic', 'aadhaar', 'UID', 'unique identification',
    
    // Document-specific
    'annexure', 'appendix', 'schedule', 'proforma', 'format',
    'prescribed form', 'self-attested', 'apostille', 'legalization',
  ];

  const complexFields = [];

  fields.forEach((field) => {
    const fieldText = `${field.label} ${field.helpText || ''}`.toLowerCase();
    const foundTerms = complexKeywords.filter(term => 
      fieldText.includes(term.toLowerCase())
    );

    if (foundTerms.length > 0 || field.isComplex) {
      complexFields.push({
        fieldId: field.id,
        fieldLabel: field.label,
        detectedTerms: foundTerms,
        fieldText: fieldText,
      });
    }
  });

  return complexFields;
}

/**
 * Generate simple explanation for a complex term using LLM
 */
async function generateExplanation(term, context, token) {
  try {
    const prompt = `You are a helpful assistant explaining government form terminology to common citizens in simple language.

Term: "${term}"
Context: This term appears in a government form field: "${context}"

Provide a clear, simple explanation in 2-3 sentences that:
1. Explains what the term means in plain English
2. Explains why it's needed in this form
3. Gives a practical example if relevant

Keep the language simple and friendly. Avoid using other complex terms.

Explanation:`;

    const result = await callHuggingFaceText(
      "mistralai/Mistral-7B-Instruct-v0.2",
      token,
      prompt,
      200
    );

    if (Array.isArray(result) && result[0]?.generated_text) {
      // Extract and clean the explanation
      let explanation = result[0].generated_text.trim();
      
      // Remove any remaining prompt text
      explanation = explanation.replace(/^(Explanation:|Term:|Context:)/gi, '').trim();
      
      // Limit to first 3 sentences
      const sentences = explanation.match(/[^.!?]+[.!?]+/g) || [explanation];
      explanation = sentences.slice(0, 3).join(' ').trim();
      
      return explanation || "This is an important field for the form.";
    }

    return "This is an important field for the form.";
  } catch (error) {
    console.error(`Error generating explanation for "${term}":`, error);
    return "Please refer to official documentation for details.";
  }
}

/**
 * Main function: Generate AI annotations for a government form
 * 
 * @param {Object} request.data
 * @param {string} request.data.formId - ID of the government form to annotate
 * @param {boolean} request.data.regenerate - Force regenerate all annotations
 */
export const generateFormAnnotations = onCall(
  { cors: true, region: "us-central1", timeoutSeconds: 540 },
  async (request) => {
    try {
      // Check authentication
      if (!request.auth) {
        throw new Error("Authentication required");
      }

      const { formId, regenerate } = request.data || {};
      const token = process.env.HUGGING_FACE_ACCESS_TOKEN;

      if (!token) {
        throw new Error("HUGGING_FACE_ACCESS_TOKEN not configured");
      }

      if (!formId) {
        throw new Error("formId is required");
      }

      console.log(`Generating annotations for form: ${formId}`);

      // Get the form document
      const formRef = db.collection("government_forms").doc(formId);
      const formDoc = await formRef.get();

      if (!formDoc.exists) {
        throw new Error("Form not found");
      }

      const formData = formDoc.data();
      
      // Check if annotations already exist and not forcing regeneration
      if (!regenerate && formData.annotations && formData.annotations.length > 0) {
        console.log("Annotations already exist, skipping generation");
        return {
          success: true,
          message: "Annotations already exist",
          annotationsCount: formData.annotations.length,
          formId: formId,
          cached: true,
        };
      }

      const originalFields = formData.originalFields || [];
      
      if (originalFields.length === 0) {
        throw new Error("No fields found in form");
      }

      console.log(`Analyzing ${originalFields.length} fields...`);

      // Step 1: Identify complex terms
      const complexFields = identifyComplexTerms(originalFields);
      console.log(`Found ${complexFields.length} fields with complex terms`);

      // Step 2: Generate annotations
      const annotations = [];
      let processedCount = 0;

      for (const complexField of complexFields) {
        processedCount++;
        console.log(`Processing field ${processedCount}/${complexFields.length}: ${complexField.fieldLabel}`);

        // Generate annotation for each detected term
        for (const term of complexField.detectedTerms) {
          const explanation = await generateExplanation(
            term,
            complexField.fieldLabel,
            token
          );

          annotations.push({
            id: `annotation_${complexField.fieldId}_${term.replace(/\s+/g, '_')}`,
            sectionId: "section_1", // Default, can be enhanced
            fieldId: complexField.fieldId,
            type: "tooltip",
            title: term,
            content: explanation,
            aiGenerated: true,
            verified: false,
          });

          // Rate limiting: small delay between API calls
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // If no specific terms, but field marked as complex, generate general annotation
        if (complexField.detectedTerms.length === 0) {
          const explanation = await generateExplanation(
            complexField.fieldLabel,
            `This field requires: ${complexField.fieldLabel}`,
            token
          );

          annotations.push({
            id: `annotation_${complexField.fieldId}_general`,
            sectionId: "section_1",
            fieldId: complexField.fieldId,
            type: "info",
            title: complexField.fieldLabel,
            content: explanation,
            aiGenerated: true,
            verified: false,
          });

          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`Generated ${annotations.length} annotations`);

      // Step 3: Update form document with annotations
      await formRef.update({
        annotations: annotations,
        'aiAnalysis.legalTermsCount': complexFields.length,
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log("Annotations saved to Firestore");

      return {
        success: true,
        formId: formId,
        message: `Generated ${annotations.length} annotations for ${complexFields.length} complex fields`,
        stats: {
          totalFields: originalFields.length,
          complexFields: complexFields.length,
          annotationsGenerated: annotations.length,
        },
      };
    } catch (error) {
      console.error("Annotation generation error:", error);
      throw new Error(`Failed to generate annotations: ${error.message}`);
    }
  }
);

/**
 * Batch function: Generate annotations for multiple forms
 * 
 * @param {Object} request.data
 * @param {string[]} request.data.formIds - Array of form IDs to annotate
 */
export const batchGenerateAnnotations = onCall(
  { cors: true, region: "us-central1", timeoutSeconds: 540 },
  async (request) => {
    try {
      // Check authentication and admin role
      if (!request.auth) {
        throw new Error("Authentication required");
      }

      const { formIds } = request.data || {};

      if (!formIds || !Array.isArray(formIds) || formIds.length === 0) {
        throw new Error("formIds array is required");
      }

      console.log(`Batch generating annotations for ${formIds.length} forms`);

      const results = {
        success: [],
        failed: [],
      };

      for (const formId of formIds) {
        try {
          // Call the single form annotation function
          const annotationFunction = await import('./generateFormAnnotations.js');
          const result = await annotationFunction.generateFormAnnotations({
            auth: request.auth,
            data: { formId, regenerate: false },
          });

          results.success.push({
            formId,
            annotationsCount: result.stats?.annotationsGenerated || 0,
          });
        } catch (error) {
          console.error(`Failed to annotate form ${formId}:`, error);
          results.failed.push({
            formId,
            error: error.message,
          });
        }

        // Delay between forms to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return {
        success: true,
        message: `Processed ${formIds.length} forms`,
        results: results,
      };
    } catch (error) {
      console.error("Batch annotation error:", error);
      throw new Error(`Failed to batch generate annotations: ${error.message}`);
    }
  }
);
