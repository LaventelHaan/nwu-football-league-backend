"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageSquare, Bot, User as LucideUser, HelpCircle, Send } from "lucide-react"
import { mockFAQs, type FAQ as MockFAQ } from "@/lib/mockData"

export interface ChatMessage {
  id: string
  userName: string
  message: string
  timestamp: string
  isBot: boolean
}

export interface FAQ {
  id: number
  question: string
  answer?: string
  status: "pending" | "answered"
  createdDate: string
}

export default function FloatingFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>(mockFAQs || [])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Send message logic
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userName: "You",
      message: inputMessage,
      timestamp: new Date().toISOString(),
      isBot: false,
    }
    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsTyping(true)

    try {
      let botReply = "Sorry, I don’t know yet. I’ll forward this to the admin team."

      // Check FAQ matches
      const matchedFAQ = faqs.find(
        (faq) =>
          faq.status === "answered" &&
          currentMessage.toLowerCase().includes(faq.question.toLowerCase())
      )

      if (matchedFAQ?.answer) botReply = matchedFAQ.answer

      const botMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        userName: "Bot",
        message: botReply,
        timestamp: new Date().toISOString(),
        isBot: true,
      }
      setMessages((prev) => [...prev, botMessage])

      // Add to pending FAQ if no match
      if (!matchedFAQ) {
        const newFAQ: FAQ = {
          id: faqs.length + 1,
          question: currentMessage,
          status: "pending",
          createdDate: new Date().toISOString().split("T")[0],
        }
        setFaqs([newFAQ, ...faqs])
        mockFAQs.push(newFAQ as MockFAQ)
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
        title="FAQ & Support Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* FAQ & Support Assistant Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" /> FAQ & Support Assistant
            </DialogTitle>
          </DialogHeader>

          {/* Chat messages */}
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.isBot ? "" : "flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isBot ? "bg-primary/10" : "bg-secondary"}`}>
                    {msg.isBot ? <Bot className="h-4 w-4 text-primary" /> : <LucideUser className="h-4 w-4" />}
                  </div>
                  <div className={`flex-1 ${msg.isBot ? "" : "flex flex-col items-end"}`}>
                    <div className="rounded-lg p-3 max-w-[80%] bg-muted">
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
