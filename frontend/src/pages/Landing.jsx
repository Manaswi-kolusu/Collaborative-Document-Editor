import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  FileText, ArrowRight, Play, Zap, History, Users, 
  ChevronRight, Check, Globe, Shield
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuthStore();

  // Typing animation for the mockup
  const [typedText, setTypedText] = useState('');
  const fullText = "Our primary objective is to increase collaborative velocity by 40% through integrated real-time editing.";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#202124] font-sans selection:bg-blue-100 overflow-x-hidden">

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e8eaed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-default">
              <div className="bg-blue-600 rounded-lg p-1.5">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-[#202124] tracking-tight">CollabDoc</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {['Product', 'Features', 'How it Works'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-[#5f6368] hover:text-[#202124] px-3 py-2 rounded-lg hover:bg-[#f1f3f4] transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-medium text-[#5f6368] hover:text-[#202124] px-3 py-2 transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative bg-gradient-to-b from-[#f0f4ff] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Copy */}
            <div className="max-w-lg">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#202124] leading-[1.1] tracking-tight mb-6">
                Real-time collaboration,{' '}
                <span className="text-[#202124]">simplified.</span>
              </h1>
              <p className="text-base sm:text-lg text-[#5f6368] leading-relaxed mb-8 max-w-md">
                The ultimate collaborative document editor for modern teams. Edit, comment, and sync in real-time with zero friction.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={user ? "/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-lg text-sm transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 group"
                >
                  Get Started for Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-white text-[#202124] font-semibold px-7 py-3.5 rounded-lg text-sm border border-[#dadce0] hover:bg-[#f8f9fa] transition-colors shadow-sm"
                >
                  <Play className="h-4 w-4 text-blue-600 fill-blue-600" />
                  Watch Demo
                </a>
              </div>
            </div>

            {/* Right: Browser Mockup */}
            <div className="relative lg:ml-auto w-full max-w-lg">
              <div className="bg-white rounded-xl border border-[#dadce0] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#f8f9fa] border-b border-[#e8eaed]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ea4335]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#fbbc04]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#34a853]"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white border border-[#dadce0] rounded-md px-3 py-1 text-[11px] text-[#5f6368] text-center font-mono">
                      collabdoc.app/documents
                    </div>
                  </div>
                </div>
                {/* App content */}
                <div className="p-6 sm:p-8 min-h-[220px]">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-600 rounded p-1">
                      <FileText className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-bold text-sm text-blue-600">CollabDoc</span>
                    <span className="text-[10px] text-[#9aa0a6] ml-auto">Real-time collaborative editor</span>
                  </div>
                  <div className="w-20 h-1 bg-[#e8eaed] rounded-full mb-5"></div>
                  <h3 className="text-lg font-bold text-[#202124] mb-3">Project Roadmap Q4</h3>
                  <p className="text-sm text-[#5f6368] leading-relaxed">
                    {typedText}
                    <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-middle"></span>
                  </p>
                  {/* Fake cursor label */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white text-[8px] text-white font-bold flex items-center justify-center">S</div>
                      <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white text-[8px] text-white font-bold flex items-center justify-center">A</div>
                    </div>
                    <span className="text-[10px] text-[#9aa0a6]">2 editing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUSTED BY ═══════════ */}
      <section className="border-y border-[#e8eaed] bg-[#fafbfc] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-[10px] font-bold text-[#9aa0a6] uppercase tracking-[0.2em] text-center mb-5">Trusted by teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {['CloudStrat', 'Pulse', 'Vertex', 'SyncIO', 'Novatek'].map((name, i) => (
              <div key={name} className="flex items-center gap-2 text-[#bdc1c6] select-none">
                <div className={`w-5 h-5 rounded ${i % 2 === 0 ? 'bg-[#dadce0]' : 'bg-[#e8eaed]'}`}></div>
                <span className="text-sm font-bold tracking-wide uppercase">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" className="py-20 sm:py-28 bg-[#f8f9fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] mb-4 tracking-tight">
              Everything you need to ship faster
            </h2>
            <p className="text-base text-[#5f6368] leading-relaxed">
              CollabDoc brings your entire team into a single flow with powerful features built for focus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Sync',
                desc: 'Experience lightning-fast updates across all devices, ensuring everyone is on the same page, always.',
                gradient: 'from-blue-500 to-cyan-500',
                bg: 'bg-blue-50',
              },
              {
                icon: History,
                title: 'Version History',
                desc: 'Track every single change and restore previous versions with ease. Never lose a brilliant idea again.',
                gradient: 'from-amber-500 to-orange-500',
                bg: 'bg-amber-50',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                desc: 'Work together seamlessly with live presence indicators and shared comments directly in the editor.',
                gradient: 'from-violet-500 to-purple-600',
                bg: 'bg-violet-50',
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-white rounded-2xl p-7 sm:p-8 border border-[#e8eaed] hover:shadow-lg hover:border-[#dadce0] transition-all group text-center"
              >
                <div className={`w-14 h-14 ${feat.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center`}>
                    <feat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#202124] mb-2">{feat.title}</h3>
                <p className="text-sm text-[#5f6368] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Steps */}
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#202124] leading-tight mb-10 tracking-tight">
                Go from idea to<br />published in three<br />easy steps.
              </h2>

              <div className="space-y-8">
                {[
                  {
                    num: '1',
                    title: 'Create & Draft',
                    desc: 'Start with a blank canvas. Focus on writing with our distraction-free interface.',
                  },
                  {
                    num: '2',
                    title: 'Invite & Collaborate',
                    desc: 'Share a link with your team. Watch as edits happen live and provide feedback in real-time.',
                  },
                  {
                    num: '3',
                    title: 'Sync & Deploy',
                    desc: 'Finalize your work. Your document is automatically synced across all your tools and devices.',
                  },
                ].map((step, idx) => (
                  <div key={step.num} className="flex gap-4 items-start group">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                      {step.num}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-base font-bold text-[#202124] mb-1">{step.title}</h3>
                      <p className="text-sm text-[#5f6368] leading-relaxed max-w-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Mini Editor Mockup */}
            <div className="bg-[#f8f9fa] rounded-2xl border border-[#e8eaed] p-6 sm:p-8 shadow-sm">
              {/* Fake toolbar */}
              <div className="flex items-center gap-1.5 mb-5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ea4335]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#fbbc04]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34a853]"></div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-[7px] text-white font-bold flex items-center justify-center">M</div>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-[7px] text-white font-bold flex items-center justify-center">J</div>
                </div>
              </div>
              {/* Fake document */}
              <div className="bg-white rounded-lg border border-[#dadce0] p-5 sm:p-6 min-h-[280px]">
                <div className="w-24 h-1.5 bg-[#e8eaed] rounded-full mb-4"></div>
                <div className="w-48 h-2 bg-[#e8eaed] rounded-full mb-3"></div>
                <div className="w-full h-1.5 bg-[#f1f3f4] rounded-full mb-2"></div>
                <div className="w-4/5 h-1.5 bg-[#f1f3f4] rounded-full mb-2"></div>
                <div className="w-3/5 h-1.5 bg-[#f1f3f4] rounded-full mb-6"></div>
                
                <div className="w-36 h-2 bg-[#e8eaed] rounded-full mb-3"></div>
                <div className="w-full h-1.5 bg-[#f1f3f4] rounded-full mb-2"></div>
                <div className="w-11/12 h-1.5 bg-[#f1f3f4] rounded-full mb-2"></div>
                <div className="w-2/3 h-1.5 bg-[#f1f3f4] rounded-full mb-6"></div>

                {/* Typing cursor */}
                <div className="flex items-center gap-1.5 mt-4">
                  <div className="w-0.5 h-4 bg-blue-500 animate-pulse"></div>
                  <div className="bg-blue-500 text-[8px] text-white font-bold px-1.5 py-0.5 rounded shadow-sm">
                    You're editing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-blue-600 rounded-3xl px-8 sm:px-16 py-14 sm:py-16 text-center shadow-xl shadow-blue-600/15 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-blue-500/30 blur-3xl"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-indigo-500/30 blur-3xl"></div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 relative z-10 tracking-tight">
            Ready to streamline your workflow?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-lg mx-auto relative z-10">
            Join thousands of teams already creating better documents together.
          </p>
          <Link
            to={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3.5 rounded-full text-sm hover:bg-blue-50 transition-colors shadow-lg relative z-10 group"
          >
            Join CollabDoc Today
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-blue-200 text-xs mt-4 relative z-10">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-[#e8eaed] bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-sm text-[#202124]">CollabDoc</span>
            <span className="text-xs text-[#9aa0a6] ml-1">© {new Date().getFullYear()} CollabDoc Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Security'].map((link) => (
              <a key={link} href="#" className="text-xs text-[#5f6368] hover:text-[#202124] transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
