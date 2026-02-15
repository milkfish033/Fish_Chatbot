import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePosition({ x, y });
    };

    const hero = heroRef.current;
    if (hero) {
      hero.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      if (hero) {
        hero.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-light via-white to-brand-gray z-0" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div 
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-brand-blue/5 blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-3xl"
          style={{
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full section-padding py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text content */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div 
                className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <span className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-medium rounded-full mb-6">
                  德国工程标准 · 中国智造优势
                </span>
              </div>
              
              <h1 
                className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-brand-black leading-tight mb-6 transition-all duration-1000 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                构筑舒适空间
                <span className="block text-brand-blue mt-2">技术定义未来</span>
              </h1>
              
              <p 
                className={`text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                贝克洛门窗，现代系统思维与工程艺术的完美融合。
                专注于高性能系统门窗与幕墙解决方案，为您打造宁静、节能、安全的生活空间。
              </p>
              
              <div 
                className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <a href="#products" className="btn-primary group">
                  探索系列
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
                <a href="#contact" className="btn-outline">
                  免费咨询
                </a>
              </div>

              {/* Stats */}
              <div 
                className={`grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-blue">15+</div>
                  <div className="text-sm text-gray-500 mt-1">年行业经验</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-blue">100万+</div>
                  <div className="text-sm text-gray-500 mt-1">平方米服务</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-brand-blue">50+</div>
                  <div className="text-sm text-gray-500 mt-1">项专利技术</div>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div 
              className={`order-1 lg:order-2 relative transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            >
              <div 
                ref={imageRef}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y * -3}deg) rotateY(${mousePosition.x * 3}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
              >
                <img
                  src="/images/hero-bg.jpg"
                  alt="贝克洛门窗"
                  className="w-full h-full object-cover"
                />
                {/* Glass overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/30 via-transparent to-transparent" />
              </div>
              
              {/* Floating badge */}
              <div 
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-card p-4 animate-float"
                style={{
                  transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-brand-black">iF设计大奖</div>
                    <div className="text-xs text-gray-500">2024年获奖产品</div>
                  </div>
                </div>
              </div>

              {/* Another floating element */}
              <div 
                className="absolute -top-4 -right-4 bg-brand-blue text-white rounded-xl shadow-lg p-4 animate-float animation-delay-300"
                style={{
                  transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <div className="text-2xl font-bold">40dB</div>
                <div className="text-xs opacity-80">隔音性能</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-gray-400 hover:text-brand-blue transition-colors cursor-pointer"
      >
        <span className="text-sm">向下滚动</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
};

export default Hero;
