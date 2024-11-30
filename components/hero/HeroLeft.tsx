"use client"

import { Button } from "@/components/ui/button"
import { AuthButton } from "../auth/AuthButton"
import { UserInfo } from "@/lib/authUtils"
import Link from "next/link"

interface HeroLeftProps {
  user: UserInfo | null;
}

export function HeroLeft({ user }: HeroLeftProps) {
  return (
    <div className="lg:w-1/2 space-y-8 px-4 py-12">
    <div className="flex items-center gap-2">
      <div className="bg-black text-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
        <span className="text-xs font-bold">Logo</span>
      </div>
      <p className="text-sm">
        <span className="font-bold">Hello, {user?.name}</span>
        <br />Welcome to LangGrade!
      </p>
    </div>
    <h1 className="text-6xl font-bold">LangGrade</h1>
    <p className="text-xl">
      Engage Learners, Boost Proficiency, And Leverage AI-Driven Content - All 30X Faster Than Traditional Methods.
    </p>
    <div className="flex gap-4">
      {user ? 
      (<Link href="/grade-article">
        <Button variant="outline" className="bg-transparent border border-primary hover:bg-transparent hover:shadow">Grade an article</Button>
      </Link>) :
    (<AuthButton />)}
    <Link href="/library">
    <Button >Explore Library →</Button>
    </Link>

    </div>
  </div>
  )
}
