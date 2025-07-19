"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, DollarSign, User, Newspaper, Menu, X, MessageCircle, LogOut, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import LoginModal from "@/components/auth/login-modal"
import RegisterModal from "@/components/auth/register-modal"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/sell", label: "Sell Cards", icon: DollarSign, protected: true },
    { href: "/profile", label: "Profiles", icon: Search, protected: true },
    { href: "/chats", label: "Chats", icon: MessageCircle, protected: true },
    { href: "/news", label: "News", icon: Newspaper },
  ]

  const handleProtectedNavigation = (href: string, isProtected: boolean) => {
    if (isProtected && !user) {
      setShowLoginModal(true)
      return
    }
    // Navigation will be handled by Link component
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const handleMyProfile = () => {
    if (user) {
      window.location.href = `/myprofile`
    }
  }

  return (
    <>
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">OP</span>
              </div>
              <span className="text-xl font-bold">One Piece TCG Market</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href === "/profile" && pathname.startsWith("/profile"))
                return (
                  <div key={item.href}>
                    {item.protected && !user ? (
                      <Button
                        variant="ghost"
                        className={`flex items-center space-x-2 text-white hover:text-yellow-400 hover:bg-blue-800`}
                        onClick={() => handleProtectedNavigation(item.href, item.protected)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    ) : (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={`flex items-center space-x-2 text-white hover:text-yellow-400 hover:bg-blue-800 ${
                            isActive ? "bg-blue-800 text-yellow-400" : ""
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* User Menu / Auth Buttons */}
            <div className="hidden md:flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-blue-800">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <span>{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleMyProfile} className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-800"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outline"
                    className="text-blue-900 border-white hover:bg-white bg-transparent"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-blue-800 pt-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    pathname === item.href || (item.href === "/profile" && pathname.startsWith("/profile"))
                  return (
                    <div key={item.href}>
                      {item.protected && !user ? (
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-white hover:text-yellow-400 hover:bg-blue-800"
                          onClick={() => {
                            handleProtectedNavigation(item.href, item.protected)
                            setIsMenuOpen(false)
                          }}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Button>
                      ) : (
                        <Link href={item.href}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-white hover:text-yellow-400 hover:bg-blue-800 ${
                              isActive ? "bg-blue-800 text-yellow-400" : ""
                            }`}
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {item.label}
                          </Button>
                        </Link>
                      )}
                    </div>
                  )
                })}

                {/* Mobile Auth Section */}
                <div className="border-t border-blue-800 pt-2 mt-2">
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-sm text-gray-300">Signed in as {user.username}</div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-blue-800"
                        onClick={() => {
                          handleMyProfile()
                          setIsMenuOpen(false)
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-blue-800"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-blue-800"
                        onClick={() => {
                          setShowLoginModal(true)
                          setIsMenuOpen(false)
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-blue-800"
                        onClick={() => {
                          setShowRegisterModal(true)
                          setIsMenuOpen(false)
                        }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false)
          setShowRegisterModal(true)
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowLoginModal(true)
        }}
      />
    </>
  )
}
