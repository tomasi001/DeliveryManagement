import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DeliveryView } from './delivery-view'

export default async function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
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
    .order('wac_code')

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <DeliveryView session={session} initialArtworks={artworks || []} />
    </div>
  )
}
