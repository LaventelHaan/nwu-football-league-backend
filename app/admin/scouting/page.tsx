"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
Eye,
Search,
Plus,
Star,
TrendingUp,
Target,
Activity,
Users,
Trophy,
Calendar,
MapPin,
Edit,
Trash2,
} from "lucide-react"
import Link from "next/link"


import { mockWatchlist, mockScoutingReports} from "@/lib/mockData" 
const positionOptions = ["ALL", "Goalkeeper", "Defender", "Midfielder", "Forward"]
const statusOptions = ["ALL", "Recommended", "Priority Target", "Under Review", "Not Interested"]
const potentialOptions = ["ALL", "Very High", "High", "exportMedium", "Low"]

export default function ScoutingDashboard() {
const [reports, setReports] = useState(mockScoutingReports)
const [watchlist, setWatchlist] = useState(mockWatchlist)
const [searchTerm, setSearchTerm] = useState("")
const [positionFilter, setPositionFilter] = useState("ALL")
const [statusFilter, setStatusFilter] = useState("ALL")
const [potentialFilter, setPotentialFilter] = useState("ALL")
const [selectedReport, setSelectedReport] = useState<any>(null)
const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
const [isCreateReportOpen, setIsCreateReportOpen] = useState(false)
const [isAddToWatchlistOpen, setIsAddToWatchlistOpen] = useState(false)

const filteredReports = reports.filter((report) => {
const matchesSearch =
    report.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.currentTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.scoutedBy.toLowerCase().includes(searchTerm.toLowerCase())
const matchesPosition = positionFilter === "ALL" || report.position === positionFilter
const matchesStatus = statusFilter === "ALL" || report.status === statusFilter
const matchesPotential = potentialFilter === "ALL" || report.potential === potentialFilter

return matchesSearch && matchesPosition && matchesStatus && matchesPotential
})

const handleViewDetails = (report: any) => {
setSelectedReport(report)
setIsDetailDialogOpen(true)
}

const getStatusColor = (status: string) => {
switch (status) {
    case "Recommended":
    return "bg-green-100 text-green-800 border-green-200"
    case "Priority Target":
    return "bg-red-100 text-red-800 border-red-200"
    case "Under Review":
    return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Not Interested":
    return "bg-gray-100 text-gray-800 border-gray-200"
    default:
    return "bg-blue-100 text-blue-800 border-blue-200"
}
}

const getPotentialColor = (potential: string) => {
switch (potential) {
    case "Very High":
    return "bg-purple-100 text-purple-800 border-purple-200"
    case "High":
    return "bg-blue-100 text-blue-800 border-blue-200"
    case "Medium":
    return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Low":
    return "bg-gray-100 text-gray-800 border-gray-200"
    default:
    return "bg-gray-100 text-gray-800 border-gray-200"
}
}

const getPriorityColor = (priority: string) => {
switch (priority) {
    case "High":
    return "bg-red-100 text-red-800 border-red-200"
    case "Medium":
    return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Low":
    return "bg-green-100 text-green-800 border-green-200"
    default:
    return "bg-gray-100 text-gray-800 border-gray-200"
}
}

const getPositionIcon = (position: string) => {
switch (position) {
    case "Goalkeeper":
    return "🥅"
    case "Defender":
    return "🛡️"
    case "Midfielder":
    return "⚽"
    case "Forward":
    return "🎯"
    default:
    return "👤"
}
}

const recommendedCount = reports.filter((r) => r.status === "Recommended").length
const priorityCount = reports.filter((r) => r.status === "Priority Target").length

return (
<div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
    {/* Header */}
    <div className="border-b bg-card/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-foreground">Scouting Dashboard</h1>
            <p className="text-muted-foreground mt-1">
            Player scouting reports, watchlist, and recruitment analytics
            </p>
        </div>
        <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            {recommendedCount} Recommended
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            {priorityCount} Priority
            </Badge>
            <Button onClick={() => setIsCreateReportOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Report
            </Button>
            <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
            </Link>
        </div>
        </div>
    </div>
    </div>

    <div className="container mx-auto px-4 py-8">
    <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="reports">Scouting Reports</TabsTrigger>
        <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
        {/* Filters and Search */}
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                    placeholder="Search players, teams, or scouts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    />
                </div>
                </div>
                <div className="flex gap-4">
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-40">
                    <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                    {positionOptions.map((position) => (
                        <SelectItem key={position} value={position}>
                        {position === "ALL" ? "All Positions" : position}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                    {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                        {status === "ALL" ? "All Statuses" : status}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Select value={potentialFilter} onValueChange={setPotentialFilter}>
                    <SelectTrigger className="w-40">
                    <SelectValue placeholder="Potential" />
                    </SelectTrigger>
                    <SelectContent>
                    {potentialOptions.map((potential) => (
                        <SelectItem key={potential} value={potential}>
                        {potential === "ALL" ? "All Potential" : potential}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>
            </CardContent>
        </Card>

        {/* Scouting Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
            <Card
                key={report.id}
                className="bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
            >
                <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getPositionIcon(report.position)}</div>
                    <div>
                        <CardTitle className="text-lg">{report.playerName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                        {report.position} • Age {report.age} • {report.currentTeam}
                        </p>
                    </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                    <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status}
                    </Badge>
                    <Badge variant="outline" className={getPotentialColor(report.potential)}>
                        {report.potential}
                    </Badge>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-lg">{report.overallRating}/10</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{report.estimatedValue}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {report.scoutDate}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {report.scoutedBy}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {report.league}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Trophy className="w-4 h-4 mr-2" />
                        {report.contractStatus}
                    </div>
                    </div>

                    <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Top Strengths:</p>
                    <div className="flex flex-wrap gap-1">
                        {report.strengths.slice(0, 2).map((strength, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                            {strength}
                        </Badge>
                        ))}
                    </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(report)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Report
                    </Button>
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                        </Button>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
            ))}
        </div>

        {filteredReports.length === 0 && (
            <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No scouting reports found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
            </Card>
        )}
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Player Watchlist</h2>
            <Button onClick={() => setIsAddToWatchlistOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Player
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {watchlist.map((player) => (
            <Card key={player.id} className="bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                    <h3 className="text-lg font-semibold">{player.playerName}</h3>
                    <p className="text-sm text-muted-foreground">
                        {player.position} • Age {player.age} • {player.currentTeam}
                    </p>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(player.priority)}>
                    {player.priority} Priority
                    </Badge>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Added by:</span>
                    <span>{player.addedBy}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Added date:</span>
                    <span>{player.addedDate}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Next scouting:</span>
                    <span>{player.nextScoutingDate}</span>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{player.notes}</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" size="sm">
                    Create Report
                    </Button>
                    <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 bg-transparent">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
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
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +3 this month
                </p>
            </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recommended Players</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">{recommendedCount}</div>
                <p className="text-xs text-muted-foreground">Ready for recruitment</p>
            </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Priority Targets</CardTitle>
                <Star className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-600">{priorityCount}</div>
                <p className="text-xs text-muted-foreground">High-value prospects</p>
            </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600">{watchlist.length}</div>
                <p className="text-xs text-muted-foreground">Players being monitored</p>
            </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Reports by Position</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {positionOptions.slice(1).map((position) => {
                    const count = reports.filter((r) => r.position === position).length
                    const percentage = reports.length > 0 ? (count / reports.length) * 100 : 0
                    return (
                    <div key={position} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                        <span className="text-lg">{getPositionIcon(position)}</span>
                        <span className="text-sm font-medium">{position}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-sm font-bold">{count}</span>
                        </div>
                    </div>
                    )
                })}
                </div>
            </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Recent Scouting Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg">{getPositionIcon(report.position)}</div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{report.playerName}</p>
                        <p className="text-xs text-muted-foreground">
                        Scouted by {report.scoutedBy} • {report.scoutDate}
                        </p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status}
                    </Badge>
                    </div>
                ))}
                </div>
            </CardContent>
            </Card>
        </div>
        </TabsContent>
    </Tabs>
    </div>

    {/* Detailed Report Dialog */}
    <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
            <span className="text-2xl">{selectedReport && getPositionIcon(selectedReport.position)}</span>
            <span>{selectedReport?.playerName} - Scouting Report</span>
        </DialogTitle>
        </DialogHeader>
        {selectedReport && (
        <div className="space-y-6">
            {/* Player Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                <Label className="text-sm font-medium">Overall Rating</Label>
                <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-lg font-bold">{selectedReport.overallRating}/10</span>
                </div>
            </div>
            <div>
                <Label className="text-sm font-medium">Potential</Label>
                <Badge variant="outline" className={getPotentialColor(selectedReport.potential)}>
                {selectedReport.potential}
                </Badge>
            </div>
            <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge variant="outline" className={getStatusColor(selectedReport.status)}>
                {selectedReport.status}
                </Badge>
            </div>
            <div>
                <Label className="text-sm font-medium">Estimated Value</Label>
                <p className="text-sm font-bold">{selectedReport.estimatedValue}</p>
            </div>
            </div>

            {/* Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <h3 className="font-semibold mb-3">Physical Attributes</h3>
                <div className="space-y-2">
                {Object.entries(selectedReport.physicalAttributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                    {typeof value === "number" ? (
                        <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                            <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(value / 10) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold w-6">{value}</span>
                        </div>
                    ) : (
                        <span className="text-sm font-bold">{String(value)}</span>

                    )}
                    </div>
                ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Technical Skills</h3>
                <div className="space-y-2">
                {Object.entries(selectedReport.technicalSkills).map(([key, value]) => {
  const numValue = Number(value); // convert safely to number

  return (
    <div key={key} className="flex justify-between items-center">
      <span className="text-sm capitalize">
        {key.replace(/([A-Z])/g, " $1").trim()}
      </span>
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-muted rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${(numValue / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold w-6">{numValue}</span>
      </div>
    </div>
  );
})}

                </div>
            </div>

            <div>
                <h3 className="font-semibold mb-3">Mental Attributes</h3>
                <div className="space-y-2">
                {Object.entries(selectedReport.mentalAttributes).map(([key, value]) => {
  const numValue = Number(value); // ensure it's numeric

  return (
    <div key={key} className="flex justify-between items-center">
      <span className="text-sm capitalize">
        {key.replace(/([A-Z])/g, " $1").trim()}
      </span>
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-muted rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full"
            style={{ width: `${(numValue / 10) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold w-6">{numValue}</span>
      </div>
    </div>
  );
})}

                </div>
            </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold mb-3">Strengths</h3>
                <div className="space-y-2">
                {selectedReport.strengths.map((strength: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm">{strength}</span>
                    </div>
                ))}
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-3">Areas for Improvement</h3>
                <div className="space-y-2">
                {selectedReport.weaknesses.map((weakness: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm">{weakness}</span>
                    </div>
                ))}
                </div>
            </div>
            </div>

            {/* Scout Notes and Recommendation */}
            <div className="space-y-4">
            <div>
                <h3 className="font-semibold mb-2">Scout Notes</h3>
                <p className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">{selectedReport.notes}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <Label className="text-sm font-medium">Recommended Action</Label>
                <p className="text-sm font-bold text-primary">{selectedReport.recommendedAction}</p>
                </div>
                <div>
                <Label className="text-sm font-medium">Contract Status</Label>
                <p className="text-sm">{selectedReport.contractStatus}</p>
                </div>
            </div>
            </div>

            {/* Scouting Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
                <Label className="text-sm font-medium">Scouted By</Label>
                <p className="text-sm">{selectedReport.scoutedBy}</p>
            </div>
            <div>
                <Label className="text-sm font-medium">Scout Date</Label>
                <p className="text-sm">{selectedReport.scoutDate}</p>
            </div>
            <div>
                <Label className="text-sm font-medium">Match Venue</Label>
                <p className="text-sm">{selectedReport.matchVenue}</p>
            </div>
            <div>
                <Label className="text-sm font-medium">League</Label>
                <p className="text-sm">{selectedReport.league}</p>
            </div>
            </div>
        </div>
        )}
    </DialogContent>
    </Dialog>
</div>
)
}
