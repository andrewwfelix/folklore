import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config({ path: '.env.local' });

describe('Integration: OpenAI API', () => {
  const openaiKey = process.env['OPENAI_API_KEY'];
  const openaiModel = process.env['OPENAI_MODEL'] || 'gpt-3.5-turbo';

  it('should have OPENAI_API_KEY set', () => {
    expect(openaiKey).toBeTruthy();
  });

  it('should make a completion request to OpenAI', async () => {
    const openai = new OpenAI({ apiKey: openaiKey });
    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello in one sentence.' },
      ],
      max_tokens: 10,
    });
    expect(Array.isArray(response.choices)).toBe(true);
    expect(response.choices.length).toBeGreaterThan(0);
    const choice = response.choices[0];
    if (!choice) throw new Error('No choices returned from OpenAI');
    if (!choice.message) throw new Error('No message in OpenAI response');
    expect(choice.message.content).toBeTruthy();
  });
}); 