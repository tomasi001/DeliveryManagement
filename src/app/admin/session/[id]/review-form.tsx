'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { finalizeSession } from '@/app/actions/finalize-session'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, Truck, ExternalLink } from 'lucide-react'
import type { Session, Artwork } from '@/types'

interface ReviewFormProps {
  session: Session
  artworks: Artwork[]
}

function formatStatus(status: string) {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function ReviewForm({ session, artworks }: ReviewFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleFinalize() {
    setLoading(true)
    const res = await finalizeSession(session.id)
    if (res.success) {
      router.push('/admin')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Session Details</h2>
            <div className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-sm font-medium uppercase tracking-wide">
                {formatStatus(session.status)}
            </div>
        </div>
        <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{session.client_name}</p>
            <p className="text-sm text-neutral-500">{session.client_email}</p>
            <div className="text-xs text-neutral-400 font-mono break-all mt-2">
                ID: {session.id}
            </div>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
              <TableHead className="font-semibold">WAC Code</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artworks.map((art) => (
              <TableRow key={art.id}>
                <TableCell className="font-medium font-mono text-neutral-700 dark:text-neutral-300">
                    {art.wac_code}
                </TableCell>
                <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {formatStatus(art.status)}
                    </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3">
        {session.status === 'active' ? (
            <Button 
                onClick={handleFinalize} 
                className="w-full h-12 text-base font-semibold shadow-md transition-all active:scale-[0.99]" 
                size="lg" 
                disabled={loading}
            >
            {loading ? (
                'Finalizing...'
            ) : (
                <>
                    <Truck className="w-5 h-5 mr-2" />
                    Finalize List & Ready for Pickup
                </>
            )}
            </Button>
        ) : (
            <Link href={`/delivery/${session.id}`} className="w-full block">
                <Button 
                    variant="outline"
                    className="w-full h-12 text-base border-2 hover:bg-neutral-50 dark:hover:bg-neutral-900" 
                    size="lg"
                >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Delivery Dashboard
                </Button>
            </Link>
        )}
      </div>
    </div>
  )
}
