import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', email: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    { icon: Phone, label: '咨询热线', value: '400-888-8888' },
    { icon: Mail, label: '电子邮箱', value: 'info@bucalu.com' },
    { icon: MapPin, label: '公司地址', value: '广东省佛山市南海区' },
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 lg:py-32 w-full overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: Info */}
            <div 
              className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
            >
              <span className="inline-block px-4 py-2 bg-brand-blue/10 text-brand-blue text-sm font-medium rounded-full mb-6">
                联系我们
              </span>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-brand-black mb-6">
                开启您的定制之旅
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                无论您是新建项目还是旧窗改造，我们的专业团队都将为您提供最合适的门窗解决方案。
                立即联系我们，获取免费咨询服务。
              </p>

              {/* Contact info */}
              <div className="space-y-6 mb-8">
                {contactInfo.map((info, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${300 + index * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                      <info.icon className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">{info.label}</div>
                      <div className="text-lg font-medium text-brand-black">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Working hours */}
              <div 
                className={`p-6 bg-brand-light rounded-2xl transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <h3 className="text-lg font-semibold text-brand-black mb-3">工作时间</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>周一至周五</span>
                    <span>9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>周六</span>
                    <span>9:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>周日</span>
                    <span>休息</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div 
              className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            >
              <div className="bg-brand-light rounded-3xl p-8 lg:p-10">
                <h3 className="text-2xl font-semibold text-brand-black mb-6">
                  免费咨询
                </h3>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-brand-black mb-2">
                      提交成功
                    </h4>
                    <p className="text-gray-600">
                      我们的顾问将尽快与您联系
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">
                          您的姓名
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="请输入姓名"
                          required
                          className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-black mb-2">
                          联系电话
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="请输入电话"
                          required
                          className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-brand-blue"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">
                        电子邮箱
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="请输入邮箱"
                        className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-brand-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-brand-black mb-2">
                        咨询内容
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="请描述您的需求..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white border-0 rounded-xl focus:ring-2 focus:ring-brand-blue resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-4 bg-brand-blue text-white font-medium rounded-xl transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
                    >
                      提交咨询
                      <Send className="ml-2 w-5 h-5" />
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      提交即表示您同意我们的隐私政策，我们承诺保护您的个人信息安全
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
