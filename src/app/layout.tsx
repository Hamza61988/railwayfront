import './globals.css';

export const metadata = {
  title: 'Next Auth App',
  description: 'Register/Login and Protected Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
