"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { HelpCircle, Eye, MessageSquare } from "lucide-react"

// Import centralized mock data
import { mockFAQs, FAQ as MockFAQ } from "@/lib/mockData"

export interface FAQ {
  id: number;
  question: string;
  answer?: string;
  status: "pending" | "answered";
  createdDate: string;
}

export default function FloatingFAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isCreateDialogOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isCreateDialogOpen])

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) return

    const faq: FAQ = {
      id: faqs.length + 1,
      question: newQuestion,
      answer: undefined,
      status: "pending", // mark as pending for admin
      createdDate: new Date().toISOString().split("T")[0],
    }

    // Add to local state for immediate UI update
    setFaqs([faq, ...faqs])

    // Add to centralized mock data so admin can respond
    mockFAQs.push({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      status: faq.status,
      createdDate: faq.createdDate,
    } as MockFAQ)

    setNewQuestion("")
    setIsCreateDialogOpen(false)
  }

  return (
    <>
      {/* Floating Chatbot Icon */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-primary text-primary-foreground p-4 rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
        title="Support / FAQ"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat / FAQ Panel */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-md h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>FAQ & Support</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <Button
              size="sm"
              className="mb-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Ask a Question
            </Button>

            {faqs.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm text-center p-6">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
              </Card>
            )}

            {faqs.map((faq) => (
              <Card
                key={faq.id}
                className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => { setSelectedFAQ(faq); setIsDetailDialogOpen(true) }}
              >
                <CardContent className="pt-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {faq.answer ? "Answered" : "Awaiting response"}
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Question Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Label htmlFor="question">Your Question</Label>
            <Textarea
              id="question"
              rows={4}
              ref={textareaRef}
              placeholder="Type your question here..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitQuestion} disabled={!newQuestion.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Question Details</DialogTitle>
          </DialogHeader>
          {selectedFAQ && (
            <div className="space-y-4 mt-4">
              <div>
                <h2 className="text-xl font-bold">{selectedFAQ.question}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted on {selectedFAQ.createdDate}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Answer</Label>
                <div className="mt-2 p-4 bg-muted/20 rounded-lg min-h-[60px]">
                  {selectedFAQ.answer ? (
                    <p className="text-sm">{selectedFAQ.answer}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Awaiting admin response...</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
