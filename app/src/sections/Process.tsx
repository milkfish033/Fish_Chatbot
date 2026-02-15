import { useEffect, useRef, useState } from 'react';
import { MessageSquare, PenTool, Factory, Wrench, Headphones } from 'lucide-react';

interface Step {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    id: 1,
    icon: MessageSquare,
    title: '咨询沟通',
    description: '专业顾问了解您的需求，提供初步方案建议',
  },
  {
    id: 2,
    icon: PenTool,
    title: '方案设计',
    description: '根据建筑特点和需求，定制专属门窗解决方案',
  },
  {
    id: 3,
    icon: Factory,
    title: '智能制造',
    description: '德国标准生产工艺，确保产品品质卓越',
  },
  {
    id: 4,
    icon: Wrench,
    title: '专业安装',
    description: '经验丰富的安装团队，确保施工质量',
  },
  {
    id: 5,
    icon: Headphones,
    title: '售后支持',
    description: '完善的售后服务体系，让您无后顾之忧',
  },
];

const Process = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

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

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative py-24 lg:py-32 w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Decorative line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent hidden lg:block" />
      
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div 
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-medium rounded-full mb-6">
              服务流程
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-brand-black mb-6">
              专业定制流程
            </h2>
            <p className="text-lg text-gray-600">
              从咨询到售后，我们提供一站式专业服务，确保每个环节都精益求精
            </p>
          </div>

          {/* Process steps */}
          <div className="relative">
            {/* Connection line - mobile */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 lg:hidden" />
            
            {/* Connection line - desktop */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
            
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                  style={{ transitionDelay: `${200 + index * 150}ms` }}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  {/* Step card */}
                  <div 
                    className={`relative bg-brand-light rounded-2xl p-6 lg:p-8 transition-all duration-500 ${
                      activeStep === index 
                        ? 'bg-brand-blue text-white shadow-xl scale-105' 
                        : 'hover:bg-white hover:shadow-card'
                    }`}
                  >
                    {/* Step number */}
                    <div 
                      className={`absolute -top-4 left-6 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        activeStep === index 
                          ? 'bg-white text-brand-blue' 
                          : 'bg-brand-blue text-white'
                      }`}
                    >
                      {step.id}
                    </div>

                    {/* Icon */}
                    <div 
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        activeStep === index 
                          ? 'bg-white/20' 
                          : 'bg-brand-blue/10'
                      }`}
                    >
                      <step.icon 
                        className={`w-7 h-7 transition-colors ${
                          activeStep === index ? 'text-white' : 'text-brand-blue'
                        }`} 
                      />
                    </div>

                    {/* Content */}
                    <h3 
                      className={`text-lg font-semibold mb-2 transition-colors ${
                        activeStep === index ? 'text-white' : 'text-brand-black'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p 
                      className={`text-sm leading-relaxed transition-colors ${
                        activeStep === index ? 'text-white/80' : 'text-gray-600'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Connector dot - desktop */}
                  <div 
                    className={`hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 transition-all duration-300 ${
                      activeStep === index 
                        ? 'bg-brand-blue border-brand-blue scale-150' 
                        : 'bg-white border-gray-300'
                    }`}
                    style={{ top: '0', transform: 'translateX(-50%) translateY(-50%)' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div 
            className={`text-center mt-16 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-blue text-white font-medium rounded-xl transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
            >
              开始您的定制之旅
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
