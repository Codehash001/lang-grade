"use client"

import React from 'react'
import Hero from "@/components/hero";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    
    <div className="w-screen h-screen sm:overflow-hidden overflow-y-auto md:px-20 md:pt-20 md:pb-10 pb-32 flex flex-col justify-between">
    <Hero/>
    </div>
  );
}
