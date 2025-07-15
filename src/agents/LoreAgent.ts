import { BaseAgent } from './base/BaseAgent';
import { AgentType, Monster, MonsterGenerationInput } from '@/types';
import { buildLorePrompt } from '@/prompts';
import OpenAI from 'openai';

export class LoreAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(id: string, config: any = {}) {
    super(id, 'Lore Agent', AgentType.DATA_PROCESSOR, config);
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY']!,
    });
  }

  async execute(input: MonsterGenerationInput): Promise<Partial<Monster>> {
    try {
      await this.start();
      this.log('Generating lore for monster');

      const lore = await this.generateLore(input);
      
      await this.complete();
      this.log('Lore generation completed');

      return {
        name: input.name || this.generateName(input.region),
        region: input.region,
        tags: input.tags || [],
        lore: lore,
        status: 'draft' as any
      };
    } catch (error) {
      await this.fail(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async generateLore(input: MonsterGenerationInput): Promise<string> {
    const prompt = buildLorePrompt({
      region: input.region,
      tags: input.tags,
      description: input.description
    });
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a cultural mythographer creating folklore-based content for a fantasy RPG. Create original monsters inspired by real-world myths and legends.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.8
    });

    const lore = response.choices[0]?.message?.content;
    if (!lore) {
      throw new Error('Failed to generate lore');
    }

    return lore.trim();
  }

  private generateName(region: string): string {
    // Simple name generation based on region
    const regionNames: { [key: string]: string[] } = {
      'Japan': ['Yokai', 'Oni', 'Tengu', 'Kappa', 'Nue'],
      'Greece': ['Chimera', 'Hydra', 'Sphinx', 'Minotaur', 'Harpy'],
      'Norse': ['Troll', 'Draugr', 'Huldra', 'Nøkk', 'Mare'],
      'Celtic': ['Banshee', 'Púca', 'Dullahan', 'Kelpie', 'Selkie'],
      'Slavic': ['Baba Yaga', 'Leshy', 'Rusalka', 'Domovoi', 'Vodyanoy'],
      'Chinese': ['Jiangshi', 'Huli Jing', 'Nian', 'Pixiu', 'Qilin'],
      'Indian': ['Rakshasa', 'Naga', 'Garuda', 'Yaksha', 'Gandharva'],
      'Egyptian': ['Sphinx', 'Ammit', 'Serpopard', 'Griffin', 'Phoenix'],
      'Aztec': ['Ahuizotl', 'Cipactli', 'Tlaltecuhtli', 'Xolotl', 'Quetzalcoatl'],
      'Malaysia': ['Pontianak', 'Penanggal', 'Toyol', 'Polong', 'Hantu']
    };

    const names = regionNames[region] || ['Unknown Creature'];
    return names[Math.floor(Math.random() * names.length)] || 'Unknown Creature';
  }
} 