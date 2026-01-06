import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ReviewForm } from './review-form'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function SessionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (!session) {
    notFound()
  }

  const { data: artworks } = await supabase
    .from('artworks')
    .select('*')
    .eq('session_id', id)

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 p-6 pt-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
            <Link href="/admin">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Review Session</h1>
        </div>
        
        <ReviewForm session={session} artworks={artworks || []} />
      </div>
    </div>
  )
}
