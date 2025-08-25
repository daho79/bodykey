export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>BodyKey</title>
      </head>
      <body style={{margin: 0, padding: '20px', fontFamily: 'Arial, sans-serif'}}>
        {children}
      </body>
    </html>
  )
}