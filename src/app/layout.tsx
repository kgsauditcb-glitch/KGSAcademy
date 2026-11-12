import type { Metadata } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'KGS Academy — Professional Learning',
    template: '%s | KGS Academy',
  },
  description:
    'KGS Academy — auditor and management-system training. Find courses, sessions and learning paths.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-(--bg-page) text-(--text-primary)">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-blue-950/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
            <Link href="/" className="text-xl font-black tracking-tight">
              <span className="text-white">KGS</span><span className="text-orange-400">Academy</span>
            </Link>
            <nav className="hidden items-center gap-5 text-sm font-semibold text-white md:flex">
              <Link href="/courses" className="hover:text-orange-300">Courses</Link>
              <Link href="/calendar" className="hover:text-orange-300">Calendar</Link>
              <Link href="/standards" className="hover:text-orange-300">Standards</Link>
              <Link href="/enquiry" className="hover:text-orange-300">Enquire</Link>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <Link
                href="/enquiry"
                className="rounded-lg bg-orange-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-orange-800"
              >
                Enquiry
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/10 bg-[#172554] text-[#bfdbfe]">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="font-bold text-white">KGS Academy</h4>
              <p className="mt-2 text-sm">
                Professional education and capability development for auditors and
                management-system professionals.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white">Explore</h4>
              <Link href="/courses" className="mt-2 block text-sm hover:text-white">Courses</Link>
              <Link href="/calendar" className="mt-2 block text-sm hover:text-white">Calendar</Link>
              <Link href="/standards" className="mt-2 block text-sm hover:text-white">Standards</Link>
            </div>
            <div>
              <h4 className="font-bold text-white">For organisations</h4>
              <Link href="/enquiry" className="mt-2 block text-sm hover:text-white">Corporate training</Link>
              <Link href="/enquiry" className="mt-2 block text-sm hover:text-white">Group enquiries</Link>
            </div>
          </div>
          <div className="border-t border-white/10 py-4 text-center text-xs">
            © 2026 KGS Academy
          </div>
        </footer>
      </body>
    </html>
  );
}
