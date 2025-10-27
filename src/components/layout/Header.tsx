"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  UserIcon,
  MailIcon,
  CalendarIcon,
  LogOutIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <motion.header
      className="relative bg-gradient-to-r from-purple-50 via-white to-blue-50 border-b border-gray-200 py-4 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-blue-600/5 opacity-50"></div>

      <div className="container mx-auto px-4 flex justify-between items-center relative z-10">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Event Scheduler
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Your intelligent scheduling assistant
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.div
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SparklesIcon className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">
              {user.displayName || user.email?.split("@")[0] || "User"}
            </span>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full p-0 w-12 h-12 ring-offset-background transition-all duration-200 hover:ring-2 hover:ring-purple-400 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                  <AvatarImage
                    src={user.photoURL || undefined}
                    alt={user.displayName || "User"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-lg">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 p-2 bg-white/95 backdrop-blur-xl border-gray-200 shadow-xl"
            >
              <DropdownMenuLabel className="text-base font-semibold text-gray-700 pb-2">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-purple-200 via-gray-200 to-blue-200" />

              <div className="p-3 my-2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Display Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.displayName || "No display name set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <MailIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Email Address
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <CalendarIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Member Since
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.metadata?.creationTime
                        ? new Date(
                            user.metadata.creationTime
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-gradient-to-r from-purple-200 via-gray-200 to-blue-200" />

              <DropdownMenuItem
                className="cursor-pointer mt-2 focus:bg-red-50 hover:bg-red-50 text-red-600 font-medium rounded-md transition-colors"
                onClick={logout}
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
