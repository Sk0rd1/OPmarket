"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, User, Lock, Edit3, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)

  // Profile form state
  const [aboutMe, setAboutMe] = useState(user?.aboutMe || "")

  // Avatar form state
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "")
  const [customAvatar, setCustomAvatar] = useState<File | null>(null)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Character avatars
  const characterAvatars = [
    { name: "Luffy", url: "/placeholder.svg?height=80&width=80&text=Luffy" },
    { name: "Zoro", url: "/placeholder.svg?height=80&width=80&text=Zoro" },
    { name: "Nami", url: "/placeholder.svg?height=80&width=80&text=Nami" },
    { name: "Usopp", url: "/placeholder.svg?height=80&width=80&text=Usopp" },
    { name: "Sanji", url: "/placeholder.svg?height=80&width=80&text=Sanji" },
    { name: "Chopper", url: "/placeholder.svg?height=80&width=80&text=Chopper" },
    { name: "Robin", url: "/placeholder.svg?height=80&width=80&text=Robin" },
    { name: "Franky", url: "/placeholder.svg?height=80&width=80&text=Franky" },
    { name: "Brook", url: "/placeholder.svg?height=80&width=80&text=Brook" },
    { name: "Jinbe", url: "/placeholder.svg?height=80&width=80&text=Jinbe" },
    { name: "Ace", url: "/placeholder.svg?height=80&width=80&text=Ace" },
    { name: "Sabo", url: "/placeholder.svg?height=80&width=80&text=Sabo" },
    { name: "Law", url: "/placeholder.svg?height=80&width=80&text=Law" },
    { name: "Kid", url: "/placeholder.svg?height=80&width=80&text=Kid" },
    { name: "Shanks", url: "/placeholder.svg?height=80&width=80&text=Shanks" },
    { name: "Whitebeard", url: "/placeholder.svg?height=80&width=80&text=WB" },
    { name: "Kaido", url: "/placeholder.svg?height=80&width=80&text=Kaido" },
    { name: "Big Mom", url: "/placeholder.svg?height=80&width=80&text=BM" },
    { name: "Doflamingo", url: "/placeholder.svg?height=80&width=80&text=Doffy" },
    { name: "Crocodile", url: "/placeholder.svg?height=80&width=80&text=Croc" },
  ]

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Profile updated",
        description: "Your profile information has been successfully updated.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAvatar = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Avatar updated",
        description: "Your profile avatar has been successfully updated.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
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

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      })

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      setCustomAvatar(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const isPasswordValid = newPassword.length >= 8
  const doPasswordsMatch = newPassword === confirmPassword && newPassword.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information, avatar, or change your password.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="aboutMe">About Me</Label>
                <Textarea
                  id="aboutMe"
                  placeholder="Tell other traders about yourself, your collecting interests, and trading preferences..."
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">
                    Share your collecting interests, trading preferences, and what makes you a great trader!
                  </p>
                  <span className={`text-sm ${aboutMe.length > 450 ? "text-red-500" : "text-gray-400"}`}>
                    {aboutMe.length}/500
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="avatar" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={selectedAvatar || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-gray-600">Current avatar</p>
              </div>

              <div>
                <Label>Choose Character Avatar</Label>
                <div className="grid grid-cols-5 gap-3 mt-2">
                  {characterAvatars.map((character) => (
                    <Card
                      key={character.name}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAvatar === character.url ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedAvatar(character.url)
                        setCustomAvatar(null)
                      }}
                    >
                      <CardContent className="p-2">
                        <Avatar className="w-12 h-12 mx-auto mb-1">
                          <AvatarImage src={character.url || "/placeholder.svg"} alt={character.name} />
                          <AvatarFallback>{character.name[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-center font-medium">{character.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="custom-avatar">Or Upload Custom Image</Label>
                <div className="mt-2">
                  <Input
                    id="custom-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveAvatar} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Avatar"}
              </Button>
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
                    className={newPassword.length > 0 ? (isPasswordValid ? "border-green-500" : "border-red-500") : ""}
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
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {isPasswordValid ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${isPasswordValid ? "text-green-600" : "text-red-600"}`}>
                      {isPasswordValid ? "Password meets requirements" : "Password must be at least 8 characters"}
                    </span>
                  </div>
                )}
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
                    className={
                      confirmPassword.length > 0 ? (doPasswordsMatch ? "border-green-500" : "border-red-500") : ""
                    }
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
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {doPasswordsMatch ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm ${doPasswordsMatch ? "text-green-600" : "text-red-600"}`}>
                      {doPasswordsMatch ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSavePassword}
                disabled={isLoading || !currentPassword || !isPasswordValid || !doPasswordsMatch}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
