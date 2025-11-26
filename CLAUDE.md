# Gemini AI - Feature Implementation Plan

**Objective:** Implement a User Dashboard to display a history of document analyses.

This plan outlines the steps required to build the feature, from the database schema to the final UI.

---

### **Step 1: Update the Database Schema**

-   **File:** `src/lib/database/models/Analysis.ts`
-   **Action:** Add a `userId` field to the `IAnalysis` interface and `AnalysisSchema`. This will link each analysis document to a user.
-   **Details:** The `userId` will be a `mongoose.Schema.Types.ObjectId` and will have a `ref` to the 'User' model. This creates a formal relationship between the two collections in MongoDB.

---

### **Step 2: Save Analysis Results to the Database**

-   **File:** `src/app/api/analyze/route.ts`
-   **Action:** Modify the `POST` handler to save the analysis results after a successful analysis.
-   **Details:**
    1.  Get the current user's session using `getServerSession(authOptions)`. If there is no user, return an unauthorized error.
    2.  After the analysis is complete, create a new document using the `Analysis` model.
    3.  Populate the new document with the analysis results, the original filename, and the `userId` from the session.
    4.  Save the document to the database.

---

### **Step 3: Create an API to Fetch Analysis History**

-   **File:** `src/app/api/analyses/route.ts` (This will be a new file).
-   **Action:** Create a `GET` handler to fetch all analyses for the currently logged-in user.
-   **Details:**
    1.  Get the current user's session to identify the user.
    2.  Use the `Analysis` model's `find()` method to query the database for all documents where `userId` matches the current user's ID.
    3.  Sort the results by date, with the most recent first.
    4.  Return the list of analysis documents as a JSON response.

---

### **Step 4: Build the Dashboard User Interface**

-   **File:** `src/app/dashboard/page.tsx`
-   **Action:** Convert the page into a client component (`"use client"`) and build the UI to display the analysis history.
-   **Details:**
    1.  Use a `useEffect` hook to fetch data from the new `/api/analyses` endpoint when the component mounts.
    2.  Store the fetched analyses in state using `useState`.
    3.  Render the data in a list or table format. Each item should display key information like the document title/filename and the date of analysis.
    4.  Each item should be a link that navigates the user to a detailed results page. The URL should include the unique ID of the analysis (e.g., `/analyses/[analysisId]`).

---

### **Step 5: Create the Detailed Analysis Results Page**

-   **File 1:** `src/app/analyses/[analysisId]/page.tsx` (new dynamic route).
-   **File 2:** `src/app/api/analyses/[analysisId]/route.ts` (new API route).
-   **Action:** Build a page that displays the full results of a single, specific analysis.
-   **Details:**
    1.  The new API route (`/api/analyses/[analysisId]`) will fetch a single document from the database by its `_id`. It must also verify that the analysis belongs to the currently logged-in user to prevent unauthorized access.
    2.  The new page component (`/analyses/[analysisId]/page.tsx`) will fetch the data from that API route and render the detailed `ResultsView`, similar to how it's done on the current `/document-analysis` page.

---
