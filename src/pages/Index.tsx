import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChatContainer } from "@/components/ChatContainer";

const Index = () => {
  const [lmStudioUrl, setLmStudioUrl] = useState(localStorage.getItem("LM_STUDIO_URL") || "");
  const [isConfigured, setIsConfigured] = useState(!!localStorage.getItem("LM_STUDIO_URL"));

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("LM_STUDIO_URL", lmStudioUrl);
    setIsConfigured(true);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-4">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to ChatBot</h1>
          <form onSubmit={handleSubmitUrl} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lmStudioUrl" className="text-sm font-medium">
                LM Studio Server URL
              </label>
              <Input
                id="lmStudioUrl"
                type="url"
                value={lmStudioUrl}
                onChange={(e) => setLmStudioUrl(e.target.value)}
                placeholder="Enter your LM Studio server URL (e.g., http://localhost:1234)"
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