"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { parseBulkImport } from "@/lib/bulk-import-parser"
import type { UserCard } from "@/lib/types"

interface BulkImportPanelProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onBulkImport: (cards: UserCard[]) => void
}

export default function BulkImportPanel({ searchQuery, onSearchChange, onBulkImport }: BulkImportPanelProps) {
  const [importText, setImportText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleBulkImport = async () => {
    if (!importText.trim()) {
      setMessage({ type: "error", text: "Please enter import data" })
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const parsedCards = parseBulkImport(importText)
      onBulkImport(parsedCards)
      setMessage({ type: "success", text: `Successfully imported ${parsedCards.length} card entries` })
      setImportText("")
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Import failed" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Manage Cards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium">
            Search Your Cards
          </Label>
          <Input
            id="search"
            placeholder="Search by card name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Bulk Import */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Bulk Import</Label>
          <div className="space-y-3">
            <Textarea
              placeholder="Enter card data..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />

            <Button
              onClick={handleBulkImport}
              disabled={isProcessing || !importText.trim()}
              className="w-full flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Process Import"}
            </Button>

            {message && (
              <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Format Help */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Import Format:</h4>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            <div>OP06-022=234</div>
            <div>4xOP07-116=122</div>
            <div>2xST28-005={"{12,13}"}</div>
            <div>4xOP06-100={"{10,10,11,11}"}</div>
            <div>4xOP07-117=m</div>
            <div>2xOP07-118={"{m, 23}"}</div>
            <div>OP07-119=m$15</div>
            <div>2xOP07-120=m$20</div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <p>• Card number = price</p>
            <p>• 4x = quantity</p>
            <p>• {"{12,13}"} = multiple prices</p>
            <p>• m = market price</p>
            <p>• m$15 = market price with $15 fallback</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
