"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Upload } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

const characterAvatars = [
  { name: "Luffy", image: "/placeholder.svg?height=60&width=60&text=Luffy" },
  { name: "Zoro", image: "/placeholder.svg?height=60&width=60&text=Zoro" },
  { name: "Nami", image: "/placeholder.svg?height=60&width=60&text=Nami" },
  { name: "Usopp", image: "/placeholder.svg?height=60&width=60&text=Usopp" },
  { name: "Sanji", image: "/placeholder.svg?height=60&width=60&text=Sanji" },
  { name: "Chopper", image: "/placeholder.svg?height=60&width=60&text=Chopper" },
  { name: "Robin", image: "/placeholder.svg?height=60&width=60&text=Robin" },
  { name: "Franky", image: "/placeholder.svg?height=60&width=60&text=Franky" },
  { name: "Brook", image: "/placeholder.svg?height=60&width=60&text=Brook" },
  { name: "Jinbe", image: "/placeholder.svg?height=60&width=60&text=Jinbe" },
  { name: "Ace", image: "/placeholder.svg?height=60&width=60&text=Ace" },
  { name: "Sabo", image: "/placeholder.svg?height=60&width=60&text=Sabo" },
  { name: "Law", image: "/placeholder.svg?height=60&width=60&text=Law" },
  { name: "Kid", image: "/placeholder.svg?height=60&width=60&text=Kid" },
  { name: "Shanks", image: "/placeholder.svg?height=60&width=60&text=Shanks" },
  { name: "Mihawk", image: "/placeholder.svg?height=60&width=60&text=Mihawk" },
  { name: "Whitebeard", image: "/placeholder.svg?height=60&width=60&text=WB" },
  { name: "Kaido", image: "/placeholder.svg?height=60&width=60&text=Kaido" },
  { name: "Big Mom", image: "/placeholder.svg?height=60&width=60&text=BM" },
  { name: "Blackbeard", image: "/placeholder.svg?height=60&width=60&text=BB" },
]

export default function EditProfileModal({ open, onOpenChange, user }: EditProfileModalProps) {
  const { updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")

  // Profile tab state
  const [aboutMe, setAboutMe] = useState(user?.aboutMe || "")

  // Avatar tab state
  const [selectedAvatar, setSelectedAvatar] = useState("")
  const [customAvatar, setCustomAvatar] = useState<File | null>(null)

  // Password tab state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSaveProfile = () => {
    updateUser({ ...user, aboutMe })
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    })
    onOpenChange(false)
  }

  const handleSaveAvatar = () => {
    if (selectedAvatar) {
      updateUser({ ...user, avatar: selectedAvatar })
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been changed successfully.",
      })
    } else if (customAvatar) {
      // In a real app, you'd upload the file here
      updateUser({ ...user, avatar: "custom" })
      toast({
        title: "Avatar Updated",
        description: "Your custom avatar has been uploaded successfully.",
      })
    }
    onOpenChange(false)
  }

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you'd verify the current password and update it
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully.",
    })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    onOpenChange(false)
  }

  const handleCustomAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        })
        return
      }
      setCustomAvatar(file)
      setSelectedAvatar("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="avatar">Avatar</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="aboutMe">About Me</Label>
                <Textarea
                  id="aboutMe"
                  placeholder="Tell others about yourself, your trading preferences, specialties, etc."
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  maxLength={500}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    Share your trading style, favorite cards, or anything that helps other traders know you better.
                  </p>
                  <span className="text-sm text-gray-400">{aboutMe.length}/500</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>Save Profile</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Choose Character Avatar</Label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {characterAvatars.map((avatar) => (
                    <Card
                      key={avatar.name}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        selectedAvatar === avatar.name ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedAvatar(avatar.name)
                        setCustomAvatar(null)
                      }}
                    >
                      <CardContent className="p-2 text-center">
                        <img
                          src={avatar.image || "/placeholder.svg"}
                          alt={avatar.name}
                          className="w-12 h-12 rounded-full mx-auto mb-1"
                        />
                        <Badge variant="outline" className="text-xs">
                          {avatar.name}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="customAvatar">Or Upload Custom Avatar</Label>
                <div className="mt-2">
                  <Input
                    id="customAvatar"
                    type="file"
                    accept="image/*"
                    onChange={handleCustomAvatarChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
                  {customAvatar && (
                    <div className="mt-2 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">{customAvatar.name} selected</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveAvatar} disabled={!selectedAvatar && !customAvatar}>
                  Save Avatar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePassword}
                  disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
