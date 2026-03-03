// ════════════════════════════════════════════════════════════
// API: AI Chat – POST (send message) / GET (history)
// Secure server-side GROQ integration
// ════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { chatWithAI } from '@/lib/services/ai';
import { aiChatSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const result = aiChatSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
        }

        // Save user message
        await supabase.from('ai_conversations').insert({
            user_id: user.id,
            role: 'user',
            content: result.data.message,
        });

        // Get recent conversation context
        const { data: history } = await supabase
            .from('ai_conversations')
            .select('role, content')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(20);

        const messages = (history || []).map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        // Get AI response
        const response = await chatWithAI(messages);

        // Save assistant response
        await supabase.from('ai_conversations').insert({
            user_id: user.id,
            role: 'assistant',
            content: response,
        });

        return NextResponse.json({ response });
    } catch (error) {
        console.error('AI Chat error:', error);
        return NextResponse.json(
            { error: 'Failed to get AI response' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const isHistory = searchParams.get('history') === 'true';

        if (!isHistory) {
            return NextResponse.json({ message: 'Use history=true to fetch chat history' });
        }

        const { data, error } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({ messages: data });
    } catch (error) {
        console.error('AI History error:', error);
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}
