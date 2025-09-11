"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Calendar,
  Users,
  Play,
  ImageIcon,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Star,
  Award,
  Target,
} from "lucide-react"
import Link from "next/link"

// Mock data for the homepage
const mockData = {
  featuredMatches: [
    {
      id: 1,
      homeTeam: "NWU Eagles",
      awayTeam: "Wits Wolves",
      date: "2024-01-15",
      time: "15:00",
      venue: "NWU Stadium",
      status: "upcoming",
    },
    {
      id: 2,
      homeTeam: "UCT Lions",
      awayTeam: "NWU Eagles",
      date: "2024-01-12",
      time: "14:30",
      venue: "UCT Grounds",
      status: "final",
      homeScore: 2,
      awayScore: 3,
    },
  ],
  leagueStandings: [
    { position: 1, team: "NWU Eagles", points: 45, wins: 14, draws: 3, losses: 1 },
    { position: 2, team: "Wits Wolves", points: 42, wins: 13, draws: 3, losses: 2 },
    { position: 3, team: "UCT Lions", points: 38, wins: 12, draws: 2, losses: 4 },
  ],
  topScorers: [
    { name: "John Doe", team: "NWU Eagles", goals: 18 },
    { name: "Mike Smith", team: "Wits Wolves", goals: 15 },
    { name: "David Johnson", team: "UCT Lions", goals: 12 },
  ],
  news: [
    {
      id: 1,
      title: "NWU Eagles Maintain Top Position",
      summary: "The Eagles continue their impressive season with a commanding victory...",
      date: "2024-01-10",
    },
    {
      id: 2,
      title: "Championship Finals Approaching",
      summary: "With only 4 matches remaining, the race for the championship intensifies...",
      date: "2024-01-08",
    },
  ],
  highlights: [
    {
      id: 1,
      title: "NWU Eagles vs Wits Wolves - Match Highlights",
      type: "video",
      thumbnail: "/football-match-highlight.png",
      duration: "3:45",
      views: "12.5K",
      date: "2024-01-12",
    },
    {
      id: 2,
      title: "Best Goals of the Season",
      type: "video",
      thumbnail: "/football-goals-compilation.png",
      duration: "5:20",
      views: "8.2K",
      date: "2024-01-10",
    },
    {
      id: 3,
      title: "Championship Trophy Ceremony",
      type: "image",
      thumbnail: "/trophy-ceremony.png",
      views: "15.3K",
      date: "2024-01-08",
    },
    {
      id: 4,
      title: "Player Training Session",
      type: "image",
      thumbnail: "/training-session.png",
      views: "6.7K",
      date: "2024-01-05",
    },
  ],
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      {/* Background pattern overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>

      <header className="relative bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-6">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3">
                <div className="text-3xl font-black text-primary-foreground">NWU</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">Sports League Manager</h1>
                <p className="text-primary-foreground/90 text-lg font-medium">
                  Your Gateway to University Sports Excellence
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-3">
              <Button variant="secondary" size="default" className="font-semibold shadow-sm" asChild>
                <Link href="/standings">Standings</Link>
              </Button>
              <Button variant="secondary" size="default" className="font-semibold shadow-sm" asChild>
                <Link href="/fixtures">Fixtures</Link>
              </Button>
              <Button variant="secondary" size="default" className="font-semibold shadow-sm" asChild>
                <Link href="/players">Players</Link>
              </Button>
              <Button
                variant="outline"
                size="default"
                className="font-semibold bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section>
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-accent/5 to-primary/12 rounded-3xl p-12 text-center shadow-xl border border-primary/10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/15 backdrop-blur-sm rounded-full p-6 shadow-lg">
                  <Trophy className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Welcome to NWU Sports</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty leading-relaxed">
                Experience the thrill of university sports with comprehensive league management, real-time statistics,
                and exclusive content from South Africa's premier athletic competition.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  size="lg"
                  className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
                  asChild
                >
                  <Link href="/standings">
                    <Trophy className="w-5 h-5 mr-2" />
                    View League Standings
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold bg-background/80 backdrop-blur-sm hover:bg-background shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20"
                  asChild
                >
                  <Link href="/fixtures">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Matches
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-3">Highlights & Media</h2>
            <p className="text-muted-foreground text-lg">Catch up on the best moments from recent matches</p>
          </div>
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/10 to-background/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockData.highlights.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg hover:shadow-2xl transition-all duration-300 bg-background/50 backdrop-blur-sm">
                      <img
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300 flex items-center justify-center">
                        {item.type === "video" ? (
                          <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <Play className="w-6 h-6 text-primary-foreground fill-current" />
                          </div>
                        ) : (
                          <div className="bg-primary/90 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <ImageIcon className="w-6 h-6 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      {item.duration && (
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                          {item.duration}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="font-medium">{item.views} views</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Matches */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <span>Featured Matches</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockData.featuredMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-gradient-to-r from-muted/20 via-muted/10 to-muted/20 border border-muted/30 rounded-xl p-6 hover:shadow-lg hover:bg-gradient-to-r hover:from-muted/30 hover:via-muted/15 hover:to-muted/30 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="font-bold text-lg mb-1">{match.homeTeam}</div>
                          {match.status === "final" && (
                            <div className="text-3xl font-black text-primary">{match.homeScore}</div>
                          )}
                        </div>
                        <div className="text-muted-foreground font-semibold text-lg">VS</div>
                        <div className="text-center">
                          <div className="font-bold text-lg mb-1">{match.awayTeam}</div>
                          {match.status === "final" && (
                            <div className="text-3xl font-black text-primary">{match.awayScore}</div>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={match.status === "final" ? "secondary" : "default"}
                        className="font-semibold px-4 py-2"
                      >
                        {match.status === "final" ? "Final" : "Upcoming"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {match.date} • {match.time} • {match.venue}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* League Standings */}
          <div>
            <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <span>League Standings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.leagueStandings.map((team) => (
                    <div
                      key={team.position}
                      className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/20 transition-colors duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                          {team.position}
                        </div>
                        <div>
                          <div className="font-bold text-base">{team.team}</div>
                          <div className="text-sm text-muted-foreground font-medium">
                            {team.wins}W • {team.draws}D • {team.losses}L
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-xl text-primary">{team.points}</div>
                        <div className="text-xs text-muted-foreground font-medium">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Scorers */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <span>Top Scorers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.topScorers.map((player, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/20 transition-colors duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-base">{player.name}</div>
                        <div className="text-sm text-muted-foreground font-medium">{player.team}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl text-primary">{player.goals}</div>
                      <div className="text-xs text-muted-foreground font-medium">goals</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Latest News */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-background/95 via-muted/8 to-background/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <div className="bg-primary/15 backdrop-blur-sm rounded-lg p-2">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span>Latest News</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockData.news.map((article) => (
                  <div key={article.id} className="border-b border-muted/30 pb-6 last:border-b-0 last:pb-0">
                    <h3 className="font-bold text-lg mb-3 text-balance hover:text-primary transition-colors duration-300 cursor-pointer">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground mb-3 text-pretty leading-relaxed">{article.summary}</p>
                    <div className="text-sm text-muted-foreground font-medium">{article.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="relative bg-gradient-to-br from-muted/90 via-muted/80 to-muted/90 mt-20 border-t border-muted/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* League Information */}
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-primary rounded-xl p-3 shadow-lg">
                  <div className="text-2xl font-black text-primary-foreground">NWU</div>
                </div>
                <div className="text-xl font-bold">Sports League</div>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed text-pretty">
                The premier university sports league featuring the best teams and players from across South Africa's
                leading institutions, promoting excellence in athletic competition.
              </p>
              <div className="flex space-x-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="p-3 bg-background/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 backdrop-blur-sm"
                >
                  <Youtube className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-lg mb-6 flex items-center space-x-2">
                <Star className="w-5 h-5 text-primary" />
                <span>Quick Links</span>
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/standings" className="hover:text-primary transition-colors duration-300 font-medium">
                    League Standings
                  </Link>
                </li>
                <li>
                  <Link href="/fixtures" className="hover:text-primary transition-colors duration-300 font-medium">
                    Fixtures & Results
                  </Link>
                </li>
                <li>
                  <Link href="/players" className="hover:text-primary transition-colors duration-300 font-medium">
                    Player Profiles
                  </Link>
                </li>
                <li>
                  <Link href="/teams" className="hover:text-primary transition-colors duration-300 font-medium">
                    Teams
                  </Link>
                </li>
                <li>
                  <Link href="/statistics" className="hover:text-primary transition-colors duration-300 font-medium">
                    Statistics
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-primary transition-colors duration-300 font-medium">
                    Latest News
                  </Link>
                </li>
              </ul>
            </div>

            {/* League Info */}
            <div>
              <h3 className="font-bold text-lg mb-6 flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>League Information</span>
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors duration-300 font-medium">
                    About the League
                  </Link>
                </li>
                <li>
                  <Link href="/rules" className="hover:text-primary transition-colors duration-300 font-medium">
                    Rules & Regulations
                  </Link>
                </li>
                <li>
                  <Link href="/schedule" className="hover:text-primary transition-colors duration-300 font-medium">
                    Season Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/venues" className="hover:text-primary transition-colors duration-300 font-medium">
                    Venues
                  </Link>
                </li>
                <li>
                  <Link href="/officials" className="hover:text-primary transition-colors duration-300 font-medium">
                    Officials
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="hover:text-primary transition-colors duration-300 font-medium">
                    League History
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-bold text-lg mb-6">Contact Us</h3>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm leading-relaxed">
                    <div className="font-semibold text-foreground">NWU Sports Complex</div>
                    <div>Potchefstroom Campus</div>
                    <div>South Africa</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">+27 18 299 1111</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">sports@nwu.ac.za</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-background/60 backdrop-blur-sm rounded-xl border border-muted/30">
                <h4 className="font-bold mb-3 text-foreground">League Statistics</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">12</div>
                    <div className="text-muted-foreground">Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">240+</div>
                    <div className="text-muted-foreground">Players</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">132</div>
                    <div className="text-muted-foreground">Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="font-black text-2xl text-primary">2024</div>
                    <div className="text-muted-foreground">Season</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-muted/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground font-medium">© 2024 NWU Sports League Manager. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Terms of Service
              </Link>
              <Link
                href="/support"
                className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
