import "./globals.css";
import "../public/styles.css"; // your original CSS

export const metadata = {
  title: "ClassSync",
  description: "Academic ERP Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}