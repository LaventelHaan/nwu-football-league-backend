"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HelpCircle, Search, Plus, Edit, Trash2, Eye, Users, Calendar, TrendingUp, MessageSquare } from "lucide-react"
import Link from "next/link"

const statusOptions = ["ALL", "Published", "Draft", "Under Review", "Archived"]


export default function FAQManagement() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const categoryOptions = ["ALL", ...Array.from(new Set(faqs.map((f) => f.category || "Uncategorized")))]
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [selectedFAQ, setSelectedFAQ] = useState<any>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingFAQ, setEditingFAQ] = useState<any>(null)
  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: "",
    tags: "",
    status: "Draft",
  })
  
  const handleCreateFAQ = async () => {
    const faqPayload = {
      question: newFAQ.question,
      answer_md: newFAQ.answer || 'Not answered',
      created_by: 1001,
      category: newFAQ.category || 'Uncategorized',
      status: newFAQ.status || 'Draft',
      tags: newFAQ.tags,
    }

    try {
      const res = await fetch('http://localhost:5000/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqPayload),
      })

      const result = await res.json()

      const newEntry = {
        faq_id: result.faq_id,
        ...faqPayload,
        tags: typeof faqPayload.tags === 'string'
          ? faqPayload.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        views: 0,
        helpful: 0,
        notHelpful: 0,
        createdBy: 'Admin User',
      }

      setFaqs((prevFaqs) => [...prevFaqs, newEntry])
      setIsCreateDialogOpen(false)
      setNewFAQ({
        question: '',
        answer: '',
        category: '',
        tags: '',
        status: 'Draft',
      })
    } catch (err) {
      console.error('Failed to create FAQ:', err)
    }
  }
  
  const categoryStats = Array.from(
  faqs.reduce((map, faq) => {
    const name = faq.category || "Uncategorized"
    const current = map.get(name) || { name, count: 0 }
    current.count += 1
    map.set(name, current)
    return map
  }, new Map<string, { name: string; count: number }>())
).map((entry, index) => ({
  ...entry[1],
  color: ["bg-green-100", "bg-yellow-100", "bg-blue-100", "bg-purple-100", "bg-red-100"][index % 5],
}))
  
  useEffect(() => {
  const fetchFAQs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/faqs")
      const data = await res.json()

      const normalized = data.map((faq) => ({
        ...faq,
        tags: typeof faq.tags === "string"
          ? faq.tags.split(",").map(tag => tag.trim()).filter(Boolean)
          : [],
      }))

      setFaqs(normalized)
    } catch (err) {
      console.error("Failed to fetch FAQs:", err)
    }
  }

  fetchFAQs()
}, [])


  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer_md.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "ALL" || faq.status === statusFilter
    const matchesCategory = categoryFilter === "ALL" || faq.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleViewDetails = async (faq: any) => {
  try {
    await fetch(`http://localhost:5000/api/faqs/${faq.faq_id}/views`, {
      method: "PUT",
    })

    const normalizedTags = typeof faq.tags === "string"
      ? faq.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : Array.isArray(faq.tags)
        ? faq.tags
        : []

    const createdDate = faq.created_at
      ? new Date(faq.created_at).toISOString().split("T")[0]
      : "Not available"

    const updatedDate = faq.updated_at
      ? new Date(faq.updated_at).toISOString().split("T")[0]
      : null

    const lastUpdated =
      updatedDate && updatedDate !== createdDate ? updatedDate : null

    const updatedFAQ = {
      faq_id: faq.faq_id,
      question: faq.question || "",
      answer_md: faq.answer_md || "",
      category: faq.category || "Uncategorized",
      createdBy: `User ${faq.created_by}` || "Unknown",
      createdDate,
      lastUpdated,
      views: (faq.views ?? 0) + 1,
      helpful: typeof faq.helpful === "number" ? faq.helpful : 0,
      notHelpful: typeof faq.notHelpful === "number" ? faq.notHelpful : 0,
      tags: normalizedTags,
    }

    setSelectedFAQ(updatedFAQ)
    setFaqs((prevFaqs) =>
      prevFaqs.map((f) => (f.faq_id === updatedFAQ.faq_id ? updatedFAQ : f))
    )

    setIsDetailDialogOpen(true)
  } catch (err) {
    console.error("Failed to increment views or update FAQ list:", err)
  }
}


  const handleEditFAQ = (faq: any) => {
  const normalizedTags = Array.isArray(faq.tags)
    ? faq.tags.join(", ")
    : typeof faq.tags === "string"
      ? faq.tags
      : ""

  setEditingFAQ({
    faq_id: faq.faq_id,
    question: faq.question || "",
    answer: faq.answer_md || "",
    category: faq.category || "Uncategorized",
    tags: normalizedTags,
    status: faq.status || "Draft",
    views: faq.views || 0,
    helpful: faq.helpful || 0,
    notHelpful: faq.notHelpful || 0,
    lastUpdated: faq.lastUpdated || new Date().toISOString().split("T")[0],
  })

  setIsEditDialogOpen(true)
}

const handleSaveFAQ = async () => {
  if (!editingFAQ) return

  const normalizedTags =
    Array.isArray(editingFAQ.tags)
      ? editingFAQ.tags.join(",")
      : typeof editingFAQ.tags === "string"
        ? editingFAQ.tags
        : ""

  const payload = {
    ...editingFAQ,
    answer_md: editingFAQ.answer_md?.trim() || "",
    is_active: typeof editingFAQ.is_active === "boolean" ? editingFAQ.is_active : true,
    tags: normalizedTags,
  }

  try {
    const res = await fetch(`http://localhost:5000/api/faqs/${editingFAQ.faq_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
	
	const contentType = res.headers.get("content-type")

	if (!res.ok || !contentType?.includes("application/json")) {
	  const errorText = await res.text()
	  console.error("Publish failed:", errorText)
	  throw new Error("Invalid response format")
	}

	const data = await res.json()



    if (!res.ok) {
      const errorText = await res.text()
      console.error("Update failed:", errorText)
      throw new Error("Failed to update FAQ")
    }

    // ✅ Re-fetch the updated FAQ from backend
    const refreshedRes = await fetch(`http://localhost:5000/api/faqs/${editingFAQ.faq_id}`)
    const refreshedFAQ = await refreshedRes.json()

    setFaqs((prevFaqs) =>
      prevFaqs.map((f) =>
        f.faq_id === editingFAQ.faq_id ? refreshedFAQ : f
      )
    )

    setIsEditDialogOpen(false)
    setEditingFAQ(null)
  } catch (err) {
    console.error("Failed to save FAQ:", err)
  }
}

const handleDeleteFAQ = async (faqId: number) => {
  if (!confirm("Are you sure you want to delete this FAQ?")) return

  try {
    const res = await fetch(`http://localhost:5000/api/faqs/${faqId}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Delete failed:", errorText)
      throw new Error("Failed to delete FAQ")
    }

    setFaqs((prevFaqs) => prevFaqs.filter((f) => f.faq_id !== faqId))
  } catch (err) {
    console.error("Failed to delete FAQ:", err)
  }
}

  const handlePublishFAQ = async (faqId: number) => {
  if (!faqId) {
    console.error("Publish failed: FAQ ID is undefined.")
    return
  }

  try {
    const res = await fetch(`http://localhost:5000/api/faqs/${faqId}/publish`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Published" }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Publish failed:", errorText)
      throw new Error("Failed to publish FAQ")
    }

    const refreshedRes = await fetch(`http://localhost:5000/api/faqs/${faqId}`)
    const refreshedFAQ = await refreshedRes.json()

    setFaqs((prevFaqs) =>
      prevFaqs.map((f) => (f.faq_id === faqId ? refreshedFAQ : f))
    )
  } catch (err) {
    console.error("Failed to publish FAQ:", err)
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

  const publishedCount = faqs.filter((f) => f.status === "Published").length
  const draftCount = faqs.filter((f) => f.status === "Draft").length
  const totalViews = faqs.reduce((sum, faq) => sum + faq.views, 0)

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faqs">FAQ Management</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
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
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category === "ALL" ? "All Categories" : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <Card key={faq.faq_id} className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{faq.answer}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(faq.status)}>
                            {faq.status}
                          </Badge>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <HelpCircle className="w-4 h-4" />
                              <span>{faq.category}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{faq.views} views</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>{faq.helpful} helpful</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {faq.lastUpdated && (
								  <div className="flex items-center space-x-1">
									<Calendar className="w-4 h-4" />
									<span>Updated {faq.lastUpdated}</span>
								  </div>
								)}
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
                              <Button size="sm" onClick={() => handlePublishFAQ(faq.faq_id)}>
                                Publish
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFAQ(faq.faq_id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {(Array.isArray(faq.tags)
							? faq.tags
							: typeof faq.tags === "string"
							  ? faq.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
							  : []
						  ).map((tag, index) => (
							<Badge key={index} variant="outline" className="text-xs bg-muted/50">
							  {tag}
							</Badge>
						  ))}
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

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">FAQ Categories</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryStats.map((category) => (
                <Card key={category.name} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <Badge variant="outline" className={category.color}>
                        {category.count} FAQs
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Active category with published content</div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{faqs.length}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="inline w-3 h-3 mr-1" />
                    +2 this month
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
                  <div className="text-2xl font-bold text-blue-600">{isNaN(totalViews) ? 0 : totalViews}</div>
                  <p className="text-xs text-muted-foreground">All time views</p>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Users className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{categoryStats.length}</div>
                  <p className="text-xs text-muted-foreground">Active categories</p>
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
                    {faqs
                      .sort((a, b) => b.views - a.views)
                      .slice(0, 5)
                      .map((faq) => (
                        <div key={faq.faq_id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{faq.question}</p>
                            <p className="text-xs text-muted-foreground">{faq.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-bold">{faq.views}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>FAQ Categories Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryStats.map((category) => {
                      const percentage = faqs.length > 0 ? (category.count / faqs.length) * 100 : 0
                      return (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${category.color.split(" ")[0]}`} />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-sm font-bold">{category.count}</span>
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
                  <p className="text-sm leading-relaxed">
					{selectedFAQ?.answer_md || "No answer provided."}
				  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedFAQ?.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm">{selectedFAQ?.createdBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm">{selectedFAQ?.createdDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm">{selectedFAQ?.lastUpdated || "Never"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
					{selectedFAQ?.views ?? 0}
				  </div>
                  <div className="text-sm text-muted-foreground">Views</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
					{selectedFAQ?.helpful ?? 0}
				  </div>
                  <div className="text-sm text-muted-foreground">Helpful</div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
				    {selectedFAQ?.notHelpful ?? 0}
				  </div>
                  <div className="text-sm text-muted-foreground">Not Helpful</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFAQ?.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-muted/50">
                      {tag}
                    </Badge>
                  ))}
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
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newFAQ.category} onValueChange={(value) => setNewFAQ({ ...newFAQ, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryStats.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newFAQ.status} onValueChange={(value) => setNewFAQ({ ...newFAQ, status: value })}>
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
              <Button onClick={handleCreateFAQ} disabled={!newFAQ.question || !newFAQ.answer || !newFAQ.category}>
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
                  <Label htmlFor="editCategory">Category</Label>
                  <Select
                    value={editingFAQ.category}
                    onValueChange={(value) => setEditingFAQ({ ...editingFAQ, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryStats.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editingFAQ.status}
                    onValueChange={(value) => setEditingFAQ({ ...editingFAQ, status: value })}
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
