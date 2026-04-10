import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="w-full flex flex-col">
      <footer className="relative w-full bg-[#050505] pt-20 pb-10 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[80vw] h-[50vh] max-w-[800px] bg-cyan-900/5 blur-[120px] pointer-events-none rounded-tl-full" />
        
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
          
          <div className="flex flex-col xl:flex-row gap-16 xl:gap-8 mb-20">
            
            <div className="xl:w-5/12 flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
              <Link href="/" className="relative w-40 h-10 shrink-0 transition-opacity hover:opacity-70 duration-500">
                <Image 
                  src="https://imagedelivery.net/uVeQjPq2FGwRQ4qZs2ijJg/Logos/AmiNexa/AmiNexa_full_logo_white.png/public" 
                  alt="AmiNexa" 
                  fill
                  sizes="160px" 
                  className="object-contain object-left"
                  loading="lazy"
                />
              </Link>
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 text-sm md:text-base leading-relaxed font-light max-w-sm tracking-tight">
                Premium research-grade peptides for optimal controlled studies and performance. Third-party tested with Certificate of Analysis. For research and laboratory use only.
              </p>
            </div>

            <div className="xl:w-7/12 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
              
              <div className="flex flex-col gap-6">
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/90 text-base md:text-lg font-normal tracking-wide">Shop</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Product Catalog", href: "/portal" },
                    { label: "Science Library", href: "/portal/science" },
                    { label: "Bulk Procurement", href: "/contact" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 hover:text-blue-400 transition-colors duration-300 text-sm md:text-base font-light tracking-tight w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/90 text-base md:text-lg font-normal tracking-wide">Resources</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Certificates of Analysis", href: "/portal#coa" },
                    { label: "Returns & Refunds", href: "/returns" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 hover:text-blue-400 transition-colors duration-300 text-sm md:text-base font-light tracking-tight w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/90 text-base md:text-lg font-normal tracking-wide">Support</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Contact Us", href: "/contact" },
                    { label: "FAQ", href: "/contact" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 hover:text-blue-400 transition-colors duration-300 text-sm md:text-base font-light tracking-tight w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/90 text-base md:text-lg font-normal tracking-wide">Legal</h4>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Disclaimer", href: "/disclaimer" },
                  ].map((link) => (
                    <Link key={link.label} href={link.href} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/50 hover:text-blue-400 transition-colors duration-300 text-sm md:text-base font-light tracking-tight w-fit">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-white/30 font-bold tracking-[0.2em] uppercase" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            <p>© 2026 AmiNexa. All rights reserved.</p>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
               <p>Engineered in Munich, DE.</p>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
