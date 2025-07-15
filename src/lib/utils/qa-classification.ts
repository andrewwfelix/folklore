import { QAIssue, QAReview } from '@/types/qa-feedback';

/**
 * Classify QA issues by type and identify target agents
 */
export function classifyQAIssues(qaReview: QAReview): QAIssue[] {
  const issues: QAIssue[] = [];
  
  qaReview.issues.forEach(issue => {
      const classifiedIssue: QAIssue = {
    severity: issue.severity,
    category: issue.category,
    issue: issue.issue,
    suggestion: issue.suggestion,
    affectedAgent: determineAffectedAgent(issue.category, issue.issue) as 'LoreAgent' | 'StatBlockAgent' | 'CitationAgent' | 'ArtPromptAgent'
  };
    issues.push(classifiedIssue);
  });
  
  return issues;
}

/**
 * Determine which agent should handle a specific issue
 */
export function determineAffectedAgent(category: string, issue: string): string {
  const issueLower = issue.toLowerCase();
  const categoryLower = category.toLowerCase();
  
  // Name-related issues
  if (categoryLower.includes('name') || 
      categoryLower.includes('distinctiveness') ||
      issueLower.includes('name') ||
      issueLower.includes('troll') ||
      issueLower.includes('dragon') ||
      issueLower.includes('spirit')) {
    return 'LoreAgent';
  }
  
  // Cultural authenticity issues
  if (categoryLower.includes('cultural') || 
      categoryLower.includes('authenticity') ||
      issueLower.includes('cultural') ||
      issueLower.includes('region')) {
    return 'LoreAgent';
  }
  
  // Stat block balance issues
  if (categoryLower.includes('balance') || 
      categoryLower.includes('stat') ||
      issueLower.includes('cr') ||
      issueLower.includes('challenge') ||
      issueLower.includes('balance') ||
      issueLower.includes('hp') ||
      issueLower.includes('armor')) {
    return 'StatBlockAgent';
  }
  
  // Citation-related issues
  if (issueLower.includes('citation') || 
      issueLower.includes('source') ||
      issueLower.includes('reference')) {
    return 'CitationAgent';
  }
  
  // Art-related issues
  if (issueLower.includes('art') || 
      issueLower.includes('style') ||
      issueLower.includes('prompt') ||
      issueLower.includes('visual')) {
    return 'ArtPromptAgent';
  }
  
  // Default to LoreAgent for general issues
  return 'LoreAgent';
}

/**
 * Map issue severity to priority levels for agent routing
 */
export function mapSeverityToPriority(severity: string): 'immediate' | 'high' | 'normal' {
  switch (severity) {
    case 'Critical':
      return 'immediate';
    case 'Major':
      return 'high';
    case 'Minor':
    default:
      return 'normal';
  }
}

/**
 * Generate specific instructions for agents based on issue type
 */
export function generateSpecificInstruction(issue: QAIssue): string {
  const category = issue.category.toLowerCase();
  const suggestion = issue.suggestion;
  
  switch (category) {
    case 'name distinctiveness':
      return `Generate a more distinctive name. Current name is too generic. ${suggestion}`;
    
    case 'cultural authenticity':
      return `Enhance cultural authenticity. ${suggestion}`;
    
    case 'stat block balance':
      return `Adjust stat block balance. ${suggestion}`;
    
    case 'consistency':
      return `Fix consistency issues. ${suggestion}`;
    
    case 'quality':
      return `Improve overall quality. ${suggestion}`;
    
    default:
      return suggestion;
  }
}

/**
 * Validate that all issues have been properly classified
 */
export function validateClassification(issues: QAIssue[]): boolean {
  return issues.every(issue => 
    issue.affectedAgent && 
    issue.severity && 
    issue.category && 
    issue.instruction
  );
} 