import type { Parallel } from "@/content/parallels";

// Decorative ticker bulletins (period flavour, intentionally blurred as texture).
const TICKER = [
  [
    "By Wire",
    "Marconi House to commence regular wireless concerts this autumn",
  ],
  ["Shipping", "Atlantic liner docks at Southampton, six days from New York"],
  ["The City", "The Pound stands firm upon the Exchange at week's close"],
  ["Cricket", "Test Match — England 312 for 7 at the drawing of stumps"],
  ["Weather", "Fair and bright over the southern counties; sea moderate"],
];

function CiteFootnote({
  label,
  cite,
}: {
  label: string;
  cite: NonNullable<Parallel["source"]>;
}) {
  return (
    <div>
      <b>{label}.</b> {cite.note}
      {cite.links?.map((l) => (
        <span key={l.url}>
          {" "}
          <a href={l.url} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
          .
        </span>
      ))}
    </div>
  );
}

/**
 * The expanded historical parallel rendered as a 1922 "Telegraph Daily News"
 * sheet. The centre column carries the real story (Τότε / Σήμερα / πηγές); the
 * side columns keep period filler, blurred so it reads as newsprint texture
 * rather than content anyone is meant to read.
 */
export function TelegraphSheet({ parallel }: { parallel: Parallel }) {
  return (
    <article className="telegraph">
      <div className="frame">
        {/* Masthead */}
        <div className="top-strap">
          <div className="strap-l">
            <span className="tg-blur">Latest News from Around the World</span>
          </div>
          <div className="strap-r tg-blur">
            One of the World's Great Newspapers
          </div>
        </div>

        <div className="nameplate">
          <h1 className="left">Telegraph</h1>
          <div
            className="crest-main engraving eng-arch"
            style={{
              margin: 0,
              width: "clamp(60px,12vw,104px)",
              height: "auto",
              aspectRatio: "1 / 1.12",
              borderWidth: 2,
            }}
            aria-hidden="true"
          >
            <span className="tag">CREST</span>
          </div>
          <h1 className="right">Daily News</h1>
        </div>

        <hr className="rule" />

        {/* Info bar — the date cell carries the real era */}
        <div className="infobar">
          <div className="cell sc grow tg-blur">News Worldwide Since 1885</div>
          <div className="cell sc tg-blur">
            Received by
            <br />
            Telegraph
          </div>
          <div className="cell grow tg-blur">Sunday Morning</div>
          <div className="cell">{parallel.era}</div>
          <div className="cell tg-blur">CC</div>
          <div className="cell tg-blur">XXXVII</div>
          <div className="cell tg-blur">0.12&nbsp;$</div>
        </div>

        {/* Ticker (blurred texture) */}
        <div className="ticker" aria-hidden="true">
          <div className="label">Stop&nbsp;Press</div>
          <div className="track-wrap">
            <div className="track tg-blur">
              {[0, 1].flatMap((run) =>
                TICKER.map(([k, t], i) => (
                  <span className="item" key={`${run}-${i}`}>
                    <b>{k}:</b> {t}
                    <span className="sep" />
                  </span>
                )),
              )}
            </div>
          </div>
        </div>

        {/* Body grid */}
        <div className="tg-grid">
          {/* Left column — period filler, blurred as one layer */}
          <section className="col col-left tg-blur" aria-hidden="true">
            <div className="kicker">
              <span className="lead">From the Provinces</span>The Open Road
            </div>
            <div className="engraving eng-circle">
              <span className="tag">
                BICYCLE
                <br />
                WHEEL
              </span>
            </div>
            <p className="subhead">
              Motor-cars and cycles throng the highways as never before, and the
              country inns rejoice.
            </p>
            <p className="body dropcap">
              Reports reach this office from every county that the public roads
              have not, in living memory, carried so great a multitude of
              travellers. The bicycle, once the diversion of the few, is now the
              faithful companion of the many; while the motor-car, no longer a
              curiosity to frighten the parson's mare, may be met upon the
              meanest country lane.
            </p>
            <p className="body">
              Our correspondent at Guildford writes that upon Saturday last he
              counted upward of two hundred machines pass the old toll-house
              between the hours of nine and noon. The fine weather, he adds, has
              emboldened even the timid to venture far afield.
            </p>
          </section>

          {/* Centre column — the real story */}
          <section className="col col-center">
            <div className="engraving eng-hero" aria-hidden="true">
              <span className="tag">ΕΙΚΟΝΑ</span>
            </div>
            <div className="kicker">
              <span className="lead">Τότε</span>
              {parallel.against}
            </div>
            <p
              className="subhead"
              style={{
                textAlign: "center",
                fontSize: "clamp(13px,1.9vw,17px)",
                textTransform: "none",
              }}
            >
              {parallel.quote}
            </p>

            <hr className="rule thin" />

            <div
              className="kicker"
              style={{
                fontSize: "clamp(15px,2.2vw,22px)",
                letterSpacing: ".05em",
              }}
            >
              Σήμερα
            </div>
            <p
              className="body center"
              style={{ fontSize: "clamp(12px,1.7vw,15px)" }}
            >
              {parallel.modern}
            </p>

            {(parallel.source || parallel.greek) && (
              <div className="footnotes">
                {parallel.source && (
                  <CiteFootnote label="Ιστορικά" cite={parallel.source} />
                )}
                {parallel.greek && (
                  <CiteFootnote label="Ελλάδα, σήμερα" cite={parallel.greek} />
                )}
              </div>
            )}
          </section>

          {/* Right column — period filler, blurred as one layer */}
          <section className="col col-right tg-blur" aria-hidden="true">
            <h2 className="head">
              Wireless
              <br />
              for the
              <br />
              Home
            </h2>
            <p className="body" style={{ marginTop: 8 }}>
              It is now confidently stated that concerts and the reading of the
              day's intelligence shall, before the year is out, be carried upon
              the wireless to any parlour fitted with a receiving set. The
              experiments lately conducted from the masts at the river have been
              heard at a distance of full two hundred miles.
            </p>
            <hr className="rule thin" />
            <h2 className="head" style={{ fontSize: 32 }}>
              Call the
              <br />
              Exchange
            </h2>
            <div className="engraving eng-arch">
              <span className="tag">№&nbsp;123</span>
            </div>
            <p className="body">
              The new automatic exchange, the pride of the borough, now joins
              eleven thousand subscribers without the labour of an operator.
              Patrons are begged to speak slowly and distinctly into the
              instrument.
            </p>
          </section>
        </div>

        {/* Footer ornament */}
        <div className="sheet-foot" aria-hidden="true">
          <div className="ln" />
          <svg
            className="shield"
            viewBox="0 0 26 30"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
          >
            <path d="M13 1l11 3v11c0 8-6 12-11 14C8 27 2 23 2 15V4z" />
            <path d="M13 6v18M6 11h14" />
          </svg>
          <div className="ln" />
        </div>
      </div>
    </article>
  );
}
