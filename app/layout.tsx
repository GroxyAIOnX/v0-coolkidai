import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { ChatHistoryProvider } from "@/hooks/use-chat-history"
import { CharactersProvider } from "@/hooks/use-characters"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Coolkid.ai - Chat with AI Characters",
  description:
    "Create and chat with engaging AI characters. Build relationships, explore stories, and experience immersive conversations.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <CharactersProvider>
            <ChatHistoryProvider>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                {" "}
                {/* Changed defaultTheme to "dark" */}
                {children}
                <Toaster />
              </ThemeProvider>
            </ChatHistoryProvider>
          </CharactersProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
