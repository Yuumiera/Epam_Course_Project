# Quickstart: Enhanced Idea Attachments

## Prerequisites
- Node.js 18+
- npm
- Environment configured for database and auth secret

## Run
```bash
npm install
npm run prisma:push
npm run dev
```

## 1) Login and get token
- Authenticate with an existing user to obtain a bearer token.

## 2) Validate attachment upload rules

### Allowed PDF upload
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Idea with PDF" \
  -F "description=Description long enough for idea validation." \
  -F "category=Technology" \
  -F "attachment=@./sample.pdf"
```
Expected: `201`.

### Disallowed file type
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Bad file" \
  -F "description=Description long enough for idea validation." \
  -F "category=Technology" \
  -F "attachment=@./sample.txt"
```
Expected: `400` with attachment validation error.

### Oversized file
```bash
curl -X POST http://localhost:3000/ideas \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Too large" \
  -F "description=Description long enough for idea validation." \
  -F "category=Technology" \
  -F "attachment=@./large-image.jpg"
```
Expected: `400` with size validation error.

## 3) Verify metadata in idea detail
```bash
curl -X GET http://localhost:3000/ideas/<IDEA_ID> \
  -H "Authorization: Bearer <TOKEN>"
```
Expected: attachment block includes `filename`, `mimeType`, `sizeBytes`.

## 4) Download/view attachment
```bash
curl -X GET http://localhost:3000/ideas/<IDEA_ID>/attachment \
  -H "Authorization: Bearer <TOKEN>" \
  -o downloaded-file
```
Expected: `200` with file content for valid attachment.

## 5) UI check
1. Open idea detail for an idea with attachment.
2. Confirm attachment name is visible.
3. Trigger download/view action and verify file opens/downloads.
4. Open idea without attachment and confirm no-attachment message.

## 6) Test
```bash
npm test
```
