'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/classname.util'
import { isLoggedIn } from '@/utils/client-cookie.util'
import { useLogout } from '@/services/auth/wrapper.service'
import Button from '../atoms/Button'

export default function Header() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const { mutate: logout, isPending: isLoggingOut } = useLogout()

  // Check login status on component mount and route changes
  useEffect(() => {
    setLoggedIn(isLoggedIn())
  }, [pathname])

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        setLoggedIn(false)
      }
    })
  }

  // Keep navigation items simple - always show main menus
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Admin Management', path: '/admin' },
  ]

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Queue Management System
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {navItems.map(item => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium',
                  isActive(item.path) ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Login/Logout Button */}
            {loggedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                leftIcon={
                  <span className="material-symbols-outlined text-sm">logout</span>
                }
              >
                Logout
              </Button>
            ) : (
              <Link
                href="/login"
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium',
                  isActive('/login') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
