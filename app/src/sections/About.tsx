import { useEffect, useRef, useState } from 'react';
import { Award, Shield, Zap, CheckCircle } from 'lucide-react';

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const honors = [
    { icon: Award, text: 'iF 国际设计大奖' },
    { icon: Shield, text: '中国绿色建材产品认证' },
    { icon: Zap, text: '国家高新技术企业' },
    { icon: CheckCircle, text: '门窗十大品牌' },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 lg:py-32 w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-brand-light" />
      
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: Image */}
            <div 
              className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/product-1.jpg"
                  alt="贝克洛产品"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-black/20 via-transparent to-transparent" />
              </div>
              
              {/* Experience badge */}
              <div className="absolute -bottom-8 -right-8 bg-brand-blue text-white rounded-2xl shadow-xl p-6">
                <div className="text-5xl font-bold">15+</div>
                <div className="text-sm opacity-90 mt-1">年行业经验</div>
              </div>

              {/* Decorative element */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-brand-blue/20 rounded-xl -z-10" />
            </div>

            {/* Right: Content */}
            <div 
              className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            >
              <span className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-medium rounded-full mb-6">
                关于我们
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-brand-black leading-tight mb-6">
                贝克洛门窗
                <span className="block text-gray-400 mt-2">Bucalu</span>
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                贝克洛（Bucalu）是广东贝克洛幕墙门窗系统有限公司旗下品牌，成立于2009年。
                依托中国铝型材集团及其技术与供应链管理体系，致力于提供创新、高性能的门窗与幕墙产品。
              </p>
              
              <p className="text-gray-600 leading-relaxed mb-8">
                我们秉承"现代系统思维 + 工程艺术"的理念，将科技研发与产品设计结合，
                为用户提供高功能性、节能、经典设计的门窗与幕墙系统。品牌定位强调
                "德国工程标准 + 中国智造优势"，注重技术创新、节能性能、安全性以及舒适性。
              </p>

              {/* Honors grid */}
              <div className="grid grid-cols-2 gap-4">
                {honors.map((honor, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-4 bg-white rounded-xl shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${400 + index * 100}ms` }}
                  >
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <honor.icon className="w-5 h-5 text-brand-blue" />
                    </div>
                    <span className="text-sm font-medium text-brand-black">{honor.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
