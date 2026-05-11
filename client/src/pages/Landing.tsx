import { useState } from "react";
import { Link } from "wouter";
import { ChatWidget } from "@/components/ChatWidget";

const TRUST_CHIPS = [
  "Chat-first support",
  "Private conversation history",
  "Behavior-aware nudges",
  "Built with care for wellbeing",
];

const STATS = [
  { n: "61", pc: "%", l: "of students living alone report frequent loneliness" },
  { n: "3", pc: "×", l: "higher stress reported during exam & work cycles" },
  { n: "24", pc: "/7", l: "HEED is here — no waiting, no judgement" },
  { n: "100", pc: "%", l: "private — your conversations stay yours" },
];

type Feature = {
  title: string;
  body: string;
  more: string;
  href: string;
  icon: JSX.Element;
};

const FEATURES: Feature[] = [
  {
    title: "Conversational support",
    body: "Talk to HEED like a friend. Natural language, warm tone, and follow-ups that actually remember what you said yesterday.",
    more: "Try a conversation",
    href: "/chat",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    title: "Emotional check-ins",
    body: "Short mood prompts that adapt to your week. HEED notices patterns — and gently asks when something feels off.",
    more: "See mood flow",
    href: "/insights",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: "Guided breathing",
    body: "4-7-8, Box, and Resonant breathing — animated and gentle. The fastest reset when the body's faster than the mind.",
    more: "Try breathing",
    href: "/breathe",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Crisis & care resources",
    body: "Region-aware helplines, grounding techniques, and curated articles — surfaced when you need them, not buried.",
    more: "Open resources",
    href: "/resources",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: "Goals & rhythm",
    body: "A flexible daily rhythm for sleep, meals, study, and breaks — built around your life, not a generic template.",
    more: "Open goals",
    href: "/goals",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-7" />
      </svg>
    ),
  },
  {
    title: "Private by design",
    body: "Your conversations live in your space. Stored privately, never sold, never used to train external models.",
    more: "Read privacy",
    href: "/settings",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    num: "01",
    title: "Talk, don't fill forms",
    body: "HEED opens with a short, warm conversation. It learns what your days look like — and what's hardest right now.",
    demo: [
      { tag: "Day 1", text: "understand the user, not a profile" },
      { tag: "~3 min", text: "typical onboarding chat" },
    ],
  },
  {
    num: "02",
    title: "Notice patterns gently",
    body: "Sleep slipping? Skipped lunch three days in a row? HEED's behavior layer notices — without making you feel watched.",
    demo: [
      { tag: "Week 1", text: "quiet signals across sleep, meals, mood" },
      { tag: "Adaptive", text: "nudges only when they'll actually help" },
    ],
  },
  {
    num: "03",
    title: "Support, not surveillance",
    body: "You stay in charge. Mute topics, change tone, pause check-ins, delete history. HEED is yours to shape.",
    demo: [
      { tag: "Always", text: "one tap to pause or export" },
      { tag: "You decide", text: "tone, frequency, what to share" },
    ],
  },
];

const PERSONAS = [
  {
    letter: "M",
    bg: "linear-gradient(160deg,#16955A,#0A5829)",
    color: "#fff",
    title: "Measured — like a therapist",
    line: "“Let's slow down for a moment. What part of today felt heaviest?”",
  },
  {
    letter: "W",
    bg: "linear-gradient(160deg,#E29A4C,#B66E1D)",
    color: "#fff",
    title: "Warm — like a close friend",
    line: "“Hey, you doing okay? I noticed you haven't eaten yet — want to figure out something easy together?”",
  },
  {
    letter: "C",
    bg: "linear-gradient(160deg,#4C6BE2,#1F3FB6)",
    color: "#fff",
    title: "Coach — gently structured",
    line: "“Three things for tomorrow morning: water, a real breakfast, and a 10-min walk. I'll check in at 9.”",
  },
  {
    letter: "N",
    bg: "linear-gradient(160deg,#7E5AE0,#4B2DAA)",
    color: "#fff",
    title: "Neutral — quietly useful",
    line: "“Logged. Sleep window: 11:20pm. Want a reminder to wind down at 10:45 tomorrow?”",
  },
];

const FAQS = [
  {
    q: "Is HEED a replacement for therapy?",
    a: "No. HEED is a supportive companion for everyday wellbeing — routine, mood, meals, sleep — and it will always point you to professional care when something needs it. It's a quiet friend, not a clinician.",
  },
  {
    q: "How is my data handled?",
    a: "Conversations are stored privately, scoped to your account, and never used to train external models. You can export or wipe everything from settings, anytime.",
  },
  {
    q: "Does HEED really learn my patterns?",
    a: "Yes — softly. HEED uses what you share in chat plus optional signals (sleep window, meal timings, check-in mood) to surface patterns. You stay in charge of what's tracked.",
  },
  {
    q: "Can I change HEED's tone?",
    a: "Anytime. Pick from Measured, Warm, Coach, or Neutral — or just tell HEED “be gentler today” and it will adjust on the fly.",
  },
  {
    q: "What platforms is HEED on?",
    a: "Web and mobile (PWA) at launch. Native iOS and Android apps are in build — join the early-access list for an invite.",
  },
  {
    q: "Is HEED free?",
    a: "The core companion experience is free during the project pilot. A future Plus tier will add longer memory and richer insights — opt-in only.",
  },
];

const SparkIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5l1.8 5.7L19.5 10l-5.7 1.8L12 17.5l-1.8-5.7L4.5 10l5.7-1.8L12 2.5z" />
    <path d="M19 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" opacity=".7" />
  </svg>
);

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <style>{LANDING_CSS}</style>
      <div className="heed-landing">
        <nav className="top">
          <div className="wrap row between" style={{ height: 76 }}>
            <Link href="/" className="brand">
              <div className="brand-mark" aria-hidden="true">
                <SparkIcon />
              </div>
              <div>
                <div className="brand-name">HEED</div>
                <div className="brand-tag">Your digital companion</div>
              </div>
            </Link>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#project">Project</a>
              <a href="#companion">Companion</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="nav-cta">
              <Link href="/signin" className="btn btn-ghost" style={{ padding: "10px 20px", fontSize: 14.5 }}>
                Sign in
              </Link>
              <Link href="/signin" className="btn btn-primary" style={{ padding: "10px 20px", fontSize: 14.5 }}>
                Get started
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div className="grid">
              <div>
                <span className="pill">
                  <span className="dot" /> AI support for independent living
                </span>
                <h1 className="hero-title">
                  A <span className="accent">quiet</span> companion for this fast-paced world.
                </h1>
                <p className="lede">
                  HEED helps students and young professionals living independently manage{" "}
                  <b>loneliness, stress, sleep, meals,</b> and <b>productivity</b> — through friendly
                  conversations, behavior awareness, and supportive nudges.
                </p>

                <div className="cta-row">
                  <Link href="/signin" className="btn btn-primary btn-lg">
                    Start with HEED
                    <ArrowRight size={16} />
                  </Link>
                  <a href="#features" className="btn btn-white btn-lg">Learn more</a>
                </div>

                <div className="trust-chips">
                  {TRUST_CHIPS.map((chip) => (
                    <span key={chip} className="chip">
                      <span className="check"><CheckIcon /></span>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chat preview card */}
              <div className="chat-card">
                <div className="chat-head">
                  <div className="ava">
                    <SparkIcon size={22} />
                  </div>
                  <div>
                    <h3>HEED Companion</h3>
                    <p>A calm, friendly place to talk</p>
                  </div>
                  <span className="status-dot">Online</span>
                </div>

                <div className="msgs">
                  <div className="msg bot">
                    <div className="ava ava-sm"><SparkIcon size={16} /></div>
                    <div className="bubble">Hey, I'm <b>HEED</b>. Want to talk about your day, or sketch a plan for tomorrow together?</div>
                  </div>
                  <div className="msg user">
                    <div className="ava ava-sm user">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
                      </svg>
                    </div>
                    <div className="bubble">I've been feeling really overwhelmed lately. Skipped dinner again.</div>
                  </div>
                  <div className="msg bot">
                    <div className="ava ava-sm"><SparkIcon size={16} /></div>
                    <div className="bubble">Thanks for telling me. Let's slow down together — one small next step. Want to plan a quick 15-min dinner, or just talk?</div>
                  </div>
                  <div className="msg bot">
                    <div className="ava ava-sm"><SparkIcon size={16} /></div>
                    <div className="typing" aria-label="HEED is typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>

                <div className="quick-replies">
                  <Link href="/chat" className="qr">Plan a quick dinner</Link>
                  <Link href="/chat" className="qr">Just want to vent</Link>
                  <Link href="/breathe" className="qr">Help me breathe</Link>
                </div>

                <div className="chat-foot">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Conversations are stored privately so HEED can keep supporting your journey over time.
                </div>

                <Link href="/chat" className="composer" aria-label="Open chat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  <span className="composer-input">Tell HEED how you're feeling…</span>
                  <span className="send" aria-label="Send">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Stats strip */}
            <div className="stats">
              <div className="stats-row">
                {STATS.map((s) => (
                  <div key={s.l} className="stat">
                    <div className="n">{s.n}<span className="pc">{s.pc}</span></div>
                    <div className="l">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="block features" id="features">
          <div className="wrap">
            <span className="eyebrow">Features</span>
            <h2 className="section-title">
              More than reminders — a companion that <em>listens, learns,</em> and gently nudges.
            </h2>
            <p className="section-lede">
              HEED blends conversational AI, behavior monitoring, and routine management into one calm space — so
              you feel heard, not nagged.
            </p>

            <div className="feat-grid">
              {FEATURES.map((feature) => (
                <Link key={feature.title} href={feature.href} className="feat">
                  <div className="ico">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                  <div className="more">
                    {feature.more} <ArrowRight />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECT / HOW IT WORKS */}
        <section className="block project" id="project">
          <div className="wrap">
            <span className="eyebrow">How HEED works</span>
            <h2 className="section-title">Three quiet steps from <em>overwhelmed</em> to in-rhythm.</h2>
            <p className="section-lede">
              No long forms, no clinical scales. Just an honest conversation, an adaptive plan, and a companion
              that shows up.
            </p>

            <div className="steps">
              {STEPS.map((step) => (
                <div key={step.num} className="step">
                  <div className="num">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  <div className="demo">
                    {step.demo.map((d) => (
                      <div key={d.tag} className="demo-row">
                        <span className="tag">{d.tag}</span>
                        <span>{d.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPANION PERSONALITIES */}
        <section className="block companion" id="companion">
          <div className="wrap">
            <div className="comp-wrap">
              <div>
                <span className="eyebrow">The companion</span>
                <h2 className="section-title">Pick a tone that <em>feels like you.</em></h2>
                <p className="section-lede">
                  HEED adapts to how you prefer to be supported — from a calm, measured therapist-voice to a
                  warm best-friend energy. Switch any time.
                </p>
                <div className="cta-row" style={{ marginTop: 32 }}>
                  <Link href="/chat" className="btn btn-primary">
                    Meet your HEED <ArrowRight />
                  </Link>
                  <Link href="/breathe" className="btn btn-white">
                    Try breathing first
                  </Link>
                </div>
              </div>
              <div className="persona-stack">
                {PERSONAS.map((p) => (
                  <div key={p.letter} className="persona">
                    <div className="pavatar" style={{ background: p.bg, color: p.color }}>{p.letter}</div>
                    <div>
                      <h4>{p.title}</h4>
                      <p>{p.line}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TOOLS — links to the actual feature pages */}
        <section className="block tools" id="tools">
          <div className="wrap">
            <span className="eyebrow">Inside HEED</span>
            <h2 className="section-title">Tools that show up when <em>you need them.</em></h2>
            <p className="section-lede">
              Every feature page is one tap away — explore the parts of HEED before signing in.
            </p>
            <div className="tools-grid">
              <Link href="/insights" className="tool-card">
                <div className="tool-ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-7" />
                  </svg>
                </div>
                <h3>Insights dashboard</h3>
                <p>Mood trends, check-in streaks, 14-day reflection calendar, and distribution chart.</p>
                <span className="tool-cta">Open insights <ArrowRight /></span>
              </Link>

              <Link href="/breathe" className="tool-card">
                <div className="tool-ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                </div>
                <h3>Breathing tool</h3>
                <p>Three techniques (4-7-8, Box, Resonant) with an animated guide and cycle counter.</p>
                <span className="tool-cta">Start breathing <ArrowRight /></span>
              </Link>

              <Link href="/resources" className="tool-card">
                <div className="tool-ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="13" />
                    <circle cx="12" cy="16" r="0.8" fill="currentColor" />
                  </svg>
                </div>
                <h3>Crisis & resources</h3>
                <p>Region-aware helplines (iCall, AASRA, 988, Samaritans) and coping technique cards.</p>
                <span className="tool-cta">Open resources <ArrowRight /></span>
              </Link>

              <Link href="/chat" className="tool-card">
                <div className="tool-ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <h3>Companion chat</h3>
                <p>Talk to HEED about your day, plan tomorrow, or just vent. Conversation history saved privately.</p>
                <span className="tool-cta">Open chat <ArrowRight /></span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="block faq" id="faq">
          <div className="wrap">
            <span className="eyebrow">FAQ</span>
            <div className="faq-grid">
              <div>
                <h2 className="section-title" style={{ margin: "18px 0 16px" }}>
                  Quiet answers to <em>loud questions.</em>
                </h2>
                <p className="section-lede">
                  Still have something on your mind? HEED's first conversation is the best place to ask.
                </p>
              </div>
              <div className="faq-list">
                {FAQS.map((item, index) => (
                  <div key={item.q} className={`faq-item ${openFaq === index ? "open" : ""}`}>
                    <button
                      type="button"
                      className="faq-q"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      {item.q}
                      <span className="plus"><PlusIcon /></span>
                    </button>
                    <div className="faq-a">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-band" id="cta">
          <div className="wrap">
            <div className="cta-card">
              <div>
                <h2>
                  Living alone is hard. <em>Showing up</em> shouldn't be.
                </h2>
                <p>
                  Start a quiet conversation with HEED — no setup, no scoring, no judgement. Just a calm
                  companion that learns how to show up for you.
                </p>
                <div className="cta-actions">
                  <Link href="/signin" className="btn btn-cream btn-lg">
                    Start with HEED <ArrowRight size={16} />
                  </Link>
                  <Link href="/resources" className="btn btn-outline-white btn-lg">
                    Read the project notes
                  </Link>
                </div>
              </div>
              <div className="cta-meta">
                <div className="meta-card">
                  <div className="l">Built for</div>
                  <div className="v">Students &amp; young pros living independently</div>
                </div>
                <div className="meta-card">
                  <div className="l">Available</div>
                  <div className="v">Web · iOS · Android (PWA today, native soon)</div>
                </div>
                <div className="meta-card">
                  <div className="l">Privacy</div>
                  <div className="v">Encrypted · yours to export or delete</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="wrap">
            <div className="foot-row">
              <div style={{ maxWidth: 340 }}>
                <Link href="/" className="brand" style={{ marginBottom: 14 }}>
                  <div className="brand-mark" aria-hidden="true">
                    <SparkIcon size={22} />
                  </div>
                  <div>
                    <div className="brand-name">HEED</div>
                    <div className="brand-tag">Your digital companion</div>
                  </div>
                </Link>
                <p style={{ color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.55, margin: "16px 0 0" }}>
                  A calmer way to live independently — supported by conversation, not surveillance.
                </p>
              </div>
              <div className="foot-links">
                <div className="foot-col">
                  <h5>Product</h5>
                  <a href="#features">Features</a>
                  <a href="#project">How it works</a>
                  <a href="#companion">Companion</a>
                  <a href="#faq">FAQ</a>
                </div>
                <div className="foot-col">
                  <h5>Tools</h5>
                  <Link href="/chat">Chat</Link>
                  <Link href="/insights">Insights</Link>
                  <Link href="/breathe">Breathing</Link>
                  <Link href="/resources">Resources</Link>
                </div>
                <div className="foot-col">
                  <h5>Account</h5>
                  <Link href="/signin">Sign in</Link>
                  <Link href="/goals">Goals</Link>
                  <Link href="/settings">Settings</Link>
                  <Link href="/check-in">Check-in</Link>
                </div>
              </div>
            </div>
            <div className="foot-bottom">
              <div>© {new Date().getFullYear()} HEED Project · A student wellbeing initiative</div>
              <div>Made with care, in green.</div>
            </div>
          </div>
        </footer>

        {/* Floating chat preserved from earlier work */}
        <ChatWidget />
      </div>
    </>
  );
}

const LANDING_CSS = `
.heed-landing {
  --brand:#0F7A3A;
  --brand-700:#0A5829;
  --brand-50:#E8F3EC;
  --brand-100:#D2E7D9;
  --ink:#0E1F23;
  --ink-2:#3D4B50;
  --muted:#6B7679;
  --cream:#FBF6EC;
  --cream-2:#F4ECDC;
  --line:rgba(14,31,35,.10);
  --line-2:rgba(14,31,35,.06);
  --pad-section:120px;
  --maxw:1240px;
  font-family:"Inter",ui-sans-serif,system-ui,sans-serif;
  color:var(--ink);
  background:
    radial-gradient(1200px 600px at 85% -10%, #F8E7C7 0%, transparent 60%),
    radial-gradient(900px 500px at -10% 10%, #FDF3DD 0%, transparent 55%),
    linear-gradient(180deg, var(--cream) 0%, #FFFCF5 60%, #FFFFFF 100%);
  min-height:100vh;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}
.heed-landing *{box-sizing:border-box}
.heed-landing a{color:inherit;text-decoration:none}
.heed-landing button{font-family:inherit;cursor:pointer;border:0;background:none;color:inherit}
.heed-landing ::selection{background:var(--brand);color:#fff}

.heed-landing .wrap{max-width:var(--maxw);margin:0 auto;padding:0 32px}
.heed-landing .row{display:flex;align-items:center}
.heed-landing .between{justify-content:space-between}

/* NAV */
.heed-landing nav.top{position:sticky;top:0;z-index:50;backdrop-filter:saturate(140%) blur(14px);-webkit-backdrop-filter:saturate(140%) blur(14px);background:rgba(251,246,236,.72);border-bottom:1px solid var(--line-2)}
.heed-landing .brand{display:flex;align-items:center;gap:14px}
.heed-landing .brand-mark{width:48px;height:48px;border-radius:14px;background:linear-gradient(160deg,#16955A 0%, var(--brand) 55%, var(--brand-700) 100%);display:grid;place-items:center;color:#fff;box-shadow:0 6px 18px -6px rgba(15,122,58,.5), inset 0 1px 0 rgba(255,255,255,.25)}
.heed-landing .brand-name{font-weight:800;font-size:22px;letter-spacing:-0.01em;line-height:1}
.heed-landing .brand-tag{font-size:12.5px;color:var(--muted);margin-top:4px;letter-spacing:.01em}
.heed-landing .nav-links{display:flex;align-items:center;gap:36px}
.heed-landing .nav-links a{font-size:15px;color:var(--ink-2);font-weight:500;transition:color .15s ease}
.heed-landing .nav-links a:hover{color:var(--brand)}
.heed-landing .nav-cta{display:flex;align-items:center;gap:10px}

.heed-landing .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:999px;font-weight:600;font-size:15px;transition:transform .12s ease, box-shadow .15s ease, background .15s ease, color .15s ease;white-space:nowrap;line-height:1}
.heed-landing .btn-primary{background:var(--brand);color:#fff;box-shadow:0 8px 20px -8px rgba(15,122,58,.55), inset 0 1px 0 rgba(255,255,255,.18)}
.heed-landing .btn-primary:hover{background:var(--brand-700);transform:translateY(-1px)}
.heed-landing .btn-ghost{background:transparent;border:1.5px solid var(--ink);color:var(--ink)}
.heed-landing .btn-ghost:hover{background:var(--ink);color:#fff}
.heed-landing .btn-white{background:#fff;color:var(--ink);border:1.5px solid var(--line)}
.heed-landing .btn-white:hover{border-color:var(--ink)}
.heed-landing .btn-lg{padding:18px 30px;font-size:16px}

/* HERO */
.heed-landing .hero{padding:88px 0 64px;position:relative}
.heed-landing .hero .grid{display:grid;grid-template-columns:1.05fr .95fr;gap:72px;align-items:start}
.heed-landing .pill{display:inline-flex;align-items:center;gap:10px;padding:8px 16px 8px 12px;border-radius:999px;background:rgba(255,255,255,.7);border:1px solid var(--brand-100);color:var(--brand-700);font-weight:600;font-size:13.5px;box-shadow:0 1px 0 rgba(255,255,255,.6) inset}
.heed-landing .pill .dot{width:8px;height:8px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 4px var(--brand-50)}
.heed-landing h1.hero-title{font-family:"Inter",sans-serif;font-weight:800;font-size:clamp(54px,6.6vw,96px);line-height:.98;letter-spacing:-0.035em;margin:28px 0;color:var(--ink);text-wrap:balance}
.heed-landing h1.hero-title .accent{color:var(--brand);font-style:italic;font-family:"Instrument Serif",serif;font-weight:400;letter-spacing:-0.01em}
.heed-landing .lede{font-size:19px;line-height:1.55;color:var(--ink-2);max-width:560px;margin:0 0 36px;text-wrap:pretty}
.heed-landing .lede b{color:var(--ink);font-weight:600}
.heed-landing .cta-row{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:32px}
.heed-landing .trust-chips{display:flex;flex-wrap:wrap;gap:10px;max-width:560px}
.heed-landing .chip{display:inline-flex;align-items:center;gap:8px;padding:8px 14px 8px 10px;border-radius:999px;background:rgba(255,255,255,.55);border:1px solid var(--line);font-size:13.5px;font-weight:500;color:var(--ink-2)}
.heed-landing .check{width:18px;height:18px;border-radius:50%;background:var(--brand-50);display:grid;place-items:center;color:var(--brand-700)}

/* CHAT PREVIEW */
.heed-landing .chat-card{background:#fff;border:1px solid var(--line);border-radius:24px;padding:28px 28px 22px;box-shadow:0 1px 0 rgba(255,255,255,.8) inset,0 20px 50px -30px rgba(14,31,35,.25),0 4px 12px -6px rgba(14,31,35,.06);position:relative}
.heed-landing .chat-card::before{content:"";position:absolute;inset:auto -40px -40px auto;width:240px;height:240px;background:radial-gradient(closest-side, rgba(15,122,58,.10), transparent 70%);pointer-events:none;z-index:-1}
.heed-landing .chat-head{display:flex;align-items:center;gap:14px;padding-bottom:18px;border-bottom:1px solid var(--line-2)}
.heed-landing .ava{width:44px;height:44px;border-radius:13px;background:linear-gradient(160deg,#16955A,var(--brand-700));display:grid;place-items:center;color:#fff;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}
.heed-landing .ava-sm{width:32px;height:32px;border-radius:10px}
.heed-landing .ava.user{background:linear-gradient(160deg,#E9DEC4,#C9B68C);color:#5C4A22}
.heed-landing .chat-head h3{margin:0;font-size:17px;font-weight:700;letter-spacing:-.01em}
.heed-landing .chat-head p{margin:3px 0 0;font-size:13px;color:var(--muted)}
.heed-landing .status-dot{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:500}
.heed-landing .status-dot::before{content:"";width:8px;height:8px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 4px rgba(34,197,94,.18)}
.heed-landing .msgs{display:flex;flex-direction:column;gap:14px;padding:22px 0 8px}
.heed-landing .msg{display:flex;gap:12px;align-items:flex-start}
.heed-landing .msg .bubble{padding:13px 16px;border-radius:16px;font-size:14.5px;line-height:1.5;max-width:78%}
.heed-landing .msg.bot .bubble{background:var(--brand-50);color:var(--ink);border-top-left-radius:6px}
.heed-landing .msg.user{flex-direction:row-reverse}
.heed-landing .msg.user .bubble{background:#F4ECDC;color:var(--ink);border-top-right-radius:6px}
.heed-landing .msg.bot .bubble b{color:var(--brand-700)}
.heed-landing .quick-replies{display:flex;flex-wrap:wrap;gap:8px;padding:6px 0 4px 56px;margin-top:-4px}
.heed-landing .qr{padding:7px 13px;font-size:13px;border-radius:999px;background:#fff;border:1px solid var(--line);color:var(--ink-2);font-weight:500;transition:color .15s,border-color .15s}
.heed-landing .qr:hover{border-color:var(--brand);color:var(--brand)}
.heed-landing .chat-foot{margin-top:18px;padding:14px 16px;border-radius:14px;background:#FAF6EC;border:1px solid var(--line-2);display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--ink-2)}
.heed-landing .chat-foot svg{flex-shrink:0;color:var(--brand)}
.heed-landing .composer{margin-top:14px;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;background:#fff;border:1px solid var(--line);transition:border-color .15s}
.heed-landing .composer:hover{border-color:var(--brand)}
.heed-landing .composer-input{flex:1;font-size:14.5px;color:var(--muted);padding:8px 0}
.heed-landing .composer .send{width:38px;height:38px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center}
.heed-landing .typing{display:inline-flex;gap:4px;padding:14px 16px;background:var(--brand-50);border-radius:16px;border-top-left-radius:6px}
.heed-landing .typing span{width:7px;height:7px;border-radius:50%;background:var(--brand);opacity:.5;animation:heed-bounce 1.2s infinite}
.heed-landing .typing span:nth-child(2){animation-delay:.15s}
.heed-landing .typing span:nth-child(3){animation-delay:.3s}
@keyframes heed-bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-4px);opacity:1}}

/* STATS */
.heed-landing .stats{padding:48px 0 24px;border-top:1px dashed var(--line);border-bottom:1px dashed var(--line);margin-top:32px}
.heed-landing .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
.heed-landing .stat .n{font-family:"Instrument Serif",serif;font-size:56px;letter-spacing:-.02em;color:var(--ink);line-height:1}
.heed-landing .stat .n .pc{color:var(--brand);font-style:italic}
.heed-landing .stat .l{margin-top:8px;font-size:14px;color:var(--muted);max-width:220px;line-height:1.4}

/* SECTIONS */
.heed-landing section.block{padding:var(--pad-section) 0;position:relative}
.heed-landing .eyebrow{display:inline-flex;align-items:center;gap:8px;text-transform:uppercase;letter-spacing:.18em;font-size:12px;font-weight:600;color:var(--brand-700)}
.heed-landing .eyebrow::before{content:"";width:24px;height:1px;background:var(--brand)}
.heed-landing h2.section-title{font-size:clamp(40px,4.5vw,64px);font-weight:800;letter-spacing:-.03em;line-height:1.02;margin:18px 0 20px;max-width:880px;text-wrap:balance}
.heed-landing h2.section-title em{font-style:italic;font-family:"Instrument Serif",serif;font-weight:400;color:var(--brand)}
.heed-landing .section-lede{font-size:18px;color:var(--ink-2);max-width:640px;line-height:1.55}

/* FEATURES */
.heed-landing .features{background:#fff;border-top:1px solid var(--line-2);border-bottom:1px solid var(--line-2)}
.heed-landing .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line-2);margin-top:64px;border:1px solid var(--line-2);border-radius:24px;overflow:hidden}
.heed-landing .feat{background:#fff;padding:36px 32px 40px;display:flex;flex-direction:column;gap:14px;min-height:280px;position:relative;transition:background .2s ease;cursor:pointer}
.heed-landing .feat:hover{background:#FBFAF6}
.heed-landing .feat .ico{width:46px;height:46px;border-radius:13px;background:var(--brand-50);color:var(--brand-700);display:grid;place-items:center;margin-bottom:6px}
.heed-landing .feat h3{margin:0;font-size:21px;font-weight:700;letter-spacing:-.01em}
.heed-landing .feat p{margin:0;font-size:15px;color:var(--ink-2);line-height:1.55}
.heed-landing .feat .more{margin-top:auto;padding-top:18px;font-size:13px;font-weight:600;color:var(--brand-700);display:flex;align-items:center;gap:6px}

/* PROJECT */
.heed-landing .project{background:var(--cream)}
.heed-landing .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:64px}
.heed-landing .step{background:#fff;border:1px solid var(--line-2);border-radius:20px;padding:32px 28px;position:relative;overflow:hidden}
.heed-landing .step .num{font-family:"Instrument Serif",serif;font-style:italic;font-size:72px;line-height:1;color:var(--brand);opacity:.9;letter-spacing:-.02em}
.heed-landing .step h3{margin:8px 0 10px;font-size:22px;font-weight:700;letter-spacing:-.01em}
.heed-landing .step p{margin:0;color:var(--ink-2);font-size:15px;line-height:1.55}
.heed-landing .step .demo{margin-top:22px;padding-top:22px;border-top:1px dashed var(--line);font-size:13.5px;color:var(--muted)}
.heed-landing .step .demo .demo-row{display:flex;align-items:center;gap:8px;margin-top:8px}
.heed-landing .step .demo .tag{padding:4px 10px;border-radius:999px;background:var(--brand-50);color:var(--brand-700);font-weight:600;font-size:12px}

/* COMPANION */
.heed-landing .companion{background:linear-gradient(180deg,#FFFBF1 0%, #FAF3E2 100%)}
.heed-landing .comp-wrap{display:grid;grid-template-columns:1fr 1.1fr;gap:80px;align-items:center;margin-top:48px}
.heed-landing .persona-stack{display:flex;flex-direction:column;gap:14px}
.heed-landing .persona{display:flex;gap:16px;align-items:flex-start;padding:20px;border-radius:18px;background:#fff;border:1px solid var(--line-2);transition:transform .15s ease, box-shadow .15s ease}
.heed-landing .persona:hover{transform:translateY(-2px);box-shadow:0 10px 30px -15px rgba(14,31,35,.18)}
.heed-landing .persona .pavatar{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;color:#fff;flex-shrink:0;font-weight:700;font-size:18px}
.heed-landing .persona h4{margin:0 0 4px;font-size:17px;font-weight:700;letter-spacing:-.01em}
.heed-landing .persona p{margin:0;color:var(--ink-2);font-size:14.5px;line-height:1.5}

/* TOOLS */
.heed-landing .tools{background:#fff;border-top:1px solid var(--line-2);border-bottom:1px solid var(--line-2)}
.heed-landing .tools-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:64px}
.heed-landing .tool-card{display:flex;flex-direction:column;gap:12px;padding:28px 24px;border:1px solid var(--line);border-radius:20px;background:#fff;transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease;min-height:240px;cursor:pointer}
.heed-landing .tool-card:hover{transform:translateY(-3px);box-shadow:0 18px 40px -20px rgba(15,122,58,.25);border-color:var(--brand-100)}
.heed-landing .tool-ico{width:46px;height:46px;border-radius:13px;background:var(--brand-50);color:var(--brand-700);display:grid;place-items:center}
.heed-landing .tool-card h3{margin:0;font-size:18px;font-weight:700;letter-spacing:-.01em}
.heed-landing .tool-card p{margin:0;font-size:14px;color:var(--ink-2);line-height:1.5}
.heed-landing .tool-cta{margin-top:auto;font-size:13px;font-weight:600;color:var(--brand-700);display:inline-flex;align-items:center;gap:6px}

/* FAQ */
.heed-landing .faq{background:#fff}
.heed-landing .faq-grid{display:grid;grid-template-columns:1fr 1.5fr;gap:80px;margin-top:48px}
.heed-landing .faq-list{display:flex;flex-direction:column;gap:0}
.heed-landing .faq-item{border-bottom:1px solid var(--line);padding:22px 0}
.heed-landing .faq-item:first-child{border-top:1px solid var(--line)}
.heed-landing .faq-q{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:18px;font-weight:600;letter-spacing:-.01em;cursor:pointer;color:var(--ink);width:100%;text-align:left;padding:0;background:transparent;border:0}
.heed-landing .faq-q .plus{width:32px;height:32px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;flex-shrink:0;transition:transform .25s ease, background .15s ease, color .15s ease}
.heed-landing .faq-item.open .faq-q .plus{transform:rotate(45deg);background:var(--brand);color:#fff;border-color:var(--brand)}
.heed-landing .faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease, padding .3s ease;color:var(--ink-2);font-size:15.5px;line-height:1.6}
.heed-landing .faq-item.open .faq-a{max-height:360px;padding-top:14px}

/* CTA */
.heed-landing .cta-band{padding:96px 0 88px;background:radial-gradient(800px 400px at 50% 0%, rgba(15,122,58,.10), transparent 70%),var(--cream)}
.heed-landing .cta-card{background:linear-gradient(160deg, #0F7A3A 0%, #0B5C2D 100%);color:#fff;border-radius:28px;padding:64px 56px;display:grid;grid-template-columns:1.4fr 1fr;gap:48px;align-items:center;position:relative;overflow:hidden;box-shadow:0 30px 80px -40px rgba(15,122,58,.55)}
.heed-landing .cta-card::before{content:"";position:absolute;right:-80px;top:-80px;width:360px;height:360px;border-radius:50%;background:radial-gradient(closest-side, rgba(255,255,255,.18), transparent 70%)}
.heed-landing .cta-card::after{content:"";position:absolute;left:-60px;bottom:-100px;width:260px;height:260px;border-radius:50%;background:radial-gradient(closest-side, rgba(255,255,255,.10), transparent 70%)}
.heed-landing .cta-card h2{font-size:clamp(36px,4vw,56px);font-weight:800;letter-spacing:-.03em;line-height:1.02;margin:0 0 16px;color:#fff;position:relative}
.heed-landing .cta-card h2 em{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;color:#F8E7C7}
.heed-landing .cta-card p{margin:0 0 28px;font-size:17px;line-height:1.55;color:rgba(255,255,255,.82);max-width:520px;position:relative}
.heed-landing .cta-actions{display:flex;gap:12px;flex-wrap:wrap;position:relative}
.heed-landing .btn-cream{background:#FBF6EC;color:var(--ink)}
.heed-landing .btn-cream:hover{background:#fff}
.heed-landing .btn-outline-white{border:1.5px solid rgba(255,255,255,.5);color:#fff}
.heed-landing .btn-outline-white:hover{background:rgba(255,255,255,.1)}
.heed-landing .cta-meta{position:relative;display:flex;flex-direction:column;gap:14px}
.heed-landing .meta-card{background:rgba(255,255,255,.10);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.18);border-radius:18px;padding:18px 20px}
.heed-landing .meta-card .l{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.6);font-weight:600}
.heed-landing .meta-card .v{font-size:17px;font-weight:600;margin-top:6px;letter-spacing:-.01em}

/* FOOTER */
.heed-landing footer{padding:56px 0 40px;background:#FBF6EC;border-top:1px solid var(--line-2)}
.heed-landing .foot-row{display:flex;justify-content:space-between;align-items:flex-start;gap:48px;flex-wrap:wrap}
.heed-landing .foot-links{display:flex;gap:48px;flex-wrap:wrap}
.heed-landing .foot-col h5{margin:0 0 14px;font-size:13px;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);font-weight:600}
.heed-landing .foot-col a{display:block;padding:5px 0;font-size:14.5px;color:var(--ink-2)}
.heed-landing .foot-col a:hover{color:var(--brand-700)}
.heed-landing .foot-bottom{margin-top:48px;padding-top:24px;border-top:1px solid var(--line-2);display:flex;justify-content:space-between;align-items:center;font-size:13.5px;color:var(--muted);flex-wrap:wrap;gap:16px}

/* RESPONSIVE */
@media (max-width: 1100px){
  .heed-landing .tools-grid{grid-template-columns:repeat(2,1fr)}
}
@media (max-width: 980px){
  .heed-landing .hero .grid{grid-template-columns:1fr;gap:48px}
  .heed-landing .feat-grid{grid-template-columns:repeat(2,1fr)}
  .heed-landing .steps{grid-template-columns:1fr}
  .heed-landing .comp-wrap{grid-template-columns:1fr;gap:40px}
  .heed-landing .faq-grid{grid-template-columns:1fr;gap:32px}
  .heed-landing .cta-card{grid-template-columns:1fr;padding:40px 32px}
  .heed-landing .stats-row{grid-template-columns:repeat(2,1fr);gap:24px}
  .heed-landing .nav-links{display:none}
  .heed-landing{--pad-section:80px}
}
@media (max-width: 560px){
  .heed-landing .feat-grid{grid-template-columns:1fr}
  .heed-landing .tools-grid{grid-template-columns:1fr}
  .heed-landing .wrap{padding:0 20px}
  .heed-landing h1.hero-title{font-size:48px}
}
`;
