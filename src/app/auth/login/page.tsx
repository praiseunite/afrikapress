"use client"

import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <LoginForm onComplete={() => router.push("/feed")} />
      </div>
    </div>
  )
}
