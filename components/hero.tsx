"use client"

import { Button } from "@/components/ui/button"
import { File } from "lucide-react"
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { AuthButton } from "./auth/AuthButton"
import { HeroLeft } from "./hero/HeroLeft"
import InitGradeUI  from "./hero/InitGradeUI"

interface UserInfo {
  name: string;
  email: string;
  userId: string
}

export default function Hero() {
  const [file, setFile] = useState<File | null>(null)
  const [user, setUser] = useState<UserInfo | null>(null);
  
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    }
  }, []);



  return (
    <div className="container mx-auto flex flex-col lg:flex-row items-start  md:h-auto gap-12">
<HeroLeft user={user} />
<InitGradeUI/>
    </div>
  )
}
