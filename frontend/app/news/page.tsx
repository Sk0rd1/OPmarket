"use client"

import Header from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Zap, Info } from "lucide-react"

export default function NewsPage() {
  const newsItems = [
    {
      id: 1,
      title: "New Booster Pack: Film Edition Released!",
      content:
        "The highly anticipated Film Edition booster pack is now available. Featuring cards from One Piece Film Red with exclusive alternate art designs.",
      date: "2024-01-15",
      type: "release",
      icon: Zap,
    },
    {
      id: 2,
      title: "Market Update: Shanks SEC Price Surge",
      content:
        "Shanks SEC card has seen a 25% price increase this week due to high demand from competitive players. Current market average: $199.99",
      date: "2024-01-12",
      type: "market",
      icon: TrendingUp,
    },
    {
      id: 3,
      title: "Tournament Results: Winter Championship",
      content:
        "Congratulations to all participants in the Winter Championship! Red/Green Luffy deck dominated the meta with a 60% win rate.",
      date: "2024-01-10",
      type: "tournament",
      icon: Info,
    },
    {
      id: 4,
      title: "Site Maintenance Scheduled",
      content:
        "We will be performing scheduled maintenance on January 20th from 2:00 AM to 4:00 AM EST. The site may be temporarily unavailable.",
      date: "2024-01-08",
      type: "maintenance",
      icon: Info,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "release":
        return "bg-green-100 text-green-800"
      case "market":
        return "bg-blue-100 text-blue-800"
      case "tournament":
        return "bg-purple-100 text-purple-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "release":
        return "New Release"
      case "market":
        return "Market Update"
      case "tournament":
        return "Tournament"
      case "maintenance":
        return "Maintenance"
      default:
        return "News"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">News & Updates</h1>
          <p className="text-gray-600">Stay updated with the latest One Piece TCG news and market information</p>
        </div>

        <div className="space-y-6">
          {newsItems.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeColor(item.type)}>{getTypeLabel(item.type)}</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{item.content}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Market Highlights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Market Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">↑ 15%</p>
                <p className="text-sm text-gray-600">SR Cards Average</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">1,247</p>
                <p className="text-sm text-gray-600">Active Listings</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">$89.50</p>
                <p className="text-sm text-gray-600">Most Traded Card</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
