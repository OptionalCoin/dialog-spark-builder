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

    try {
      const response = await fetch(`${localStorage.getItem("LM_STUDIO_URL")}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }],
          stream: false,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      setMessages((prev) => [...prev, { content: aiMessage, isUser: false }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your LM Studio URL.",
        variant: "destructive",
      });
      console.error("Error:", error);
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