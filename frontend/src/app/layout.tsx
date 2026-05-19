import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PhiloMind - Interactive Philosophical Sanctuary',
  description: 'AI Philosophy Learning Journey. Explore structured mindmaps, podcast audio dialogs, Socratic debates, and flashcard repetitions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col md:flex-row transition-all duration-300">
        {children}
      </body>
    </html>
  );
}
