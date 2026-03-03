// ════════════════════════════════════════════════════════════
// Salik – AI Chat Page
// ════════════════════════════════════════════════════════════
import { ChatInterface } from '@/components/shared/ChatInterface';

export default function SalikChatPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">AI Spiritual Guide</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Ask for guidance on your spiritual journey
                </p>
            </div>
            <ChatInterface />
        </div>
    );
}
