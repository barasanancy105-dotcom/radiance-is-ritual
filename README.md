# Glow Guide — Radiance Is Ritual

Glow Guide is a skincare and wellness website designed to encourage
simple routines, mindful self-care, and personal reflection.

## Features

- Responsive skincare colletion with category filters
- Shopping bag with item quantities and estimated totals
- Personal routine builder for morning and evening products
- Routine completion checklist and progress indicators
- Water check-in tracker
- Mood selection and personal journal entry
- Shared browser storage across the website's pages
- Form validation and helpful feedback messages
- Three linked HTML pages

## Pages

- `index.html` — Homepage, skincare collection, daily habits, and journal check-in
- `routine.html` — Add, view, and remove personal skincare products
- `journal.html` — Review saved products, progress, and journal reflections

## Technologies

- HTML5
- CSS3
- JavaScript
- Browser localStorage

## How to run

1. Download or clone the project repository.
2. Keep all HTML, CSS, and JavaScript files in the same folder.
3. Open `index.html` in a browser.
4. Navigate between Home, My Routine, and My Journal.

For the most reliable testing, run the folder through a local development
server such as VS Code Live Server.

## Data storage

The project uses browser localStorage with the key `glowGuideLuxury`.
Saved information remains in the same browser and website origin until
the data is cleared. This project does not currently use a server or
online database.

## Important note

The newsletter form is a front-end demonstration. It does not subscribe
visitors to a mailing list.