# Income Category Ledger (React + Vite)

**Finals TLA 1**, CS008.23 Web Applications Development 1, University of the Immaculate Conception

This project refactors the Midterm **Applied Lab 1: Enterprise Income Category Ledger** (vanilla JavaScript DOM manipulation) into a modular React application built with Vite.

- **Student:** _[Your full name]_ · _[Section]_
- **Live app (Vercel):** _[paste your Vercel URL]_
- **Repository (GitHub):** _[paste your GitHub URL]_

---

## 1. Features

| Feature | Source |
|---|---|
| Register a category with a name and description | Midterm baseline |
| Guard-clause validation: nothing is saved if a field is empty | Midterm baseline (improved) |
| Inputs reset and the cursor returns to Category Name after saving | Midterm baseline |
| **Inline error messages** under each field, instead of `alert()` | New |
| **Press Enter** to save | New |
| **Expected monthly amount (₱)** per category, with number validation | New |
| **Summary cards:** monthly total, yearly projection, top income source | New |
| **Table total row** (or "Total of shown categories" while searching) | New |
| **Date Added** column, recorded automatically | New |
| **Sort** by Name, Amount or Date Added (click a header; click again to reverse) | New |
| **Delete** a single category / **Delete All** | New |
| **Confirmation dialog** before any delete | New |
| **Edit** a category directly in the table (Enter saves, Escape cancels) | New |
| **Search** by name or description | New |
| **Count badge** ("3", or "1 of 3" while searching) | New |
| **Duplicate names blocked** (ignores upper/lower case and extra spaces) | New |
| **Success messages** (saved / updated / deleted / exported), gone after 3 seconds | New |
| **Export to CSV**, which opens in Excel | New |
| **Empty-state message** when the table has no rows or no search results | New |
| "Prosperity Grid" color theme | New |

## 2. How to run

```bash
npm install      # install React, Vite and Bootstrap
npm run dev      # start at http://localhost:5173
npm run build    # production build into dist/ (Vercel runs this)
```

## 3. Project structure

```
src/
├── main.jsx                       # Mounts <App /> into <div id="root">; imports Bootstrap and CSS
├── App.jsx                        # ALL state and logic: add, validate, edit, delete, sort, search, export, toasts
├── components/
│   ├── AppHeader.jsx              # Page title banner
│   ├── CategoryForm.jsx           # Registration card (form#categoryForm in the Midterm)
│   ├── InputField.jsx             # Reusable input + label + optional ₱ prefix + inline error
│   ├── SummaryCards.jsx           # Monthly total, yearly projection, top income source
│   ├── LedgerTable.jsx            # "Registered Categories" card: count, search, export, Delete All, table, total
│   ├── SortableHeader.jsx         # Clickable column header with ▲ / ▼
│   ├── CategoryRow.jsx            # One row in normal view (Edit / Delete buttons)
│   ├── EditCategoryRow.jsx        # One row in edit mode (inputs + Save / Cancel)
│   ├── DeleteConfirmModal.jsx     # "Are you sure?" dialog
│   └── ToastStack.jsx             # Success messages in the corner
├── utils/
│   ├── format.js                  # formatPeso (₱15,000.00) and formatDate (Nov 6, 2026, 5:40 PM)
│   └── exportCsv.js               # Builds the CSV text and downloads it
└── styles/style.css               # Midterm styles + Prosperity Grid palette
```

**Component tree**

```
App                      ← owns every piece of state
├── AppHeader
├── CategoryForm
│   └── InputField ×3
├── SummaryCards
├── LedgerTable
│   ├── SortableHeader ×3
│   ├── CategoryRow ×n           (normal rows)
│   └── EditCategoryRow          (the one row being edited)
│       └── InputField ×3
├── DeleteConfirmModal           (only while a delete is waiting for confirmation)
└── ToastStack
```

**Design choice:** all state lives in `App.jsx`. The other components only **display** what they receive as props and **report** user actions back by calling functions passed down to them. This makes the app easy to follow, because there is one place where data changes. The `utils/` files are plain functions with no React state.

---

## 4. Code defense: Midterm DOM code to React

### 4.1 Side-by-side mapping

| Midterm (`js/app.js`) | React version | Where |
|---|---|---|
| `const categoryNameInput = document.getElementById("txtCatName")` | `const [formValues, setFormValues] = useState({ name: "", desc: "", amount: "" })`. The inputs' text lives in state. | `App.jsx` |
| `categoryNameInput.value.trim()` | `formValues.name.trim()`, read directly from state | `App.jsx` → `getErrors` |
| `addCategoryBtn.addEventListener("click", handleAddCategory)` | `<form onSubmit={onSubmit}>` + `<button type="submit">`. React attaches the listener; no `addEventListener` needed. | `CategoryForm.jsx` |
| `function handleAddCategory()` | Kept the **same name**: `function handleAddCategory(event)` | `App.jsx` |
| `if (!catName \|\| !catDesc) { alert(...); return; }` | Same guard clause, but errors are stored in `formErrors` state and shown under each input | `App.jsx` |
| Building `newRowHTML` as a string | `CategoryRow` component returns `<tr>` JSX with the **same classes** (`fw-semibold`, `text-secondary`) | `CategoryRow.jsx` |
| `incomeTableBody.insertAdjacentHTML("beforeend", newRowHTML)` | `setCategories(prev => [...prev, newCategory])`. Add **data**; React draws the row. | `App.jsx` |
| `<tbody id="listIncomeCat">` filled by hand | `categories.map(c => <CategoryRow key={c.id} ... />)` | `LedgerTable.jsx` |
| `categoryNameInput.value = ""` | `setFormValues(EMPTY_VALUES)`. The inputs are **controlled**, so clearing the state clears the boxes. | `App.jsx` |
| `categoryNameInput.focus()` | `inputRefs.name.current.focus()` using `useRef` | `App.jsx` |
| Bootstrap via CDN `<link>` | `import "bootstrap/dist/css/bootstrap.min.css"` (npm package) | `main.jsx` |

The original IDs (`txtCatName`, `txtCatDesc`, `btnAdd`, `categoryForm`, `listIncomeCat`) are kept so the two versions are easy to compare.

### 4.2 Imperative vs declarative

- **Midterm (imperative):** *I* tell the browser each step: find the node, build an HTML string, insert it, clear the input.
- **React (declarative):** I keep the **data** in state (the `categories` array) and write components that describe how the screen should look **for that data**. When I call a setter like `setCategories`, React re-runs the components and updates only the parts of the page that changed.

**Rule followed throughout:** never touch the DOM directly. Change state, and the page follows. There are two exceptions, both browser features that state can't express: `useRef` to move the cursor (focus), and a temporary download link in `exportCsv.js`.

### 4.3 The state in `App.jsx`

| State | Holds | Used for |
|---|---|---|
| `categories` | Array of `{ id, name, description, amount, createdAt }` | The ledger itself (replaces the rows in `<tbody>`) |
| `formValues` | `{ name, desc, amount }` text in the form | Controlled inputs (replace `.value`) |
| `formErrors` | `{ name, desc, amount }` error messages | Red border + message under a field |
| `searchText` | Text in the search box | Filtering the table |
| `sort` | `{ key: "name" \| "amount" \| "createdAt", direction: "asc" \| "desc" }` | Table order |
| `editingId` | `id` of the row being edited, or `null` | Which row shows inputs instead of text |
| `editValues`, `editErrors` | The edit row's inputs and errors | Editing without changing the list until Save |
| `pendingDelete` | `{ mode: "one", category }`, `{ mode: "all" }`, or `null` | Whether the confirm dialog is open, and for what |
| `toasts` | Array of `{ id, message }` | Success messages currently on screen |

`inputRefs` (from `useRef`) are **not** state. They point to the real `<input>` elements so `.focus()` can be called on them, and changing them doesn't re-render anything.

**One handler for all fields:** `handleFormChange(field, value)` updates any field with `setFormValues(prev => ({ ...prev, [field]: value }))`. `[field]` is a *computed property name*, so the same function works for `"name"`, `"desc"`, and `"amount"`.

### 4.4 Adding a category, step by step

1. The user types. Each keystroke calls `onChange` → `handleFormChange("name", value)` → state updates → React re-renders the input with the new value. If that field had an error, it is cleared.
2. The user clicks **Save Category** or presses **Enter**. The form's `onSubmit` runs `handleAddCategory(event)`.
3. `event.preventDefault()` stops the browser from reloading the page.
4. `getErrors(formValues)` checks every field (see 4.6), and the result goes into `setFormErrors(errors)`.
5. **Guard clause:** if any field has an error, focus the first invalid input and `return`. Nothing is saved.
6. Otherwise, build `{ id, name, description, amount, createdAt: Date.now() }` and call `setCategories(prev => [...prev, newCategory])`.
7. Show a success message, clear the form with `setFormValues(EMPTY_VALUES)`, and focus the name input, as the Midterm did.
8. React re-renders: the table gets a new row, and the count, total row and summary cards all update, because they are calculated from `categories`.

### 4.5 Immutable updates

State is never changed in place: no `push`, `splice`, or `category.name = ...`. Each update makes a **new** array or object, and React notices the change and re-renders.

```js
setCategories(prev => [...prev, newCategory]);                                     // add
setCategories(prev => prev.map(c => (c.id === editingId ? { ...c, ...changes } : c))); // edit
setCategories(prev => prev.filter(c => c.id !== id));                             // delete one
setCategories([]);                                                                 // delete all
```

`prev => ...` always works on the latest list. Each category's `id` comes from `crypto.randomUUID()` and is used as the `key` in `.map()`, so React can tell rows apart, and Edit/Delete always target the right item.

Sorting also follows this rule: `[...categories].sort(...)` copies the array first, because `.sort()` would otherwise rearrange the state array itself.

### 4.6 Validation

`getErrors(values, ignoreId)` is one function used for **both** adding and editing:

| Field | Rule | Message |
|---|---|---|
| Name | Not blank | "Please enter a category name." |
| Name | Not already used (compared with `.trim().toLowerCase()`) | "… is already registered." |
| Description | Not blank | "Please enter a description." |
| Amount | Not blank | "Please enter the expected monthly amount." |
| Amount | Digits with at most 2 decimals (`/^\d+(\.\d{1,2})?$/`); commas like `15,000` are allowed | "Enter a valid amount, e.g. 15000 or 15000.50." |
| Amount | Greater than 0 | "The amount must be greater than ₱0." |

When editing, the row's own `id` is passed as `ignoreId`, so saving without renaming isn't flagged as a duplicate of itself. The amount input is `type="text"` with `inputMode="decimal"` instead of `type="number"`. Phones still show a number keypad, but the field doesn't accept "e" or change value when you scroll over it. The text is turned into a real number with `Number(...)` only after it passes validation.

### 4.7 Derived values: search, sort, totals

Several things on screen are **calculated from state on every render** instead of being stored in their own state. Storing them separately could let them fall out of sync with `categories`.

```js
const sortedCategories = [...categories].sort(compareCategories);   // 1. sort
const visibleCategories = query ? sortedCategories.filter(...) : sortedCategories; // 2. search
```

- **Sort:** `handleSort(key)` only changes the `sort` state. Clicking the same column flips `asc` ↔ `desc`, and clicking a new column starts at `asc`. `compareCategories` uses `localeCompare` for names (A–Z, ignoring case) and subtraction for numbers (`amount`, `createdAt`). The default `{ key: "createdAt", direction: "asc" }` keeps the Midterm's "oldest first" order.
- **Search:** keeps rows whose name or description contains the search text.
- **Summary cards** (`SummaryCards.jsx`) use `.reduce()` over **all** categories: the sum for the monthly total, ×12 for the yearly projection, and the largest amount for the top source.
- **Total row** (`LedgerTable.jsx`) sums only the **visible** rows, so while searching it says "Total of shown categories".
- **Count badge** shows `visible of total` while searching.

`SortableHeader` sets `aria-sort` so screen readers announce how a column is sorted.

### 4.8 Date added

`createdAt: Date.now()` stores the moment of creation as a number (milliseconds since 1970). Numbers are easy to sort by subtraction. `formatDate()` in `utils/format.js` turns the number into readable text with the built-in `Intl.DateTimeFormat("en-PH", ...)`. Amounts are shown with `Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })` → `₱15,000.00`. Editing a category never changes its date.

### 4.9 Editing a row

- Clicking **Edit** calls `startEdit(category)`. It sets `editingId` and copies the row's current values into `editValues`.
- `LedgerTable` checks each row: `category.id === editing.id ? <EditCategoryRow/> : <CategoryRow/>` (conditional rendering). Only one row can be in edit mode.
- **Save** (or **Enter**) runs `saveEdit()`: validate, update the list with `.map()`, set `editingId` back to `null`, and show "updated".
- **Cancel** (or **Escape**) only sets `editingId` to `null`. The list is never touched, so nothing changes.
- The edit state is grouped into one `editing` object prop so `LedgerTable` doesn't need many separate props.

### 4.10 Deleting with confirmation

- **Delete** / **Delete All** don't delete right away. They set `pendingDelete` to `{ mode: "one", category }` or `{ mode: "all" }`.
- `App` renders `{pendingDelete && <DeleteConfirmModal ... />}`, so the dialog only exists while `pendingDelete` isn't `null`.
- **Confirm** → `confirmDelete()` removes the row (or empties the list), shows a message, then `setPendingDelete(null)`.
- **Cancel**, ✕, **Escape**, or clicking outside → `setPendingDelete(null)`. Nothing is deleted.
- The dialog uses Bootstrap's modal **styles** without Bootstrap's JavaScript, because React state controls when it shows. **Cancel** is focused first, so an accidental Enter is safe.

### 4.11 Success messages (toasts)

```js
function showToast(message) {
  const id = crypto.randomUUID();
  setToasts(prev => [...prev, { id, message }]);           // show it
  setTimeout(() => closeToast(id), TOAST_DURATION_MS);     // remove it after 3 s
}
```

`ToastStack` just maps over the `toasts` array. Each message has its own `id`, so several can be on screen at once and each disappears on its own timer. The ✕ button calls `closeToast(id)` early. `aria-live="polite"` makes screen readers read new messages aloud.

### 4.12 Export to CSV

`handleExport()` passes `sortedCategories` (all categories, in the current sort order) to `exportCategoriesToCsv()` in `utils/exportCsv.js`:

1. Build rows: a header, then one row per category (name, description, amount as `15000.00`, date added).
2. `toCsvCell()` wraps every value in quotes and doubles any quotes inside, so commas or quotes in a description don't break the columns. Values starting with `=`, `+`, `-`, or `@` get a `'` in front so Excel doesn't run them as formulas.
3. Put the text in a `Blob`, create a temporary URL for it, and click a temporary `<a download>` link to save `income-ledger-YYYY-MM-DD.csv`. A `﻿` marker at the start tells Excel the file is UTF-8.

### 4.13 Security improvement over the Midterm

The Midterm inserted user text straight into HTML with `insertAdjacentHTML`. Typing `<b>hi</b>` as a name would render **bold text**, and a malicious script tag could run code (an XSS risk). React **escapes** text inside `{...}` automatically, so `<b>hi</b>` appears exactly as typed. The CSV export is protected in a similar way (see 4.12).

---

## 5. AI usage and code defense

AI tools were allowed for this activity. This section states exactly how AI was used.

**Tool:** Claude (Anthropic), through the Claude Code extension in VS Code.

**What AI built:**

| Part | AI's role |
|---|---|
| Project setup | Created the Vite + React project files (`package.json`, `vite.config.js`, `.gitignore`) and checked that `npm run build` works for Vercel. |
| Baseline refactor | Translated the Midterm `app.js` into React state (`useState`), controlled inputs, and components, keeping the original IDs and the `handleAddCategory` name. |
| Validation | Wrote `getErrors` (blank, duplicate and amount checks) and `InputField.jsx` to replace `alert()`. |
| Monthly amount + totals | Added the amount field, `SummaryCards.jsx`, the table total row, and `formatPeso`. |
| Date added + sort | Added `createdAt`, `formatDate`, the `sort` state, `compareCategories`, and `SortableHeader.jsx`. |
| Delete + confirmation | Wrote the `pendingDelete` state, `confirmDelete`, and `DeleteConfirmModal.jsx`. |
| Edit | Wrote the editing state, `startEdit` / `saveEdit`, and `EditCategoryRow.jsx`. |
| Search + count | Wrote the `searchText` state, the filtering, and the count badge. |
| Success messages | Wrote the `toasts` state, `showToast` / `closeToast`, and `ToastStack.jsx`. |
| Export CSV | Wrote `utils/exportCsv.js`. |
| Styling | Applied the Prosperity Grid palette in `style.css`. |
| Testing | Ran an automated click-through of every feature: validation, amounts, totals, dates, sorting, search, edit, delete, toasts, and CSV contents. All checks passed. |
| README | Drafted this document. |

**My own decisions and work:**
- Chose which features to add: amount and totals, date added, sorting, success messages, CSV export, confirm before delete, edit, search, count, block duplicates.
- Chose inline error messages over `alert()`.
- Chose to keep all state in `App.jsx` instead of custom hooks, so the data flow is easy to follow.
- Chose the "Prosperity Grid" palette: #F4F7F5 (60%), #1A3636 (30%), #00C897 (10% accent), #2C3E35 text.
- _[Add what else you did: e.g. tested the app in the browser, changed wording/styles, deployed to GitHub and Vercel, reviewed and edited this README]_

**Design reasoning:**
- Green (#00C897) marks money and positive actions: Save, the count, the monthly total, success messages. Delete stays red so it reads as dangerous.
- Buttons use dark text on green, because white on #00C897 is too faint to read comfortably.
- Data lives in memory only and resets on refresh, the same as the Midterm baseline. Export CSV is how the user keeps a copy.

---

## 6. Deployment

1. Create a **public** GitHub repository and push this folder (see the commands below).
2. On [vercel.com](https://vercel.com): **Add New → Project** → import the repository.
3. Vercel detects **Vite** automatically (build `npm run build`, output `dist`). Click **Deploy**.

```bash
git init
git add .
git commit -m "Income Category Ledger refactored to React"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
