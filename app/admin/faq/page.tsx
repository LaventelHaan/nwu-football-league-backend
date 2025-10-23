"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpCircle, Search, Plus, Edit, Trash2, Eye, Calendar, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"

const statusOptions = ["ALL", "Published", "Draft", "Under Review", "Archived"]

// API service functions
const faqAPI = {
  getFAQs: async (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    
    const response = await fetch(`/api/admin/faq?${params}`)
    if (!response.ok) throw new Error('Failed to fetch FAQs')
    return response.json()
  },

  getFAQ: async (id: number) => {
    const response = await fetch(`/api/admin/faq/${id}`)
    if (!response.ok) throw new Error('Failed to fetch FAQ')
    return response.json()
  },

  createFAQ: async (data: any) => {
    const response = await fetch('/api/admin/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create FAQ')
    return response.json()
  },

  updateFAQ: async (id: number, data: any) => {
    const response = await fetch(`/api/admin/faq/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update FAQ')
    return response.json()
  },

  deleteFAQ: async (id: number) => {
    const response = await fetch(`/api/admin/faq/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete FAQ')
    return response.json()
  },

  updateStats: async (id: number, field: 'views' | 'helpful' | 'notHelpful') => {
    const response = await fetch(`/api/admin/faq/${id}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field })
    })
    if (!response.ok) throw new Error('Failed to update stats')
    return response.json()
  },

  getAnalytics: async () => {
    const response = await fetch('/api/admin/faq/analytics')
    if (!response.ok) throw new Error('Failed to fetch analytics')
    return response.json()
  }
}

// Safe date formatter that works on both server and client
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

// Safe tag parser that handles null/undefined values
const parseTags = (tags: string | null | undefined): string[] => {
  if (!tags) return []
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
}

// Safe string check for search filtering
const safeStringIncludes = (text: string | null | undefined, searchTerm: string): boolean => {
  if (!text) return false
  return text.toLowerCase().includes(searchTerm.toLowerCase())
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<any>(null)
  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer_md: "",
    tags: "",
    status: "Draft" as "Draft" | "Published" | "Under Review" | "Archived",
  })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Wait for component to mount to avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load data from API only after component mounts
  useEffect(() => {
    if (mounted) {
      loadData()
    }
  }, [mounted])

  const loadData = async () => {
    try {
      setLoading(true)
      const [faqsData, analyticsData] = await Promise.all([
        faqAPI.getFAQs(),
        faqAPI.getAnalytics()
      ])
      
      setFaqs(faqsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading FAQ data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      safeStringIncludes(faq.question, searchTerm) ||
      safeStringIncludes(faq.answer, searchTerm) ||
      safeStringIncludes(faq.tags, searchTerm)
    const matchesStatus = statusFilter === "ALL" || faq.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewDetails = async (faq: any) => {
    setSelectedFAQ(faq)
    setIsDetailDialogOpen(true)
    // Increment view count
    try {
      await faqAPI.updateStats(faq.id, 'views')
      // Reload FAQs to get updated view count
      const updatedFAQs = await faqAPI.getFAQs()
      setFaqs(updatedFAQs)
    } catch (error) {
      console.error('Error updating view count:', error)
    }
  }

  const handleEditFAQ = (faq: any) => {
    setEditingFAQ({ 
      ...faq, 
      tags: faq.tags || "", // Ensure tags is never null
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveFAQ = async () => {
    if (editingFAQ) {
      try {
        await faqAPI.updateFAQ(editingFAQ.id, {
          question: editingFAQ.question,
          answer_md: editingFAQ.answer,
          tags: editingFAQ.tags || "", // Ensure tags is never null
          status: editingFAQ.status,
          updated_by: 1 // Replace with actual user ID from auth
        })
        
        // Reload data
        await loadData()
        setIsEditDialogOpen(false)
        setEditingFAQ(null)
      } catch (error) {
        console.error('Error updating FAQ:', error)
      }
    }
  }

  const handleCreateFAQ = async () => {
    try {
      await faqAPI.createFAQ({
        question: newFAQ.question,
        answer_md: newFAQ.answer_md,
        tags: newFAQ.tags,
        status: newFAQ.status,
        created_by: 1 // Replace with actual user ID from auth
      })
      
      // Reload data
      await loadData()
      setIsCreateDialogOpen(false)
      setNewFAQ({
        question: "",
        answer_md: "",
        tags: "",
        status: "Draft",
      })
    } catch (error) {
      console.error('Error creating FAQ:', error)
    }
  }

  const handleDeleteFAQ = async (faqId: number) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await faqAPI.deleteFAQ(faqId)
        // Reload data
        await loadData()
      } catch (error) {
        console.error('Error deleting FAQ:', error)
      }
    }
  }

  const handlePublishFAQ = async (faqId: number) => {
    try {
      await faqAPI.updateFAQ(faqId, {
        status: "Published",
        updated_by: 1 // Replace with actual user ID from auth
      })
      // Reload data
      await loadData()
    } catch (error) {
      console.error('Error publishing FAQ:', error)
    }
  }

  const handleHelpful = async (faqId: number) => {
    try {
      await faqAPI.updateStats(faqId, 'helpful')
      // Reload FAQs to get updated count
      const updatedFAQs = await faqAPI.getFAQs()
      setFaqs(updatedFAQs)
    } catch (error) {
      console.error('Error updating helpful count:', error)
    }
  }

  const handleNotHelpful = async (faqId: number) => {
    try {
      await faqAPI.updateStats(faqId, 'notHelpful')
      // Reload FAQs to get updated count
      const updatedFAQs = await faqAPI.getFAQs()
      setFaqs(updatedFAQs)
    } catch (error) {
      console.error('Error updating not helpful count:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "bg-green-100 text-green-800 border-green-200"
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Under Review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading FAQs...</p>
        </div>
      </div>
    )
  }

  const publishedCount = analytics?.published || 0
  const draftCount = analytics?.draft || 0
  const totalViews = analytics?.totalViews || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">FAQ Management</h1>
              <p className="text-muted-foreground mt-1">Manage frequently asked questions and help content</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create FAQ
              </Button>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                {publishedCount} Published
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {draftCount} Drafts
              </Badge>
              
              <Link href="/admin/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="faqs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faqs">FAQ Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-6">
            {/* Filters and Search */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search FAQs by question, answer, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === "ALL" ? "All Statuses" : status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{faq.answer || "No answer provided"}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(faq.status)}>
                            {faq.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{faq.views || 0} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{faq.helpful || 0} helpful</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Updated {formatDate(faq.lastUpdated)}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(faq)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditFAQ(faq)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            {faq.status === "Draft" && (
                              <Button size="sm" onClick={() => handlePublishFAQ(faq.id)}>
                                Publish
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {parseTags(faq.tags).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-muted/50">
                              {tag}
                            </Badge>
                          ))}
                          {parseTags(faq.tags).length === 0 && (
                            <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground">
                              No tags
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No FAQs found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    All time
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <MessageSquare className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
                  <p className="text-xs text-muted-foreground">Live on website</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
                  <p className="text-xs text-muted-foreground">All time views</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{analytics?.categories || 0}</div>
                  <p className="text-xs text-muted-foreground">Unique tags</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Most Viewed FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.mostViewed?.map((faq: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{faq.question}</p>
                          <p className="text-xs text-muted-foreground">{parseTags(faq.tags).join(', ') || "No tags"}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold">{faq.views || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: "Published", count: publishedCount, color: "bg-green-500" },
                      { status: "Draft", count: draftCount, color: "bg-yellow-500" },
                      { status: "Under Review", count: analytics?.underReview || 0, color: "bg-blue-500" },
                      { status: "Archived", count: analytics?.archived || 0, color: "bg-gray-500" }
                    ].map((item) => {
                      const percentage = analytics?.total > 0 ? (item.count / analytics.total) * 100 : 0
                      return (
                        <div key={item.status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm font-medium">{item.status}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-sm font-bold">{item.count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* FAQ Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>FAQ Details</DialogTitle>
          </DialogHeader>
          {selectedFAQ && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{selectedFAQ.question}</h2>
                  <Badge variant="outline" className={getStatusColor(selectedFAQ.status)}>
                    {selectedFAQ.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Answer</Label>
                <div className="mt-2 p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm leading-relaxed">{selectedFAQ.answer || "No answer provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm">{selectedFAQ.createdBy || "Unknown"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm">{formatDate(selectedFAQ.createdDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm">{formatDate(selectedFAQ.lastUpdated)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm">{selectedFAQ.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedFAQ.views || 0}</div>
                  <div className="text-sm text-muted-foreground">Views</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedFAQ.helpful || 0}</div>
                  <div className="text-sm text-muted-foreground">Helpful</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{selectedFAQ.notHelpful || 0}</div>
                  <div className="text-sm text-muted-foreground">Not Helpful</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleHelpful(selectedFAQ.id)}
                >
                  Mark as Helpful
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNotHelpful(selectedFAQ.id)}
                >
                  Mark as Not Helpful
                </Button>
              </div>

              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {parseTags(selectedFAQ.tags).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-muted/50">
                      {tag}
                    </Badge>
                  ))}
                  {parseTags(selectedFAQ.tags).length === 0 && (
                    <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                      No tags
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create FAQ Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New FAQ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter the frequently asked question..."
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Provide a comprehensive answer..."
                rows={6}
                value={newFAQ.answer_md}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer_md: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newFAQ.status} onValueChange={(value: any) => setNewFAQ({ ...newFAQ, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., registration, team, documents"
                value={newFAQ.tags}
                onChange={(e) => setNewFAQ({ ...newFAQ, tags: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFAQ} disabled={!newFAQ.question || !newFAQ.answer_md}>
                Create FAQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          {editingFAQ && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editQuestion">Question</Label>
                <Input
                  id="editQuestion"
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="editAnswer">Answer</Label>
                <Textarea
                  id="editAnswer"
                  rows={6}
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editingFAQ.status}
                    onValueChange={(value: any) => setEditingFAQ({ ...editingFAQ, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="editTags">Tags (comma-separated)</Label>
                <Input
                  id="editTags"
                  value={editingFAQ.tags}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, tags: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveFAQ}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
