import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const footerLinks = {
  explorar: [
    { label: 'Início', href: '/' },
    { label: 'Explorar Aberturas', href: '/explore' },
    { label: 'Treinar Repertório', href: '/train' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
};

const socialLinks = [
  { 
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-4.51-2-7-2" />
      </svg>
    ), 
    href: 'https://github.com/fermneto/ChessAI', 
    label: 'GitHub' 
  },
  { 
    icon: (props: any) => (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ), 
    href: 'https://www.linkedin.com/in/fjmn/', 
    label: 'LinkedIn' 
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-white border-t border-white/5 pt-20 pb-12 relative overflow-hidden">
      {/* Background Glow Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-app relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-3">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-white text-2xl tracking-tighter">ChessAI</span>
            </Link>
            
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md mb-8">
              Transforme seu estudo de aberturas com análise de engine e IA pedagógica. 
              Este é um projeto <span className="text-white font-semibold">Open Source</span> feito para a comunidade.
            </p>

            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 border border-white/10 hover:border-blue-500/50 group"
                >
                  <Icon className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-start-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-neutral-600 mb-8">Plataforma</h3>
            <ul className="space-y-4">
              {footerLinks.explorar.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-neutral-400 hover:text-white transition-all flex items-center group relative"
                  >
                    <ChevronRight 
                      size={12} 
                      className="absolute -left-4 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 text-blue-500" 
                    />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-neutral-500 font-medium">
            © {new Date().getFullYear()} ChessAI. Licença MIT.
          </p>
          
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <span>Feito com</span>
            <span className="text-blue-500 animate-pulse">♟</span>
            <span>para a comunidade</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
