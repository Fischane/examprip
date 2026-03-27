# Requirements Document

## Introduction

The CV Builder Platform extends the existing CV maker page (`src/app/(student)/app/cv/page.tsx`) in the Next.js + MongoDB exam prep application. It introduces a full-featured CV and cover letter creation system with template selection (free and paid), customization options (colors, fonts, icons), CV version history, a student dashboard, and admin tooling for template management, user management, analytics, and site settings. Paid templates reuse the existing offline payment system (reference number submission + admin approval).

## Glossary

- **CV_Builder**: The extended CV creation module built on top of the existing CV maker page
- **Template**: A pre-designed CV layout that can be free or paid
- **CV_Document**: A saved CV instance belonging to a user, including all field data and styling choices
- **Cover_Letter**: A separate document associated with a CV, with its own font, color, and section order
- **CV_Dashboard**: The student-facing page for managing saved CVs, cover letters, and download history
- **Template_Gallery**: The page listing all available templates with filter and preview capabilities
- **CV_Payment**: A payment record linking a user to a paid template, reusing the existing Payment model
- **Admin_Panel**: The admin-facing section for managing templates, users, analytics, and site settings
- **Download_Record**: A log entry created each time a user downloads or prints a CV
- **Icon_Set**: A collection of icons (social media, skills, awards) that can be embedded in a CV section

---

## Requirements

### Requirement 1: CV Customization

**User Story:** As a student, I want to customize the colors, fonts, and icons in my CV, so that I can create a visually distinctive and professional document.

#### Acceptance Criteria

1. WHEN a user opens the CV editor, THE CV_Builder SHALL display color scheme and font selection controls alongside the existing form fields
2. WHEN a user selects a color scheme, THE CV_Builder SHALL apply the chosen colors to the CV preview in real time
3. WHEN a user selects a font, THE CV_Builder SHALL apply the chosen font to the CV preview in real time
4. WHEN a user adds an icon to a section (contact, skills, or awards), THE CV_Builder SHALL render the selected icon in the CV preview and in the printed output
5. THE CV_Builder SHALL provide at least 5 preset color schemes and at least 4 font options
6. IF a user selects an invalid or unsupported font, THEN THE CV_Builder SHALL fall back to the default font and display an inline warning

---

### Requirement 2: CV Version History and Multi-CV Management

**User Story:** As a student, I want to save multiple CV versions and revisit them later, so that I can maintain different CVs for different job applications.

#### Acceptance Criteria

1. WHEN a user clicks "Save CV", THE CV_Builder SHALL persist the current CV_Document to the database under the authenticated user's account
2. WHEN a user saves a CV with the same name as an existing CV_Document, THE CV_Builder SHALL create a new version rather than overwriting the existing one
3. THE CV_Dashboard SHALL display all CV_Documents belonging to the authenticated user, ordered by last-modified date descending
4. WHEN a user clicks "Edit" on a saved CV_Document, THE CV_Builder SHALL load that CV_Document into the editor
5. WHEN a user clicks "Delete" on a saved CV_Document, THE CV_Builder SHALL remove the CV_Document from the database after a confirmation prompt
6. IF a delete operation fails, THEN THE CV_Builder SHALL display an error message and leave the CV_Document unchanged

---

### Requirement 3: Cover Letter Generator

**User Story:** As a student, I want to generate a cover letter alongside my CV, so that I can submit a complete job application package.

#### Acceptance Criteria

1. WHEN a user opens the cover letter editor, THE CV_Builder SHALL display fields for recipient, body paragraphs, and professional links (LinkedIn, GitHub, portfolio URL)
2. WHEN a user selects a font or color scheme for the cover letter, THE CV_Builder SHALL apply those settings independently from the CV settings
3. WHEN a user reorders sections in the cover letter editor, THE CV_Builder SHALL reflect the new section order in the preview immediately
4. WHEN a user clicks "Download Cover Letter", THE CV_Builder SHALL generate a print-ready HTML document using the current cover letter data and styling
5. THE CV_Builder SHALL associate each Cover_Letter with a CV_Document so they can be managed together from the CV_Dashboard
6. IF a required cover letter field (recipient name or at least one body paragraph) is empty, THEN THE CV_Builder SHALL prevent download and display a validation message

---

### Requirement 4: Template Gallery and Selection

**User Story:** As a student, I want to browse and preview CV templates before choosing one, so that I can pick a design that suits my profession.

#### Acceptance Criteria

1. THE Template_Gallery SHALL display all available templates with their name, thumbnail preview, and a Free or Paid badge
2. WHEN a user applies the "Free" filter, THE Template_Gallery SHALL show only templates marked as free
3. WHEN a user applies the "Paid" filter, THE Template_Gallery SHALL show only templates marked as paid
4. WHEN a user clicks "Preview" on a template, THE Template_Gallery SHALL display a full-size preview of the template in a modal or dedicated preview page
5. WHEN a user clicks "Use Template" on a free template, THE CV_Builder SHALL open the CV editor pre-loaded with that template's layout and default content
6. WHEN a user clicks "Use Template" on a paid template the user has already purchased, THE CV_Builder SHALL open the CV editor pre-loaded with that template
7. WHEN a user clicks "Use Template" on a paid template the user has not purchased, THE Template_Gallery SHALL redirect the user to the CV_Payment page with the template pre-selected

---

### Requirement 5: Paid Template Unlock via Offline Payment

**User Story:** As a student, I want to pay for a premium template using the existing offline payment system, so that I can unlock it without needing a credit card.

#### Acceptance Criteria

1. WHEN a user submits a CV_Payment for a paid template, THE CV_Builder SHALL create a payment record with status "pending" linked to both the user and the template
2. WHEN an admin approves a CV_Payment, THE CV_Builder SHALL mark the template as unlocked for that user
3. WHEN a user visits the Template_Gallery after a CV_Payment is approved, THE Template_Gallery SHALL display the previously paid template with a "Use Template" button instead of a payment prompt
4. IF a CV_Payment is rejected, THEN THE CV_Builder SHALL notify the user and allow resubmission
5. THE CV_Dashboard SHALL list all templates the user has access to, including free templates and templates unlocked via approved CV_Payment records

---

### Requirement 6: Student CV Dashboard

**User Story:** As a student, I want a central dashboard to manage all my CVs, cover letters, and download history, so that I can stay organized.

#### Acceptance Criteria

1. THE CV_Dashboard SHALL display all CV_Documents and associated Cover_Letters for the authenticated user
2. WHEN a user downloads or prints a CV_Document, THE CV_Builder SHALL create a Download_Record with the timestamp and document reference
3. THE CV_Dashboard SHALL display the user's Download_Record history, ordered by timestamp descending
4. WHEN a user clicks "Edit" on a CV_Document from the dashboard, THE CV_Builder SHALL navigate to the CV editor with that document loaded
5. WHEN a user clicks "Delete" on a CV_Document from the dashboard, THE CV_Builder SHALL remove the document and its associated Cover_Letter after confirmation

---

### Requirement 7: Admin Template Management

**User Story:** As an admin, I want to create, edit, and delete CV templates, so that I can keep the template library current and high quality.

#### Acceptance Criteria

1. WHEN an admin submits a new template form, THE Admin_Panel SHALL persist the template with name, thumbnail URL, layout configuration, default content, free/paid status, and price (if paid)
2. WHEN an admin edits an existing template, THE Admin_Panel SHALL update the template record and reflect changes in the Template_Gallery immediately
3. WHEN an admin deletes a template, THE Admin_Panel SHALL remove the template and display a confirmation prompt before deletion
4. THE Admin_Panel SHALL allow admins to preview any template before publishing it
5. WHEN an admin toggles a template between free and paid, THE Admin_Panel SHALL update the template's status and price accordingly
6. IF a template deletion is attempted while users have active CV_Documents using that template, THEN THE Admin_Panel SHALL warn the admin and require explicit confirmation

---

### Requirement 8: Admin User Management

**User Story:** As an admin, I want to view and manage all student accounts, so that I can maintain platform quality and handle policy violations.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all users with name, email, department, registration date, and account status
2. WHEN an admin deactivates a user, THE Admin_Panel SHALL set the user's `isActive` field to false and prevent that user from logging in
3. WHEN an admin reactivates a user, THE Admin_Panel SHALL set the user's `isActive` field to true
4. THE Admin_Panel SHALL display per-user stats: total CVs created, total downloads, and last active date
5. WHEN an admin deletes a user, THE Admin_Panel SHALL remove the user record and all associated CV_Documents, Cover_Letters, and CV_Payment records after confirmation

---

### Requirement 9: Admin Analytics

**User Story:** As an admin, I want to see platform-wide usage analytics, so that I can make informed decisions about templates and features.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display the total number of CVs created, total downloads, and count of active users for the current month
2. THE Admin_Panel SHALL display a ranked list of templates ordered by number of CVs created using each template
3. THE Admin_Panel SHALL display a ranked list of paid templates ordered by total revenue generated
4. WHEN an admin views the analytics page, THE Admin_Panel SHALL aggregate data from CV_Documents and Download_Records without exposing individual user PII beyond what is already visible in user management

---

### Requirement 10: Admin Content Management

**User Story:** As an admin, I want to manage default template content and help resources, so that students have a good starting experience.

#### Acceptance Criteria

1. WHEN an admin updates the default content for a template, THE Admin_Panel SHALL store the new default text and apply it when a student first opens that template
2. THE Admin_Panel SHALL provide a CRUD interface for FAQ entries, each with a question and answer field
3. WHEN a student visits the help page, THE CV_Builder SHALL display the current FAQ entries ordered by admin-defined sort order

---

### Requirement 11: Admin Website Settings

**User Story:** As an admin, I want to control global site appearance and subscription plans, so that I can keep the platform branded and commercially viable.

#### Acceptance Criteria

1. WHEN an admin updates the site color scheme or logo, THE Admin_Panel SHALL persist the settings and apply them to the CV Builder section on next page load
2. THE Admin_Panel SHALL provide an interface to create, edit, and delete subscription plan tiers for CV template access, each with a name, price, and list of included template IDs
3. WHEN an admin updates a subscription plan price, THE Admin_Panel SHALL reflect the new price on the Template_Gallery payment page immediately
