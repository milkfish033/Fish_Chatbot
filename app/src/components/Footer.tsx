import { Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  products: [
    { label: '断桥铝门窗', href: '#products' },
    { label: '推拉门系统', href: '#products' },
    { label: '平开窗系统', href: '#products' },
    { label: '阳光房系统', href: '#products' },
    { label: '幕墙系统', href: '#products' },
  ],
  services: [
    { label: '定制咨询', href: '#contact' },
    { label: '方案设计', href: '#process' },
    { label: '安装服务', href: '#process' },
    { label: '售后支持', href: '#process' },
  ],
  company: [
    { label: '关于我们', href: '#about' },
    { label: '应用案例', href: '#projects' },
    { label: '核心优势', href: '#advantages' },
    { label: '联系我们', href: '#contact' },
  ],
};

const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-brand-black text-white overflow-hidden">
      {/* Top decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />
      
      <div className="section-padding py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-blue rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">B</span>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">贝克洛</div>
                  <div className="text-xs text-gray-400">BUCALU</div>
                </div>
              </div>
              
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                现代系统思维与工程艺术的完美融合。专注于高性能系统门窗与幕墙解决方案。
              </p>

              {/* Contact info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm">400-888-8888</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm">info@bucalu.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 text-brand-blue" />
                  <span className="text-sm">广东省佛山市南海区</span>
                </div>
              </div>
            </div>

            {/* Links columns */}
            <div className="lg:col-span-8">
              <div className="grid sm:grid-cols-3 gap-8">
                {/* Products */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">产品中心</h3>
                  <ul className="space-y-3">
                    {footerLinks.products.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">服务支持</h3>
                  <ul className="space-y-3">
                    {footerLinks.services.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">关于贝克洛</h3>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link, index) => (
                      <li key={index}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm text-center sm:text-left">
                © 2024 贝克洛门窗 (Bucalu). 保留所有权利.
              </p>
              <div className="flex items-center gap-6">
                <button className="text-gray-500 hover:text-white transition-colors text-sm">
                  隐私政策
                </button>
                <button className="text-gray-500 hover:text-white transition-colors text-sm">
                  使用条款
                </button>
                <button className="text-gray-500 hover:text-white transition-colors text-sm">
                  网站地图
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
