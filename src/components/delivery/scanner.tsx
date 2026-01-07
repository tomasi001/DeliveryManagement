'use client'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'

interface ScannerProps {
  onScan: (decodedText: string) => void
}

export function Scanner({ onScan }: ScannerProps) {
  useEffect(() => {
    const elementId = "html5qr-code-full-region"
    
    if (!document.getElementById(elementId)) return

    const scanner = new Html5QrcodeScanner(
      elementId,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render((decodedText) => {
       onScan(decodedText)
    }, () => {
       // ignore errors to avoid console spam
    });

    return () => {
      scanner.clear().catch(err => console.warn("Failed to clear scanner", err))
    }
  }, [onScan])

  return <div id="html5qr-code-full-region" className="w-full bg-black rounded-lg overflow-hidden [&>div>img]:hidden [&>div>div]:hidden" />
}

