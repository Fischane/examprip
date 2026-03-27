# Implementation Plan: CV Builder Platform

## Overview

Incremental implementation of the CV Builder Platform on top of the existing CV maker page. Each task builds on the previous, ending with full integration. All code is TypeScript with Next.js 14 App Router, MongoDB/Mongoose, NextAuth, and Tailwind CSS.

## Tasks

- [x] 1. Create Mongoose models for the CV Builder Platform
  - Create `src/models/CVTemplate.ts` with fields: name, thumbnailUrl, layoutConfig, defaultContent, isPaid, price, isPublished, createdBy
  - Create `src/models/CVDocument.ts` with fields: user, templateId, name, version, data (all CV fields + links + icons), styling (colorScheme, font, accentColor, backgroundColor)
  - Create `src/models/CoverLetter.ts` with fields: user, cvDocumentId, recipientName, recipientTitle, companyName, paragraphs, sectionOrder, links, styling
  - Create `src/models/CVPayment.ts` mirroring the existing Payment model but with a `template` ref field instead of `planDays`
  - Create `src/models/DownloadRecord.ts` with fields: user, cvDocumentId, type ('cv' | 'cover-letter')
  - Create `src/models/SiteSettings.ts` (singleton) with fields: colorScheme, logoUrl, bannerText, subscriptionPlans array
  - Create `src/models/FAQ.ts` with fields: question, answer, sortOrder
  - _Requirements: 2.1, 3.5, 4.1, 5.1, 6.2, 10.2, 11.1_

- [x] 2. Implement CV Document API routes
  - [x] 2.1 Create `src/app/api/cv-documents/route.ts` — GET (list user's CVDocuments sorted by updatedAt desc) and POST (create new CVDocument with auto-version logic)
    - Version logic: count existing docs with same user+name, set version = count + 1
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 2.2 Write property test for CV save/load round trip
    - **Property 1: CV save/load round trip**
    - **Validates: Requirements 2.1, 2.4**
  - [ ]* 2.3 Write property test for version increment on duplicate name
    - **Property 2: Version increment on duplicate name**
    - **Validates: Requirements 2.2**
  - [x] 2.4 Create `src/app/api/cv-documents/[id]/route.ts` — GET (load single doc), PUT (update), DELETE (cascade delete associated CoverLetter)
    - _Requirements: 2.4, 2.5, 6.5_
  - [ ]* 2.5 Write property test for CV deletion cascade
    - **Property 8: CV deletion cascades to cover letter**
    - **Validates: Requirements 6.5**

- [-] 3. Implement CV Template API routes
  - [x] 3.1 Create `src/app/api/cv-templates/route.ts` — GET (list templates with optional `?filter=free|paid` query param, admin POST to create)
    - _Requirements: 4.1, 4.2, 4.3, 7.1_
  - [ ]* 3.2 Write property test for template filter correctness
    - **Property 4: Template filter correctness**
    - **Validates: Requirements 4.2, 4.3**
  - [x] 3.3 Create `src/app/api/cv-templates/[id]/route.ts` — GET, PUT (admin), DELETE (admin, check for active CVDocuments, return 409 if conflict without force=true)
    - _Requirements: 7.2, 7.3, 7.6_
  - [ ]* 3.4 Write property test for template conflict detection
    - **Property 15: Template conflict detection**
    - **Validates: Requirements 7.6**

- [-] 4. Implement CV Payment API routes
  - [x] 4.1 Create `src/app/api/cv-payments/route.ts` — GET (list user's template payments) and POST (submit payment for a template, status=pending)
    - _Requirements: 5.1_
  - [x] 4.2 Create `src/app/api/cv-payments/[id]/approve/route.ts` and `reject/route.ts` — PATCH endpoints for admin to approve or reject
    - _Requirements: 5.2, 5.4_
  - [x] 4.3 Create `src/lib/cv-access.ts` — `checkTemplateAccess(userId, templateId)` function: returns true for free templates, true if approved CVPayment exists, false otherwise
    - _Requirements: 4.6, 4.7, 5.2, 5.3_
  - [ ]* 4.4 Write property test for paid template access gate
    - **Property 5: Paid template access gate**
    - **Validates: Requirements 4.6, 4.7, 5.2, 5.3**

- [-] 5. Implement Cover Letter and Download Record API routes
  - [x] 5.1 Create `src/app/api/cover-letters/route.ts` and `src/app/api/cover-letters/[id]/route.ts` — CRUD for cover letters
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  - [ ]* 5.2 Write property test for cover letter section order round trip
    - **Property 7: Cover letter section order round trip**
    - **Validates: Requirements 3.3**
  - [-] 5.3 Create `src/app/api/download-records/route.ts` — GET (list user's download history sorted by createdAt desc) and POST (create record on download)
    - _Requirements: 6.2, 6.3_
  - [ ]* 5.4 Write property test for download record creation
    - **Property 6: Download record creation on every download**
    - **Validates: Requirements 6.2**

- [ ] 6. Checkpoint — Ensure all API routes and models are working
  - Ensure all tests pass, ask the user if questions arise.

- [-] 7. Implement CV customization utilities
  - [x] 7.1 Create `src/lib/cv-styling.ts` — define 5 preset color schemes and 4 font options as typed constants; export `resolveColorScheme(key)` and `resolveFont(key)` functions that return CSS values and fall back to defaults for invalid keys
    - _Requirements: 1.2, 1.3, 1.5, 1.6_
  - [ ]* 7.2 Write property test for styling application correctness
    - **Property 11: Styling application correctness**
    - **Validates: Requirements 1.2, 1.3, 1.6**
  - [x] 7.3 Create `src/lib/cv-validation.ts` — export `validateCoverLetter(data)` returning false if recipientName is empty or paragraphs array is empty
    - _Requirements: 3.6_
  - [ ]* 7.4 Write property test for cover letter validation gate
    - **Property 12: Cover letter validation gate**
    - **Validates: Requirements 3.6**

- [-] 8. Build the Template Gallery page
  - [x] 8.1 Create `src/app/(student)/app/cv/templates/page.tsx` — fetch all published templates, render grid with name, thumbnail, Free/Paid badge, filter buttons (All / Free / Paid), Preview button, and Use Template button
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 8.2 Add template preview modal component `src/components/cv/TemplatePreviewModal.tsx` — full-size preview with close button
    - _Requirements: 4.4_
  - [x] 8.3 Wire "Use Template" button: call `checkTemplateAccess`, navigate to `/app/cv/editor?templateId=X` for accessible templates, navigate to `/app/cv/payment?templateId=X` for locked paid templates
    - _Requirements: 4.5, 4.6, 4.7_

- [ ] 9. Extend the CV Editor page
  - [ ] 9.1 Refactor `src/app/(student)/app/cv/page.tsx` to redirect to `/app/cv/templates` if no templateId is in the URL, or load the template defaults if templateId is provided
    - _Requirements: 4.5_
  - [x] 9.2 Create `src/app/(student)/app/cv/editor/page.tsx` — extend the existing CV form with: color scheme selector, font selector, icon picker per section (contact, skills, awards), and social links fields (LinkedIn, GitHub, portfolio)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ] 9.3 Add "Save CV" button to the editor — POST to `/api/cv-documents`, show save confirmation; on download/print, POST to `/api/download-records` before opening print window
    - _Requirements: 2.1, 6.2_
  - [x] 9.4 Create `src/app/(student)/app/cv/editor/[id]/page.tsx` — load existing CVDocument by ID into the editor form
    - _Requirements: 2.4, 6.4_

- [-] 10. Build the Cover Letter Editor page
  - [-] 10.1 Create `src/app/(student)/app/cv/cover-letter/[cvId]/page.tsx` — form with recipient fields, body paragraph editor (add/remove/reorder paragraphs via drag handles), links fields, font/color selectors, Download button
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 10.2 Implement cover letter HTML generation function in `src/lib/cover-letter-print.ts` — takes CoverLetter data and styling, returns print-ready HTML string; validate required fields before generating
    - _Requirements: 3.4, 3.6_

- [ ] 11. Build the Student CV Dashboard
  - [ ] 11.1 Create `src/app/(student)/app/cv/dashboard/page.tsx` — fetch user's CVDocuments and CoverLetters, render cards with Edit/Delete buttons and associated cover letter link; fetch and display download history
    - _Requirements: 6.1, 6.3, 6.4, 6.5_
  - [ ] 11.2 Add accessible templates section to the dashboard — fetch free templates + templates with approved CVPayments for the user
    - _Requirements: 5.5_
  - [ ]* 11.3 Write property test for dashboard list completeness and sort order
    - **Property 3: Dashboard list completeness and sort order**
    - **Validates: Requirements 2.3, 6.1**

- [ ] 12. Build the Template Payment page
  - Create `src/app/(student)/app/cv/payment/page.tsx` — read `templateId` from query params, display template name and price, render the same reference number submission form as the existing payment page, POST to `/api/cv-payments`
  - _Requirements: 5.1, 5.4_

- [ ] 13. Checkpoint — Ensure all student-facing pages work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Build Admin Template Management page
  - [ ] 14.1 Create `src/app/admin/cv-templates/page.tsx` — paginated table of all templates with Edit, Delete, Preview, and Publish/Unpublish actions; "Add Template" button opens a form modal
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ] 14.2 Create template form component `src/components/admin/cv/TemplateForm.tsx` — fields for name, thumbnailUrl, isPaid, price, defaultContent JSON editor, layoutConfig JSON editor
    - _Requirements: 7.1, 7.2_
  - [ ] 14.3 Wire delete with conflict check — call DELETE `/api/cv-templates/[id]`, if 409 show warning with affected user count and a "Force Delete" confirmation button
    - _Requirements: 7.6_
  - [ ] 14.4 Add CV Templates and CV Payments links to the admin sidebar in `src/components/admin/sidebar.tsx`
    - _Requirements: 7.1_

- [ ] 15. Implement Admin User Management extensions
  - Extend `src/app/admin/users/page.tsx` (or create if not present) to show per-user CV stats: total CVs created, total downloads, last active date; add Deactivate/Reactivate and Delete buttons that call the existing user API with isActive updates and cascade delete
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 15.1 Write property test for user activation state round trip
    - **Property 13: User deactivate/reactivate round trip**
    - **Validates: Requirements 8.2, 8.3**
  - [ ]* 15.2 Write property test for user cascade delete
    - **Property 14: User cascade delete**
    - **Validates: Requirements 8.5**

- [ ] 16. Implement Admin Analytics and CV Analytics API
  - [ ] 16.1 Create `src/app/api/cv-analytics/route.ts` — aggregate: total CVDocuments this month, total DownloadRecords this month, active users (users with at least one CVDocument this month), templates ranked by CVDocument count, paid templates ranked by approved CVPayment sum
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ]* 16.2 Write property test for analytics count consistency
    - **Property 9: Analytics count consistency**
    - **Validates: Requirements 9.1**
  - [ ] 16.3 Create `src/app/admin/cv-analytics/page.tsx` — display stats cards and ranked template tables
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 17. Implement Admin Content Management (FAQ) and Site Settings
  - [ ] 17.1 Create `src/app/api/faqs/route.ts` — GET (ordered by sortOrder asc), POST; and `src/app/api/faqs/[id]/route.ts` — PUT, DELETE
    - _Requirements: 10.2, 10.3_
  - [ ]* 17.2 Write property test for FAQ sort order round trip
    - **Property 10: FAQ sort order round trip**
    - **Validates: Requirements 10.2, 10.3**
  - [ ] 17.3 Create `src/app/api/cv-settings/route.ts` — GET and PUT for the singleton SiteSettings document
    - _Requirements: 11.1, 11.2, 11.3_
  - [ ]* 17.4 Write property test for site settings round trip
    - **Property 16: Site settings round trip**
    - **Validates: Requirements 11.1, 11.2, 11.3**
  - [ ] 17.5 Create `src/app/admin/cv-settings/page.tsx` — tabs for: Site Appearance (color scheme, logo), FAQ CRUD table, Subscription Plans CRUD
    - _Requirements: 10.1, 10.2, 11.1, 11.2, 11.3_

- [ ] 18. Wire student nav and final integration
  - Add "CV Dashboard" link to `src/components/student/nav.tsx` pointing to `/app/cv/dashboard`
  - Update the existing `/app/cv` route to redirect to `/app/cv/templates` so the template gallery is the new entry point
  - _Requirements: 4.1_

- [ ] 19. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with minimum 100 iterations each
- Each property test references its design document property number
- Tag format: **Feature: cv-builder-platform, Property N: {property_text}**
