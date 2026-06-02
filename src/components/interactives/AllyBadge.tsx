import { useEffect, useRef, useState } from "react";

const SIZE = 1080;
const CX = SIZE / 2;
const CY = 470; // photo sits a bit high to leave room for the caption
const RADIUS = 360;
const BG = "#f4f0e7";
const INK = "#231f1a";

type StyleKey = "spectrum" | "trans" | "progress";

const STYLES: { key: StyleKey; label: string }[] = [
  { key: "spectrum", label: "Φάσμα" },
  { key: "trans", label: "Τρανς" },
  { key: "progress", label: "Πρόοδος" },
];

const SPECTRUM = [
  "#e40303",
  "#ff8c00",
  "#ffed00",
  "#008026",
  "#004dff",
  "#750787",
];
const TRANS = ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"];
const PROGRESS_INNER = ["#000000", "#613915", "#5bcefa", "#f5a9b8", "#ffffff"];

// Stroke a full-circle ring split into equal colored arcs (slight overlap so no gaps show).
function drawRing(
  ctx: CanvasRenderingContext2D,
  radius: number,
  lineWidth: number,
  colors: string[],
) {
  const seg = (Math.PI * 2) / colors.length;
  const overlap = 0.01;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "butt";
  colors.forEach((c, i) => {
    ctx.beginPath();
    ctx.strokeStyle = c;
    ctx.arc(CX, CY, radius, i * seg - overlap, (i + 1) * seg + overlap);
    ctx.stroke();
  });
}

// Curved "WhyPride.gr" wordmark, laid along the bottom of the ring (reads
// left-to-right, upright at 6 o'clock). White, with a soft shadow so it stays
// legible over any ring colour.
function drawCurvedWordmark(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
) {
  ctx.save();
  ctx.font = "700 34px Helvetica, Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;

  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const totalAngle = widths.reduce((a, w) => a + w, 0) / radius;
  // Bottom centre is +PI/2; start at the left end and walk clockwise to the right.
  let angle = Math.PI / 2 + totalAngle / 2;
  chars.forEach((c, i) => {
    const a = angle - widths[i] / 2 / radius;
    ctx.save();
    ctx.translate(CX + radius * Math.cos(a), CY + radius * Math.sin(a));
    ctx.rotate(a - Math.PI / 2);
    ctx.fillText(c, 0, 0);
    ctx.restore();
    angle -= widths[i] / radius;
  });
  ctx.restore();
}

function drawSilhouette(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#d9d3c6";
  ctx.beginPath();
  ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b9b2a3";
  // head
  ctx.beginPath();
  ctx.arc(CX, CY - 70, 120, 0, Math.PI * 2);
  ctx.fill();
  // shoulders
  ctx.beginPath();
  ctx.arc(CX, CY + 280, 230, Math.PI, Math.PI * 2);
  ctx.fill();
}

function render(
  canvas: HTMLCanvasElement,
  style: StyleKey,
  bitmap: ImageBitmap | null,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // photo (circular cover-fit clip) or silhouette
  if (bitmap) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
    ctx.clip();
    const d = RADIUS * 2;
    const scale = Math.max(d / bitmap.width, d / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.drawImage(bitmap, CX - w / 2, CY - h / 2, w, h);
    ctx.restore();
  } else {
    drawSilhouette(ctx);
  }

  // pride ring(s)
  const ringWidth = 44;
  let wordmarkRadius = RADIUS + ringWidth / 2;
  if (style === "spectrum") {
    drawRing(ctx, RADIUS + ringWidth / 2, ringWidth, SPECTRUM);
  } else if (style === "trans") {
    drawRing(ctx, RADIUS + ringWidth / 2, ringWidth, TRANS);
  } else {
    wordmarkRadius = RADIUS + ringWidth / 2 + 22;
    drawRing(ctx, RADIUS + ringWidth / 2 + 22, ringWidth, SPECTRUM);
    drawRing(ctx, RADIUS + ringWidth / 2 - 18, 28, PROGRESS_INNER);
  }

  // Site wordmark, curved into the bottom of the ring.
  drawCurvedWordmark(ctx, "WhyPride.gr", wordmarkRadius);
}

export function AllyBadge({ onRestart }: { onRestart: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const [style, setStyle] = useState<StyleKey>("spectrum");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // redraw whenever the style changes (photo redraws are triggered on load)
  useEffect(() => {
    if (canvasRef.current) render(canvasRef.current, style, bitmapRef.current);
  }, [style, hasPhoto]);

  // close the decoded bitmap on unmount
  useEffect(() => {
    return () => bitmapRef.current?.close();
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      bitmapRef.current?.close();
      bitmapRef.current = bitmap;
      setHasPhoto(true); // triggers redraw via effect
    } catch {
      setError("Δεν μπόρεσα να διαβάσω αυτή την εικόνα. Δοκίμασε άλλη.");
    }
  }

  function toBlob(): Promise<Blob | null> {
    return new Promise((resolve) =>
      canvasRef.current?.toBlob((b) => resolve(b), "image/png"),
    );
  }

  async function download() {
    const blob = await toBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "whypride-ally-badge.png";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function share() {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], "whypride-ally-badge.png", {
      type: "image/png",
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Το Ally badge μου",
          text: "Έφτιαξα το ally badge μου στο WhyPride.gr",
        });
        return;
      } catch {
        /* user cancelled or share failed — fall through to download */
      }
    }
    void download();
  }

  return (
    <div className="reading-width">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
        Το badge σου
      </p>
      <h3 className="mt-3 font-display text-2xl md:text-3xl">
        Βάλε μια φωτογραφία και διάλεξε πλαίσιο.
      </h3>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label="Προεπισκόπηση του ally badge"
          className="w-full max-w-sm rounded-2xl border border-border bg-card"
        />

        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent">
            {hasPhoto ? "Άλλαξε φωτογραφία" : "Διάλεξε φωτογραφία"}
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className="sr-only"
            />
          </label>
          <p className="mt-3 text-sm text-muted-foreground">
            Η φωτογραφία μένει στη συσκευή σου και δεν ανεβαίνει πουθενά.
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <fieldset className="mt-8">
            <legend className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Πλαίσιο
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStyle(s.key)}
                  aria-pressed={style === s.key}
                  className={
                    "rounded-md border px-4 py-2 text-sm transition-colors " +
                    (style === s.key
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-ink")
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={download}
              disabled={!hasPhoto}
              className="rounded-md bg-ink px-6 py-3 text-sm uppercase tracking-[0.2em] text-paper transition-colors hover:bg-accent disabled:opacity-40"
            >
              Αποθήκευση
            </button>
            <button
              onClick={share}
              disabled={!hasPhoto}
              className="rounded-md border border-ink px-6 py-3 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
            >
              Μοιράσου
            </button>
            <button
              onClick={onRestart}
              className="rounded-md px-4 py-3 text-sm uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-ink"
            >
              ↺ Νέο τεστ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
