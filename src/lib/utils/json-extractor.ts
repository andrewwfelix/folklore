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

  // Fallback to regex matching for object
  const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON object with fallback:", e);
      console.error("Raw response:", response);
    }
  }

  // Fallback to regex matching for array
  const jsonArrayMatch = response.match(/\[[\s\S]*\]/);
  if (jsonArrayMatch) {
    try {
      return JSON.parse(jsonArrayMatch[0]);
    } catch (e) {
      console.error("Failed to parse JSON array with fallback:", e);
      console.error("Raw response:", response);
    }
  }

  console.error("No JSON object or array found in response");
  return null;
} 