import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Wind, Thermometer, Shield, Volume2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  features: string[];
  specs: { label: string; value: string }[];
}

const products: Product[] = [
  {
    id: 1,
    name: '断桥铝门窗系统',
    description: '采用德国进口隔热条，配合多腔体结构设计，实现卓越的隔热保温性能。',
    image: '/images/product-1.jpg',
    features: ['断桥隔热', '双层中空玻璃', '多道密封'],
    specs: [
      { label: '隔音性能', value: '40dB' },
      { label: '保温系数', value: '1.4 W/㎡·K' },
      { label: '气密等级', value: '8级' },
    ],
  },
  {
    id: 2,
    name: '阳光房系统',
    description: '定制化阳光房解决方案，让您的室内空间与自然完美融合。',
    image: '/images/product-2.jpg',
    features: ['钢结构框架', '夹胶安全玻璃', '智能遮阳'],
    specs: [
      { label: '抗风压', value: '9级' },
      { label: '透光率', value: '85%' },
      { label: '质保期', value: '15年' },
    ],
  },
  {
    id: 3,
    name: '平开窗系统',
    description: '精密五金配件，开启灵活顺畅，密封性能卓越。',
    image: '/images/product-3.jpg',
    features: ['隐藏式合页', '多点锁闭', '防坠设计'],
    specs: [
      { label: '开启角度', value: '90°' },
      { label: '水密等级', value: '6级' },
      { label: '使用寿命', value: '10万+次' },
    ],
  },
];

const coreValues = [
  { icon: Wind, title: '高性能隔音', desc: '多层密封结构，有效隔绝外界噪音' },
  { icon: Thermometer, title: '卓越保温', desc: '断桥隔热技术，节能降耗' },
  { icon: Shield, title: '安全可靠', desc: '抗风压设计，守护家居安全' },
  { icon: Volume2, title: '气密防水', desc: '精密密封系统，防风防雨' },
];

const Products = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeProduct, setActiveProduct] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="products"
      ref={sectionRef}
      className="relative py-24 lg:py-32 w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div 
            className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-medium rounded-full mb-6">
              产品中心
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-brand-black mb-6">
              高性能系统门窗解决方案
            </h2>
            <p className="text-lg text-gray-600">
              贝克洛提供一系列系统门窗与幕墙产品，解决住宅及商业建筑中的关键问题
            </p>
          </div>

          {/* Core values */}
          <div 
            className={`grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {coreValues.map((value, index) => (
              <div 
                key={index}
                className="group p-6 bg-brand-light rounded-2xl hover:bg-brand-blue transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-brand-blue/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <value.icon className="w-6 h-6 text-brand-blue group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-brand-black group-hover:text-white mb-2 transition-colors">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-white/80 transition-colors">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Products showcase */}
          <div 
            className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Product selector */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => setActiveProduct(index)}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeProduct === index
                      ? 'bg-brand-blue text-white shadow-lg'
                      : 'bg-brand-light text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {product.name}
                </button>
              ))}
            </div>

            {/* Active product display */}
            <div className="bg-brand-light rounded-3xl overflow-hidden">
              <div className="grid lg:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-[4/3] lg:aspect-auto">
                  <img
                    src={products[activeProduct].image}
                    alt={products[activeProduct].name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-light/50 lg:block hidden" />
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl lg:text-3xl font-display font-bold text-brand-black mb-4">
                    {products[activeProduct].name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {products[activeProduct].description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {products[activeProduct].features.map((feature, idx) => (
                      <span 
                        key={idx}
                        className="px-4 py-2 bg-white rounded-full text-sm font-medium text-brand-black shadow-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {products[activeProduct].specs.map((spec, idx) => (
                      <div key={idx} className="text-center p-4 bg-white rounded-xl">
                        <div className="text-xl font-bold text-brand-blue">{spec.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{spec.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <a 
                    href="#contact" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-brand-blue text-white font-medium rounded-xl transition-all duration-300 hover:bg-blue-700 hover:shadow-lg group w-fit"
                  >
                    了解详情
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
