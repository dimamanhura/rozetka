import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import {
  APP_DESCRIPTION,
  SERVER_URL,
  APP_NAME,
} from "@/lib/constants";
import "./globals.css";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: `%s | Rozetka`,
    default: APP_NAME
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          disableTransitionOnChange
          defaultTheme="light"
          enableSystem
          attribute={'class'}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};
