import "./globals.css";
import RouterWrapper from "../componenet/RouterWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RouterWrapper />
      </body>
    </html>
  );
}
