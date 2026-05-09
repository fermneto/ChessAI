import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  produto: [
    { label: 'Recursos', href: '#features' },
    { label: 'Como funciona', href: '#how-it-works' },
    { label: 'Preços', href: '#pricing' },
    { label: 'Roadmap', href: '/roadmap' },
  ],
  empresa: [
    { label: 'Sobre nós', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Carreiras', href: '/careers' },
    { label: 'Contato', href: '/contact' },
  ],
  legal: [
    { label: 'Privacidade', href: '/privacy' },
    { label: 'Termos de uso', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/chessai', label: 'Twitter' },
  { icon: Github, href: 'https://github.com/chessai', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/chessai', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@chessai.app', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container-app py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <span className="font-semibold text-white text-lg">ChessAI</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              Transforme seu estudo de aberturas com análise de engine e IA
              pedagógica personalizada para seu estilo de jogo.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} className="text-neutral-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-label text-neutral-500 mb-4">Produto</h3>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-label text-neutral-500 mb-4">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-label text-neutral-500 mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} ChessAI. Todos os direitos reservados.
          </p>
          <p className="text-sm text-neutral-500">
            Feito com ♟ para jogadores de todos os níveis
          </p>
        </div>
      </div>
    </footer>
  );
}
