# Webseite

HTML, CSS und TypeScript. Kontaktformular über ein kleines PHP-Backend.

## Lokal starten

Voraussetzungen: Node.js und PHP.

    npm install
    npm run watch     # TypeScript automatisch kompilieren
    npm run serve     # zweites Terminal: http://localhost:8000

## Struktur

- `public/`  – alles, was auf den Server kommt
- `src/`     – TypeScript-Quellcode (wird nach `public/dist/` kompiliert)
- `config.example.php` – Vorlage; echte `config.php` nur lokal bzw. auf dem Server anlegen

## Schriften

Newsreader und IBM Plex Mono als woff2 in `public/fonts/` ablegen
(`Newsreader.woff2`, `IBMPlexMono-Regular.woff2`).