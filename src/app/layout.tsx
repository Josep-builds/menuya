import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ElcsaProvider } from "@/components/ElcsaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MenúYA — Contador de Ahorro",
  description: "¿Cuánto se te va en comida que tiras? Versión de prueba con datos de demostración.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2f7d4f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ElcsaProvider>
          <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-5">{children}</div>
        </ElcsaProvider>
      </body>
    </html>
  );
}
