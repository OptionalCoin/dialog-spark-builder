import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

interface Message {
  content: string;
  isUser: boolean;
}

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (message: string) => {
    // Add user message to chat
    setMessages((prev) => [...prev, { content: message, isUser: true }]);
    setIsLoading(true);

    const lmStudioUrl = localStorage.getItem("LM_STUDIO_URL");
    
    if (!lmStudioUrl) {
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
      new URL(lmStudioUrl);
      
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

      const response = await fetch(`${lmStudioUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: formattedMessages,
          stream: false,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      setMessages((prev) => [...prev, { content: aiMessage, isUser: false }]);
    } catch (error) {
      console.error("Error details:", error);
      
      let errorMessage = "Failed to get AI response. ";
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage += "Cannot connect to LM Studio. Make sure LM Studio is running and the URL is correct.";
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
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
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