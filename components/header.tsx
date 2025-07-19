"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import LoginModal from "@/components/auth/login-modal"
import RegisterModal from "@/components/auth/register-modal"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">OP</span>
              </div>
              <span className="font-bold text-xl">TCG Marketplace</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="hover:text-yellow-400 transition-colors">
                Home
              </Link>
              <Link href="/sell" className="hover:text-yellow-400 transition-colors">
                Sell Cards
              </Link>
              <Link href="/profile" className="hover:text-yellow-400 transition-colors">
                Profiles
              </Link>
              <Link href="/chats" className="hover:text-yellow-400 transition-colors">
                Chats
              </Link>
              <Link href="/news" className="hover:text-yellow-400 transition-colors">
                News
              </Link>
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-yellow-400 hover:bg-blue-800">
                      <User className="w-4 h-4 mr-2" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/myprofile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    className="text-white hover:text-yellow-400 hover:bg-blue-800"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-blue-800">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link
                  href="/sell"
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sell Cards
                </Link>
                <Link
                  href="/profile"
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profiles
                </Link>
                <Link
                  href="/chats"
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Chats
                </Link>
                <Link
                  href="/news"
                  className="hover:text-yellow-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  News
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/myprofile"
                      className="hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="text-left hover:text-yellow-400 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowLoginModal(true)
                        setIsMenuOpen(false)
                      }}
                      className="text-left hover:text-yellow-400 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setShowRegisterModal(true)
                        setIsMenuOpen(false)
                      }}
                      className="text-left hover:text-yellow-400 transition-colors"
                    >
                      Register
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
      <RegisterModal open={showRegisterModal} onOpenChange={setShowRegisterModal} />
    </>
  )
}
