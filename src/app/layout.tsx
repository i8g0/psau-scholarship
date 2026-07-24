import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نسب قبول طلاب المنح – دفعة 2026 | جامعة الأمير سطام",
  description:
    "منصة عرض إحصائيات موزونات القبول لطلاب المنح في جامعة الأمير سطام بن عبدالعزيز – دفعة 2026.",
  keywords: [
    "جامعة الأمير سطام",
    "نسب قبول",
    "طلاب منح",
    "موزونات",
    "PSAU",
    "scholarship",
    "admissions",
    "2026",
  ],
  openGraph: {
    title: "نسب قبول طلاب المنح – دفعة 2026 | PSAU",
    description:
      "إحصائيات موزونات القبول المباشرة لطلاب منح جامعة الأمير سطام بن عبدالعزيز",
    type: "website",
    locale: "ar_SA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "'Tajawal', system-ui, sans-serif" }}
      >
        {/* Apply dark mode before hydration to avoid a light-mode flash for returning users */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("psau-dark-mode")==="true"){document.documentElement.classList.add("dark")}}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
