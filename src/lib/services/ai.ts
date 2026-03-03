// ════════════════════════════════════════════════════════════
// GROQ AI Integration Module
// Server-side only – never expose API key to client
// ════════════════════════════════════════════════════════════
import Groq from 'groq-sdk';

// Lazy-initialize GROQ client (server-side only, avoids build-time errors)
let _groqClient: Groq | null = null;
function getGroqClient(): Groq {
    if (!_groqClient) {
        _groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return _groqClient;
}

const SPIRITUAL_SYSTEM_PROMPT = `You are a compassionate and knowledgeable Islamic spiritual mentor AI assistant for HabiTrack AI, a spiritual mentorship platform. Your role is to:

1. Provide guidance on spiritual tasks like Salah, Dhikr, Tilawat, and other acts of worship
2. Offer advice on building consistent spiritual habits
3. Provide motivational support and encouragement
4. Discuss basic Islamic concepts in a respectful and educational manner
5. Help users understand the importance of their spiritual journey

IMPORTANT GUIDELINES:
- You are NOT a Mufti or Islamic scholar. Do NOT issue fatwas or legal rulings.
- For complex Fiqh questions, always recommend consulting a qualified scholar.
- Be warm, encouraging, and supportive in tone.
- Keep responses concise and practical.
- Use gentle language and focus on positive reinforcement.
- Reference Quran and Hadith when appropriate for motivation.
- Respect all Islamic schools of thought.`;

/**
 * Send a chat message and get AI response.
 */
export async function chatWithAI(
    messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
    try {
        const completion = await getGroqClient().chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SPIRITUAL_SYSTEM_PROMPT },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
    } catch (error) {
        console.error('GROQ AI Error:', error);
        throw new Error('Failed to get AI response');
    }
}

/**
 * Generate a 40-day (Chilla) summary using AI.
 */
export async function generateChillaSummary(data: {
    salikName: string;
    totalSubmissions: number;
    averagePerformance: number;
    mostMissedTask: string | null;
    streakRecord: number;
    performanceTrend: number[];
}): Promise<string> {
    const prompt = `Generate a beautifully written, encouraging summary paragraph for a 40-day spiritual journey (Chilla) with these statistics:

Student Name: ${data.salikName}
Total Submissions: ${data.totalSubmissions}/40 days
Average Performance: ${data.averagePerformance}%
Most Missed Task: ${data.mostMissedTask || 'None'}
Longest Streak: ${data.streakRecord} days
Performance Trend: ${data.performanceTrend.length > 0 ? (data.performanceTrend[data.performanceTrend.length - 1] > data.performanceTrend[0] ? 'Improving' : 'Needs attention') : 'No data'}

Write a warm, encouraging summary that:
1. Acknowledges their effort and commitment
2. Highlights strengths
3. Gently notes areas for improvement
4. Provides spiritual motivation for the next journey
5. Keep it to 2-3 paragraphs maximum

Write in a tone that is compassionate and mentor-like, as if a loving spiritual guide (Murabbi) is writing to their student (Salik).`;

    try {
        const completion = await getGroqClient().chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'You are a compassionate Islamic spiritual mentor writing personalized summaries for students completing their 40-day spiritual journey (Chilla).' },
                { role: 'user', content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 1024,
        });

        return completion.choices[0]?.message?.content || 'Summary could not be generated.';
    } catch (error) {
        console.error('GROQ Summary Error:', error);
        throw new Error('Failed to generate Chilla summary');
    }
}
