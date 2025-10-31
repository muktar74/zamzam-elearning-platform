
import React, { useState, useRef, useEffect } from 'react';
import { AiMessage } from '../types';
import { getAiChatResponse } from '../services/geminiService';
import { SparklesIcon, PaperAirplaneIcon, BookOpenIcon, XMarkIcon } from './icons';

interface AiAssistantProps {
    history: AiMessage[];
    setHistory: React.Dispatch<React.SetStateAction<AiMessage[]>>;
    courseContext?: {title: string, description: string};
}

const AiAssistant: React.FC<AiAssistantProps> = ({ history, setHistory, courseContext }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [history]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: AiMessage = { role: 'user', text: userInput };
        const updatedHistory = [...history, newUserMessage];
        setHistory(updatedHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const modelResponse = await getAiChatResponse(updatedHistory, courseContext);
            const newModelMessage: AiMessage = { role: 'model', text: modelResponse };
            setHistory(prev => [...prev, newModelMessage]);
        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage: AiMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 bg-zamzam-teal-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform z-40"
                aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
            >
                {isOpen ? <XMarkIcon className="w-8 h-8"/> : <SparklesIcon className="w-8 h-8" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-28 right-8 w-96 h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden border border-slate-200">
                    {/* Header */}
                    <div className="p-4 bg-zamzam-teal-50 border-b border-slate-200">
                        <h3 className="font-bold text-lg text-zamzam-teal-800">AI Personal Assistant</h3>
                        <p className="text-sm text-slate-600">Your guide to Islamic Finance.</p>
                        {courseContext && (
                            <div className="mt-2 text-xs text-zamzam-teal-700 bg-zamzam-teal-100 p-2 rounded-md flex items-start space-x-2">
                                <BookOpenIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span>Context: <strong>{courseContext.title}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Messages */}
                    <div className="flex-grow p-4 overflow-y-auto">
                        {history.length === 0 && (
                            <div className="h-full flex items-center justify-center text-center text-slate-500">
                                <p>Ask me anything about Islamic Finance or the course you're on!</p>
                            </div>
                        )}
                        <div className="space-y-4">
                           {history.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-zamzam-teal-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white"/></div>}
                                    <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-zamzam-teal-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                           ))}
                           {isLoading && (
                                <div className="flex items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-zamzam-teal-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white"/></div>
                                    <div className="max-w-xs md:max-w-sm rounded-2xl px-4 py-2 bg-slate-100 text-slate-800 rounded-bl-none">
                                        <div className="flex items-center space-x-1">
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                           )}
                           <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 bg-white">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500 bg-white"
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-zamzam-teal-600 text-white p-3 rounded-full hover:bg-zamzam-teal-700 disabled:bg-slate-300 transition">
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiAssistant;
