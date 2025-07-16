export const JSON_OUTPUT_DIRECTIVE = `
IMPORTANT: Return ONLY valid JSON.

- Your response MUST be wrapped in <json> and </json> tags, or it will be rejected.
- Do NOT include any extra text, markdown, code fences, or explanation—ONLY the JSON inside the tags.
- The JSON must appear between <json> and </json> tags, on their own lines.
- All property names and string values must use double quotes.
- No trailing commas, comments, or malformed structures.
- Strings must be properly escaped.

Example format:
<json>
{
  "name": "Alice",
  "age": 30,
  "interests": ["reading", "hiking", "cooking"]
}
</json>
`; 