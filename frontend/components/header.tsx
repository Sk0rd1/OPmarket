"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, User, LogOut, Package, Heart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import AuthModal from "@/components/auth/auth-modal" // 🔄 Замінюємо на єдиний AuthModal

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false) // 🔄 Єдиний стан для модалки
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login') // 🔄 Таб для модалки
  const { user, isAuthenticated, logout } = useAuth() // 🔄 Використовуємо isAuthenticated

  const handleLogout = () => {
    logout()
  }

  // 🆕 Функція для відкриття AuthModal
  const handleAuthAction = (tab: 'login' | 'register') => {
    setAuthTab(tab)
    setShowAuthModal(true)
  }

  return (
    <>
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo - зберігаємо ваш дизайн */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-blue-900 font-bold text-sm">OP</span>
              </div>
              <span className="font-bold text-xl">TCG Marketplace</span>
            </Link>

            {/* Desktop Navigation - зберігаємо ваші посилання */}
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

            {/* User Menu - покращуємо аутентифікацію */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-yellow-400 hover:bg-blue-800">
                      <User className="w-4 h-4 mr-2" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {/* 🆕 Інформація про користувача */}
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {user.is_verified_seller ? 'Verified Seller' : 'Member'}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link href="/myprofile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    {/* 🆕 Додаткові пункти меню */}
                    <DropdownMenuItem asChild>
                      <Link href="/my-listings" className="flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
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
                    onClick={() => handleAuthAction('login')} // 🔄 Використовуємо AuthModal
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
                    onClick={() => handleAuthAction('register')} // 🔄 Використовуємо AuthModal
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

          {/* Mobile Navigation - зберігаємо ваш дизайн */}
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
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href="/myprofile"
                      className="hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/my-listings"
                      className="hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link
                      href="/wishlist"
                      className="hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wishlist
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
                        handleAuthAction('login') // 🔄 Використовуємо AuthModal
                        setIsMenuOpen(false)
                      }}
                      className="text-left hover:text-yellow-400 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        handleAuthAction('register') // 🔄 Використовуємо AuthModal
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

      {/* 🔄 Замінюємо два окремі модали на один AuthModal */}
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        defaultTab={authTab}
      />
    </>
  )
}
