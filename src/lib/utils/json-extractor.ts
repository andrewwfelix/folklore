/**
 * Extracts JSON from a response that uses <json> tags
 * @param response The raw response from the AI model
 * @returns Parsed JSON object or null if extraction/parsing fails
 */
export function extractJson(response: string): any | null {
  const match = response.match(/<json>([\s\S]*?)<\/json>/);
  if (!match) {
    console.error("No <json> tags found in response");
    return null;
  }
  
  try {
    return JSON.parse(match[1] || '');
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    console.error("Raw JSON content:", match[1]);
    return null;
  }
}

/**
 * Extracts JSON with fallback to regex matching if <json> tags are not found
 * @param response The raw response from the AI model
 * @returns Parsed JSON object or null if extraction/parsing fails
 */
export function extractJsonWithFallback(response: string): any | null {
  // First try the <json> tags approach
  const jsonResult = extractJson(response);
  if (jsonResult) {
    return jsonResult;
  }
  
  // Fallback to regex matching for backward compatibility
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("No JSON object found in response");
    return null;
  }
  
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse JSON with fallback:", e);
    console.error("Raw response:", response);
    return null;
  }
} 