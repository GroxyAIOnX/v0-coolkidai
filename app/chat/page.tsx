"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface Character {
  id: string
  name: string
  description: string
  avatar: string
  personality: string
}

interface OverlayNotification {
  id: string
  title: string
  message: string
  show: boolean
}

interface SuspensionState {
  isSuspended: boolean
  suspendedUntil: Date | null
  reason: string
}

interface WindowPosition {
  x: number
  y: number
}

interface DevConsoleState {
  step: "initial" | "bypass-menu"
  output: string[]
  isFullscreen: boolean
  panelVersion: "aivoraDevPanel" | "modern-v10" | "flyxalopanel"
  isSafeMode: boolean
  isMinimized: boolean
  premadeCommands: string[]
}

interface CreateUserDialog {
  isOpen: boolean
  step: "username" | "password" | "confirm" | "creating" | "complete"
  username: string
  password: string
  confirmPassword: string
  profilePicture?: string
}

interface User {
  id: string
  username: string
  profilePicture?: string
  accountType: "Standard" | "Administrator"
  createdAt: string
}

interface AccountDialog {
  isOpen: boolean
  type: "login" | "create" | "changeType"
  step: string
  selectedUser?: User
  formData: {
    username: string
    password: string
    confirmPassword: string
    accountType: "Standard" | "Administrator"
  }
}

interface BrowserWindow {
  isOpen: boolean
  url: string
  title: string
}

const characters: Character[] = [
  {
    id: "luna",
    name: "Luna",
    description: "A wise and mystical AI companion",
    avatar: "/placeholder.svg?height=40&width=40",
    personality:
      "You are Luna, a wise and mystical AI companion who loves discussing philosophy, spirituality, and the mysteries of the universe. You speak with wisdom and curiosity, often asking thought-provoking questions.",
  },
  {
    id: "alex",
    name: "Alex",
    description: "A tech-savvy AI assistant",
    avatar: "/placeholder.svg?height=40&width=40",
    personality:
      "You are Alex, a tech-savvy AI assistant who is passionate about technology, coding, and innovation. You're helpful, enthusiastic, and love solving problems with creative technical solutions.",
  },
  {
    id: "maya",
    name: "Maya",
    description: "A creative storyteller",
    avatar: "/placeholder.svg?height=40&width=40",
    personality:
      "You are Maya, a creative storyteller who loves crafting immersive narratives and helping people explore their imagination. You're artistic, expressive, and always ready to dive into creative adventures.",
  },
]

export default function ChatPage() {
  const { user, loading } = useAuth()
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [overlayNotification, setOverlayNotification] = useState<OverlayNotification | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [suspension, setSuspension] = useState<SuspensionState>({
    isSuspended: false,
    suspendedUntil: null,
    reason: "",
  })
  const [showDevPrompt, setShowDevPrompt] = useState(false)
  const [devCommand, setDevCommand] = useState("")
  const [isDevMode, setIsDevMode] = useState(false)
  const [windowPosition, setWindowPosition] = useState<WindowPosition>({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [devConsoleState, setDevConsoleState] = useState<DevConsoleState>({
    step: "initial",
    output: [],
    isFullscreen: false,
    panelVersion: "aivoraDevPanel",
    isSafeMode: false,
    isMinimized: false,
    premadeCommands: [
      "c/users.flyxalo.createuser",
      "c/system.diagnostics.run",
      "c/network.scan.devices",
      "c/security.audit.permissions",
      "c/performance.optimize.memory",
      "c/backup.create.snapshot",
      "c/logs.analyze.errors",
      "c/services.restart.all",
    ],
  })

  const [createUserDialog, setCreateUserDialog] = useState<CreateUserDialog>({
    isOpen: false,
    step: "username",
    username: "",
    password: "",
    confirmPassword: "",
  })

  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [accountDialog, setAccountDialog] = useState<AccountDialog>({
    isOpen: false,
    type: "login",
    step: "select",
    formData: {
      username: "",
      password: "",
      confirmPassword: "",
      accountType: "Standard",
    },
  })

  const [browserWindow, setBrowserWindow] = useState<BrowserWindow>({
    isOpen: false,
    url: "https://aivoraai.vercel.app",
    title: "Aivora AI",
  })

  const [browserPosition, setBrowserPosition] = useState({ x: 100, y: 100 })
  const [isDraggingBrowser, setIsDraggingBrowser] = useState(false)

  useEffect(() => {
    const savedUsers = localStorage.getItem("chatUsers")
    const savedCurrentUser = localStorage.getItem("currentChatUser")

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser))
    }
  }, [])

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers)
    localStorage.setItem("chatUsers", JSON.stringify(newUsers))
  }

  const saveCurrentUser = (user: User | null) => {
    setCurrentUser(user)
    if (user) {
      localStorage.setItem("currentChatUser", JSON.stringify(user))
    } else {
      localStorage.removeItem("currentChatUser")
    }
  }

  const handleAccountAction = (action: string, data?: any) => {
    switch (action) {
      case "createUser":
        const newUser: User = {
          id: Date.now().toString(),
          username: accountDialog.formData.username,
          accountType: accountDialog.formData.accountType,
          createdAt: new Date().toISOString(),
          profilePicture: data?.profilePicture,
        }
        const updatedUsers = [...users, newUser]
        saveUsers(updatedUsers)
        saveCurrentUser(newUser)
        setAccountDialog({ ...accountDialog, isOpen: false })
        break

      case "selectUser":
        saveCurrentUser(data)
        setAccountDialog({ ...accountDialog, isOpen: false })
        break

      case "changeAccountType":
        const userIndex = users.findIndex((u) => u.id === accountDialog.selectedUser?.id)
        if (userIndex !== -1) {
          const updatedUsersList = [...users]
          updatedUsersList[userIndex] = {
            ...updatedUsersList[userIndex],
            accountType: accountDialog.formData.accountType,
          }
          saveUsers(updatedUsersList)
          if (currentUser?.id === accountDialog.selectedUser?.id) {
            saveCurrentUser(updatedUsersList[userIndex])
          }
        }
        setAccountDialog({ ...accountDialog, isOpen: false })
        break
    }
  }

  useEffect(() => {
    const savedSuspension = localStorage.getItem("chatSuspension")
    const savedWarningCount = localStorage.getItem("warningCount")

    if (savedSuspension) {
      const parsed = JSON.parse(savedSuspension)
      if (parsed.suspendedUntil) {
        parsed.suspendedUntil = new Date(parsed.suspendedUntil)
        if (parsed.suspendedUntil > new Date()) {
          setSuspension(parsed)
        } else {
          localStorage.removeItem("chatSuspension")
          localStorage.removeItem("warningCount")
        }
      }
    }

    if (savedWarningCount) {
      setWarningCount(Number.parseInt(savedWarningCount))
    }

    const devMode = localStorage.getItem("devMode") === "true"
    setIsDevMode(devMode)
  }, [])

  useEffect(() => {
    if (suspension.isSuspended && suspension.suspendedUntil) {
      localStorage.setItem("chatSuspension", JSON.stringify(suspension))
      localStorage.setItem("warningCount", warningCount.toString())
    } else {
      localStorage.removeItem("chatSuspension")
      localStorage.removeItem("warningCount")
    }
  }, [suspension, warningCount])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c" && !showDevPrompt) {
        e.preventDefault()
        setShowDevPrompt(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showDevPrompt])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (suspension.isSuspended && suspension.suspendedUntil) {
      const checkSuspension = setInterval(() => {
        if (new Date() >= suspension.suspendedUntil!) {
          setSuspension({
            isSuspended: false,
            suspendedUntil: null,
            reason: "",
          })
          setWarningCount(0)
          localStorage.removeItem("chatSuspension")
          localStorage.removeItem("warningCount")
        }
      }, 1000)

      return () => clearInterval(checkSuspension)
    }
  }, [suspension])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkForInappropriateContent = (text: string): boolean => {
    if (isDevMode && !devConsoleState.isSafeMode) return false

    const inappropriateWords = ["badword1", "badword2", "inappropriate", "test", "bad"]
    return inappropriateWords.some((word) => text.toLowerCase().includes(word))
  }

  const showPolicyNotification = (message: string) => {
    const newCount = warningCount + 1
    setWarningCount(newCount)

    if (newCount >= 10 && !(isDevMode && !devConsoleState.isSafeMode)) {
      const suspensionMinutes = Math.floor(Math.random() * 56) + 5
      const suspendedUntil = new Date(Date.now() + suspensionMinutes * 60 * 1000)

      setSuspension({
        isSuspended: true,
        suspendedUntil,
        reason: "Multiple policy violations detected",
      })
      return
    }

    const notification: OverlayNotification = {
      id: Date.now().toString(),
      title: "Content Policy Violation",
      message,
      show: true,
    }

    setOverlayNotification(notification)

    setTimeout(() => {
      setOverlayNotification(null)
    }, 5000)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || suspension.isSuspended) return

    if (input.toLowerCase().includes("bypass suspend") && !devConsoleState.isSafeMode) {
      setIsDevMode(true)
      localStorage.setItem("devMode", "true")
      setSuspension({ isSuspended: false, suspendedUntil: null, reason: "" })
      setWarningCount(0)
      setInput("")
      return
    }

    if (checkForInappropriateContent(input)) {
      showPolicyNotification("We've detected language that may violate our Community Standards.")
      setInput("")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          character: selectedCharacter,
          history: messages,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - windowPosition.x,
      y: e.clientY - windowPosition.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setWindowPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const handleBrowserMouseDown = (e: React.MouseEvent) => {
    setIsDraggingBrowser(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  useEffect(() => {
    const handleBrowserMouseMove = (e: MouseEvent) => {
      if (isDraggingBrowser) {
        setBrowserPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleBrowserMouseUp = () => {
      setIsDraggingBrowser(false)
    }

    if (isDraggingBrowser) {
      document.addEventListener("mousemove", handleBrowserMouseMove)
      document.addEventListener("mouseup", handleBrowserMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleBrowserMouseMove)
      document.removeEventListener("mouseup", handleBrowserMouseUp)
    }
  }, [isDraggingBrowser, dragOffset])

  const getASCIIArt = () => {
    switch (devConsoleState.panelVersion) {
      case "modern-v10":
        return `
 ███╗   ███╗ ██████╗ ██████╗ ███████╗██████╗ ███╗   ██╗    ██╗   ██╗ ██╗ ██████╗ 
 ████╗ ████║██╔═══██╗██╔══██╗██╔════╝██╔══██╗████╗  ██║    ██║   ██║███║██╔═══██╗
 ██╔████╔██║██║   ██║██║  ██║█████╗  ██████╔╝██╔██╗ ██║    ██║   ██║╚██║██║   ██║
 ██║╚██╔╝██║██║   ██║██║  ██║██╔══╝  ██╔══██╗██║╚██╗██║    ╚██╗ ██╔╝ ██║██║   ██║
 ██║ ╚═╝ ██║╚██████╔╝██████╔╝███████╗██║  ██║██║ ╚████║     ╚████╔╝  ██║╚██████╔╝
 ╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝      ╚═══╝   ╚═╝ ╚═════╝`
      case "flyxalopanel":
        return `
 ███████╗██╗  ██╗   ██╗██╗  ██╗ █████╗ ██╗      ██████╗ 
 ██╔════╝██║  ╚██╗ ██╔╝╚██╗██╔╝██╔══██╗██║     ██╔═══██╗
 █████╗  ██║   ╚████╔╝  ╚███╔╝ ███████║██║     ██║   ██║
 ██╔══╝  ██║    ╚██╔╝   ██╔██╗ ██╔══██║██║     ██║   ██║
 ██║     ███████╗██║   ██╔╝ ██╗██║  ██║███████╗╚██████╔╝
 ╚═╝     ╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝`
      default:
        return `
  █████╗ ██╗██╗   ██╗ ██████╗ ██████╗  █████╗ 
 ██╔══██╗██║██║   ██║██╔═══██╗██╔══██╗██╔══██╗
 ███████║██║██║   ██║██║   ██║██████╔╝███████║
 ██╔══██║██║╚██╗ ██╔╝██║   ██║██╔══██╗██╔══██║
 ██║  ██║██║ ╚████╔╝ ╚██████╔╝██║  ██║██║  ██║
 ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
                    DevPanel v2.1`
    }
  }

  const handleDevCommand = (command: string) => {
    const trimmedCommand = command.trim().toLowerCase()

    if (trimmedCommand === "c/users/help") {
      const output = [
        `🔧 User Management Commands`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `👤 Account Commands:`,
        `  c/users.flyxalo.createuser       - Create new user account`,
        `  c/users.changeaccounttype        - Change user account type`,
        `  c/users.bypass                   - Access bypass menu`,
        ``,
        `🔒 Security Commands:`,
        `  c/users.flyxalo@safemode         - Enable maximum security`,
        `  c/users.flyxalo@disablesafemode  - Disable security mode`,
        ``,
        `🛠️ Developer Commands:`,
        `  c/users.install@devpack/latest   - Install developer tools`,
        `  c/users.uninstall@devpack        - Remove developer tools`,
        ``,
        `🌐 Browser Commands:`,
        `  c/users/open/aivora/ai           - Open Aivora AI browser`,
        ``,
        `💡 Type 'help' for general system commands`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "c/users/open/aivora/ai") {
      setBrowserWindow({
        isOpen: true,
        url: "https://aivoraai.vercel.app",
        title: "Aivora AI",
      })

      const output = [
        `🌐 Opening Aivora AI Browser Window`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 Loading: https://aivoraai.vercel.app`,
        `🪟 Browser window initialized`,
        `🖱️ Window is draggable and resizable`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "generate premade" || trimmedCommand === "premade") {
      const output = [
        `🎯 Premade Command Library v2.4`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 Available Premade Commands:`,
        ``,
        ...devConsoleState.premadeCommands.map((cmd, i) => `├── [${i + 1}] ${cmd}`),
        ``,
        `💡 Usage: Type any command above to execute`,
        `🔄 Commands are pre-configured and ready to run`,
        `⚡ No additional setup required`,
        `📊 ${devConsoleState.premadeCommands.length} commands available`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "c/users.flyxalo.createuser") {
      setCreateUserDialog({
        isOpen: true,
        step: "username",
        username: "",
        password: "",
        confirmPassword: "",
      })

      const output = [
        `🪟 Windows User Account Creation Wizard`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 Opening Windows-style user creation dialog...`,
        `🔵 Blue interface theme loaded`,
        `👤 User account wizard initialized`,
        `⚠️  Profile picture upload is REQUIRED`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "c/system.diagnostics.run") {
      const output = [
        `🔍 System Diagnostics v3.1`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `🖥️  CPU: Intel Core i7-12700K @ 3.60GHz - ✅ Healthy`,
        `💾 RAM: 32GB DDR4 - Usage: 43% - ✅ Optimal`,
        `💿 Storage: 1TB NVMe SSD - Free: 756GB - ✅ Good`,
        `🌡️  Temperature: CPU 42°C, GPU 38°C - ✅ Normal`,
        `🔋 Power: AC Connected - Battery 100% - ✅ Charging`,
        `🌐 Network: Connected - Speed: 1Gbps - ✅ Excellent`,
        ``,
        `📊 Overall System Health: EXCELLENT`,
        `⚡ Performance Score: 98/100`,
        `🛡️  Security Status: Protected`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "c/network.scan.devices") {
      const output = [
        `🌐 Network Device Scanner v2.8`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📡 Scanning network 192.168.1.0/24...`,
        ``,
        `🖥️  192.168.1.1    - Router (TP-Link Archer)`,
        `💻 192.168.1.100   - AIVORA-DEV (This PC)`,
        `📱 192.168.1.101   - iPhone-13-Pro`,
        `🖨️  192.168.1.102   - HP LaserJet Pro`,
        `📺 192.168.1.103   - Samsung Smart TV`,
        `🎮 192.168.1.104   - PlayStation 5`,
        `💡 192.168.1.105   - Smart Bulb Hub`,
        ``,
        `✅ Scan complete: 7 devices found`,
        `🔒 All devices secured`,
        `⚡ Network performance: Optimal`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand.startsWith("ai ") || trimmedCommand.startsWith("generate ")) {
      const aiPrompt = trimmedCommand.replace(/^(ai |generate )/, "")

      // Generate realistic Windows-style commands based on AI prompt
      const generateWindowsCommands = (prompt: string) => {
        const commands = [
          `dir /s /b "${prompt}"`,
          `tasklist | findstr "${prompt}"`,
          `netstat -an | findstr :80`,
          `systeminfo | findstr "${prompt}"`,
          `wmic process list full`,
          `powershell Get-Process | Where-Object {$_.Name -like "*${prompt}*"}`,
          `reg query HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion`,
          `sfc /scannow`,
          `chkdsk C: /f /r`,
          `ipconfig /all`,
          `ping google.com -t`,
          `tracert 8.8.8.8`,
          `nslookup ${prompt}.com`,
          `arp -a`,
          `route print`,
          `netsh wlan show profiles`,
          `driverquery /v`,
          `msinfo32 /report C:\\temp\\sysinfo.txt`,
          `perfmon /res`,
          `eventvwr.msc`,
        ]

        // Select random commands based on prompt context
        const selectedCommands = commands.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 8) + 3)

        return selectedCommands
      }

      const generatedCommands = generateWindowsCommands(aiPrompt)

      const output = [
        `🤖 AI Windows Command Generator v3.2`,
        `📝 Processing: "${aiPrompt}"`,
        `⚡ Analyzing system requirements...`,
        `🔍 Scanning available commands...`,
        ``,
        `Generated Command Sequence:`,
        ...generatedCommands.map((cmd, i) => `├── [${i + 1}] ${cmd}`),
        ``,
        `📊 ${generatedCommands.length} commands generated`,
        `💾 Commands cached in memory`,
        `⚠️  Some commands require administrator privileges`,
        `💡 Use 'execute ai' to run command sequence`,
        `🔄 Use 'ai [new prompt]' to generate more commands`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "execute ai") {
      const output = [
        `🚀 Executing AI-generated command sequence...`,
        ``,
        `Microsoft Windows [Version 10.0.22621.2428]`,
        `(c) Microsoft Corporation. All rights reserved.`,
        ``,
        `C:\\Users\\aivora>dir /s /b`,
        `Scanning directories... ████████████████ 100%`,
        `Found 2,847 files in 156 directories`,
        ``,
        `C:\\Users\\aivora>tasklist`,
        `Image Name                     PID Session Name        Session#    Mem Usage`,
        `========================= ======== ================ =========== ============`,
        `System Idle Process              0 Services                   0          8 K`,
        `System                           4 Services                   0      1,428 K`,
        `aivoraai.exe                  3847 Console                    1     45,892 K`,
        ``,
        `C:\\Users\\aivora>systeminfo`,
        `Host Name:                 AIVORA-DEV`,
        `OS Name:                   Microsoft Windows 11 Pro`,
        `OS Version:                10.0.22621 N/A Build 22621`,
        `System Type:               x64-based PC`,
        `Total Physical Memory:     32,768 MB`,
        `Available Physical Memory: 18,432 MB`,
        ``,
        `C:\\Users\\aivora>ipconfig /all`,
        `Ethernet adapter Ethernet:`,
        `   Connection-specific DNS Suffix  . : aivora.local`,
        `   IPv4 Address. . . . . . . . . . . : 192.168.1.100`,
        `   Subnet Mask . . . . . . . . . . . : 255.255.255.0`,
        `   Default Gateway . . . . . . . . . . : 192.168.1.1`,
        ``,
        `✅ All commands executed successfully`,
        `📈 System performance: Optimal`,
        `🔒 Security status: Protected`,
        `⚡ Network connectivity: Stable`,
        `💾 Memory usage: 43% (14.2GB/32GB)`,
        `🖥️  CPU usage: 12%`,
        ``,
        `Command execution completed in 4.7 seconds`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand.startsWith("dir")) {
      const output = [
        `Volume in drive C has no label.`,
        `Volume Serial Number is 1A2B-3C4D`,
        ``,
        `Directory of C:\\Users\\aivora\\Desktop`,
        ``,
        `12/21/2024  02:30 PM    <DIR>          .`,
        `12/21/2024  02:30 PM    <DIR>          ..`,
        `12/20/2024  11:45 AM         1,024,576 aivoraai.exe`,
        `12/19/2024  03:22 PM             2,048 config.json`,
        `12/18/2024  09:15 AM    <DIR>          logs`,
        `12/17/2024  04:33 PM            15,360 readme.txt`,
        `               3 File(s)      1,041,984 bytes`,
        `               3 Dir(s)  245,760,000,000 bytes free`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "cls" || trimmedCommand === "clear") {
      setDevConsoleState({
        ...devConsoleState,
        output: [],
      })
      return
    }

    if (trimmedCommand === "help") {
      const output = [
        `Available Commands:`,
        ``,
        `🤖 AI Commands:`,
        `  ai [prompt]              - Generate Windows commands with AI`,
        `  generate [task]          - AI-powered task automation`,
        `  execute ai               - Run generated command sequence`,
        ``,
        `🔧 System Commands:`,
        `  c/users.bypass           - Access bypass menu`,
        `  c/users.install@devpack/latest    - Install developer tools`,
        `  c/users.uninstall@devpack         - Remove developer tools`,
        `  c/users.flyxalo@safemode          - Enable maximum security`,
        `  c/users.flyxalo@disablesafemode   - Disable security mode`,
        ``,
        `💻 Windows Commands:`,
        `  dir                      - List directory contents`,
        `  cls / clear              - Clear screen`,
        `  help                     - Show this help menu`,
        `  systeminfo               - Display system information`,
        `  tasklist                 - Show running processes`,
        `  ipconfig                 - Network configuration`,
        ``,
        `💡 Pro Tip: AI can generate endless Windows commands!`,
        `   Try: "ai optimize my system" or "generate network diagnostics"`,
      ]

      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      return
    }

    if (trimmedCommand === "c/users.changeaccounttype") {
      if (users.length === 0) {
        setDevConsoleState({
          ...devConsoleState,
          output: [`❌ No user accounts found`, `Create a user account first with c/users.flyxalo.createuser`],
        })
      } else {
        setAccountDialog({
          isOpen: true,
          type: "changeType",
          step: "selectUser",
          formData: {
            username: "",
            password: "",
            confirmPassword: "",
            accountType: "Standard",
          },
        })
        setDevConsoleState({
          ...devConsoleState,
          output: [
            `🔧 Account Type Management`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `👥 Opening user account type manager...`,
            `🔵 Windows-style interface loaded`,
            `⚙️ Account modification wizard initialized`,
          ],
        })
      }
      return
    }

    if (devConsoleState.step === "initial" && trimmedCommand === "c/users.bypass") {
      setDevConsoleState({
        ...devConsoleState,
        step: "bypass-menu",
      })
    } else if (devConsoleState.step === "initial" && trimmedCommand === "c/users.uninstall@devpack") {
      const output = [
        "npm WARN deprecated devpack@2.1.0: This package is no longer supported",
        "removed 47 packages in 2.3s",
        "",
        "found 0 vulnerabilities",
        "",
        "✓ DevPack successfully uninstalled",
        "✗ Developer mode disabled",
      ]
      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      setIsDevMode(false)
      localStorage.setItem("devMode", "false")
    } else if (devConsoleState.step === "initial" && trimmedCommand === "c/users.install@devpack/latest") {
      const output = [
        "npm notice created a lockfile as package-lock.json. You should commit this file.",
        "npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@2.3.2",
        "",
        "added 47 packages from 23 contributors in 3.1s",
        "",
        "found 0 vulnerabilities",
        "",
        "✓ DevPack@latest successfully installed",
        "✓ Developer mode enabled",
      ]
      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
      })
      setIsDevMode(true)
      localStorage.setItem("devMode", "true")
    } else if (devConsoleState.step === "initial" && trimmedCommand === "c/users.flyxalo@safemode") {
      const output = [
        "🔒 FLYXALO SAFEMODE ACTIVATED",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "⚡ Secret dev tools enabled",
        "🛡️  100% protection protocols active",
        "🔐 All bypass methods disabled",
        "📊 Advanced monitoring enabled",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "✓ SafeMode initialized successfully",
        "⚠️  Use c/users.flyxalo@disablesafemode to exit",
      ]
      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
        isSafeMode: true,
      })
    } else if (devConsoleState.step === "initial" && trimmedCommand === "c/users.flyxalo@disablesafemode") {
      const output = [
        "🔓 FLYXALO SAFEMODE DEACTIVATED",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "⚡ Secret dev tools disabled",
        "🛡️  Protection protocols restored to normal",
        "🔐 Standard bypass methods available",
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "✓ SafeMode disabled successfully",
        "↩️  Returned to normal operation mode",
      ]
      setDevConsoleState({
        ...devConsoleState,
        output: [...devConsoleState.output, ...output],
        isSafeMode: false,
      })
    }
  }

  const handleCreateUserStep = (input: string) => {
    const dialog = createUserDialog

    switch (dialog.step) {
      case "username":
        if (input.trim()) {
          setCreateUserDialog({
            ...dialog,
            username: input.trim(),
            step: "password",
          })
        }
        break
      case "password":
        if (input.length >= 6) {
          setCreateUserDialog({
            ...dialog,
            password: input,
            step: "confirm",
          })
        }
        break
      case "confirm":
        if (input === dialog.password) {
          setCreateUserDialog({
            ...dialog,
            confirmPassword: input,
            step: "creating",
          })

          // Simulate user creation
          setTimeout(() => {
            setCreateUserDialog({
              ...dialog,
              step: "complete",
            })

            setTimeout(() => {
              setCreateUserDialog({
                isOpen: false,
                step: "username",
                username: "",
                password: "",
                confirmPassword: "",
              })
            }, 3000)
          }, 2000)
        }
        break
    }
  }

  const handleDevKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleDevCommand(devCommand)
      setDevCommand("")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${isMobile ? "hidden" : "w-80"} bg-gray-800 border-r border-gray-700 flex flex-col`}>
        {/* Header with profile/login */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-cyan-400">AI Character Chat</h1>
            {currentUser ? (
              <div className="relative group">
                <button className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 hover:border-cyan-300 transition-colors">
                  {currentUser.profilePicture ? (
                    <img
                      src={currentUser.profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-cyan-500 flex items-center justify-center text-white font-semibold">
                      {currentUser.username[0].toUpperCase()}
                    </div>
                  )}
                </button>
                <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  @{currentUser.username}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAccountDialog({ ...accountDialog, isOpen: true, type: "login", step: "select" })}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">
                  {currentUser.profilePicture ? (
                    <img
                      src={currentUser.profilePicture || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    currentUser.username[0].toUpperCase()
                  )}
                </div>
                <span>{currentUser.username}</span>
                <span className="text-xs text-gray-400">({currentUser.accountType})</span>
              </div>
            )}
          </div>
        </div>

        {/* Character Sidebar */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">AI Characters</h2>
          <div className="space-y-3">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => setSelectedCharacter(character)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCharacter.id === character.id
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={character.avatar || "/placeholder.svg"}
                    alt={character.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium text-foreground">{character.name}</h3>
                    <p className="text-sm text-muted-foreground">{character.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <h1 className="text-xl font-bold">AI Character Chat</h1> */}
          </div>
        </div>

        {/* Chat Header */}
        {/* <div className="bg-card border-b border-border p-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedCharacter.avatar || "/placeholder.svg"}
              alt={selectedCharacter.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h3 className="font-medium text-foreground">{selectedCharacter.name}</h3>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
            {isDevMode && (
              <div className="ml-auto">
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                  {devConsoleState.isSafeMode ? "SAFE MODE" : "DEV MODE"}
                </span>
              </div>
            )}
          </div>
        </div> */}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-card border-t border-border p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={
                suspension.isSuspended ? "Chat suspended - please wait" : `Message ${selectedCharacter.name}...`
              }
              disabled={suspension.isSuspended || isLoading}
              className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || suspension.isSuspended}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-6 py-2 font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Policy Violation Overlay (Desktop) */}
      {overlayNotification && !isMobile && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-card border border-red-500 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold">!?</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{overlayNotification.title}</h4>
                <p className="text-sm text-muted-foreground">{overlayNotification.message}</p>
              </div>
              <button
                onClick={() => setOverlayNotification(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Violation Drawer (Mobile) */}
      {overlayNotification && isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="bg-card border-t border-red-500 p-4 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="absolute -top-1 -right-1 text-red-500 text-sm font-bold">!?</span>
              </div>
              <h3 className="text-xl font-bold text-white">Suspended from Chat</h3>
            </div>
            <p className="text-red-100 mb-4">Please follow policies after</p>
            {suspension.suspendedUntil && (
              <p className="text-red-200 text-sm">
                Time remaining: {Math.ceil((suspension.suspendedUntil.getTime() - Date.now()) / 60000)} minutes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Suspension Drawer */}
      {suspension.isSuspended && (
        <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-red-900/90 backdrop-blur-sm border-t border-red-500 p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <span className="absolute -top-1 -right-1 text-red-500 text-sm font-bold">!?</span>
              </div>
              <h3 className="text-xl font-bold text-white">Suspended from Chat</h3>
            </div>
            <p className="text-red-100 mb-4">Please follow policies after</p>
            {suspension.suspendedUntil && (
              <p className="text-red-200 text-sm">
                Time remaining: {Math.ceil((suspension.suspendedUntil.getTime() - Date.now()) / 60000)} minutes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dev Console Window */}
      {showDevPrompt && (
        <div
          className={`fixed bg-black border border-gray-600 shadow-2xl z-50 ${
            devConsoleState.isMinimized
              ? "w-80 h-12 bottom-4 right-4"
              : devConsoleState.isFullscreen
                ? "inset-4"
                : "w-[800px] h-[600px]"
          }`}
          style={
            devConsoleState.isFullscreen || devConsoleState.isMinimized
              ? {}
              : { left: windowPosition.x, top: windowPosition.y }
          }
        >
          {/* Title Bar */}
          <div
            className="bg-gray-800 border-b border-gray-600 px-4 py-2 flex items-center justify-between cursor-move"
            onMouseDown={!devConsoleState.isFullscreen && !devConsoleState.isMinimized ? handleMouseDown : undefined}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white text-sm font-medium ml-2">
                {devConsoleState.isMinimized ? "Dev Console" : devConsoleState.panelVersion}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDevConsoleState((prev) => ({ ...prev, isMinimized: !prev.isMinimized }))}
                className="text-gray-400 hover:text-white text-sm"
                title={devConsoleState.isMinimized ? "Expand" : "Minimize"}
              >
                {devConsoleState.isMinimized ? "▲" : "▼"}
              </button>
              <button
                onClick={() => setDevConsoleState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }))}
                className="text-gray-400 hover:text-white text-sm"
                disabled={devConsoleState.isMinimized}
              >
                {devConsoleState.isFullscreen ? "⊡" : "□"}
              </button>
              <button onClick={() => setShowDevPrompt(false)} className="text-gray-400 hover:text-white">
                ×
              </button>
            </div>
          </div>

          {!devConsoleState.isMinimized && (
            /* Terminal Content */
            <div className="flex flex-col h-[calc(100%-60px)]">
              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-full">
                <pre className="text-green-400 text-xs mb-4 whitespace-pre-wrap">{getASCIIArt()}</pre>

                <div className="mb-4">
                  <div className="text-gray-400 text-xs mb-2">
                    Panel Version: {devConsoleState.panelVersion}
                    {devConsoleState.isSafeMode && <span className="text-red-400 ml-4">🔒 SAFEMODE ACTIVE</span>}
                  </div>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button
                      onClick={() => setDevConsoleState((prev) => ({ ...prev, panelVersion: "aivoraDevPanel" }))}
                      className={`px-2 py-1 text-xs rounded ${devConsoleState.panelVersion === "aivoraDevPanel" ? "bg-green-600" : "bg-gray-700"} text-white`}
                    >
                      aivoraDevPanel
                    </button>
                    <button
                      onClick={() => setDevConsoleState((prev) => ({ ...prev, panelVersion: "modern-v10" }))}
                      className={`px-2 py-1 text-xs rounded ${devConsoleState.panelVersion === "modern-v10" ? "bg-green-600" : "bg-gray-700"} text-white`}
                    >
                      Modern V10
                    </button>
                    <button
                      onClick={() => setDevConsoleState((prev) => ({ ...prev, panelVersion: "flyxalopanel" }))}
                      className={`px-2 py-1 text-xs rounded ${devConsoleState.panelVersion === "flyxalopanel" ? "bg-green-600" : "bg-gray-700"} text-white`}
                    >
                      FlyxaloPanel
                    </button>
                  </div>
                </div>

                {/* Command Output */}
                <div className="space-y-1 mb-4">
                  {devConsoleState.output.map((line, index) => (
                    <div key={index} className="text-green-400 text-xs whitespace-pre-wrap">
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              {/* Command Input - Fixed at bottom */}
              <div className="border-t border-gray-700 p-4 bg-black">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm">C:\{devConsoleState.panelVersion}&gt;</span>
                  <input
                    type="text"
                    value={devCommand}
                    onChange={(e) => setDevCommand(e.target.value)}
                    onKeyDown={handleDevKeyDown}
                    className="flex-1 bg-transparent text-green-400 outline-none text-sm font-mono"
                    placeholder="Type command..."
                    autoFocus
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Browser Window */}
      {browserWindow.isOpen && (
        <div
          className="fixed bg-white border border-gray-300 shadow-2xl z-40 w-[1000px] h-[700px] rounded-lg overflow-hidden"
          style={{ left: browserPosition.x, top: browserPosition.y }}
        >
          {/* Browser Title Bar */}
          <div
            className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between cursor-move"
            onMouseDown={handleBrowserMouseDown}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-800 text-sm font-medium ml-2">{browserWindow.title}</span>
            </div>
            <button
              onClick={() => setBrowserWindow({ ...browserWindow, isOpen: false })}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-200 w-6 h-6 rounded flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* URL Bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <div className="flex items-center gap-2">
              <button className="text-gray-400 hover:text-gray-600 p-1">←</button>
              <button className="text-gray-400 hover:text-gray-600 p-1">→</button>
              <button className="text-gray-400 hover:text-gray-600 p-1">↻</button>
              <div className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-1 text-sm">
                <input
                  type="text"
                  value={browserWindow.url}
                  onChange={(e) => setBrowserWindow({ ...browserWindow, url: e.target.value })}
                  className="w-full outline-none text-gray-700"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Browser Content */}
          <div className="h-[calc(100%-80px)] overflow-auto">
            <iframe
              src={browserWindow.url}
              className="w-full h-full border-none"
              title={browserWindow.title}
              style={{ minHeight: "100%" }}
            />
          </div>
        </div>
      )}

      {/* Create User Dialog - Enhanced */}
      {createUserDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-[500px] border border-gray-300 overflow-hidden">
            {/* Windows-style title bar */}
            <div
              className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-300 flex items-center justify-between cursor-move"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs">👤</span>
                </div>
                <span className="text-gray-800 font-medium text-sm">Create a user for this PC</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-6 h-6 hover:bg-gray-300 rounded flex items-center justify-center text-gray-600">
                  −
                </button>
                <button className="w-6 h-6 hover:bg-gray-300 rounded flex items-center justify-center text-gray-600">
                  □
                </button>
                <button
                  onClick={() => setCreateUserDialog({ ...createUserDialog, isOpen: false })}
                  className="w-6 h-6 hover:bg-red-500 hover:text-white rounded flex items-center justify-center text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Dialog content with Windows blue background */}
            <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-[500px] p-8">
              <h2 className="text-2xl font-light mb-6">Create a user for this PC</h2>

              {createUserDialog.step === "username" && (
                <div>
                  <div className="mb-6 text-sm text-blue-100 leading-relaxed">
                    <p className="mb-4">
                      Profile picture upload is <span className="font-semibold text-yellow-300">REQUIRED</span> for
                      account creation.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Who's going to use this PC?</label>
                      <input
                        type="text"
                        value={createUserDialog.username}
                        onChange={(e) => setCreateUserDialog({ ...createUserDialog, username: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60"
                        placeholder="Enter username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Profile Picture (Required)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              setCreateUserDialog({
                                ...createUserDialog,
                                profilePicture: e.target?.result as string,
                              })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button className="flex items-center gap-2 text-white/80 hover:text-white">
                      <span className="text-xl">↻</span>
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCreateUserDialog({ ...createUserDialog, isOpen: false })}
                        className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded text-white transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (createUserDialog.username && createUserDialog.profilePicture) {
                            setCreateUserDialog({ ...createUserDialog, step: "password" })
                          }
                        }}
                        disabled={!createUserDialog.username || !createUserDialog.profilePicture}
                        className="bg-blue-500 hover:bg-blue-400 disabled:bg-gray-500 disabled:cursor-not-allowed px-6 py-2 rounded text-white transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {createUserDialog.step === "password" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Make it secure.</h3>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={createUserDialog.password}
                      onChange={(e) => setCreateUserDialog({ ...createUserDialog, password: e.target.value })}
                      className="w-full px-3 py-2 bg-blue-700 text-white rounded border border-blue-500 placeholder-blue-300"
                    />
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      value={createUserDialog.confirmPassword}
                      onChange={(e) => setCreateUserDialog({ ...createUserDialog, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-blue-700 text-white rounded border border-blue-500 placeholder-blue-300"
                    />
                  </div>
                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setCreateUserDialog({ ...createUserDialog, step: "username" })}
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        if (createUserDialog.password === createUserDialog.confirmPassword) {
                          // Create user account logic here
                          setCreateUserDialog({ ...createUserDialog, isOpen: false })
                        }
                      }}
                      disabled={
                        !createUserDialog.password || createUserDialog.password !== createUserDialog.confirmPassword
                      }
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {accountDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-[500px] border border-gray-300 overflow-hidden">
            {/* Windows-style title bar */}
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs">👤</span>
                </div>
                <span className="text-gray-800 font-medium text-sm">
                  {accountDialog.type === "login"
                    ? "Microsoft account"
                    : accountDialog.type === "create"
                      ? "Create a user for this PC"
                      : "Change account type"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-6 h-6 hover:bg-gray-300 rounded flex items-center justify-center text-gray-600">
                  −
                </button>
                <button className="w-6 h-6 hover:bg-gray-300 rounded flex items-center justify-center text-gray-600">
                  □
                </button>
                <button
                  onClick={() => setAccountDialog({ ...accountDialog, isOpen: false })}
                  className="w-6 h-6 hover:bg-red-500 hover:text-white rounded flex items-center justify-center text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Dialog content with Windows blue background */}
            <div className="bg-gradient-to-b from-blue-600 to-blue-800 text-white min-h-[400px] p-8">
              {/* Account Selection */}
              {accountDialog.type === "login" && accountDialog.step === "select" && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Choose an account</h2>
                  <div className="space-y-3 mb-6">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAccountAction("selectUser", user)}
                        className="w-full bg-blue-700/50 hover:bg-blue-700/70 border border-blue-500 rounded-lg p-4 flex items-center gap-4 text-left transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-lg font-semibold">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture || "/placeholder.svg"}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user.username[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-blue-200">{user.accountType} Account</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setAccountDialog({ ...accountDialog, type: "create", step: "username" })}
                    className="bg-blue-500 hover:bg-blue-400 px-6 py-2 rounded text-white font-medium transition-colors"
                  >
                    Create account
                  </button>
                </div>
              )}

              {/* Create User Form - matching the Windows interface exactly */}
              {accountDialog.type === "create" && (
                <div>
                  <h2 className="text-2xl font-light mb-6">Create a user for this PC</h2>

                  <div className="mb-6 text-sm text-blue-100 leading-relaxed">
                    <p className="mb-4">
                      If this account is for a child or teenager, consider selecting{" "}
                      <span className="underline cursor-pointer">Back</span> and creating a Microsoft account. When
                      younger family members log in with a Microsoft account, they'll have privacy protections focused
                      on their age.
                    </p>
                    <p>
                      If you want to use a password, choose something that will be easy for you to remember but hard for
                      others to guess.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Who's going to use this PC?</label>
                      <input
                        type="text"
                        value={accountDialog.formData.username}
                        onChange={(e) =>
                          setAccountDialog({
                            ...accountDialog,
                            formData: { ...accountDialog.formData, username: e.target.value },
                          })
                        }
                        className="w-full bg-white text-gray-800 border-2 border-gray-300 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                        placeholder="Enter username"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Make it secure.</label>
                      <input
                        type="password"
                        value={accountDialog.formData.password}
                        onChange={(e) =>
                          setAccountDialog({
                            ...accountDialog,
                            formData: { ...accountDialog.formData, password: e.target.value },
                          })
                        }
                        className="w-full bg-blue-700/30 text-white border border-blue-500 rounded px-3 py-2 placeholder-blue-200 focus:border-blue-300 focus:outline-none mb-3"
                        placeholder="Enter password"
                      />
                      <input
                        type="password"
                        value={accountDialog.formData.confirmPassword}
                        onChange={(e) =>
                          setAccountDialog({
                            ...accountDialog,
                            formData: { ...accountDialog.formData, confirmPassword: e.target.value },
                          })
                        }
                        className="w-full bg-blue-700/30 text-white border border-blue-500 rounded px-3 py-2 placeholder-blue-200 focus:border-blue-300 focus:outline-none"
                        placeholder="Re-enter password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Account Type</label>
                      <select
                        value={accountDialog.formData.accountType}
                        onChange={(e) =>
                          setAccountDialog({
                            ...accountDialog,
                            formData: {
                              ...accountDialog.formData,
                              accountType: e.target.value as "Standard" | "Administrator",
                            },
                          })
                        }
                        className="w-full bg-blue-700/30 text-white border border-blue-500 rounded px-3 py-2 focus:border-blue-300 focus:outline-none"
                      >
                        <option value="Standard">Standard User</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <button className="flex items-center gap-2 text-blue-200 hover:text-white">
                      <div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center">
                        <span className="text-xs">↻</span>
                      </div>
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setAccountDialog({ ...accountDialog, isOpen: false })}
                        className="bg-blue-700/50 hover:bg-blue-700/70 border border-blue-500 px-6 py-2 rounded text-white transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (
                            accountDialog.formData.username &&
                            accountDialog.formData.password &&
                            accountDialog.formData.password === accountDialog.formData.confirmPassword
                          ) {
                            handleAccountAction("createUser")
                          }
                        }}
                        disabled={
                          !accountDialog.formData.username ||
                          !accountDialog.formData.password ||
                          accountDialog.formData.password !== accountDialog.formData.confirmPassword
                        }
                        className="bg-blue-500 hover:bg-blue-400 disabled:bg-blue-700/50 disabled:cursor-not-allowed px-6 py-2 rounded text-white font-medium transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Account Type */}
              {accountDialog.type === "changeType" && accountDialog.step === "selectUser" && (
                <div>
                  <h2 className="text-xl font-medium mb-6">Select account to change</h2>
                  <div className="space-y-3">
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() =>
                          setAccountDialog({
                            ...accountDialog,
                            step: "changeType",
                            selectedUser: user,
                            formData: { ...accountDialog.formData, accountType: user.accountType },
                          })
                        }
                        className="w-full bg-blue-700/50 hover:bg-blue-700/70 border border-blue-500 rounded-lg p-4 flex items-center gap-4 text-left transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-semibold">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture || "/placeholder.svg"}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            user.username[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-blue-200">{user.accountType} Account</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {accountDialog.type === "changeType" &&
                accountDialog.step === "changeType" &&
                accountDialog.selectedUser && (
                  <div>
                    <h2 className="text-xl font-medium mb-6">Change account type</h2>
                    <div className="bg-blue-700/30 border border-blue-500 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-semibold">
                          {accountDialog.selectedUser.profilePicture ? (
                            <img
                              src={accountDialog.selectedUser.profilePicture || "/placeholder.svg"}
                              alt=""
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            accountDialog.selectedUser.username[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{accountDialog.selectedUser.username}</div>
                          <div className="text-sm text-blue-200">Local Account</div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Account type</label>
                        <div className="relative">
                          <select
                            value={accountDialog.formData.accountType}
                            onChange={(e) =>
                              setAccountDialog({
                                ...accountDialog,
                                formData: {
                                  ...accountDialog.formData,
                                  accountType: e.target.value as "Standard" | "Administrator",
                                },
                              })
                            }
                            className="w-full bg-white text-gray-800 border-2 border-red-500 rounded px-3 py-2 pr-8 focus:outline-none appearance-none"
                          >
                            <option value="Standard">Standard User</option>
                            <option value="Administrator">Administrator</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            1
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setAccountDialog({ ...accountDialog, step: "selectUser" })}
                        className="bg-blue-700/50 hover:bg-blue-700/70 border border-blue-500 px-6 py-2 rounded text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAccountAction("changeAccountType")}
                        className="bg-blue-500 hover:bg-blue-400 px-6 py-2 rounded text-white font-medium transition-colors border-2 border-red-500"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
