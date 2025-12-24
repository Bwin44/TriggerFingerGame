import Navbar from "./Navbar";
import Background from "./background";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Background />
      <Navbar />
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
