"use client"

import { useRouter } from "next/navigation"
import { CreateAccountForm } from "@/components/auth/CreateAccountForm"

export default function CreateAccountPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <CreateAccountForm onComplete={() => router.push("/feed")} />
      </div>
    </div>
  )
}
