# Merge PDF

Web app for merging PDF files: select or drag-and-drop files, reorder pages
by drag-and-drop, auto-detect a common output file name from the input file
names, then export the merged PDF.

Everything runs **in the browser** (React + [pdf-lib](https://github.com/Hopding/pdf-lib) +
[pdf.js](https://mozilla.github.io/pdf.js/)): no file is ever sent to a
server, and the app requires **no installation** (no admin rights needed).

## Features

- Select files via button or **drag-and-drop**
- Thumbnail preview of every page
- **Reorder pages** by drag-and-drop, page by page
- **Auto-sort** files based on numbers/patterns detected in their name
  (e.g. `chapter-2.pdf` before `chapter-10.pdf`)
- **Auto-detected, editable output file name**, derived from what the input
  file names have in common (e.g. `SG878666_Sheet7DML_I00.pdf`,
  `SG878666_Sheet10DML_I00.pdf`, ... → `SG878666DML_I00.pdf`)
- Remove individual pages or files
- Merge and download the final PDF

## Usage (no installation)

The build produces a single self-contained `dist/index.html` file (JS, CSS
and the PDF.js worker are all inlined). Once built, just share that one file
— USB drive, network share, email — and open it in a browser, no server or
install required.

```bash
npm install
npm run build
# then open dist/index.html in a browser
```

## Development

```bash
npm install
npm run dev      # dev server with hot reload
npm run build    # production build (standalone dist/index.html)
npm run lint      # oxlint
```
