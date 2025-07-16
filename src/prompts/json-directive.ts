export const JSON_OUTPUT_DIRECTIVE = `
IMPORTANT: Return ONLY valid JSON.

- Respond with a single valid JSON object.
- Do NOT include any extra text, markdown, code fences, or explanation.
- The JSON must appear between <json> and </json> tags.
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