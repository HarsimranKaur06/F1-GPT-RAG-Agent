import "./global.css"
export const metadata = {
    title: "F1GPT",
    description: "F1GPT - Your AI Companion for Formula 1",
}
import React from 'react'


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
