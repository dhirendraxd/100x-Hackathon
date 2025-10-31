/**
 * Firebase Cloud Function: Generate Simplified Form
 * 
 * Transforms complex government form fields into user-friendly simplified versions
 * using Hugging Face LLMs (Mistral-7B-Instruct or similar).
 * 
 * This function:
 * 1. Analyzes each original form field
 * 2. Generates simplified labels, descriptions, examples, and hints
 * 3. Preserves field mapping for data export
 * 4. Stores simplified fields in the same government_forms document
 * 
 * @param {Object} data - { formId: string, regenerate?: boolean }
 * @returns {Object} - { success: boolean, formId: string, message: string, stats: {...} }
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
 * Generate simplified version of a single field using LLM
 */
async function generateSimplifiedField(originalField, formContext) {
  const token = process.env.HUGGING_FACE_ACCESS_TOKEN;
  if (!token) {
    throw new Error("HUGGING_FACE_ACCESS_TOKEN not configured");
  }

  // Create a prompt for the LLM to generate simplified field data
  const prompt = `You are a helpful assistant that simplifies complex government form fields for common citizens.

Original Field Information:
- Label: ${originalField.label}
- Type: ${originalField.type}
- Section: ${originalField.section}
- Required: ${originalField.required ? "Yes" : "No"}
${originalField.helpText ? `- Help Text: ${originalField.helpText}` : ""}
${originalField.options ? `- Options: ${originalField.options.join(", ")}` : ""}

Form Context:
- Form Name: ${formContext.formName}
- Department: ${formContext.department}
- Document Type: ${formContext.documentType}

Task: Create a simplified, user-friendly version of this field.

Provide your response in this exact JSON format (no markdown, no code blocks):
{
  "simplifiedLabel": "A clear, simple label (5-7 words max)",
  "description": "Plain-language explanation of what to enter (15-25 words)",
  "placeholder": "Example placeholder text showing the format",
  "hint": "A helpful tip or common mistake to avoid (10-15 words)",
  "example": "A realistic example value"
}

Important guidelines:
- Use simple, everyday language (8th-grade reading level)
- Avoid legal jargon and technical terms
- Be specific and actionable
- Provide practical examples
- Keep it concise and clear

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
          max_new_tokens: 250,
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
      generatedText = result.generated_text;
    }

    // Parse JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in LLM response, using fallback");
      return generateFallbackSimplifiedField(originalField);
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    
    return {
      simplifiedLabel: parsedData.simplifiedLabel || originalField.label,
      description: parsedData.description || `Enter your ${originalField.label.toLowerCase()}`,
      placeholder: parsedData.placeholder || "",
      hint: parsedData.hint || "",
      example: parsedData.example || "",
    };

  } catch (error) {
    console.error("Error generating simplified field:", error);
    return generateFallbackSimplifiedField(originalField);
  }
}

/**
 * Fallback simplified field generation (rule-based)
 */
function generateFallbackSimplifiedField(originalField) {
  const label = originalField.label;
  const type = originalField.type;

  // Simple rule-based transformations
  let simplifiedLabel = label;
  let description = `Please enter your ${label.toLowerCase()}`;
  let placeholder = "";
  let hint = "";
  let example = "";

  // Type-specific defaults
  switch (type) {
    case "text":
      placeholder = "Type here...";
      hint = "Use English letters only";
      example = "John Doe";
      break;
    case "number":
      placeholder = "0";
      hint = "Enter numbers only";
      example = "12345";
      break;
    case "email":
      placeholder = "your.email@example.com";
      hint = "Use a valid email address";
      example = "ramesh.kumar@gmail.com";
      description = "Enter your email address for communication";
      break;
    case "phone":
      placeholder = "98XXXXXXXX";
      hint = "Enter 10-digit mobile number";
      example = "9801234567";
      description = "Enter your active mobile number";
      break;
    case "date":
      placeholder = "DD/MM/YYYY";
      hint = "Use the calendar picker";
      example = "15/08/1990";
      description = "Select the date from the calendar";
      break;
    case "address":
      placeholder = "Street, City, District";
      hint = "Include your complete address";
      example = "Thamel, Kathmandu, Bagmati";
      description = "Enter your full residential address";
      break;
    case "select":
      placeholder = "Choose an option...";
      hint = "Select the most appropriate option";
      description = `Select your ${label.toLowerCase()} from the dropdown`;
      break;
    case "file-upload":
      placeholder = "Click to upload file";
      hint = "Upload a clear, readable document";
      description = `Upload your ${label.toLowerCase()} document`;
      break;
    case "signature":
      placeholder = "Click to sign";
      hint = "Use a clear, consistent signature";
      description = "Provide your signature";
      break;
  }

  return {
    simplifiedLabel,
    description,
    placeholder,
    hint,
    example,
  };
}

/**
 * Main callable function to generate simplified form
 */
exports.generateSimplifiedForm = onCall(
  { 
    timeoutSeconds: 540,
    memory: "1GiB",
  },
  async (request) => {
    try {
      const { formId, regenerate = false } = request.data;

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

      // Check if simplified fields already exist
      if (formData.simplifiedFields && formData.simplifiedFields.length > 0 && !regenerate) {
        return {
          success: true,
          formId,
          message: "Simplified fields already exist. Use regenerate=true to regenerate.",
          cached: true,
          stats: {
            totalFields: formData.originalFields?.length || 0,
            simplifiedFields: formData.simplifiedFields.length,
          },
        };
      }

      const originalFields = formData.originalFields || [];
      if (originalFields.length === 0) {
        throw new HttpsError("failed-precondition", "No original fields found in form");
      }

      // Form context for LLM
      const formContext = {
        formName: formData.name,
        department: formData.department,
        documentType: formData.documentType,
      };

      console.log(`Generating simplified fields for form: ${formId} (${originalFields.length} fields)`);

      const simplifiedFields = [];
      const fieldMappings = [];

      // Generate simplified version for each field
      for (let i = 0; i < originalFields.length; i++) {
        const originalField = originalFields[i];
        
        console.log(`Processing field ${i + 1}/${originalFields.length}: ${originalField.label}`);

        // Generate simplified field data
        const simplifiedData = await generateSimplifiedField(originalField, formContext);

        // Create simplified field object
        const simplifiedField = {
          id: `simplified_${originalField.id}`,
          label: simplifiedData.simplifiedLabel,
          type: originalField.type,
          description: simplifiedData.description,
          required: originalField.required,
          placeholder: simplifiedData.placeholder,
          hint: simplifiedData.hint,
          example: simplifiedData.example,
          mappingTo: originalField.id,
          validation: originalField.validation || [],
        };

        // Handle select/radio/checkbox options
        if (originalField.options && originalField.options.length > 0) {
          simplifiedField.options = originalField.options.map((opt) => ({
            value: opt,
            label: opt, // Could be simplified further with another LLM call
          }));
        }

        simplifiedFields.push(simplifiedField);

        // Create field mapping
        const mapping = {
          simplifiedFieldId: simplifiedField.id,
          originalFieldId: originalField.id,
          originalSection: originalField.section,
          originalFieldName: originalField.label,
          instructions: `Copy the value from "${simplifiedField.label}" to the field "${originalField.label}" in section "${originalField.section}"`,
        };

        fieldMappings.push(mapping);

        // Rate limiting: Wait 500ms between API calls to avoid rate limits
        if (i < originalFields.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      // Update the form document with simplified fields and mappings
      await formRef.update({
        simplifiedFields,
        fieldMappings,
        simplifiedGeneratedAt: new Date(),
        simplifiedVersion: "1.0",
      });

      console.log(`Successfully generated ${simplifiedFields.length} simplified fields for form ${formId}`);

      return {
        success: true,
        formId,
        message: `Successfully generated ${simplifiedFields.length} simplified fields`,
        cached: false,
        stats: {
          totalFields: originalFields.length,
          simplifiedFields: simplifiedFields.length,
          fieldMappings: fieldMappings.length,
        },
      };

    } catch (error) {
      console.error("Error in generateSimplifiedForm:", error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      throw new HttpsError(
        "internal",
        `Failed to generate simplified form: ${error.message}`
      );
    }
  }
);

/**
 * Batch function to generate simplified forms for multiple forms
 */
exports.batchGenerateSimplifiedForms = onCall(
  { 
    timeoutSeconds: 540,
    memory: "1GiB",
  },
  async (request) => {
    try {
      const { formIds, regenerate = false } = request.data;

      if (!Array.isArray(formIds) || formIds.length === 0) {
        throw new HttpsError("invalid-argument", "formIds array is required");
      }

      const results = [];

      for (const formId of formIds) {
        try {
          const result = await exports.generateSimplifiedForm.run({
            data: { formId, regenerate },
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const successCount = results.filter((r) => r.success).length;

      return {
        success: true,
        message: `Processed ${formIds.length} forms, ${successCount} successful`,
        results,
      };

    } catch (error) {
      console.error("Error in batchGenerateSimplifiedForms:", error);
      throw new HttpsError(
        "internal",
        `Batch generation failed: ${error.message}`
      );
    }
  }
);
