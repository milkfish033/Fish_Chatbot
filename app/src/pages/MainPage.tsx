import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Products from "@/sections/Products";
import Projects from "@/sections/Projects";
import Process from "@/sections/Process";
import Advantages from "@/sections/Advantages";
import Contact from "@/sections/Contact";
import ChatWidget from "@/components/ChatWidget";
import "@/App.css";

/**
 * 登录后的主界面（原 App 内容）
 */
export default function MainPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-light">
      <Navigation onOpenConsult={() => setChatOpen(true)} />
      <main>
        <Hero />
        <About />
        <Products />
        <Projects />
        <Process />
        <Advantages />
        <Contact />
      </main>
      <Footer />
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
