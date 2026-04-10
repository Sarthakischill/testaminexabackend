import { AlertTriangle } from "lucide-react";

export default function WarningSection() {
  return (
    <section className="w-full bg-[#050505] border-y border-white/[0.05] py-16 md:py-20 relative overflow-hidden z-20">
      {/* Subtle ambient glow */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-900/5 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-8 items-start">
           
           {/* Left: Title & Icon */}
           <div className="flex flex-col gap-4 shrink-0 lg:w-5/12">
             <div className="flex items-center gap-3">
               <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                 <AlertTriangle className="w-4 h-4 text-red-400/80" />
               </div>
               <h4 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-white/90 text-lg md:text-xl font-normal tracking-wide">
                 Important Research Notice
               </h4>
             </div>
             <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-2" />
           </div>

           {/* Right: Copy */}
           <div className="flex flex-col gap-5 text-white/40 text-sm md:text-base leading-relaxed font-light lg:w-7/12" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              <p>
                <strong className="text-white/70 font-normal">Not for human consumption.</strong> This product is sold exclusively for research and educational purposes. It is not intended to diagnose, treat, cure, or prevent any disease.
              </p>
              <p>
                All clinical trial data and research findings presented on this page are sourced from peer-reviewed journals and official publications. They are provided for educational reference only and should not be interpreted as medical advice or product claims.
              </p>
              <p>
                By purchasing this product, you confirm that you are a qualified researcher and will use it in accordance with all applicable laws and regulations.
              </p>
           </div>
        </div>
      </div>
    </section>
  );
}
