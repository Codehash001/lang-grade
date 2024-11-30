"use client";

import React, { useState, useEffect } from "react";
import { Dock, DockIcon } from "@/components/ui/dock";
import { Home, KeyRound, LayoutGrid, LibraryBig, LogOut, Newspaper, X } from "lucide-react";
import { useRouter } from 'next/navigation'
import { signOut, UserInfo } from "@/lib/authUtils";

export function Footer() {
  const [isVisible, setIsVisible] = useState(true);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    }
  }, []);

  // Toggle Dock visibility with the Space key
  useEffect(() => {
    const handleKeyPress = (event: { code: string; preventDefault: () => void }) => {
      if (event.code === "Space") {
        event.preventDefault(); // Prevent page scroll
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Show the "Press Space to toggle menu" hint when hovering over the Dock
  const handleDockHover = () => {
    setShowHint(true);
  };

  const handleDockHoverLeave =() =>{
    setShowHint(false);
  }

  const handleNavAction = (destination: string) =>{
    router.push(`${destination}`);
  }

  const handleSignOut = () => {
    signOut();
  }

  return (
    <div className="relative">
      {/* Tooltip for Dock toggle */}
      {showHint && (
        <div
          className="absolute translate-x-0 -translate-y-0 bottom-2 right-0
                       text-xs px-3 py-2 rounded-lg shadow-lg
                     animate-fade-slide z-50"
        >
          Press <kbd className="bg-gray-700 p-1 rounded text-white">Space</kbd> to toggle menu
        </div>
      )}

      {/* Dock */}
      <div
        onMouseLeave={() => setIsTooltipVisible(false)}
        className={`transition-all duration-500 ease-in-out ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 scale-75 pointer-events-none"
        }`}
      >
        <Dock
          magnification={55}
          className="border rounded-3xl shadow-lg flex justify-center items-center gap-6 px-4 py-2 relative"
        >
          <div className=" rounded-3x; text-white absolute w-full h-full -translate-x-0 translate-y-0" 
          // onMouseEnter={handleDockHover} onMouseLeave={handleDockHoverLeave}
          >

          </div>
          {/* Dock Icons */}
          {[
            {tooltip: "Home" , icon: <Home className="w-6 h-6 text-gray-600" /> ,
            destination: "/"},
            { tooltip: "My books", icon: <LayoutGrid className="w-6 h-6 text-gray-600" /> , destination: "/my-books" },
            { tooltip: "Library", icon: <LibraryBig className="w-6 h-6 text-gray-600" /> , destination: "/library" },
            { tooltip: "Grade articles", icon: <Newspaper className="w-6 h-6 text-gray-600" /> , destination: "/grade-article" },
          ].map((item, index) => (
            <DockIcon
              key={index}
              className="relative group rounded-full border-2 border-white/30 bg-white/20 p-1 shadow-md hover:shadow-lg"
              onClick={() => handleNavAction(item.destination)}
            >
              {/* Tooltip for each icon */}
              <div
                className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white 
                           bg-gray-800 rounded-md shadow-md opacity-0 scale-75 whitespace-nowrap
                           transition-all duration-300 group-hover:opacity-100 group-hover:scale-100`}
              >
                {item.tooltip}
              </div>

              {/* Icon */}
              {item.icon}
            </DockIcon>
          ))}
          {user ?
                    <DockIcon
                    className="relative group rounded-full border-2 border-white/30 bg-white/20 p-1 shadow-md hover:shadow-lg"
                    onClick={handleSignOut}
                    >
                       <div
                          className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white 
                                     bg-gray-800 rounded-md shadow-md opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100`}
                        >
                          Logout
                        </div>
                      <LogOut className="w-6 h-6 text-black" />
                    </DockIcon>
        :
        <DockIcon
        className="relative group rounded-full border-2 border-white/30 bg-white/20 p-1 shadow-md hover:shadow-lg"
        onClick={() => router.push("/sign-in")}
        >
           <div
              className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white 
                         bg-gray-800 rounded-md shadow-md opacity-0 scale-75 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100`}
            >
              Login
            </div>
          <KeyRound className="w-6 h-6 text-black" />
          </DockIcon>
        }
        </Dock>
      </div>
    </div>
  );
}
