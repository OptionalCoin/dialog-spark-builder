import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChatContainer } from "@/components/ChatContainer";

const Index = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem("OPENAI_API_KEY") || "");
  const [isConfigured, setIsConfigured] = useState(!!localStorage.getItem("OPENAI_API_KEY"));

  const handleSubmitApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("OPENAI_API_KEY", apiKey);
    setIsConfigured(true);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-4">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to ChatBot</h1>
          <form onSubmit={handleSubmitApiKey} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="text-sm font-medium">
                OpenAI API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Start Chatting
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <ChatContainer />;
};

export default Index;