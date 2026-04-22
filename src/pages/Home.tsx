import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Key, User, Bot } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      setApiKeySaved(true);
      // Optionally save to localStorage for persistence
      localStorage.setItem('openrouter_api_key', apiKey);
    }
  };

  useEffect(() => {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiKeySaved(true);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !apiKeySaved) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://example.com',
          'X-Title': 'Test Chat App',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            { role: 'user', content: input },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantMessageId = Date.now().toString() + 'assistant';
      let assistantContent = '';

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') break;

          // Skip empty lines or invalid data
          if (!data || data.trim() === '') {
            continue;
          }

          // Skip lines that don't look like JSON
          const trimmedData = data.trim();
          if (!trimmedData.startsWith('{') && !trimmedData.startsWith('[')) {
            continue;
          }

          // Try to parse JSON with error handling
          try {
            const parsed = JSON.parse(trimmedData);
            const delta = parsed.choices[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: assistantContent }
                  : msg
              ));
            }
          } catch (e) {
            // Silently skip parsing errors
            // This prevents console errors from cluttering the interface
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.role === 'assistant' && msg.content === '' 
          ? { ...msg, content: 'Error: Failed to get response' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white py-4 px-6 shadow-md">
        <h1 className="text-2xl font-bold">OpenRouter Chat</h1>
      </header>
      
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {!apiKeySaved && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-yellow-800">API Key Required</h2>
            </div>
            <p className="text-yellow-700 mb-3">Please enter your OpenRouter API key to use this chat application.</p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key here"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className={`p-3 rounded-lg ${!apiKey.trim() 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'}`}
              >
                Save
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end items-end' : 'justify-start items-end'} space-x-2`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-gray-600" />
                </div>
              )}
              <div 
                className={`max-w-[80%] p-4 rounded-lg ${message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200'}`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.ctrlKey) {
                  e.preventDefault();
                  handleSend();
                } else if (e.key === 'Enter' && e.ctrlKey) {
                  // Ctrl+Enter for newline - no need to prevent default
                }
              }}
              placeholder="Type your message... (Enter to send, Ctrl+Enter for newline)"
              disabled={!apiKeySaved}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!apiKeySaved ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              rows={1}
              style={{ resize: 'none', overflow: 'hidden' }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              Enter: send, Ctrl+Enter: newline
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !apiKeySaved}
            className={`p-3 rounded-lg ${isLoading || !input.trim() || !apiKeySaved 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'}`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </main>
      
      <footer className="bg-gray-100 py-2 px-6 text-center text-gray-600 text-sm">
        <p>Powered by OpenRouter API</p>
      </footer>
    </div>
  );
}