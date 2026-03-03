// ════════════════════════════════════════════════════════════
// Integration Test – AI Chat Route
// ════════════════════════════════════════════════════════════
import { describe, it, expect, vi } from 'vitest';

// Mock the GROQ SDK
vi.mock('groq-sdk', () => {
    return {
        default: class {
            chat = {
                completions: {
                    create: vi.fn().mockResolvedValue({
                        choices: [
                            {
                                message: {
                                    content: 'May peace be upon you! Here is some spiritual guidance...',
                                },
                            },
                        ],
                    }),
                },
            };
        },
    };
});

describe('AI Chat Integration', () => {
    it('should return AI response for valid input', async () => {
        // Import after mocking
        const { chatWithAI } = await import('@/lib/services/ai');

        const response = await chatWithAI([
            { role: 'user', content: 'How can I improve my Salah?' },
        ]);

        expect(response).toBeTruthy();
        expect(typeof response).toBe('string');
    });

    it('should handle multiple message context', async () => {
        const { chatWithAI } = await import('@/lib/services/ai');

        const messages: { role: 'user' | 'assistant'; content: string }[] = [
            { role: 'user', content: 'What is Dhikr?' },
            { role: 'assistant', content: 'Dhikr is the remembrance of Allah...' },
            { role: 'user', content: 'How often should I do it?' },
        ];

        const response = await chatWithAI(messages);
        expect(response).toBeTruthy();
    });
});
