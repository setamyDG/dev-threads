// layout for (auth) pages
import { ClerkProvider } from '@clerk/nextjs';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Dev Threads',
  description: 'A Next.js 13 Meta dev threads app',
};

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={`${inter.className} bg-dark-1`}>
          <div className='w-full flex justify-center items-center min-h-screen'>{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
