import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://voltz.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Voltz — Encontre Instrutores de Trânsito Autônomos Credenciados",
    template: "%s | Voltz",
  },
  description:
    "Encontre instrutores de trânsito autônomos credenciados pelo SENATRAN perto de você. Compare preços, avaliações e agende aulas práticas de direção. Nova lei CNH permite instrutor autônomo. Tire sua habilitação mais rápido e barato.",
  keywords: [
    "instrutor de trânsito",
    "instrutor autônomo",
    "aula prática de direção",
    "habilitação",
    "CNH",
    "autoescola",
    "instrutor de direção",
    "aula de direção",
    "tirar carteira de motorista",
    "instrutor credenciado SENATRAN",
    "nova lei CNH",
    "instrutor particular",
    "aula prática carro",
    "aula prática moto",
    "primeira habilitação",
    "categoria A",
    "categoria B",
  ],
  authors: [{ name: "Voltz" }],
  creator: "Voltz",
  publisher: "Voltz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Voltz",
    title: "Voltz — Encontre Instrutores de Trânsito Autônomos Credenciados",
    description:
      "Compare instrutores de trânsito autônomos credenciados. Veja avaliações, preços e agende aulas práticas de direção na sua cidade.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Voltz — Plataforma de instrutores de trânsito autônomos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voltz — Encontre Instrutores de Trânsito Autônomos",
    description:
      "Compare instrutores credenciados pelo SENATRAN. Preços, avaliações e aulas práticas de direção perto de você.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Adicione seus códigos de verificação aqui quando tiver:
    // google: "seu-codigo-google-search-console",
    // yandex: "seu-codigo-yandex",
  },
  category: "education",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={spaceGrotesk.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#FACC15" />
        <meta name="geo.region" content="BR" />
        <meta name="geo.placename" content="Brasil" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#171717",
              border: "1px solid #E5E5E5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
          }}
        />
        </AuthProvider>
      </body>
    </html>
  )
}
