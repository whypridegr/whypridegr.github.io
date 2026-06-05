import { useEffect, useRef, useState } from "react";
import type { Challenge } from "@/components/sections/challengeRegistry";
import { cn } from "@/lib/utils";

export function DeckScene({
  challenge,
  variant,
  interactive,
  onEngage,
}: {
  challenge: Challenge;
  /** desktop scaling scene vs mobile single-stage (affects layout only). */
  variant: "scroll" | "swipe";
  /** whether the interactive should be interactive (near-fullscreen / active). */
  interactive: boolean;
  onEngage: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(variant === "swipe");

  // Mount the heavy interactive the first time it nears the viewport, then keep
  // it mounted — unmounting would reset the challenge's local state and can
  // flash on remount. IO here is a one-shot mount trigger.
  useEffect(() => {
    if (variant !== "scroll" || mounted) return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "75% 0px 75% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [variant, mounted]);

  // First real interaction inside the challenge marks it done.
  useEffect(() => {
    const node = ref.current;
    if (!node || !interactive) return;
    const onInteract = (e: Event) => {
      if (e.type === "keydown") {
        const k = (e as KeyboardEvent).key;
        if (k !== "Enter" && k !== " " && k !== "Spacebar") return;
      }
      onEngage(challenge.id);
      node.removeEventListener("pointerdown", onInteract);
      node.removeEventListener("keydown", onInteract);
      node.removeEventListener("change", onInteract);
    };
    node.addEventListener("pointerdown", onInteract);
    node.addEventListener("keydown", onInteract);
    node.addEventListener("change", onInteract);
    return () => {
      node.removeEventListener("pointerdown", onInteract);
      node.removeEventListener("keydown", onInteract);
      node.removeEventListener("change", onInteract);
    };
  }, [interactive, challenge.id, onEngage]);

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full flex-col items-center text-center",
        !interactive && "pointer-events-none select-none",
      )}
    >
      <p className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
        {challenge.label}
      </p>
      <h2 className="mt-3 font-display text-3xl md:text-5xl leading-tight reading-width">
        {challenge.title}
      </h2>
      <div className="mt-8 w-full text-left">
        {mounted ? challenge.render() : <div aria-hidden className="min-h-[40vh]" />}
      </div>
    </div>
  );
}
