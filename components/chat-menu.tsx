"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Trash2 } from "lucide-react"
import useAuth from "@/hooks/use-auth"
import useChatHistory from "@/hooks/use-chat-history"
import { useRouter } from "next/navigation"

interface ChatMenuProps {
  character: any
  onClose: () => void
}

export function ChatMenu({ character, onClose }: ChatMenuProps) {
  const { signOut } = useAuth()
  const { clearHistory } = useChatHistory()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    onClose()
    router.push("/auth")
  }

  const handleClearHistory = () => {
    clearHistory()
    onClose()
    router.refresh() // Refresh the current route
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-md shadow-lg border border-border z-10">
      <div className="py-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/20 rounded-none"
          onClick={handleClearHistory}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat History
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive/20 rounded-none"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default ChatMenu
