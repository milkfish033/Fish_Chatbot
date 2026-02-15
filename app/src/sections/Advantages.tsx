import { useEffect, useRef, useState } from 'react';
import { Leaf, VolumeX, ShieldCheck, Clock } from 'lucide-react';

interface Advantage {
  icon: React.ElementType;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

const advantages: Advantage[] = [
  {
    icon: Leaf,
    title: '节能保温',
    description: '采用断桥隔热技术和Low-E低辐射玻璃，有效降低能耗，为您节省空调费用',
    stat: '40%',
    statLabel: '节能效果',
  },
  {
    icon: VolumeX,
    title: '降噪隔音',
    description: '多层密封结构配合中空玻璃，有效隔绝外界噪音，营造宁静舒适的居住环境',
    stat: '40dB',
    statLabel: '隔音性能',
  },
  {
    icon: ShieldCheck,
    title: '安全可靠',
    description: '高强度铝合金型材，配合多点锁闭系统，抗风压、防盗性能卓越',
    stat: '9级',
    statLabel: '抗风压等级',
  },
  {
    icon: Clock,
    title: '经久耐用',
    description: '优质原材料和先进表面处理工艺，确保产品使用寿命长达30年以上',
    stat: '30年+',
    statLabel: '使用寿命',
  },
];

const Advantages = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePosition({ x, y });
  };

  return (
    <section
      id="advantages"
      ref={sectionRef}
      className="relative py-24 lg:py-32 w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-brand-light" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-blue/5 to-transparent" />
      
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div 
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-medium rounded-full mb-6">
              核心优势
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-brand-black mb-6">
              为什么选择贝克洛
            </h2>
            <p className="text-lg text-gray-600">
              我们致力于为客户提供高性能、高品质的门窗解决方案，让每一扇窗都成为生活的艺术品
            </p>
          </div>

          {/* Advantages grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl p-8 shadow-card hover:shadow-hover transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ 
                  transitionDelay: `${200 + index * 100}ms`,
                  transform: `perspective(1000px) rotateX(${mousePosition.y * -2}deg) rotateY(${mousePosition.x * 2}deg)`,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at ${(mousePosition.x + 1) * 50}% ${(mousePosition.y + 1) * 50}%, rgba(0, 65, 196, 0.1) 0%, transparent 50%)`,
                  }}
                />

                <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue transition-colors duration-300">
                    <advantage.icon className="w-8 h-8 text-brand-blue group-hover:text-white transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-black mb-2">
                      {advantage.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {advantage.description}
                    </p>

                    {/* Stat */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-brand-blue">
                        {advantage.stat}
                      </span>
                      <span className="text-sm text-gray-500">
                        {advantage.statLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stats */}
          <div 
            className={`grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {[
              { value: '100万+', label: '平方米服务面积' },
              { value: '50+', label: '项专利技术' },
              { value: '2000+', label: '合作伙伴' },
              { value: '99%', label: '客户满意度' },
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-card"
              >
                <div className="text-2xl lg:text-3xl font-bold text-brand-blue mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Advantages;
