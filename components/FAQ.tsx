"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export type FAQItem = { question: string; answer: string };

export const generalFaqs: FAQItem[] = [
  {
    question: "What purity level are your peptides and how is it verified?",
    answer: "AmiNexa mandates a minimum 99.4%+ optical purity for all compounds. Every batch is subjected to rigorous independent HPLC and LC-MS analysis. Certificates of Analysis (CoA) are available for cross-referencing in our portal."
  },
  {
    question: "What is a Certificate of Analysis (CoA) and how do I read it?",
    answer: "A CoA is a verified document from an independent testing facility detailing the exact purity and mass of the synthesized compound. It ensures the product is free from synthesis impurities, trifluoroacetic acid (TFA) salts, and heavy metals."
  },
  {
    question: "Where are your peptides manufactured?",
    answer: "Our peptides are manufactured in state-of-the-art European pharmaceutical facilities with ISO, HACCP, and GMP certifications."
  },
  {
    question: "How should I store peptides?",
    answer: "Lyophilized (freeze-dried) peptides should be stored in a freezer at -20°C for long-term stability. Once reconstituted with bacteriostatic water, they must be kept refrigerated at 2°C to 8°C and are typically stable for 2-6 weeks."
  },
  {
    question: "How fast do you ship and is cold shipping required?",
    answer: "Molecular stability demands protection. Every dispatch is packed in insulated cold-boxes with specialized ice packs to prevent thermal degradation during transit. We utilize expedited shipping networks to ensure rapid, temperature-controlled delivery."
  },
  {
    question: "Are these peptides for human use?",
    answer: "No. All AmiNexa products are sold strictly for laboratory research and educational purposes only. They are not intended for human consumption, diagnostic, or therapeutic procedures."
  }
];

export default function FAQ({ title = "Frequently Asked Questions", subtitle, faqs }: { title?: string, subtitle?: string, faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full bg-[#050505] py-24 md:py-32 relative z-20">
       <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
         <div className="flex flex-col items-center text-center mb-16 md:mb-24">
            <h3 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-[8vw] md:text-[6vw] lg:text-[5vw] font-normal tracking-[-0.04em] leading-[0.85] text-white mb-6">
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-lg md:text-xl text-white/60 font-light tracking-wide max-w-full lg:max-w-4xl">
                {subtitle}
              </p>
            )}
         </div>
         
         <div className="flex flex-col border-t border-white/10">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/10">
                <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)} 
                  className="w-full py-6 md:py-8 flex items-center justify-between text-left group"
                >
                  <span style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="text-xl md:text-2xl text-white/90 font-normal group-hover:text-white transition-colors pr-8 tracking-wide">
                    {faq.question}
                  </span>
                  <motion.div 
                    animate={{ rotate: openIndex === i ? 180 : 0 }} 
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} 
                    className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-300"
                  >
                    <ChevronDown className="w-5 h-5 text-white/50 group-hover:text-white" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
                      className="overflow-hidden"
                    >
                      <p style={{ fontFamily: 'Helvetica, Arial, sans-serif' }} className="pb-8 md:pb-10 text-base md:text-lg text-white/50 font-light leading-relaxed pr-12 max-w-5xl">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
         </div>
       </div>
    </section>
  )
}