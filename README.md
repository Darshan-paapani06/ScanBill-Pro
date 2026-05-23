<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ScanBill Pro — README</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&display=swap" rel="stylesheet" />
<style>
  :root {
    --ink:    #1a110a;
    --parch:  #f5ede0;
    --cream:  #fdf7ef;
    --amber:  #c98a3e;
    --ember:  #8b3a1e;
    --sage:   #4a7c59;
    --slate:  #4a5568;
    --gold:   #d4a843;
    --shadow: rgba(60,30,10,.14);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Cormorant Garamond', Georgia, serif;
    background: var(--cream);
    color: var(--ink);
    overflow-x: hidden;
    font-size: 18px;
    line-height: 1.75;
  }

  /* ─── PARTICLE CANVAS ─── */
  #particles {
    position: fixed; inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: .45;
  }

  /* ─── HERO ─── */
  .hero {
    position: relative;
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    overflow: hidden;
    background: radial-gradient(ellipse 80% 60% at 50% 30%, #2b1509 0%, #0e0704 100%);
    padding: 60px 24px;
  }

  .hero-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(212,168,67,.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,168,67,.08) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: gridDrift 40s linear infinite;
  }
  @keyframes gridDrift {
    from { background-position: 0 0; }
    to   { background-position: 48px 48px; }
  }

  .hero-glow {
    position: absolute;
    width: 700px; height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,138,62,.18) 0%, transparent 70%);
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    animation: glowPulse 4s ease-in-out infinite;
  }
  @keyframes glowPulse {
    0%,100% { opacity: .6; transform: translate(-50%,-50%) scale(1); }
    50%      { opacity: 1;  transform: translate(-50%,-50%) scale(1.12); }
  }

  .hero-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: .75rem; letter-spacing: .32em;
    color: var(--gold); text-transform: uppercase;
    opacity: 0; animation: fadeUp .8s ease .3s forwards;
    position: relative; z-index: 2;
    margin-bottom: 18px;
  }

  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(4rem, 12vw, 9rem);
    font-weight: 900; line-height: .95;
    color: #fff;
    text-align: center;
    position: relative; z-index: 2;
    opacity: 0; animation: fadeUp .9s ease .55s forwards;
    text-shadow: 0 0 80px rgba(212,168,67,.4), 0 4px 32px rgba(0,0,0,.8);
    letter-spacing: -.02em;
  }
  .hero-title span { color: var(--gold); }

  .hero-sub {
    font-size: 1.15rem; font-weight: 300; font-style: italic;
    color: rgba(255,255,255,.65);
    max-width: 600px; text-align: center;
    position: relative; z-index: 2;
    opacity: 0; animation: fadeUp .9s ease .8s forwards;
    margin-top: 22px;
  }

  .hero-bar {
    display: flex; gap: 6px; align-items: center;
    margin-top: 52px; position: relative; z-index: 2;
    opacity: 0; animation: fadeUp .9s ease 1.05s forwards;
  }
  .hero-bar-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); animation: dotBlink 1.6s ease-in-out infinite; }
  .hero-bar-dot:nth-child(2) { animation-delay: .25s; }
  .hero-bar-dot:nth-child(3) { animation-delay: .5s; }
  @keyframes dotBlink { 0%,100%{opacity:.3} 50%{opacity:1} }

  .scroll-hint {
    position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    z-index: 2; opacity: 0; animation: fadeIn 1s ease 1.6s forwards;
    color: rgba(255,255,255,.4);
    font-family: 'DM Mono', monospace; font-size: .68rem; letter-spacing: .2em;
  }
  .scroll-arrow {
    width: 20px; height: 28px; border: 1.5px solid rgba(212,168,67,.5); border-radius: 10px;
    position: relative;
  }
  .scroll-arrow::after {
    content:''; position:absolute; width:4px; height:4px; border-radius:50%;
    background: var(--gold); left:50%; top:5px; transform:translateX(-50%);
    animation: scrollDot 1.5s ease-in-out infinite;
  }
  @keyframes scrollDot { 0%{top:5px;opacity:1} 80%{top:15px;opacity:.2} 100%{top:5px;opacity:1} }

  /* ─── NAV ─── */
  nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(26,17,10,.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(212,168,67,.18);
    padding: 0 40px;
    display: flex; align-items: center; gap: 0;
    overflow-x: auto;
  }
  nav a {
    font-family: 'DM Mono', monospace;
    font-size: .72rem; letter-spacing: .18em; text-transform: uppercase;
    color: rgba(255,255,255,.5); text-decoration: none;
    padding: 18px 20px; white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: color .25s, border-color .25s;
  }
  nav a:hover { color: var(--gold); border-color: var(--gold); }

  /* ─── MAIN LAYOUT ─── */
  main { position: relative; z-index: 1; }

  /* ─── SECTION WRAPPER ─── */
  .section {
    padding: 100px 24px;
    max-width: 960px; margin: 0 auto;
    opacity: 0; transform: translateY(40px);
    transition: opacity .7s ease, transform .7s ease;
  }
  .section.visible { opacity: 1; transform: translateY(0); }

  .section-label {
    font-family: 'DM Mono', monospace;
    font-size: .7rem; letter-spacing: .3em; text-transform: uppercase;
    color: var(--amber); margin-bottom: 14px;
    display: flex; align-items: center; gap: 12px;
  }
  .section-label::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(to right, var(--amber), transparent);
  }

  h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 3.4rem);
    font-weight: 700; line-height: 1.1;
    color: var(--ink); margin-bottom: 32px;
  }

  p { color: #4a3728; line-height: 1.85; margin-bottom: 1em; }

  /* ─── OVERVIEW CARDS ─── */
  .goal-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px; margin-top: 40px;
  }
  .goal-card {
    background: #fff; border: 1px solid rgba(201,138,62,.18);
    border-radius: 16px; padding: 28px 24px;
    position: relative; overflow: hidden;
    box-shadow: 0 6px 24px var(--shadow);
    transition: transform .3s ease, box-shadow .3s ease;
  }
  .goal-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px var(--shadow);
  }
  .goal-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(to right, var(--amber), var(--gold));
    transform: scaleX(0); transform-origin: left;
    transition: transform .4s ease;
  }
  .goal-card:hover::before { transform: scaleX(1); }
  .goal-num {
    font-family: 'Playfair Display', serif;
    font-size: 2.8rem; font-weight: 900;
    color: rgba(201,138,62,.15); line-height: 1;
    margin-bottom: 10px;
  }
  .goal-text { font-size: 1rem; color: var(--ink); }

  /* ─── DARK SECTION ─── */
  .dark-section {
    background: linear-gradient(135deg, #1a110a 0%, #2b1e12 100%);
    padding: 100px 24px; position: relative; overflow: hidden;
  }
  .dark-section::before {
    content:''; position:absolute; inset:0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 50%, rgba(201,138,62,.08) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 30%, rgba(139,58,30,.12) 0%, transparent 70%);
  }
  .dark-section .section { opacity:1; transform:none; }
  .dark-section h2 { color: #fff; }
  .dark-section p { color: rgba(255,255,255,.6); }
  .dark-section .section-label { color: var(--gold); }

  /* ─── TREE / CODE ─── */
  .code-block {
    background: #0d0906; border: 1px solid rgba(212,168,67,.2);
    border-radius: 16px; padding: 32px;
    font-family: 'DM Mono', monospace;
    font-size: .8rem; line-height: 1.9;
    color: rgba(255,255,255,.7); overflow-x: auto;
    position: relative;
    box-shadow: inset 0 1px 0 rgba(212,168,67,.1), 0 24px 60px rgba(0,0,0,.5);
  }
  .code-block::before {
    content: '● ● ●'; position: absolute; top: 14px; left: 20px;
    font-size: .7rem; color: rgba(255,255,255,.2); letter-spacing: .4em;
  }
  .code-block pre { margin-top: 12px; white-space: pre; }
  .tree-dir  { color: var(--gold); }
  .tree-file { color: rgba(255,255,255,.55); }
  .tree-branch { color: rgba(212,168,67,.35); }

  /* ─── FEATURES GRID ─── */
  .feature-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr));
    gap: 24px; margin-top: 48px;
  }
  .feature-card {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(212,168,67,.15);
    border-radius: 20px; padding: 34px 28px;
    transition: background .3s, border-color .3s, transform .3s;
    position: relative; overflow: hidden;
  }
  .feature-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 60% 0%, rgba(212,168,67,.1) 0%, transparent 60%);
    opacity: 0; transition: opacity .3s;
  }
  .feature-card:hover { background: rgba(255,255,255,.08); border-color: rgba(212,168,67,.45); transform: translateY(-4px); }
  .feature-card:hover::after { opacity: 1; }
  .feature-icon {
    font-size: 2rem; margin-bottom: 16px;
    display: inline-block;
    animation: iconFloat 3s ease-in-out infinite;
  }
  @keyframes iconFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .feature-card:nth-child(2) .feature-icon { animation-delay: .4s; }
  .feature-card:nth-child(3) .feature-icon { animation-delay: .8s; }
  .feature-card:nth-child(4) .feature-icon { animation-delay: 1.2s; }
  .feature-card:nth-child(5) .feature-icon { animation-delay: 1.6s; }
  .feature-card:nth-child(6) .feature-icon { animation-delay: 2s; }
  .feature-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem; font-weight: 700;
    color: #fff; margin-bottom: 10px;
  }
  .feature-desc { font-size: .92rem; color: rgba(255,255,255,.55); line-height: 1.7; }

  /* ─── WORKFLOW STEPS ─── */
  .workflow-steps { display: flex; flex-direction: column; gap: 0; margin-top: 48px; }
  .workflow-step {
    display: flex; gap: 28px; align-items: flex-start;
    padding: 28px 0; border-bottom: 1px solid rgba(201,138,62,.12);
    opacity: 0; transform: translateX(-24px);
    transition: opacity .55s ease, transform .55s ease;
  }
  .workflow-step.visible { opacity: 1; transform: translateX(0); }
  .step-num {
    flex-shrink: 0;
    width: 52px; height: 52px; border-radius: 50%;
    border: 2px solid var(--amber);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 900;
    color: var(--amber);
    background: rgba(201,138,62,.07);
    position: relative;
  }
  .step-num::before {
    content:''; position:absolute;
    width:62px; height:62px; border-radius:50%;
    border:1px solid rgba(201,138,62,.2);
    animation: ripple 2.5s ease-out infinite;
  }
  @keyframes ripple { 0%{transform:scale(.9);opacity:.8} 100%{transform:scale(1.5);opacity:0} }
  .step-body h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem; color: var(--ink); margin-bottom: 6px;
  }
  .step-body p { font-size: .95rem; color: #5a4535; margin: 0; }

  /* ─── DESIGN TOKENS ─── */
  .token-row {
    display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px;
  }
  .token {
    display: flex; align-items: center; gap: 10px;
    background: #fff; border: 1px solid rgba(201,138,62,.2);
    border-radius: 40px; padding: 8px 16px;
    font-family: 'DM Mono', monospace; font-size: .78rem;
    color: var(--ink); box-shadow: 0 2px 8px var(--shadow);
    transition: transform .25s; cursor: default;
  }
  .token:hover { transform: scale(1.06); }
  .token-swatch {
    width: 16px; height: 16px; border-radius: 50%;
    flex-shrink: 0;
  }

  /* ─── INSTALL STEPS ─── */
  .install-steps { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }
  .install-step {
    background: #fff; border-radius: 14px;
    border: 1px solid rgba(201,138,62,.15);
    padding: 20px 24px;
    display: flex; gap: 18px; align-items: flex-start;
    box-shadow: 0 4px 16px var(--shadow);
    transition: transform .28s, box-shadow .28s;
  }
  .install-step:hover { transform: translateX(6px); box-shadow: 0 8px 32px var(--shadow); }
  .install-badge {
    flex-shrink: 0;
    background: linear-gradient(135deg, var(--amber), var(--gold));
    color: #fff; border-radius: 8px;
    width: 36px; height: 36px;
    display:flex; align-items:center; justify-content:center;
    font-family: 'DM Mono', monospace; font-size: .8rem; font-weight: 500;
  }
  .install-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
  .install-cmd {
    font-family: 'DM Mono', monospace; font-size: .8rem;
    background: #f5f0e8; border-radius: 6px; padding: 4px 10px;
    color: var(--ember); display: inline-block; margin-top: 4px;
  }

  /* ─── AUTHOR ─── */
  .author-section {
    background: linear-gradient(135deg, #1a110a, #2b1e12);
    padding: 120px 24px; text-align: center; position: relative; overflow: hidden;
  }
  .author-section::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 70% 80% at 50% 50%, rgba(201,138,62,.1) 0%, transparent 65%);
  }
  .author-ring {
    width: 160px; height: 160px; border-radius: 50%;
    border: 2px solid rgba(212,168,67,.4);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 36px;
    position: relative; z-index:1;
    animation: authorRing 6s linear infinite;
  }
  @keyframes authorRing { to { transform: rotate(360deg); } }
  .author-ring-inner {
    width: 136px; height: 136px; border-radius: 50%;
    border: 1px solid rgba(212,168,67,.2);
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle, rgba(201,138,62,.15) 0%, transparent 70%);
    animation: authorRing 6s linear infinite reverse;
  }
  .author-initials {
    font-family: 'Playfair Display', serif;
    font-size: 3rem; font-weight: 900;
    color: var(--gold);
  }
  .author-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: .72rem; letter-spacing: .3em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 16px;
    position: relative; z-index:1;
  }
  .author-name {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.4rem, 7vw, 5rem);
    font-weight: 900; color: #fff;
    position: relative; z-index: 1;
    text-shadow: 0 0 60px rgba(212,168,67,.3);
    margin-bottom: 10px;
  }
  .author-name span { color: var(--gold); }
  .author-title {
    font-size: 1.1rem; font-style: italic;
    color: rgba(255,255,255,.5);
    position: relative; z-index:1;
    margin-bottom: 28px;
  }
  .author-quote {
    max-width: 560px; margin: 0 auto;
    font-size: 1.05rem; font-style: italic;
    color: rgba(255,255,255,.4);
    border-top: 1px solid rgba(212,168,67,.2);
    padding-top: 24px;
    position: relative; z-index:1;
  }

  /* ─── FOOTER ─── */
  footer {
    background: #0d0906; padding: 40px 24px;
    text-align: center;
    font-family: 'DM Mono', monospace;
    font-size: .72rem; letter-spacing: .12em;
    color: rgba(255,255,255,.2);
    border-top: 1px solid rgba(212,168,67,.1);
  }
  footer span { color: var(--gold); }

  /* ─── MISC ANIMATIONS ─── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ─── BADGE ROW ─── */
  .badge-row {
    display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px;
  }
  .badge {
    font-family: 'DM Mono', monospace; font-size: .72rem;
    padding: 6px 14px; border-radius: 40px;
    border: 1px solid rgba(201,138,62,.35);
    color: var(--amber); background: rgba(201,138,62,.07);
    letter-spacing: .08em;
    transition: background .25s, color .25s;
  }
  .badge:hover { background: var(--amber); color: #fff; }

  /* ─── HORIZONTAL RULE ─── */
  hr {
    border: none; height: 1px;
    background: linear-gradient(to right, transparent, rgba(201,138,62,.35), transparent);
    margin: 0;
  }

  /* Stagger delays for cards */
  .goal-grid .goal-card:nth-child(1) { transition-delay: 0s; }
  .goal-grid .goal-card:nth-child(2) { transition-delay: .1s; }
  .goal-grid .goal-card:nth-child(3) { transition-delay: .2s; }
  .goal-grid .goal-card:nth-child(4) { transition-delay: .3s; }
  .goal-grid .goal-card:nth-child(5) { transition-delay: .4s; }

  .feature-grid .feature-card:nth-child(1) { transition-delay: 0s; }
  .feature-grid .feature-card:nth-child(2) { transition-delay: .1s; }
  .feature-grid .feature-card:nth-child(3) { transition-delay: .2s; }
  .feature-grid .feature-card:nth-child(4) { transition-delay: .3s; }
  .feature-grid .feature-card:nth-child(5) { transition-delay: .4s; }
  .feature-grid .feature-card:nth-child(6) { transition-delay: .5s; }

  .goal-card, .feature-card {
    opacity: 0; transform: translateY(30px);
    transition: opacity .55s ease, transform .55s ease, box-shadow .3s ease, border-color .3s ease;
  }
  .goal-card.visible, .feature-card.visible { opacity: 1; transform: translateY(0); }

  /* checklist */
  .checklist { list-style: none; margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
  .checklist li {
    display: flex; align-items: center; gap: 14px;
    font-size: 1rem; color: var(--ink);
    padding: 14px 18px; background: #fff;
    border-radius: 10px; border: 1px solid rgba(201,138,62,.15);
    box-shadow: 0 2px 8px var(--shadow);
    transition: transform .25s;
  }
  .checklist li:hover { transform: translateX(6px); }
  .check-box {
    width: 22px; height: 22px; border-radius: 6px;
    border: 2px solid rgba(201,138,62,.4);
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--sage); font-size: .85rem;
  }

  /* scan animation in hero */
  .scan-line {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(to right, transparent, rgba(212,168,67,.7), transparent);
    animation: scanMove 3s ease-in-out infinite;
    top: 30%;
  }
  @keyframes scanMove {
    0%,100% { top: 20%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    50% { top: 80%; }
  }
</style>
</head>
<body>

<!-- Particle canvas -->
<canvas id="particles"></canvas>

<!-- ══════════ HERO ══════════ -->
<section class="hero">
  <div class="hero-grid"></div>
  <div class="hero-glow"></div>
  <div class="scan-line"></div>

  <p class="hero-eyebrow">A Curated Retail Ledger</p>
  <h1 class="hero-title">Scan<span>Bill</span> Pro</h1>
  <p class="hero-sub">A refined barcode billing dashboard with intelligent discovery, animated classical design, and a polished point‑of‑sale workflow.</p>
  <div class="hero-bar">
    <div class="hero-bar-dot"></div>
    <div class="hero-bar-dot"></div>
    <div class="hero-bar-dot"></div>
  </div>

  <div class="scroll-hint">
    <div class="scroll-arrow"></div>
    SCROLL
  </div>
</section>

<!-- ══════════ NAV ══════════ -->
<nav>
  <a href="#overview">Overview</a>
  <a href="#design">Philosophy</a>
  <a href="#architecture">Architecture</a>
  <a href="#workflow">Workflow</a>
  <a href="#features">Features</a>
  <a href="#install">Install</a>
  <a href="#author">Author</a>
</nav>

<main>

<!-- ══════════ OVERVIEW ══════════ -->
<div id="overview">
  <div class="section">
    <p class="section-label">Project Overview</p>
    <h2>What is ScanBill Pro?</h2>
    <p>ScanBill Pro is a premium retail dashboard built for modern point-of-sale experiences. It combines live webcam barcode scanning, secure JWT authentication, AI-backed barcode lookup, and a fully editable product catalog into one elegant web interface.</p>
    <p>The experience is built around a retail-first mindset: fast scanning, clear product insight, rich transaction receipts, and secure access control. Every interaction is intentionally animated and crafted to feel polished, responsive, and delightful.</p>

    <div class="badge-row">
      <span class="badge">Live Barcode Scanning</span>
      <span class="badge">JWT Auth</span>
      <span class="badge">AI Lookup</span>
      <span class="badge">Animated UI</span>
      <span class="badge">Receipt Engine</span>
      <span class="badge">SSE Streams</span>
      <span class="badge">Dark Theme</span>
    </div>

    <div class="goal-grid">
      <div class="goal-card">
        <div class="goal-num">01</div>
        <div class="goal-text">Fast, accurate barcode scanning on the browser with webcam.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">02</div>
        <div class="goal-text">Intelligent product resolution for standard and custom barcodes.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">03</div>
        <div class="goal-text">Clear, actionable inventory management with inline editing.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">04</div>
        <div class="goal-text">Secure and maintainable collection of sale transactions.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">05</div>
        <div class="goal-text">A strong baseline for production-grade POS experiences.</div>
      </div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════ DESIGN PHILOSOPHY ══════════ -->
<div id="design">
  <div class="section">
    <p class="section-label">Design Philosophy</p>
    <h2>Crafted with Intention</h2>
    <p>ScanBill Pro is built with a deliberate design system that prioritizes clarity, speed, and delight. Visual hierarchy is created with depth, soft shadows, and layered cards. Motion is used to guide attention, not distract.</p>
    <p>Data-rich controls are simplified through animated toggles, feedback chips, and progress states. The UI is optimized for both desktop and tablet-style POS terminals. The result is a premium checkout experience that feels modern, coherent, and trustworthy.</p>

    <div class="token-row">
      <div class="token"><div class="token-swatch" style="background:#6d28d9"></div>violet accent</div>
      <div class="token"><div class="token-swatch" style="background:#10b981"></div>emerald success</div>
      <div class="token"><div class="token-swatch" style="background:#1a110a"></div>dark canvas</div>
      <div class="token"><div class="token-swatch" style="background:#f59e0b"></div>amber alert</div>
      <div class="token"><div class="token-swatch" style="background:#d4a843"></div>gold highlight</div>
      <div class="token"><div class="token-swatch" style="background:#f5ede0"></div>parchment bg</div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════ ARCHITECTURE ══════════ -->
<div class="dark-section" id="architecture">
  <div class="section">
    <p class="section-label">Architecture & Design Tree</p>
    <h2>The Blueprint</h2>
    <p>A complete map of the application from top-level features down to individual UI and backend components.</p>

    <div class="code-block">
      <pre><span class="tree-dir">ScanBill Pro</span>
<span class="tree-branch">├──</span> <span class="tree-dir">Frontend</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">App Shell</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Top Navigation</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Status Panel</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Animated Dashboard Cards</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Quick Action Buttons</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Scan Workspace</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Webcam Scanner Panel</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Scan History Feed</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Active Receipt Preview</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Auto-Discovery Info Tile</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Product Catalog Modal</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Search Bar + Sort Controls</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Editable Product Table</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Add / Delete Product Actions</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Receipt Modal</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Print Optimised Invoice</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Tax & Total Calculations</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Payment Status Badge</span>
<span class="tree-branch">│   └──</span> <span class="tree-dir">Authentication Screens</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Login / Register Pages</span>
<span class="tree-branch">│       └──</span> <span class="tree-file">Token Storage + Session Refresh</span>
<span class="tree-branch">├──</span> <span class="tree-dir">Backend</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Express API</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">/api/auth/login · register · me</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">/api/products · /api/scan</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">/api/scan-stream · /api/products/bulk</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Barcode Intelligence</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">OpenFoodFacts Lookup</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Gemini AI Fallback</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Deterministic Generator</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Security Layer</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">JWT Middleware</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Role Validation</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Secret Management</span>
<span class="tree-branch">│   └──</span> <span class="tree-dir">In-Memory Data Store</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Products DB · Scan Logs</span>
<span class="tree-branch">│       └──</span> <span class="tree-file">Transaction History · User Accounts</span>
<span class="tree-branch">└──</span> <span class="tree-dir">Developer Experience</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">Local Dev Server</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">Environment Configuration</span>
<span class="tree-branch">    └──</span> <span class="tree-file">Debug Logging + Error Messages</span></pre>
    </div>
  </div>
</div>

<!-- ══════════ WORKFLOW ══════════ -->
<div id="workflow">
  <div class="section">
    <p class="section-label">Workflow Map</p>
    <h2>From Scan to Receipt</h2>
    <p>A narrative of how users move through the system and how data flows through every layer of the app.</p>

    <div class="workflow-steps">
      <div class="workflow-step">
        <div class="step-num">1</div>
        <div class="step-body">
          <h3>Launch & Authenticate</h3>
          <p>The UI shell initialises with dark theme and motion. Users log in or register. A JWT token is created and stored securely, unlocking the full dashboard.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">2</div>
        <div class="step-body">
          <h3>Begin Scan Session</h3>
          <p>The webcam scanner panel activates and listens continuously for valid barcodes. When detected, a <code>/api/scan</code> request fires immediately.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">3</div>
        <div class="step-body">
          <h3>Intelligent Product Lookup</h3>
          <p>Known items display instantly. Unknown barcodes trigger the AI fallback engine — OpenFoodFacts first, then Gemini, then a deterministic generator.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">4</div>
        <div class="step-body">
          <h3>Build the Receipt</h3>
          <p>Each scanned item glides into the transaction tile. Subtotal, tax, and grand total recalculate in real time as the cart grows.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">5</div>
        <div class="step-body">
          <h3>Finalise & Print</h3>
          <p>Confirm checkout, generate a unique receipt number, and present the print-ready invoice modal. Transaction history is stored automatically.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">6</div>
        <div class="step-body">
          <h3>Continue Sales</h3>
          <p>A gentle fade resets the scan session. The catalog is always available for live editing, stock updates, and product management between transactions.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════ FEATURES ══════════ -->
<div class="dark-section" id="features">
  <div class="section">
    <p class="section-label">Unique Features</p>
    <h2>What Makes It Special</h2>
    <p>ScanBill Pro is built with a layered feature set that is both functional and delightful — every capability is intentional.</p>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">📷</div>
        <div class="feature-title">Smart Scanner</div>
        <div class="feature-desc">Browser-based barcode scanning via html5-qrcode. Adapts to mobile and desktop camera feeds. Physical scanner hookup via POST + SSE.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧠</div>
        <div class="feature-title">AI Barcode Intelligence</div>
        <div class="feature-desc">OpenFoodFacts → Gemini fallback → deterministic generator. The checkout flow is never blocked by missing product data.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🛡️</div>
        <div class="feature-title">Secure Auth</div>
        <div class="feature-desc">JWT login, registration, and session validation. Role-aware endpoints guard every protected inventory operation.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🗂️</div>
        <div class="feature-title">Live Catalog Management</div>
        <div class="feature-desc">Real-time inline editing, search, sort, filter. Stock-level indicators pulse on low inventory. Bulk import endpoint ready.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧾</div>
        <div class="feature-title">Receipt Engine</div>
        <div class="feature-desc">Printable invoice with itemised totals, tax calculation, and payment status badges. Optimised for both screen and paper.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <div class="feature-title">Animated UI</div>
        <div class="feature-desc">Motion-driven modal entrances, hover states, pulse alerts, and a consistent animation language that feels warm and premium.</div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════ INSTALL ══════════ -->
<div id="install">
  <div class="section">
    <p class="section-label">Installation</p>
    <h2>Up & Running in Minutes</h2>
    <p>A clean five-step process to get the full ScanBill Pro experience running locally.</p>

    <div class="install-steps">
      <div class="install-step">
        <div class="install-badge">01</div>
        <div>
          <div class="install-title">Clone the Repository</div>
          <div class="install-cmd">git clone https://github.com/&lt;username&gt;/barcode-billing-dashboard.git</div>
        </div>
      </div>
      <div class="install-step">
        <div class="install-badge">02</div>
        <div>
          <div class="install-title">Install Dependencies</div>
          <div class="install-cmd">npm install</div>
        </div>
      </div>
      <div class="install-step">
        <div class="install-badge">03</div>
        <div>
          <div class="install-title">Configure Environment</div>
          <div class="install-cmd">GEMINI_API_KEY=... &nbsp; JWT_SECRET=...</div>
        </div>
      </div>
      <div class="install-step">
        <div class="install-badge">04</div>
        <div>
          <div class="install-title">Start Dev Server</div>
          <div class="install-cmd">npm run dev</div>
        </div>
      </div>
      <div class="install-step">
        <div class="install-badge">05</div>
        <div>
          <div class="install-title">Open the App</div>
          <div class="install-cmd">http://localhost:3000</div>
        </div>
      </div>
    </div>

    <div style="margin-top:48px;">
      <p class="section-label">Maintenance Checklist</p>
      <ul class="checklist">
        <li><div class="check-box">☐</div> Verify JWT secret is set in production</li>
        <li><div class="check-box">☐</div> Replace in-memory storage with persistent database</li>
        <li><div class="check-box">☐</div> Add end-to-end tests for scan and checkout flows</li>
        <li><div class="check-box">☐</div> Improve offline support for the scanner</li>
        <li><div class="check-box">☐</div> Add analytics for scan volume and product usage</li>
        <li><div class="check-box">☐</div> Tune UI animations for lighter CPU use</li>
      </ul>
    </div>
  </div>
</div>

<hr />

<!-- ══════════ AUTHOR ══════════ -->
<div class="author-section" id="author">
  <div class="author-ring">
    <div class="author-ring-inner">
      <div class="author-initials">DP</div>
    </div>
  </div>
  <p class="author-eyebrow">Lead Artisan</p>
  <h2 class="author-name">Darshan <span>Paapani</span></h2>
  <p class="author-title">Crafted with classical elegance & premium motion design</p>
  <p class="author-quote">
    "ScanBill Pro is built with a top-to-bottom design mindset. Every workflow is mapped, every animation is intentional, and the product is positioned as a premium retail experience from scan to receipt."
  </p>
</div>

</main>

<!-- ══════════ FOOTER ══════════ -->
<footer>
  <span>ScanBill Pro</span> &nbsp;·&nbsp; Built by Darshan Paapani &nbsp;·&nbsp; A Curated Retail Ledger
</footer>

<script>
/* ─── PARTICLE CANVAS ─── */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function makeParticle() {
  return {
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + .3,
    vx: (Math.random() - .5) * .3,
    vy: (Math.random() - .5) * .3,
    a: Math.random()
  };
}

function initParticles() {
  particles = Array.from({length: 120}, makeParticle);
}

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(212,168,67,${p.a * .25})`;
    ctx.fill();
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
  });
  requestAnimationFrame(drawParticles);
}

resize(); initParticles(); drawParticles();
window.addEventListener('resize', () => { resize(); initParticles(); });

/* ─── INTERSECTION OBSERVER ─── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.section, .goal-card, .feature-card, .workflow-step'
).forEach(el => io.observe(el));

/* ─── WORKFLOW STEP STAGGER ─── */
document.querySelectorAll('.workflow-step').forEach((el, i) => {
  el.style.transitionDelay = (i * .12) + 's';
});
</script>
</body>
</html>
