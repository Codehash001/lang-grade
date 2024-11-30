"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LogoComponent from "@/components/logo-component"

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function GradeArticlePage() {
  const [articleUrl, setArticleUrl] = useState("")
  const [articleText, setArticleText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    text: string;
    level: string;
    rewrittenText?: string;
  } | null>(null)
  const [targetLevel, setTargetLevel] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent, isUrl: boolean) => {
    e.preventDefault()
    setLoading(true)
    try {
      const input = isUrl ? articleUrl : articleText;
      const response = await fetch('/api/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, isUrl })
      });
      
      if (!response.ok) throw new Error('Failed to process article');
      
      const data = await response.json();
      setResult({ text: data.text, level: data.level });
      toast.success(`Article analyzed! CEFR Level: ${data.level}`);
    } catch (error) {
      toast.error('Failed to process article. Please try again.');
      console.error(error);
    } finally {
      setLoading(false)
    }
  }

  const handleRewrite = async () => {
    if (!result || !targetLevel) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.text, targetLevel })
      });
      
      if (!response.ok) throw new Error('Failed to rewrite article');
      
      const data = await response.json();
      setResult({ ...result, rewrittenText: data.rewrittenText });
      toast.success(`Article rewritten to ${targetLevel} level!`);
    } catch (error) {
      toast.error('Failed to rewrite article. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <header className="flex-none sm:px-8 px-5 py-2 shadow backdrop-blur-sm border-b border-gray-200 bg-sunflower">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6">
        <div className='flex items-center space-x-4'>
          <LogoComponent/>
      <h1 className="sm:text-4xl text-xl font-bold text-gray-800">Grade Articles</h1>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-auto mih-h-screen items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6 h-full">
          {/* Input Methods Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* URL Input */}
            <div className="bg-lightblue p-4 sm:p-6 rounded-lg border shadow flex flex-col">
              <h2 className="text-xl font-semibold mb-2">Article URL</h2>
              <p className="text-sm text-gray-600 mb-4">Paste the URL of the article you want to analyze</p>
              <form onSubmit={(e) => handleSubmit(e, true)} className="flex flex-col flex-grow">
                <Input
                  placeholder="https://example.com/article"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  disabled={loading}
                />
                <div className="flex-grow"></div>
                <Button type="submit" className="w-full mt-4" disabled={loading || !articleUrl.trim()}>
                  {loading ? 'Processing...' : 'Grade from URL'}
                </Button>
              </form>
            </div>

            {/* Text Input */}
            <div className="bg-lightblue p-4 sm:p-6 rounded-lg border shadow flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-2">Article Text</h2>
              <p className="text-sm text-gray-600 mb-4">Or paste the article text directly</p>
              <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col flex-grow">
                <Textarea
                  placeholder="Paste your article text here..."
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  className="min-h-[120px] resize-y flex-grow"
                  disabled={loading}
                />
                <Button type="submit" className="w-full mt-4" disabled={loading || !articleText.trim()}>
                  {loading ? 'Processing...' : 'Grade Text'}
                </Button>
              </form>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm space-y-6 mb-20">
              {/* Level Result */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Results</h2>
                  <p className="text-gray-600">
                    Detected CEFR Level: <span className="font-semibold text-primary">{result.level}</span>
                  </p>
                </div>
                
                {/* Rewrite Controls */}
                <div className="flex gap-3 items-center">
                  <Select onValueChange={setTargetLevel} value={targetLevel}>
                    <SelectTrigger className="w-[130px]" disabled={loading}>
                      <SelectValue placeholder="Target level" />
                    </SelectTrigger>
                    <SelectContent>
                      {CEFR_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleRewrite}
                    disabled={!targetLevel || loading}
                    className="whitespace-nowrap"
                  >
                    {loading ? 'Rewriting...' : 'Rewrite'}
                  </Button>
                </div>
              </div>

              {/* Rewritten Text */}
              {result.rewrittenText && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Rewritten Text ({targetLevel})</h3>
                  <div className="bg-gray-50 p-4 rounded-md prose prose-sm max-w-none">
                    <ReactMarkdown>{result.rewrittenText}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
