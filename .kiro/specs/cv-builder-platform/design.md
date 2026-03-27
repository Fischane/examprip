# Design Document: CV Builder Platform

## Overview

The CV Builder Platform extends the existing CV maker page at `src/app/(student)/app/cv/page.tsx` into a full-featured document creation system. It adds template selection (free and paid), per-CV customization (colors, fonts, icons), version history, a cover letter generator, a student dashboard, and a complete admin panel. The feature reuses the existing offline payment flow (Payment model, reference number submission, admin approval) for paid template unlocks.

The design follows the existing conventions: Next.js 14 App Router, MongoDB/Mongoose models, NextAuth sessions, and Tailwind CSS styling.

---

## Architecture

```mermaid
graph TD
    subgraph Student Routes
        A[/app/cv] --> B[Template Gallery]
        B --> C[CV Editor]
        C --> D[Cover Letter Editor]
        A2[/app/cv/dashboard] --> C
        A2 --> D
        A3[/app/cv/payment] --> E[Offline Payment Flow]
    end

    subgraph Admin Routes
        F[/admin/cv-templates] --> G[Template CRUD]
        H[/admin/cv-analytics] --> I[Analytics View]
        J[/admin/cv-settings] --> K[Site Settings]
        L[/admin/users] --> M[User Management - extended]
    end

    subgraph API Routes
        N[/api/cv-documents]
        O[/api/cv-templates]
        P[/api/cv-payments]
        Q[/api/cv-analytics]
        R[/api/cv-settings]
        S[/api/faqs]
    end

    subgraph Models
        T[CVDocument]
        U[CoverLetter]
        V[CVTemplate]
        W[CVPayment]
        X[DownloadRecord]
        Y[SiteSettings]
        Z[FAQ]
    end

    C --> N
    B --> O
    E --> P
    G --> O
    I --> Q
    K --> R
```

---

## Components and Interfaces

### Student-Facing Pages

| Route | File | Purpose |
|---|---|---|
| `/app/cv` | `src/app/(student)/app/cv/page.tsx` | Refactored: Template Gallery entry point |
| `/app/cv/templates` | `src/app/(student)/app/cv/templates/page.tsx` | Template Gallery with filter |
| `/app/cv/editor` | `src/app/(student)/app/cv/editor/page.tsx` | CV Editor (extended from existing page) |
| `/app/cv/editor/[id]` | `src/app/(student)/app/cv/editor/[id]/page.tsx` | Load existing CV into editor |
| `/app/cv/cover-letter/[cvId]` | `src/app/(student)/app/cv/cover-letter/[cvId]/page.tsx` | Cover Letter editor |
| `/app/cv/dashboard` | `src/app/(student)/app/cv/dashboard/page.tsx` | Student CV Dashboard |
| `/app/cv/payment` | `src/app/(student)/app/cv/payment/page.tsx` | Template payment page |

### Admin-Facing Pages

| Route | File | Purpose |
|---|---|---|
| `/admin/cv-templates` | `src/app/admin/cv-templates/page.tsx` | Template management |
| `/admin/cv-analytics` | `src/app/admin/cv-analytics/page.tsx` | CV analytics |
| `/admin/cv-settings` | `src/app/admin/cv-settings/page.tsx` | Site settings + FAQ |

### API Routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/cv-documents` | GET, POST | List/create CV documents |
| `/api/cv-documents/[id]` | GET, PUT, DELETE | Single CV document |
| `/api/cv-templates` | GET, POST | List/create templates |
| `/api/cv-templates/[id]` | GET, PUT, DELETE | Single template |
| `/api/cv-payments` | GET, POST | Template payment submission |
| `/api/cv-payments/[id]/approve` | PATCH | Admin approve payment |
| `/api/cv-payments/[id]/reject` | PATCH | Admin reject payment |
| `/api/cover-letters` | GET, POST | List/create cover letters |
| `/api/cover-letters/[id]` | GET, PUT, DELETE | Single cover letter |
| `/api/download-records` | GET, POST | Log and retrieve downloads |
| `/api/cv-analytics` | GET | Aggregated analytics |
| `/api/cv-settings` | GET, PUT | Site settings |
| `/api/faqs` | GET, POST, PUT, DELETE | FAQ management |

---

## Data Models

### CVTemplate

```typescript
interface ICVTemplate {
  _id: ObjectId
  name: string                    // Display name
  thumbnailUrl: string            // Preview image URL
  layoutConfig: object            // JSON describing section layout
  defaultContent: object          // Pre-filled field values
  isPaid: boolean
  price: number                   // 0 for free templates
  isPublished: boolean
  createdBy: ObjectId             // Admin user ref
  createdAt: Date
  updatedAt: Date
}
```

### CVDocument

```typescript
interface ICVDocument {
  _id: ObjectId
  user: ObjectId                  // Ref to User
  templateId: ObjectId            // Ref to CVTemplate
  name: string                    // User-given CV name
  version: number                 // Auto-incremented per user+name combo
  data: {                         // All CV field values
    name: string; title: string; phone: string; phone2: string
    website: string; email: string; address: string; summary: string
    experiences: Experience[]
    educations: Education[]
    references: Reference[]
    skills: Skill[]
    photo: string
    links: { linkedin?: string; github?: string; portfolio?: string }
    icons: { section: string; iconName: string }[]
  }
  styling: {
    colorScheme: string           // Preset key or hex values object
    font: string                  // Font family name
    accentColor: string
    backgroundColor: string
  }
  createdAt: Date
  updatedAt: Date
}
```

### CoverLetter

```typescript
interface ICoverLetter {
  _id: ObjectId
  user: ObjectId
  cvDocumentId: ObjectId          // Associated CV
  recipientName: string
  recipientTitle: string
  companyName: string
  paragraphs: string[]            // Ordered body paragraphs
  sectionOrder: string[]          // e.g. ['header','opening','body','closing']
  links: { linkedin?: string; github?: string; portfolio?: string }
  styling: {
    colorScheme: string
    font: string
    accentColor: string
  }
  createdAt: Date
  updatedAt: Date
}
```

### CVPayment

```typescript
interface ICVPayment {
  _id: ObjectId
  user: ObjectId
  template: ObjectId              // Ref to CVTemplate
  amount: number
  currency: string                // default 'ETB'
  referenceNumber: string
  screenshotUrl?: string
  note?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: ObjectId
  reviewNote?: string
  createdAt: Date
}
```

### DownloadRecord

```typescript
interface IDownloadRecord {
  _id: ObjectId
  user: ObjectId
  cvDocumentId: ObjectId
  type: 'cv' | 'cover-letter'
  createdAt: Date
}
```

### SiteSettings

```typescript
interface ISiteSettings {
  _id: ObjectId
  colorScheme: string
  logoUrl: string
  bannerText: string
  subscriptionPlans: {
    name: string
    price: number
    templateIds: ObjectId[]
  }[]
  updatedAt: Date
}
```

### FAQ

```typescript
interface IFAQ {
  _id: ObjectId
  question: string
  answer: string
  sortOrder: number
  createdAt: Date
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: CV save/load round trip
*For any* valid CVDocument data object, saving it to the database and then loading it back by ID should produce an object with equivalent field values (name, data, styling, templateId).
**Validates: Requirements 2.1, 2.4**

Property 2: Version increment on duplicate name
*For any* user who saves two CVDocuments with the same name, the second document's `version` field should be strictly greater than the first.
**Validates: Requirements 2.2**

Property 3: Dashboard list completeness and sort order
*For any* user with N saved CVDocuments, the dashboard API response should contain exactly N documents, all belonging to that user, ordered by `updatedAt` descending.
**Validates: Requirements 2.3, 6.1**

Property 4: Template filter correctness
*For any* collection of templates with mixed `isPaid` values, applying the "free" filter should return only templates where `isPaid` is false, and applying the "paid" filter should return only templates where `isPaid` is true — with no cross-contamination.
**Validates: Requirements 4.2, 4.3**

Property 5: Paid template access gate
*For any* user and paid template, the access check function should return `true` if and only if there exists a CVPayment record with `status = "approved"` linking that user to that template; free templates should always return `true`.
**Validates: Requirements 4.6, 4.7, 5.2, 5.3**

Property 6: Download record creation on every download
*For any* CV download action triggered by a user, a DownloadRecord should exist in the database with the matching `userId`, `cvDocumentId`, and a `createdAt` timestamp within a reasonable window of the action.
**Validates: Requirements 6.2**

Property 7: Cover letter section order round trip
*For any* CoverLetter with a given `sectionOrder` array, saving it to the database and reloading it should produce the identical `sectionOrder` array.
**Validates: Requirements 3.3**

Property 8: CV deletion cascades to cover letter
*For any* CVDocument that has an associated CoverLetter, deleting the CVDocument should result in the CoverLetter also being absent from the database.
**Validates: Requirements 6.5**

Property 9: Analytics count consistency
*For any* time window, the total CVs created count returned by the analytics API should equal the number of CVDocument records with a `createdAt` timestamp within that window.
**Validates: Requirements 9.1**

Property 10: FAQ sort order round trip
*For any* list of FAQ entries with distinct `sortOrder` values, saving them and retrieving them via the API should return the entries in ascending `sortOrder` sequence.
**Validates: Requirements 10.2, 10.3**

Property 11: Styling application correctness
*For any* valid color scheme key or font name from the supported presets, the styling resolution function should return a non-null style object containing the expected CSS property values; invalid keys should return the default style object.
**Validates: Requirements 1.2, 1.3, 1.6**

Property 12: Cover letter validation gate
*For any* CoverLetter where `recipientName` is empty or `paragraphs` is an empty array, the validation function should return `false` and the download should be blocked.
**Validates: Requirements 3.6**

Property 13: User activation state round trip
*For any* active user, deactivating then reactivating should result in `isActive = true`; deactivating should result in `isActive = false`.
**Validates: Requirements 8.2, 8.3**

Property 14: User cascade delete
*For any* user with associated CVDocuments, CoverLetters, and CVPayment records, deleting the user should result in none of those associated records remaining in the database.
**Validates: Requirements 8.5**

Property 15: Template conflict detection
*For any* CVTemplate that is referenced by at least one CVDocument, a delete request without `force=true` should return an error response (HTTP 409) rather than deleting the template.
**Validates: Requirements 7.6**

Property 16: Site settings round trip
*For any* valid SiteSettings object, saving it via the admin API and reading it back should produce an object with equivalent field values (colorScheme, logoUrl, subscriptionPlans).
**Validates: Requirements 11.1, 11.2, 11.3**

---

## Error Handling

- All API routes return structured JSON errors: `{ error: string, code?: string }`
- Authentication errors return HTTP 401; authorization errors return HTTP 403
- Validation errors return HTTP 400 with field-level messages
- Database errors return HTTP 500 and are logged server-side
- CV editor: unsaved changes trigger a browser `beforeunload` warning
- Template payment: if a payment is rejected, the UI shows the rejection note and re-enables the submission form
- Cover letter download: blocked client-side if required fields are empty, with inline validation messages
- Template deletion with active users: API returns HTTP 409 with a count of affected users; admin must send `force=true` to proceed

---

## Testing Strategy

### Unit Tests

- Validate CVDocument version increment logic (pure function)
- Validate cover letter section order reordering logic
- Validate template filter query builder
- Validate CVPayment status transition rules (pending → approved/rejected only)
- Validate FAQ sort order normalization

### Property-Based Tests

Use `fast-check` for TypeScript property-based testing. Each property test runs a minimum of 100 iterations.

Each test is tagged with:
**Feature: cv-builder-platform, Property N: {property_text}**

- **Property 1** — Generate random CVDocument data, save to test DB, read back, assert deep equality
- **Property 2** — Generate random user IDs and CV names, save two CVDocuments with the same name, assert version2 > version1
- **Property 3** — Generate random template lists with mixed isPaid values, apply filter, assert all results match filter
- **Property 4** — Generate random (user, template) pairs with and without approved CVPayment records, assert access gate returns correct boolean
- **Property 5** — Simulate random download actions, assert a DownloadRecord exists for each action
- **Property 6** — Generate random sectionOrder arrays, save cover letter, reload, assert sectionOrder equality
- **Property 7** — Generate CVDocuments with associated CoverLetters, delete CVDocument, assert CoverLetter is gone
- **Property 8** — Generate random sets of CVDocuments with timestamps, query analytics, assert count matches
- **Property 9** — Generate random FAQ lists with sortOrder values, save and retrieve, assert sequence matches
- **Property 10** — Generate random styling keys (valid and invalid), assert valid keys return expected CSS values and invalid keys return defaults
- **Property 11** — Generate cover letters with empty/non-empty recipientName and paragraphs, assert validation returns false for invalid inputs
- **Property 12** — Generate users with associated records, delete user, assert all associated records are gone
- **Property 13** — Generate templates referenced by CVDocuments, attempt delete without force, assert 409 response
- **Property 14** — Generate SiteSettings objects, save and read back, assert deep equality

### Integration Tests

- End-to-end: student selects free template → editor opens with template defaults
- End-to-end: student submits CVPayment → admin approves → template unlocked in gallery
- End-to-end: student saves CV → appears in dashboard → edit loads correct data
- End-to-end: student downloads CV → DownloadRecord created → appears in dashboard history
