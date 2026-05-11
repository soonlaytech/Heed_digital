import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Phone,
  Globe,
  Wind,
  Eye,
  PenLine,
  HeartHandshake,
  ShieldAlert,
  BookOpen,
  Headphones,
  ArrowRight,
} from "lucide-react";

const HELPLINES = [
  {
    region: "India",
    name: "iCall",
    phone: "9152987821",
    hours: "Mon–Sat · 8am–10pm",
    web: "https://icallhelpline.org",
  },
  {
    region: "India",
    name: "AASRA",
    phone: "+91-9820466726",
    hours: "24 × 7",
    web: "http://www.aasra.info",
  },
  {
    region: "India",
    name: "Vandrevala Foundation",
    phone: "1860-2662-345",
    hours: "24 × 7",
    web: "https://www.vandrevalafoundation.com",
  },
  {
    region: "USA",
    name: "988 Suicide & Crisis Lifeline",
    phone: "988",
    hours: "24 × 7",
    web: "https://988lifeline.org",
  },
  {
    region: "UK & Ireland",
    name: "Samaritans",
    phone: "116 123",
    hours: "24 × 7",
    web: "https://www.samaritans.org",
  },
  {
    region: "Worldwide",
    name: "Befrienders Worldwide",
    phone: "—",
    hours: "Local helplines listed online",
    web: "https://befrienders.org",
  },
];

const COPING_CARDS = [
  {
    icon: Wind,
    title: "4-7-8 Breathing",
    body: "Breathe in for 4. Hold for 7. Breathe out slowly for 8. Repeat 4 cycles. Useful for racing thoughts or anxious chest.",
    cta: { label: "Try it now", href: "/breathe" },
  },
  {
    icon: Eye,
    title: "5-4-3-2-1 Grounding",
    body: "Name 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. Brings the mind back when it spirals.",
  },
  {
    icon: PenLine,
    title: "Two-minute Journal",
    body: "Write one sentence for each: What happened today? How did it feel? What's one thing I'll carry forward gently?",
  },
  {
    icon: HeartHandshake,
    title: "Permission to Pause",
    body: "Decide one thing on your list you'll let go of for the next hour. Rest is not earned — it's allowed.",
  },
];

const ARTICLES = [
  {
    title: "Why our bodies feel anxiety before our minds know why",
    source: "Harvard Health",
    url: "https://www.health.harvard.edu/staying-healthy/understanding-the-stress-response",
  },
  {
    title: "What loneliness does to the body — and what gently helps",
    source: "NIH / NIA",
    url: "https://www.nia.nih.gov/health/loneliness-and-social-isolation-tips-staying-connected",
  },
  {
    title: "Sleep, mood and small habits that actually work",
    source: "NHS",
    url: "https://www.nhs.uk/every-mind-matters/mental-health-issues/sleep/",
  },
];

export default function Resources() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-12 pb-32 md:pt-20">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">When things feel heavy</p>
          <h1 className="mt-1 font-display text-4xl font-bold text-foreground">Resources & care</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            HEED is a companion, not a replacement for professional help. If you ever feel unsafe, please reach
            out to a real human — the helplines below are confidential and trained to listen.
          </p>
        </header>

        <section className="rounded-3xl border border-red-200 bg-red-50/60 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-red-900">
                If you're in immediate danger
              </h2>
              <p className="mt-1 text-sm text-red-900/80">
                Please call your local emergency services or one of the 24×7 lines below. You don't have to find
                the right words — just dial. You matter.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Phone className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Helplines</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {HELPLINES.map((h) => (
              <div key={`${h.region}-${h.name}`} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{h.region}</span>
                  <span className="text-xs text-muted-foreground">{h.hours}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{h.name}</h3>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {h.phone !== "—" && (
                    <a
                      href={`tel:${h.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                    >
                      <Phone className="h-4 w-4" />
                      {h.phone}
                    </a>
                  )}
                  <a
                    href={h.web}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <HeartHandshake className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Coping techniques</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {COPING_CARDS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{c.body}</p>
                  {c.cta && (
                    <Link
                      href={c.cta.href}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      {c.cta.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <BookOpen className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Reading</h2>
          </div>
          <div className="grid gap-3">
            {ARTICLES.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 text-foreground">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{a.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.source}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 to-accent/5 p-6 text-center shadow-sm">
          <p className="mx-auto max-w-xl text-sm leading-7 text-foreground/80">
            HEED is a digital companion built with care, but it's not a therapist. If something feels too heavy to
            carry, talking to a professional is one of the bravest things you can do.
          </p>
        </section>
      </motion.div>
    </div>
  );
}
