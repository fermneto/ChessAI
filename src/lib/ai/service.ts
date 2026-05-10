import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Serviço centralizado de IA
 * Por padrão usa Groq (Llama 3) para alta disponibilidade e velocidade.
 */
export const aiService = {
  /**
   * Gera conteúdo estruturado (JSON)
   */
  async generateJSON<T>(prompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<T> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em xadrez que responde apenas em formato JSON puro.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: model,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = chatCompletion.choices[0]?.message?.content || '{}';
      return JSON.parse(content) as T;
    } catch (error) {
      console.error('Erro no aiService (Groq):', error);
      throw error;
    }
  },

  /**
   * Gera texto simples
   */
  async generateText(prompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<string> {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: model,
        temperature: 0.7,
      });

      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Erro no aiService (Groq):', error);
      throw error;
    }
  }
};
