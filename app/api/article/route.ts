import { NextResponse } from 'next/server'
import { processArticle, rewriteArticle } from '@/lib/articleService'

export async function POST(req: Request) {
  try {
    const { text, isUrl, targetLevel } = await req.json()

    if (targetLevel) {
      // Rewrite request
      const rewrittenText = await rewriteArticle(text, targetLevel)
      return NextResponse.json({ rewrittenText })
    } else {
      // Analysis request
      const result = await processArticle(text, isUrl)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Article processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    )
  }
}
