import "./globals.css";

export const metadata = {
  title: "Education Chat App",
  description: "A modern chat & learning app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {/* Navbar */}
        <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between shadow">
          <h1 className="text-xl font-bold">EduChat</h1>
          <div className="space-x-4">
            <a href="/" className="hover:underline">Home</a>
            <a href="/chat/room1" className="hover:underline">Chat</a>
            <a href="/qna" className="hover:underline">Q&A</a>
            <a href="/resources" className="hover:underline">Resources</a>
            <a herf="/register"className="hover:underline">Register</a>
          </div>
        </nav>

        <main className="min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-800 text-gray-200 text-center py-4 mt-10">
          <p>© {new Date().getFullYear()} EduChat. Built with ❤️</p>
        </footer>
      </body>
    </html>
  );
}