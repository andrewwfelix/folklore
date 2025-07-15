// Prompts index - exports all prompt templates for the monster generation system

export * from './lore';
export * from './statblock';
export * from './citation';
export * from './art-prompt';
export * from './qa-review';
export * from './pdf-generation';

// Re-export build functions for convenience
export { buildLorePrompt } from './lore';
export { buildStatBlockPrompt } from './statblock';
export { buildCitationPrompt } from './citation';
export { buildArtPrompt } from './art-prompt';
export { buildQAReviewPrompt } from './qa-review';
export { buildPDFGenerationPrompt } from './pdf-generation';

// Prompt types and interfaces
export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  examples?: PromptExample[];
}

export interface PromptExample {
  input: Record<string, any>;
  output: string;
  description: string;
}

export interface PromptContext {
  region: string;
  tags?: string[];
  description?: string;
  name?: string;
  lore?: string;
  statblock?: any;
  citations?: any[];
  artPrompt?: any;
}

// Helper function to render prompts with variables
export function renderPrompt(template: string, variables: Record<string, any>): string {
  let result = template;
  // Replace all {{var}} with value or empty string
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => (key in variables ? String(variables[key] ?? '') : ''));
  return result;
}

// Helper function to validate prompt variables
export function validatePromptVariables(template: string, providedVariables: Record<string, any>): string[] {
  const requiredVariables = template.match(/\{\{(\w+)\}\}/g)?.map(v => v.slice(2, -2)) || [];
  const missingVariables = requiredVariables.filter(v => !(v in providedVariables));
  
  return missingVariables;
} 