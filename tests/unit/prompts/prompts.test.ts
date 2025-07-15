import { 
  buildLorePrompt, 
  buildStatBlockPrompt, 
  buildCitationPrompt, 
  buildArtPrompt, 
  buildQAReviewPrompt, 
  buildPDFGenerationPrompt,
  renderPrompt,
  validatePromptVariables
} from '@/prompts';

describe('Prompt Templates', () => {
  describe('Lore Prompt', () => {
    it('should build lore prompt with all variables', () => {
      const context = {
        region: 'Japan',
        tags: ['yokai', 'supernatural'],
        description: 'A mysterious creature from Japanese folklore'
      };

      const prompt = buildLorePrompt(context);

      expect(prompt).toContain('Japan');
      expect(prompt).toContain('yokai, supernatural');
      expect(prompt).toContain('A mysterious creature from Japanese folklore');
      expect(prompt).toContain('cultural mythographer');
    });

    it('should handle missing optional variables', () => {
      const context = {
        region: 'Japan'
      };

      const prompt = buildLorePrompt(context);

      expect(prompt).toContain('Japan');
      expect(prompt).not.toContain('Suggested creature type:');
      expect(prompt).not.toContain('Additional context:');
    });
  });

  describe('StatBlock Prompt', () => {
    it('should build statblock prompt with lore', () => {
      const context = {
        lore: 'A nine-tailed fox yokai that dwells in sacred groves'
      };

      const prompt = buildStatBlockPrompt(context);

      expect(prompt).toContain('A nine-tailed fox yokai that dwells in sacred groves');
      expect(prompt).toContain('D&D 5e-compatible stat blocks');
      expect(prompt).toContain('JSON format');
    });
  });

  describe('Citation Prompt', () => {
    it('should build citation prompt with monster info', () => {
      const context = {
        name: 'Kitsune-no-Mori',
        region: 'Japan',
        description: 'A nine-tailed fox yokai that dwells in sacred groves'
      };

      const prompt = buildCitationPrompt(context);

      expect(prompt).toContain('Kitsune-no-Mori');
      expect(prompt).toContain('Japan');
      expect(prompt).toContain('A nine-tailed fox yokai that dwells in sacred groves');
      expect(prompt).toContain('JSON format');
    });
  });

  describe('Art Prompt', () => {
    it('should build art prompt with monster details', () => {
      const context = {
        name: 'Kitsune-no-Mori',
        region: 'Japan',
        lore: 'A nine-tailed fox yokai that dwells in sacred groves'
      };

      const prompt = buildArtPrompt(context);

      expect(prompt).toContain('Kitsune-no-Mori');
      expect(prompt).toContain('Japan');
      expect(prompt).toContain('A nine-tailed fox yokai that dwells in sacred groves');
      expect(prompt).toContain('AI image generator');
    });
  });

  describe('QA Review Prompt', () => {
    it('should build QA review prompt with all monster data', () => {
      const context = {
        name: 'Kitsune-no-Mori',
        region: 'Japan',
        lore: 'A nine-tailed fox yokai that dwells in sacred groves',
        statblock: { armorClass: 15, hitPoints: 120, challengeRating: 8 },
        citations: [{ title: 'Kitsune - Wikipedia', url: 'https://en.wikipedia.org/wiki/Kitsune' }],
        artPrompt: { prompt: 'Nine-tailed fox in Japanese forest', style: 'ukiyo-e' }
      };

      const prompt = buildQAReviewPrompt(context);

      expect(prompt).toContain('Kitsune-no-Mori');
      expect(prompt).toContain('Japan');
      expect(prompt).toContain('A nine-tailed fox yokai that dwells in sacred groves');
      expect(prompt).toContain('{"armorClass":15,"hitPoints":120,"challengeRating":8}');
      expect(prompt).toContain('senior editor evaluating');
    });
  });

  describe('PDF Generation Prompt', () => {
    it('should build PDF generation prompt with monster data', () => {
      const context = {
        name: 'Kitsune-no-Mori',
        region: 'Japan',
        lore: 'A nine-tailed fox yokai that dwells in sacred groves',
        statblock: { armorClass: 15, hitPoints: 120, challengeRating: 8 },
        citations: [{ title: 'Kitsune - Wikipedia', url: 'https://en.wikipedia.org/wiki/Kitsune' }],
        artPrompt: { prompt: 'Nine-tailed fox in Japanese forest', style: 'ukiyo-e' }
      };

      const prompt = buildPDFGenerationPrompt(context);

      expect(prompt).toContain('Kitsune-no-Mori');
      expect(prompt).toContain('Japan');
      expect(prompt).toContain('PDF layout');
      expect(prompt).toContain('JSON format');
    });
  });

  describe('Prompt Utilities', () => {
    describe('renderPrompt', () => {
      it('should replace variables in template', () => {
        const template = 'Hello {{name}}, you are from {{region}}';
        const variables = { name: 'John', region: 'Japan' };

        const result = renderPrompt(template, variables);

        expect(result).toBe('Hello John, you are from Japan');
      });

      it('should handle missing variables', () => {
        const template = 'Hello {{name}}, you are from {{region}}';
        const variables = { name: 'John' };

        const result = renderPrompt(template, variables);

        expect(result).toBe('Hello John, you are from ');
      });
    });

    describe('validatePromptVariables', () => {
      it('should find missing variables', () => {
        const template = 'Hello {{name}}, you are from {{region}}';
        const providedVariables = { name: 'John' };

        const missing = validatePromptVariables(template, providedVariables);

        expect(missing).toEqual(['region']);
      });

      it('should return empty array when all variables provided', () => {
        const template = 'Hello {{name}}, you are from {{region}}';
        const providedVariables = { name: 'John', region: 'Japan' };

        const missing = validatePromptVariables(template, providedVariables);

        expect(missing).toEqual([]);
      });
    });
  });
}); 