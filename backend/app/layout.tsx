export const metadata = {
  title: 'Delta - Traffic Signal Detection API',
  description: 'Backend API for accessibility-first traffic signal detection',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
