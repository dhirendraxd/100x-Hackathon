# NID Application Form - Implementation Complete ✅

## Overview
Successfully created a comprehensive National Identity Card (NID) application form with all 42 required fields based on the official DoNIDCR application form structure.

## Form Structure

### Form Metadata
- **ID**: `nid-application-2024`
- **Name**: National Identity Card (NID) Application
- **Nepali Name**: राष्ट्रिय परिचयपत्र आवेदन फारम
- **Department**: home-affairs
- **Document Type**: national-id
- **Difficulty**: medium
- **Official URL**: https://donidcr.gov.np/
- **Completion Time**: ~22 minutes
- **Complexity Score**: 70/100

## Fields Breakdown (42 total fields)

### Section 1: Applicant's Identification Details (15 fields)
1. **National Identity Number (NIN)** - Optional text field
2. **First Name** - Required text field
3. **Middle Name** - Optional text field
4. **Last Name** - Required text field
5. **Date of Birth (B.S.)** - Required date field
6. **Date of Birth (A.D.)** - Required date field
7. **Citizenship Certificate No.** - Required text field
8. **Citizenship Issue Date** - Required date field
9. **Citizenship Issue District** - Required text field
10. **Citizenship Type** - Required select (5 options):
    - वंशज (Descent)
    - जन्मसिद्ध (Birth)
    - अंगीकृत (Naturalized)
    - सम्मानार्थ (Honorary)
    - वैवाहिक अंगीकृत (Marital Naturalized)
11. **Birth Place** - Required text field
12. **Marital Status** - Required select (4 options):
    - विवाहित (Married)
    - अविवाहित (Unmarried)
    - सम्बन्ध विच्छेद (Divorced)
    - विधुर/विधवा (Widow/Widower)
13. **Religion** - Required select (6 options):
    - हिन्दु (Hindu)
    - बौद्ध (Buddhist)
    - किरात (Kirat)
    - क्रिश्चियन (Christian)
    - मुस्लिम (Muslim)
    - अन्य (Other)
14. **Educational Qualification** - Required select (8 options):
    - निरक्षर (Illiterate)
    - प्राथमिक (Primary)
    - माध्यमिक (Secondary)
    - एस.एल.सी. वा सो सरह (SLC or equivalent)
    - उच्च माध्यमिक (Higher Secondary)
    - स्नातक (Bachelor)
    - स्नातकोत्तर (Master)
    - विद्यावारिधी (PhD)
15. **Profession** - Required select (8 options):
    - कृषक (Farmer)
    - गृहणी (Homemaker)
    - सरकारी सेवा (Government Service)
    - निजी सेवा (Private Service)
    - स्वरोजगार (Self-employed)
    - विद्यार्थी (Student)
    - अवकाश प्राप्त (Retired)
    - अन्य (Other)

### Section 2: Permanent Address (7 fields)
16. **State (प्रदेश)** - Required
17. **District (जिल्ला)** - Required
18. **Municipality (गा.पा./न.पा.)** - Required
19. **Ward No. (वडा नं.)** - Required
20. **Village/Tole (गाउँ/टोल)** - Required
21. **Phone No. (फोन नं.)** - Optional
22. **Mobile No. (मोबाइल नं.)** - Required

### Section 3: Temporary Address (5 fields)
23. **State (प्रदेश)** - Optional
24. **District (जिल्ला)** - Optional
25. **Municipality (गा.पा./न.पा.)** - Optional
26. **Ward No. (वडा नं.)** - Optional
27. **Village/Tole (गाउँ/टोल)** - Optional

### Section 4: Family Details (15 fields)

#### Father's Information (5 fields)
28. **Father's First Name** - Required
29. **Father's Middle Name** - Optional
30. **Father's Last Name** - Required
31. **Father's Citizenship Certificate No.** - Optional
32. **Father's National Identity Number (NIN)** - Optional

#### Mother's Information (5 fields)
33. **Mother's First Name** - Required
34. **Mother's Middle Name** - Optional
35. **Mother's Last Name** - Required
36. **Mother's Citizenship Certificate No.** - Optional
37. **Mother's National Identity Number (NIN)** - Optional

#### Spouse's Information (5 fields) - Required if married
38. **Spouse's First Name** - Conditional
39. **Spouse's Middle Name** - Optional
40. **Spouse's Last Name** - Conditional
41. **Spouse's Citizenship Certificate No.** - Optional
42. **Spouse's National Identity Number (NIN)** - Optional

## Simplified Fields (10 user-friendly fields)
For easier form filling, we created 10 simplified fields that map to the original 42:
1. Your First Name
2. Your Middle Name (if any)
3. Your Last Name/Surname
4. Date of Birth
5. Citizenship Certificate Number
6. Which District Issued Your Citizenship?
7. Mobile Number
8. Are You Currently Married?
9. Father's Full Name
10. Mother's Full Name

## Required Documents (4 documents)
1. **Citizenship Certificate** (Original + 2 Photocopies) - Required
   - Formats: PDF, JPG, PNG
   - Max size: 5MB
2. **Passport Size Photos** (3 copies) - Required
   - White background
   - Formats: JPG, PNG
   - Max size: 2MB
3. **Birth Certificate** - Optional (if available)
   - Formats: PDF, JPG, PNG
   - Max size: 3MB
4. **Marriage Certificate** - Conditional (for married applicants)
   - Formats: PDF, JPG, PNG
   - Max size: 3MB

## Form Annotations (3 helpful tooltips)
1. **NIN Field**: Explanation about when to provide existing NIN vs leaving blank for first application
2. **Citizenship Types**: Detailed explanation of all 5 citizenship types in both Nepali and English
3. **Marital Status**: Guidance on when spouse details are required

## Field Mappings (5 key mappings)
Connecting simplified fields to original form fields with clear instructions:
1. First Name → `nid_field_2`
2. Last Name → `nid_field_4`
3. Date of Birth → `nid_field_5` (auto-converted to B.S.)
4. Citizenship No. → `nid_field_7`
5. Mobile No. → `nid_field_22`

## Statistics & Metadata
- **Total Submissions**: 45,820
- **Success Rate**: 91%
- **Average Completion Time**: 25 minutes
- **Popularity Score**: 98/100
- **Common Mistakes**:
  - Incorrect date format (B.S. vs A.D.)
  - Missing parent information
  - Incomplete address details
  - Wrong citizenship type selection
  - Not providing spouse details when married

## Keywords & Tags
- **Tags**: nid, national-id, identity, biometric, parichaya-patra
- **Keywords**: national id, nid, राष्ट्रिय परिचयपत्र, parichaya patra, identity card, biometric card

## Technical Implementation

### Type Updates
- Added `'national-id'` to `DocumentType` in `/src/types/governmentForms.ts`

### File Location
- Form data added to `/src/data/mockForms.ts`
- Positioned after PAN card form, before closing array bracket

### Structure
- All fields follow the `OriginalFormField` interface
- Simplified fields follow the `SimplifiedFormField` interface with options as objects (value/label pairs)
- Select field options in original fields are string arrays
- All sections properly configured with estimated completion times
- Complete with field mappings, annotations, and required documents

## Build Status
✅ **Build Successful** - Completed in 7.26s with no errors

## Usage
The NID form is now available in:
- Form Library page (browse digitized forms)
- FormFiller component (fill form with autofill support)
- Mock data services (testing without Firebase)
- Government forms search

## Next Steps
To use this form:
1. Navigate to Form Library (`/library`)
2. Search for "National ID" or "NID"
3. Click to view or start filling the form
4. Use autofill feature if you have a saved profile
5. Follow the 4-section wizard for completion

## Notes
- All Nepali text preserved with proper Unicode characters
- Bilingual support ready (field labels in both English and Nepali)
- Date fields support both Bikram Sambat (B.S.) and Anno Domini (A.D.) formats
- Conditional fields (spouse details) based on marital status
- Address validation ready for Nepal's 7 provinces
- Mobile number field includes format validation hints
