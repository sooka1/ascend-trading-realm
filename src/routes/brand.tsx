import { createFileRoute } from "@tanstack/react-router";
import goldSquare from "@/assets/social/hk-social-gold-square.png";
import whiteSquare from "@/assets/social/hk-social-white-square.png";
import blackSquare from "@/assets/social/hk-social-black-square.png";
import goldCircle from "@/assets/social/hk-social-gold-circle.png";
import whiteCircle from "@/assets/social/hk-social-white-circle.png";
import blackCircle from "@/assets/social/hk-social-black-circle.png";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: "Brand Assets — HK Investment Management" },
      { name: "description", content: "Download HK Investment Management social profile logos in gold, white, and black — square and circular variants." },
    ],
  }),
  component: BrandPage,
});

const ASSETS = [
  { label: "Gold · Square", src: goldSquare, file: "hk-social-gold-square.png", shape: "square" as const },
  { label: "White · Square", src: whiteSquare, file: "hk-social-white-square.png", shape: "square" as const },
  { label: "Black · Square", src: blackSquare, file: "hk-social-black-square.png", shape: "square" as const },
  { label: "Gold · Circle", src: goldCircle, file: "hk-social-gold-circle.png", shape: "circle" as const },
  { label: "White · Circle", src: whiteCircle, file: "hk-social-white-circle.png", shape: "circle" as const },
  { label: "Black · Circle", src: blackCircle, file: "hk-social-black-circle.png", shape: "circle" as const },
];

function BrandPage() {
  return (
    <main className="container mx-auto px-6 py-24">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">Brand Assets</h1>
        <p className="mt-4 text-muted-foreground">
          Optimized 1024×1024 profile logos for social media. Right-click or use the download button to save.
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ASSETS.map((a) => (
          <figure key={a.file} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#0B1120]">
              <img
                src={a.src}
                alt={`HK Investment Management logo — ${a.label}`}
                width={1024}
                height={1024}
                loading="lazy"
                className={a.shape === "circle" ? "h-full w-full object-contain" : "h-full w-full object-cover"}
              />
            </div>
            <figcaption className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium">{a.label}</span>
              <a
                href={a.src}
                download={a.file}
                className="text-sm text-primary underline underline-offset-4"
              >
                Download
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}