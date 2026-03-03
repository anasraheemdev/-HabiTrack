// ════════════════════════════════════════════════════════════
// Murabbi – AI Assistant Page
// ════════════════════════════════════════════════════════════
import { ChatInterface } from '@/components/shared/ChatInterface';

export default function MurabbiAIAssistantPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">AI Assistant</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Get AI-powered help with drafting summaries and guidance
                </p>
            </div>
            <ChatInterface />
        </div>
    );
}
