import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LegalSection {
  title: string;
  content: (string | string[])[];
}

interface LegalPageProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  sections: LegalSection[];
  contactEmail?: string;
}

export default function LegalPage({ title, subtitle, lastUpdated, sections, contactEmail = "contact@aminexa.net" }: LegalPageProps) {
  return (
    <main className="relative min-h-screen w-full bg-[#050505] text-white font-sans">
      <Navbar />

      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 pt-32 pb-32">
        <div className="max-w-3xl mx-auto">

          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-16 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xs font-medium tracking-[0.1em] uppercase">Home</span>
          </Link>

          {/* Header */}
          <div className="mb-16 md:mb-20">
            {lastUpdated && (
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-4">
                Last Updated: {lastUpdated}
              </p>
            )}
            <h1 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white mb-6">
              {title}
            </h1>
            {subtitle && (
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/50 font-light leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
            <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-10" />
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-14 md:gap-16">
            {sections.map((section, idx) => (
              <div key={idx}>
                <h2 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl md:text-2xl font-normal tracking-tight text-white mb-6">
                  {section.title}
                </h2>
                <div className="flex flex-col gap-4">
                  {section.content.map((item, i) => {
                    if (Array.isArray(item)) {
                      return (
                        <ul key={i} className="flex flex-col gap-2.5 pl-5">
                          {item.map((bullet, j) => (
                            <li key={j} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm md:text-base text-white/50 font-light leading-relaxed list-disc marker:text-white/20">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    const isAllCaps = item === item.toUpperCase() && item.length > 50;
                    return (
                      <p key={i} style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className={`text-sm md:text-base font-light leading-relaxed ${isAllCaps ? 'text-white/60' : 'text-white/50'}`}>
                        {item}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-20 pt-10 border-t border-white/10">
            <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-sm text-white/40 font-light">
              Questions? Contact us at{" "}
              <a href={`mailto:${contactEmail}`} className="text-white/70 hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
                {contactEmail}
              </a>
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
