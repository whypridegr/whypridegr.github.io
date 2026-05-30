import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Parallel } from "@/content/parallels";
import { parallels } from "@/content/parallels";
import { Popover } from "@/components/primitives/Popover";
import { CiteList } from "@/components/primitives/CiteList";

const TILTS = [-0.7, 0.5, -0.4];

export function HistoricalParallels() {
  return (
    <div className="newsprint mx-auto max-w-2xl space-y-16">
      {parallels.map((p, i) => (
        <Clipping key={i} parallel={p} tilt={TILTS[i % TILTS.length]} />
      ))}
    </div>
  );
}

function Clipping({ parallel, tilt }: { parallel: Parallel; tilt: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        transform: `rotate(${tilt}deg)`,
        filter: "drop-shadow(0 12px 16px rgba(40,30,15,0.22))",
      }}
    >
      <article className="paper torn-bottom px-6 pb-10 pt-6 md:px-10 md:pb-12 md:pt-8">
        {/* dateline / masthead */}
        <div className="flex items-center justify-between border-b border-[#c3b79b] pb-2 font-sans text-[0.66rem] uppercase tracking-[0.22em] text-[#7d7257]">
          <div className="flex items-center gap-2">
            Τότε
            {parallel.source && (
              <Popover
                label="ⓘ"
                ariaLabel="Ιστορική πηγή"
                align="start"
                triggerClassName="no-underline text-[#9b3520]"
              >
                <CiteList cite={parallel.source} />
              </Popover>
            )}
          </div>
          <span>{parallel.era}</span>
        </div>

        {/* headline + lead */}
        <h4 className="mt-4 text-xl font-bold uppercase leading-tight tracking-tight">
          {parallel.against}
        </h4>
        <blockquote className="mt-3 text-2xl leading-snug md:text-[1.7rem]">
          {parallel.quote}
        </blockquote>

        {!open && (
          <button
            onClick={() => setOpen(true)}
            aria-expanded={open}
            className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-[#9b3520] transition-opacity hover:opacity-70"
          >
            Ξεδίπλωσε το σήμερα
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              className="overflow-hidden"
              style={{ perspective: 900 }}
            >
              <motion.div
                initial={{ rotateX: -88, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                style={{ transformOrigin: "top center" }}
                className="mt-6 border-t border-dashed border-[#b3a684] pt-4"
              >
                <span className="font-sans text-[0.66rem] uppercase tracking-[0.22em] text-[#9b3520]">
                  Σήμερα
                </span>
                <p className="mt-2 text-xl leading-relaxed md:text-2xl">
                  {parallel.modern}
                </p>
                {parallel.greek && (
                  <div className="mt-4 flex items-center gap-2 font-sans text-[0.66rem] uppercase tracking-[0.22em] text-[#7d7257]">
                    Ελλάδα, σήμερα
                    <Popover
                      label="ⓘ"
                      ariaLabel="Σύγχρονη ελληνική πηγή"
                      align="start"
                      triggerClassName="no-underline text-[#9b3520]"
                    >
                      <CiteList cite={parallel.greek} />
                    </Popover>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </div>
  );
}
