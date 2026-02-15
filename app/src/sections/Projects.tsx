import { useEffect, useRef, useState } from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  category: string;
  location: string;
  description: string;
  image: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: '现代别墅群',
    category: '住宅项目',
    location: '上海',
    description: '大面积落地玻璃窗和推拉门系统，打造开放通透的居住空间',
    image: '/images/project-1.jpg',
  },
  {
    id: 2,
    title: '商业综合体',
    category: '商业项目',
    location: '深圳',
    description: '高层建筑玻璃幕墙系统，展现现代建筑美学',
    image: '/images/project-2.jpg',
  },
  {
    id: 3,
    title: '高端住宅',
    category: '住宅项目',
    location: '杭州',
    description: '推拉门系统连接室内外空间，享受自然光线',
    image: '/images/project-3.jpg',
  },
  {
    id: 4,
    title: '写字楼大堂',
    category: '公共建筑',
    location: '北京',
    description: '大面积玻璃幕墙营造明亮大气的入口空间',
    image: '/images/project-4.jpg',
  },
];

const Projects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

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
      id="projects"
      ref={sectionRef}
      className="relative py-24 lg:py-32 w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-brand-light" />
      
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div 
            className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div>
              <span className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-medium rounded-full mb-6">
                应用案例
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-brand-black">
                成功案例展示
              </h2>
            </div>
            <p className="text-lg text-gray-600 max-w-xl">
              从高端住宅到商业地标，贝克洛门窗为各类建筑提供专业的门窗与幕墙解决方案
            </p>
          </div>

          {/* Projects grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      hoveredProject === project.id ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  {/* Overlay */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/40 to-transparent transition-opacity duration-500 ${
                      hoveredProject === project.id ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                  {/* Category & Location */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-brand-blue text-white text-xs font-medium rounded-full">
                      {project.category}
                    </span>
                    <span className="flex items-center gap-1 text-white/80 text-sm">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl lg:text-2xl font-display font-bold text-white mb-2">
                    {project.title}
                  </h3>

                  {/* Description - shows on hover */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ${
                      hoveredProject === project.id ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-white/80 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* View button */}
                  <div 
                    className={`mt-4 transition-all duration-500 ${
                      hoveredProject === project.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <button className="inline-flex items-center gap-2 text-white font-medium hover:text-brand-blue transition-colors">
                      查看项目
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Corner accent */}
                <div 
                  className={`absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-500 ${
                    hoveredProject === project.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* View all button */}
          <div 
            className={`text-center mt-12 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-brand-black text-brand-black font-medium rounded-xl transition-all duration-300 hover:bg-brand-black hover:text-white group"
            >
              查看更多案例
              <ArrowUpRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
