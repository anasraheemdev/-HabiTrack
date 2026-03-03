// ════════════════════════════════════════════════════════════
// ChatInterface – AI Chatbot with Markdown Rendering
// ════════════════════════════════════════════════════════════
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch('/api/ai/chat?history=true');
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages) {
                        setMessages(
                            data.messages.map((m: { id: string; role: string; content: string; created_at: string }) => ({
                                id: m.id,
                                role: m.role as 'user' | 'assistant',
                                content: m.content,
                                timestamp: new Date(m.created_at),
                            }))
                        );
                    }
                }
            } catch {
                // Silent fail
            }
        };
        loadHistory();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content }),
            });

            if (!res.ok) throw new Error('Failed to get response');

            const data = await res.json();

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            toast.error('Failed to get AI response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Card className="border-0 shadow-sm flex flex-col h-[calc(100vh-180px)] min-h-[400px]">
            <CardHeader className="pb-3 border-b flex-shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                        <Sparkles size={20} className="text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">AI Spiritual Guide</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            Bismillah – seek guidance on your spiritual journey
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-5 border border-primary/10">
                                <BookOpen size={32} className="text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</h3>
                            <p className="text-sm text-muted-foreground mb-1">Assalamu Alaikum wa Rahmatullahi wa Barakatuh</p>
                            <p className="text-sm text-muted-foreground max-w-md">
                                I&apos;m your AI spiritual companion. Ask me about strengthening your worship,
                                building consistent habits, or seek motivational guidance on your path.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-5 justify-center max-w-lg">
                                {[
                                    'How can I be more consistent in my Salah?',
                                    'Tips for building a Quran recitation habit',
                                    'How to strengthen my Dhikr routine?',
                                    'Ways to improve my spiritual discipline',
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="text-xs px-3.5 py-2 rounded-full bg-primary/5 text-foreground hover:bg-primary/10 transition-colors border border-primary/10"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25 }}
                                className={cn(
                                    'flex gap-3',
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                )}
                            >
                                {msg.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 flex-shrink-0 mt-1 ring-1 ring-primary/10">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-[10px] font-bold">
                                            AI
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                        'max-w-[85%] sm:max-w-[75%] rounded-2xl text-sm leading-relaxed',
                                        msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground px-4 py-3 rounded-br-sm'
                                            : 'bg-secondary/80 text-foreground px-4 py-3 rounded-bl-sm border border-border/40'
                                    )}
                                >
                                    {msg.role === 'assistant' ? (
                                        <div className="prose-chat">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1.5 first:mt-0">{children}</h3>,
                                                    h2: ({ children }) => <h4 className="text-sm font-bold mt-2.5 mb-1 first:mt-0">{children}</h4>,
                                                    h3: ({ children }) => <h5 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h5>,
                                                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                                    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                                                    em: ({ children }) => <em className="italic text-primary/90">{children}</em>,
                                                    ul: ({ children }) => <ul className="mb-2 last:mb-0 space-y-1 ml-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="mb-2 last:mb-0 space-y-1 ml-1 list-decimal list-inside">{children}</ol>,
                                                    li: ({ children }) => (
                                                        <li className="flex items-start gap-2 text-sm">
                                                            <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                                                            <span>{children}</span>
                                                        </li>
                                                    ),
                                                    code: ({ children }) => (
                                                        <code className="bg-background/50 text-xs px-1.5 py-0.5 rounded font-mono">{children}</code>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-2 border-primary/30 pl-3 my-2 italic text-muted-foreground">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                    <p
                                        className={cn(
                                            'text-[10px] mt-2 opacity-50',
                                            msg.role === 'user' ? 'text-right' : 'text-left'
                                        )}
                                    >
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-primary/10">
                                <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary text-[10px] font-bold">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-secondary/80 rounded-2xl rounded-bl-sm px-4 py-3 border border-border/40">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-primary/40"
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: Infinity,
                                                delay: i * 0.15,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input */}
                <div className="border-t bg-background/50 p-3 sm:p-4 flex-shrink-0">
                    <div className="flex items-end gap-2">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your question... (Press Enter to send)"
                            className="min-h-[44px] max-h-[120px] resize-none bg-secondary/30 border border-border/50 rounded-xl text-sm"
                            rows={1}
                        />
                        <Button
                            onClick={sendMessage}
                            size="icon"
                            disabled={!input.trim() || isLoading}
                            className="h-11 w-11 rounded-xl flex-shrink-0 shadow-sm"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
                        AI provides general spiritual guidance. For Fiqh rulings, consult a qualified scholar (Alim/Mufti).
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
