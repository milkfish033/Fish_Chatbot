import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Hero from "@/sections/Hero";
import About from "@/sections/About";
import Products from "@/sections/Products";
import Projects from "@/sections/Projects";
import Process from "@/sections/Process";
import Advantages from "@/sections/Advantages";
import Contact from "@/sections/Contact";
import "@/App.css";

/**
 * 登录后的主界面（原 App 内容）
 * 在线咨询通过导航栏跳转 /chat，浮动按钮由 App 统一渲染
 */
export default function MainPage() {
  return (
    <div className="min-h-screen bg-brand-light">
      <Navigation />
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
    </div>
  );
}
