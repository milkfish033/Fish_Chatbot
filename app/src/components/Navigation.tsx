import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '#about', label: '关于我们' },
  { href: '#products', label: '产品中心' },
  { href: '#projects', label: '应用案例' },
  { href: '#process', label: '服务流程' },
  { href: '#advantages', label: '核心优势' },
  { href: '#contact', label: '联系我们' },
];

interface NavigationProps {
  onOpenConsult?: () => void;
}

const Navigation = ({ onOpenConsult }: NavigationProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="section-padding">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <a 
              href="#" 
              className="flex items-center gap-3"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isScrolled ? 'bg-brand-blue' : 'bg-white'}`}>
                <span className={`text-lg font-bold ${isScrolled ? 'text-white' : 'text-brand-blue'}`}>B</span>
              </div>
              <div className="hidden sm:block">
                <div className={`text-xl font-display font-bold transition-colors ${isScrolled ? 'text-brand-black' : 'text-brand-black'}`}>
                  贝克洛
                </div>
                <div className={`text-xs transition-colors ${isScrolled ? 'text-gray-500' : 'text-gray-500'}`}>
                  BUCALU
                </div>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={`text-sm font-medium transition-colors hover:text-brand-blue ${
                    isScrolled ? 'text-gray-700' : 'text-gray-700'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* 用户与 CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {user && (
                <span className="text-sm text-muted-foreground">{user.username}</span>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="w-4 h-4" />
                退出
              </Button>
              <button
                onClick={onOpenConsult}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                在线咨询
              </button>
              <button
                onClick={() => scrollToSection('#contact')}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 bg-brand-blue text-white hover:bg-blue-700`}
              >
                免费咨询
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center"
            >
              {isMobileMenuOpen ? (
                <X className={`w-6 h-6 ${isScrolled ? 'text-brand-black' : 'text-brand-black'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isScrolled ? 'text-brand-black' : 'text-brand-black'}`} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-brand-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu panel */}
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-white shadow-2xl transition-transform duration-500 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-6 pt-20">
            <div className="space-y-2">
              {navLinks.map((link, index) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className={`block w-full text-left px-4 py-3 text-lg font-medium text-brand-black hover:bg-brand-light rounded-xl transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200 space-y-2">
              {user && (
                <p className="text-sm text-muted-foreground px-4">当前用户：{user.username}</p>
              )}
              <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                退出登录
              </Button>
              <button
                onClick={() => { onOpenConsult?.(); setIsMobileMenuOpen(false); }}
                className="w-full py-4 border border-brand-blue text-brand-blue font-medium rounded-xl hover:bg-brand-blue hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                在线咨询
              </button>
              <button
                onClick={() => scrollToSection('#contact')}
                className="w-full py-4 bg-brand-blue text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                免费咨询
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
