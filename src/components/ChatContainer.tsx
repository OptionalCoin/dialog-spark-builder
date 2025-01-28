import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Message {
  content: string;
  isUser: boolean;
}

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lmStudioUrl, setLmStudioUrl] = useState(localStorage.getItem("LM_STUDIO_URL") || "");
  const { toast } = useToast();

  const handleSaveUrl = () => {
    localStorage.setItem("LM_STUDIO_URL", lmStudioUrl);
    toast({
      title: "Settings saved",
      description: "LM Studio URL has been updated.",
    });
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { content: message, isUser: true }]);
    setIsLoading(true);

    const storedLmStudioUrl = localStorage.getItem("LM_STUDIO_URL");
    
    if (!storedLmStudioUrl) {
      toast({
        title: "Error",
        description: "LM Studio URL is not configured. Please set it up first.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Test if URL is valid
      new URL(storedLmStudioUrl);
      
      // Format messages for LM Studio API
      const formattedMessages = messages.map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      }));
      
      // Add the current message
      formattedMessages.push({
        role: "user",
        content: message
      });

      const response = await fetch(`${storedLmStudioUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        mode: "cors",
        body: JSON.stringify({
          messages: formattedMessages,
          stream: false,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      setMessages((prev) => [...prev, { content: aiMessage, isUser: false }]);
    } catch (error) {
      console.error("Error details:", error);
      
      let errorMessage = "Failed to get AI response. ";
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage += "Cannot connect to LM Studio. Make sure:\n" +
            "1. LM Studio is running\n" +
            "2. The URL is correct (e.g., http://localhost:1234)\n" +
            "3. CORS is enabled in LM Studio settings";
        } else {
          errorMessage += error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 relative">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute right-6 top-6">
            <Settings className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lmStudioUrl" className="text-sm font-medium">
                LM Studio Server URL
              </label>
              <Input
                id="lmStudioUrl"
                value={lmStudioUrl}
                onChange={(e) => setLmStudioUrl(e.target.value)}
                placeholder="http://localhost:1234"
              />
            </div>
            <Button onClick={handleSaveUrl} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message.content}
            isUser={message.isUser}
          />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};