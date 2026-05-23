<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ScanBill Pro — README</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet" />
<style>
/* ─── TOKENS ─── */
:root {
  --ink:    #1a110a;
  --parch:  #f5ede0;
  --cream:  #fdf7ef;
  --amber:  #c98a3e;
  --ember:  #8b3a1e;
  --sage:   #4a7c59;
  --gold:   #d4a843;
  --shadow: rgba(60,30,10,.14);
  --shadow-deep: rgba(60,30,10,.22);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  font-family: 'Cormorant Garamond', Georgia, serif;
  background: var(--cream);
  color: var(--ink);
  overflow-x: hidden;
  font-size: 18px;
  line-height: 1.8;
}

/* ─── PARTICLES ─── */
#particles {
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 0; opacity: .45;
}

/* ─── HERO ─── */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden;
  background: radial-gradient(ellipse 80% 60% at 50% 30%, #2b1509 0%, #0e0704 100%);
  padding: 80px 24px 100px;
}

.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(212,168,67,.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,168,67,.07) 1px, transparent 1px);
  background-size: 52px 52px;
  animation: gridDrift 50s linear infinite;
}
@keyframes gridDrift {
  from { background-position: 0 0; }
  to   { background-position: 52px 52px; }
}

.hero-glow {
  position: absolute;
  width: 800px; height: 800px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,138,62,.16) 0%, transparent 68%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: glowPulse 5s ease-in-out infinite;
}
@keyframes glowPulse {
  0%,100% { opacity: .5; transform: translate(-50%,-50%) scale(1); }
  50%      { opacity: 1;  transform: translate(-50%,-50%) scale(1.14); }
}

.scan-line {
  position: absolute; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(to right, transparent 0%, rgba(212,168,67,.8) 50%, transparent 100%);
  animation: scanMove 4s ease-in-out infinite;
  top: 20%;
}
@keyframes scanMove {
  0%,100% { top: 15%; opacity: 0; }
  8%       { opacity: 1; }
  92%      { opacity: 1; }
  50%      { top: 85%; }
}

.hero-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: .72rem; letter-spacing: .34em; text-transform: uppercase;
  color: var(--gold);
  opacity: 0; animation: fadeUp .8s ease .3s forwards;
  position: relative; z-index: 2;
  margin-bottom: 20px;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(4rem, 13vw, 9.5rem);
  font-weight: 900; line-height: .92;
  color: #fff; text-align: center;
  position: relative; z-index: 2;
  opacity: 0; animation: fadeUp .9s ease .55s forwards;
  text-shadow: 0 0 90px rgba(212,168,67,.38), 0 4px 40px rgba(0,0,0,.9);
  letter-spacing: -.02em;
}
.hero-title span { color: var(--gold); }

.hero-sub {
  font-size: 1.12rem; font-weight: 300; font-style: italic;
  color: rgba(255,255,255,.6);
  max-width: 620px; text-align: center;
  position: relative; z-index: 2;
  opacity: 0; animation: fadeUp .9s ease .82s forwards;
  margin-top: 24px; line-height: 1.75;
}

.hero-badges {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
  margin-top: 36px; position: relative; z-index: 2;
  opacity: 0; animation: fadeUp .9s ease 1.05s forwards;
}
.hero-badge {
  font-family: 'DM Mono', monospace; font-size: .68rem;
  letter-spacing: .14em; text-transform: uppercase;
  padding: 6px 14px; border-radius: 40px;
  border: 1px solid rgba(212,168,67,.35);
  color: rgba(212,168,67,.9);
  background: rgba(212,168,67,.07);
}

.hero-dots {
  display: flex; gap: 7px; align-items: center;
  margin-top: 44px; position: relative; z-index: 2;
  opacity: 0; animation: fadeUp .9s ease 1.28s forwards;
}
.hero-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--gold);
  animation: dotBlink 1.8s ease-in-out infinite;
}
.hero-dot:nth-child(2) { animation-delay: .28s; }
.hero-dot:nth-child(3) { animation-delay: .56s; }
@keyframes dotBlink { 0%,100%{opacity:.25} 50%{opacity:1} }

.scroll-hint {
  position: absolute; bottom: 38px; left: 50%;
  transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 9px;
  z-index: 2;
  opacity: 0; animation: fadeIn 1s ease 1.8s forwards;
  color: rgba(255,255,255,.35);
  font-family: 'DM Mono', monospace; font-size: .65rem; letter-spacing: .22em;
}
.scroll-arrow {
  width: 22px; height: 32px;
  border: 1.5px solid rgba(212,168,67,.45); border-radius: 11px;
  position: relative;
}
.scroll-arrow::after {
  content: ''; position: absolute;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--gold);
  left: 50%; top: 6px; transform: translateX(-50%);
  animation: scrollDot 1.6s ease-in-out infinite;
}
@keyframes scrollDot {
  0%   { top: 6px; opacity: 1; }
  80%  { top: 17px; opacity: .15; }
  100% { top: 6px; opacity: 1; }
}

/* ─── NAV ─── */
nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(20,13,7,.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(212,168,67,.16);
  padding: 0 32px;
  display: flex; align-items: center;
  overflow-x: auto; gap: 0;
}
nav a {
  font-family: 'DM Mono', monospace;
  font-size: .7rem; letter-spacing: .18em; text-transform: uppercase;
  color: rgba(255,255,255,.45); text-decoration: none;
  padding: 18px 18px; white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: color .22s ease, border-color .22s ease;
  flex-shrink: 0;
}
nav a:hover { color: var(--gold); border-color: var(--gold); }

/* ─── MAIN ─── */
main { position: relative; z-index: 1; }

/* ─── SECTION BASE ─── */
.section {
  padding: 96px 24px;
  max-width: 980px; margin: 0 auto;
  opacity: 0; transform: translateY(36px);
  transition: opacity .7s ease, transform .7s ease;
}
.section.visible { opacity: 1; transform: none; }

.section-label {
  font-family: 'DM Mono', monospace;
  font-size: .68rem; letter-spacing: .32em; text-transform: uppercase;
  color: var(--amber); margin-bottom: 14px;
  display: flex; align-items: center; gap: 14px;
}
.section-label::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(to right, rgba(201,138,62,.6), transparent);
}

h2 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 700; line-height: 1.08; color: var(--ink);
  margin-bottom: 28px;
}
p { color: #4a3728; line-height: 1.85; margin-bottom: 1em; }
p:last-child { margin-bottom: 0; }

/* ─── DIVIDER ─── */
hr {
  border: none; height: 1px;
  background: linear-gradient(to right, transparent, rgba(201,138,62,.32), transparent);
  margin: 0;
}

/* ─── DARK SECTION ─── */
.dark-section {
  background: linear-gradient(140deg, #160e07 0%, #261810 100%);
  position: relative; overflow: hidden;
}
.dark-section::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 55% 55% at 15% 50%, rgba(201,138,62,.07) 0%, transparent 70%),
    radial-gradient(ellipse 40% 65% at 85% 25%, rgba(139,58,30,.1) 0%, transparent 70%);
}
.dark-section .section { opacity: 0; transform: translateY(36px); }
.dark-section .section.visible { opacity: 1; transform: none; }
.dark-section h2 { color: #fff; }
.dark-section p  { color: rgba(255,255,255,.55); }
.dark-section .section-label { color: var(--gold); }
.dark-section .section-label::after { background: linear-gradient(to right, rgba(212,168,67,.5), transparent); }

/* ─── GOAL CARDS ─── */
.goal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px; margin-top: 44px;
}
.goal-card {
  background: #fff;
  border: 1px solid rgba(201,138,62,.18);
  border-radius: 18px; padding: 28px 24px;
  position: relative; overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow);
  opacity: 0; transform: translateY(28px);
  transition: opacity .55s ease, transform .55s ease, box-shadow .3s ease;
}
.goal-card.visible { opacity: 1; transform: none; }
.goal-card:hover { box-shadow: 0 18px 48px var(--shadow-deep); transform: translateY(-5px); }
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
  font-size: 3rem; font-weight: 900;
  color: rgba(201,138,62,.13); line-height: 1;
  margin-bottom: 10px;
}
.goal-text { font-size: .98rem; color: var(--ink); line-height: 1.65; }

/* ─── TOKENS ROW ─── */
.token-row {
  display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px;
}
.token {
  display: flex; align-items: center; gap: 10px;
  background: #fff; border: 1px solid rgba(201,138,62,.2);
  border-radius: 40px; padding: 8px 16px;
  font-family: 'DM Mono', monospace; font-size: .76rem;
  color: var(--ink); box-shadow: 0 2px 8px var(--shadow);
  transition: transform .22s, box-shadow .22s;
  cursor: default;
}
.token:hover { transform: scale(1.06); box-shadow: 0 6px 20px var(--shadow); }
.token-swatch { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }

/* ─── CODE BLOCK ─── */
.code-block {
  background: #0a0704;
  border: 1px solid rgba(212,168,67,.2);
  border-radius: 18px; padding: 36px 32px 32px;
  font-family: 'DM Mono', monospace;
  font-size: .78rem; line-height: 1.95;
  color: rgba(255,255,255,.65); overflow-x: auto;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(212,168,67,.08), 0 28px 64px rgba(0,0,0,.55);
  margin-top: 36px;
}
.code-block::before {
  content: '● ● ●'; position: absolute;
  top: 14px; left: 22px;
  font-size: .68rem; color: rgba(255,255,255,.18);
  letter-spacing: .4em;
}
.code-block pre { white-space: pre; margin-top: 8px; }
.tree-dir    { color: var(--gold); font-weight: 500; }
.tree-file   { color: rgba(255,255,255,.52); }
.tree-branch { color: rgba(212,168,67,.3); }
.tree-comment { color: rgba(255,255,255,.25); font-style: italic; }

/* ─── WORKFLOW STEPS ─── */
.workflow-steps { display: flex; flex-direction: column; gap: 0; margin-top: 48px; }
.workflow-step {
  display: flex; gap: 28px; align-items: flex-start;
  padding: 30px 0; border-bottom: 1px solid rgba(201,138,62,.11);
  opacity: 0; transform: translateX(-22px);
  transition: opacity .55s ease, transform .55s ease;
}
.workflow-step:last-child { border-bottom: none; }
.workflow-step.visible { opacity: 1; transform: none; }
.step-num {
  flex-shrink: 0;
  width: 54px; height: 54px; border-radius: 50%;
  border: 1.5px solid var(--amber);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem; font-weight: 900;
  color: var(--amber);
  background: rgba(201,138,62,.06);
  position: relative;
}
.step-num::before {
  content: ''; position: absolute;
  width: 66px; height: 66px; border-radius: 50%;
  border: 1px solid rgba(201,138,62,.18);
  animation: ripple 2.8s ease-out infinite;
}
@keyframes ripple {
  0%   { transform: scale(.88); opacity: .8; }
  100% { transform: scale(1.55); opacity: 0; }
}
.step-body h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.12rem; color: var(--ink); margin-bottom: 6px;
}
.step-body p { font-size: .95rem; color: #5a4535; margin: 0; line-height: 1.7; }

/* ─── FEATURE CARDS ─── */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
  gap: 22px; margin-top: 48px;
}
.feature-card {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(212,168,67,.14);
  border-radius: 20px; padding: 34px 28px;
  position: relative; overflow: hidden;
  opacity: 0; transform: translateY(28px);
  transition: opacity .55s ease, transform .55s ease, background .28s, border-color .28s;
}
.feature-card.visible { opacity: 1; transform: none; }
.feature-card::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 65% 0%, rgba(212,168,67,.09) 0%, transparent 60%);
  opacity: 0; transition: opacity .3s;
}
.feature-card:hover { background: rgba(255,255,255,.07); border-color: rgba(212,168,67,.4); transform: translateY(-4px); }
.feature-card:hover::after { opacity: 1; }
.feature-icon {
  font-size: 2.1rem; margin-bottom: 16px;
  display: inline-block;
  animation: iconFloat 3.2s ease-in-out infinite;
}
@keyframes iconFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.feature-card:nth-child(2) .feature-icon { animation-delay: .45s; }
.feature-card:nth-child(3) .feature-icon { animation-delay: .9s; }
.feature-card:nth-child(4) .feature-icon { animation-delay: 1.35s; }
.feature-card:nth-child(5) .feature-icon { animation-delay: 1.8s; }
.feature-card:nth-child(6) .feature-icon { animation-delay: 2.25s; }
.feature-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.18rem; font-weight: 700;
  color: #fff; margin-bottom: 10px;
}
.feature-desc { font-size: .91rem; color: rgba(255,255,255,.52); line-height: 1.72; }

/* ─── INSTALL STEPS ─── */
.install-steps { display: flex; flex-direction: column; gap: 14px; margin-top: 40px; }
.install-step {
  background: #fff; border-radius: 14px;
  border: 1px solid rgba(201,138,62,.14);
  padding: 20px 24px;
  display: flex; gap: 18px; align-items: flex-start;
  box-shadow: 0 3px 14px var(--shadow);
  transition: transform .26s ease, box-shadow .26s ease;
}
.install-step:hover { transform: translateX(7px); box-shadow: 0 8px 30px var(--shadow); }
.install-badge {
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--amber), var(--gold));
  color: #fff; border-radius: 8px;
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Mono', monospace; font-size: .78rem; font-weight: 500;
}
.install-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; margin-bottom: 5px; color: var(--ink); }
.install-cmd {
  font-family: 'DM Mono', monospace; font-size: .78rem;
  background: #f5f0e8; border-radius: 6px; padding: 4px 10px;
  color: var(--ember); display: inline-block; margin-top: 2px;
}

/* ─── CHECKLIST ─── */
.checklist { list-style: none; margin-top: 32px; display: flex; flex-direction: column; gap: 11px; }
.checklist li {
  display: flex; align-items: center; gap: 14px;
  font-size: .98rem; color: var(--ink);
  padding: 14px 18px; background: #fff;
  border-radius: 10px; border: 1px solid rgba(201,138,62,.14);
  box-shadow: 0 2px 8px var(--shadow);
  transition: transform .24s ease;
}
.checklist li:hover { transform: translateX(6px); }
.check-box {
  width: 22px; height: 22px; border-radius: 6px;
  border: 1.5px solid rgba(201,138,62,.38);
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--sage); font-size: .78rem;
}

/* ─── SCENARIOS ─── */
.scenarios-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px; margin-top: 40px;
}
.scenario-card {
  background: #fff; border: 1px solid rgba(201,138,62,.17);
  border-radius: 16px; padding: 26px 22px;
  box-shadow: 0 4px 18px var(--shadow);
  opacity: 0; transform: translateY(26px);
  transition: opacity .55s ease, transform .55s ease, box-shadow .28s;
}
.scenario-card.visible { opacity: 1; transform: none; }
.scenario-card:hover { box-shadow: 0 14px 40px var(--shadow-deep); }
.scenario-num {
  font-family: 'DM Mono', monospace; font-size: .68rem;
  letter-spacing: .22em; text-transform: uppercase;
  color: var(--amber); margin-bottom: 10px;
}
.scenario-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.08rem; font-weight: 700; color: var(--ink); margin-bottom: 12px;
}
.scenario-steps { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.scenario-steps li {
  font-size: .88rem; color: #5a4535;
  padding-left: 16px; position: relative; line-height: 1.6;
}
.scenario-steps li::before {
  content: '→'; position: absolute; left: 0; color: var(--amber);
  font-family: 'DM Mono', monospace; font-size: .8rem;
}

/* ─── EXTEND GRID ─── */
.extend-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px; margin-top: 36px;
}
.extend-item {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(212,168,67,.13);
  border-radius: 14px; padding: 20px 18px;
  opacity: 0; transform: translateY(22px);
  transition: opacity .5s ease, transform .5s ease, border-color .25s;
}
.extend-item.visible { opacity: 1; transform: none; }
.extend-item:hover { border-color: rgba(212,168,67,.4); }
.extend-emoji { font-size: 1.4rem; margin-bottom: 10px; }
.extend-title { font-family: 'Playfair Display', serif; font-size: .98rem; font-weight: 700; color: rgba(255,255,255,.9); margin-bottom: 6px; }
.extend-desc  { font-size: .82rem; color: rgba(255,255,255,.42); line-height: 1.6; }

/* ─── FULL FEATURE LIST ─── */
.feature-list-grid {
  columns: 2; column-gap: 32px; margin-top: 36px;
  list-style: none;
}
@media (max-width: 600px) { .feature-list-grid { columns: 1; } }
.feature-list-grid li {
  break-inside: avoid;
  display: flex; align-items: flex-start; gap: 10px;
  padding: 9px 0; border-bottom: 1px solid rgba(201,138,62,.1);
  font-size: .94rem; color: #4a3728; line-height: 1.5;
}
.feature-list-grid li::before {
  content: '◆'; font-size: .55rem; color: var(--amber);
  flex-shrink: 0; margin-top: 5px;
}

/* ─── AUTHOR ─── */
.author-section {
  background: linear-gradient(140deg, #160e07, #261810);
  padding: 130px 24px; text-align: center; position: relative; overflow: hidden;
}
.author-section::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(201,138,62,.1) 0%, transparent 65%);
}
.author-orbit {
  width: 180px; height: 180px; border-radius: 50%;
  border: 1.5px solid rgba(212,168,67,.35);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 40px;
  position: relative; z-index: 1;
  animation: orbit 8s linear infinite;
}
@keyframes orbit { to { transform: rotate(360deg); } }
.author-orbit-inner {
  width: 150px; height: 150px; border-radius: 50%;
  border: 1px solid rgba(212,168,67,.18);
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle, rgba(201,138,62,.13) 0%, transparent 70%);
  animation: orbit 8s linear infinite reverse;
}
.author-initials {
  font-family: 'Playfair Display', serif;
  font-size: 3.2rem; font-weight: 900; color: var(--gold);
}
.author-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: .7rem; letter-spacing: .32em; text-transform: uppercase;
  color: var(--gold); margin-bottom: 16px;
  position: relative; z-index: 1;
}
.author-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.6rem, 8vw, 5.5rem);
  font-weight: 900; color: #fff;
  position: relative; z-index: 1;
  text-shadow: 0 0 70px rgba(212,168,67,.28);
  margin-bottom: 12px; letter-spacing: -.015em;
}
.author-name span { color: var(--gold); }
.author-role {
  font-size: 1.08rem; font-style: italic;
  color: rgba(255,255,255,.45);
  position: relative; z-index: 1; margin-bottom: 36px;
}
.author-quote {
  max-width: 580px; margin: 0 auto;
  font-size: 1.02rem; font-style: italic;
  color: rgba(255,255,255,.38);
  border-top: 1px solid rgba(212,168,67,.18);
  padding-top: 28px;
  position: relative; z-index: 1;
  line-height: 1.85;
}

/* ─── FOOTER ─── */
footer {
  background: #0a0704; padding: 38px 24px;
  text-align: center;
  font-family: 'DM Mono', monospace; font-size: .7rem;
  letter-spacing: .14em; color: rgba(255,255,255,.18);
  border-top: 1px solid rgba(212,168,67,.1);
}
footer span { color: var(--gold); }

/* ─── BADGE ROW ─── */
.badge-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.badge {
  font-family: 'DM Mono', monospace; font-size: .7rem;
  padding: 6px 14px; border-radius: 40px;
  border: 1px solid rgba(201,138,62,.34);
  color: var(--amber); background: rgba(201,138,62,.07);
  letter-spacing: .08em;
  transition: background .22s, color .22s;
}
.badge:hover { background: var(--amber); color: #fff; }

/* ─── ANIMATIONS ─── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: none; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ─── STAGGER HELPERS ─── */
.goal-card:nth-child(1)     { transition-delay: 0s; }
.goal-card:nth-child(2)     { transition-delay: .1s; }
.goal-card:nth-child(3)     { transition-delay: .2s; }
.goal-card:nth-child(4)     { transition-delay: .3s; }
.goal-card:nth-child(5)     { transition-delay: .4s; }
.feature-card:nth-child(1)  { transition-delay: 0s; }
.feature-card:nth-child(2)  { transition-delay: .1s; }
.feature-card:nth-child(3)  { transition-delay: .2s; }
.feature-card:nth-child(4)  { transition-delay: .3s; }
.feature-card:nth-child(5)  { transition-delay: .4s; }
.feature-card:nth-child(6)  { transition-delay: .5s; }
.scenario-card:nth-child(1) { transition-delay: 0s; }
.scenario-card:nth-child(2) { transition-delay: .1s; }
.scenario-card:nth-child(3) { transition-delay: .2s; }
.scenario-card:nth-child(4) { transition-delay: .3s; }
.extend-item:nth-child(1)   { transition-delay: 0s; }
.extend-item:nth-child(2)   { transition-delay: .08s; }
.extend-item:nth-child(3)   { transition-delay: .16s; }
.extend-item:nth-child(4)   { transition-delay: .24s; }
.extend-item:nth-child(5)   { transition-delay: .32s; }
.extend-item:nth-child(6)   { transition-delay: .4s; }
.extend-item:nth-child(7)   { transition-delay: .48s; }
</style>
</head>
<body>

<canvas id="particles"></canvas>

<!-- ══════════════════════ HERO ══════════════════════ -->
<section class="hero">
  <div class="hero-grid"></div>
  <div class="hero-glow"></div>
  <div class="scan-line"></div>

  <p class="hero-eyebrow">A Curated Retail Ledger</p>
  <h1 class="hero-title">Scan<span>Bill</span>&nbsp;Pro</h1>
  <p class="hero-sub">A refined barcode billing dashboard with intelligent discovery, animated classical design, and a polished point‑of‑sale workflow.</p>

  <div class="hero-badges">
    <span class="hero-badge">Live Scanning</span>
    <span class="hero-badge">JWT Auth</span>
    <span class="hero-badge">AI Lookup</span>
    <span class="hero-badge">Animated UI</span>
    <span class="hero-badge">Receipt Engine</span>
    <span class="hero-badge">SSE Streams</span>
    <span class="hero-badge">Dark Theme</span>
    <span class="hero-badge">TypeScript</span>
  </div>

  <div class="hero-dots">
    <div class="hero-dot"></div>
    <div class="hero-dot"></div>
    <div class="hero-dot"></div>
  </div>

  <div class="scroll-hint">
    <div class="scroll-arrow"></div>
    SCROLL
  </div>
</section>

<!-- ══════════════════════ NAV ══════════════════════ -->
<nav>
  <a href="#overview">Overview</a>
  <a href="#philosophy">Philosophy</a>
  <a href="#architecture">Architecture</a>
  <a href="#workflow">Workflow</a>
  <a href="#features">Features</a>
  <a href="#install">Install</a>
  <a href="#structure">Structure</a>
  <a href="#scenarios">Scenarios</a>
  <a href="#extend">Extend</a>
  <a href="#security">Security</a>
  <a href="#author">Author</a>
</nav>

<main>

<!-- ══════════════════════ OVERVIEW ══════════════════════ -->
<div id="overview">
  <div class="section">
    <p class="section-label">Project Overview</p>
    <h2>What is ScanBill Pro?</h2>
    <p>ScanBill Pro is a premium retail dashboard built for modern point-of-sale experiences. It combines live webcam barcode scanning, secure JWT authentication, AI-backed barcode lookup, and a fully editable product catalog into one elegant web interface.</p>
    <p>Built with a retail-first mindset — fast scanning, clear product insight, rich transaction receipts, and secure access control. Every interaction is intentionally animated and crafted to feel polished, responsive, and delightful.</p>

    <div class="badge-row">
      <span class="badge">html5-qrcode</span>
      <span class="badge">Express.js</span>
      <span class="badge">React + Vite</span>
      <span class="badge">TypeScript</span>
      <span class="badge">motion/react</span>
      <span class="badge">jsonwebtoken</span>
      <span class="badge">OpenFoodFacts</span>
      <span class="badge">Gemini AI</span>
    </div>

    <div class="goal-grid">
      <div class="goal-card">
        <div class="goal-num">01</div>
        <div class="goal-text">Fast, accurate barcode scanning directly in the browser via webcam.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">02</div>
        <div class="goal-text">Intelligent product resolution for both standard and custom barcodes.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">03</div>
        <div class="goal-text">Clear, actionable inventory management with real-time inline editing.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">04</div>
        <div class="goal-text">Secure, maintainable collection of sale transactions with printable receipts.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">05</div>
        <div class="goal-text">A strong, extensible baseline for production-grade POS experiences.</div>
      </div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════════════════ PHILOSOPHY ══════════════════════ -->
<div id="philosophy">
  <div class="section">
    <p class="section-label">Design Philosophy</p>
    <h2>Crafted with Intention</h2>
    <p>ScanBill Pro is built with a deliberate design system that prioritizes clarity, speed, and delight. Visual hierarchy emerges from depth, soft shadows, and layered cards. Motion is used to guide attention — never to distract from the task at hand.</p>
    <p>Data-rich controls are simplified through animated toggles, feedback chips, and progress states. The UI is optimized for both desktop and tablet-style POS terminals, resulting in a checkout experience that feels modern, coherent, and trustworthy.</p>

    <div class="token-row">
      <div class="token"><div class="token-swatch" style="background:#6d28d9"></div>violet accent</div>
      <div class="token"><div class="token-swatch" style="background:#10b981"></div>emerald success</div>
      <div class="token"><div class="token-swatch" style="background:#1a110a"></div>dark canvas</div>
      <div class="token"><div class="token-swatch" style="background:#f59e0b"></div>amber alert</div>
      <div class="token"><div class="token-swatch" style="background:#d4a843"></div>gold highlight</div>
      <div class="token"><div class="token-swatch" style="background:#fdf7ef"></div>parchment bg</div>
      <div class="token"><div class="token-swatch" style="background:#4a7c59"></div>sage confirm</div>
      <div class="token"><div class="token-swatch" style="background:#8b3a1e"></div>ember danger</div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════════════════ ARCHITECTURE ══════════════════════ -->
<div class="dark-section" id="architecture">
  <div class="section">
    <p class="section-label">Architecture &amp; Design Tree</p>
    <h2>The Blueprint</h2>
    <p>A complete map of the application — from top-level features down to individual UI and backend components. Use it as a design blueprint or developer architecture reference.</p>

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
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Product Lightbox Preview</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Add / Delete Product Actions</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Receipt Modal</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Print Optimised Invoice</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Transaction Summary</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Tax &amp; Total Calculations</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Payment Status Badge</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Authentication Screens</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Login &amp; Registration Pages</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Token Storage (LocalStorage)</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Session Refresh Logic</span>
<span class="tree-branch">│   └──</span> <span class="tree-dir">Micro Animations</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Hover &amp; Focus States</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Pulse Alerts (low stock)</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Modal Entrance / Exit</span>
<span class="tree-branch">│       └──</span> <span class="tree-file">Table Row Transitions</span>
<span class="tree-branch">├──</span> <span class="tree-dir">Backend</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Express API</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">POST  /api/auth/login</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">POST  /api/auth/register</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">GET   /api/auth/me</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">GET   /api/products</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">POST  /api/scan</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">GET   /api/scan-stream  (SSE)</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">POST  /api/products/bulk</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Security Layer</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">JWT Middleware</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Role Validation</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Authorization Guards</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Secret Management (.env)</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Barcode Intelligence</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">OpenFoodFacts Lookup</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Gemini AI Fallback</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Deterministic Generator</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Metadata Sanitisation</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Transaction Engine</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Receipt Number Generator</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Item Totals &amp; Tax Calculator</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Receipt Serialisation</span>
<span class="tree-branch">│   ├──</span> <span class="tree-dir">Scanner Stream (SSE)</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">SSE Client Registry</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">Scan Broadcasting</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">Physical Scanner Hooks</span>
<span class="tree-branch">│   └──</span> <span class="tree-dir">In-Memory Data Store</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Products DB</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Scan Logs</span>
<span class="tree-branch">│       ├──</span> <span class="tree-file">Transaction History</span>
<span class="tree-branch">│       └──</span> <span class="tree-file">User Accounts</span>
<span class="tree-branch">└──</span> <span class="tree-dir">Developer Experience</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">Local Dev Server (Vite)</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">Environment Configuration</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">Startup Scripts (npm run dev)</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">Debug Logging</span>
<span class="tree-branch">    └──</span> <span class="tree-file">Tailored Error Messages</span></pre>
    </div>
  </div>
</div>

<!-- ══════════════════════ WORKFLOW ══════════════════════ -->
<div id="workflow">
  <div class="section">
    <p class="section-label">Workflow Map</p>
    <h2>From Scan to Receipt</h2>
    <p>A narrative of how users move through the system and how data flows through every layer of the application — from first login to final printout.</p>

    <div class="workflow-steps">
      <div class="workflow-step">
        <div class="step-num">1</div>
        <div class="step-body">
          <h3>Launch &amp; Authenticate</h3>
          <p>The UI shell initialises with dark theme and motion. Users log in or register with email and password. A JWT token is created, stored in LocalStorage, and validated via <code>/api/auth/me</code> to unlock the full dashboard.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">2</div>
        <div class="step-body">
          <h3>Begin Scan Session</h3>
          <p>The webcam scanner panel activates via html5-qrcode and listens continuously. When a valid barcode is detected, a <code>POST /api/scan</code> request fires instantly. A live scan history feed keeps the operator aware of recent activity.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">3</div>
        <div class="step-body">
          <h3>Intelligent Product Lookup</h3>
          <p>Known items display with price, stock, and image immediately. Unknown barcodes trigger the three-tier fallback engine: OpenFoodFacts first, then Gemini AI, then a deterministic product generator — so the checkout flow is never blocked.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">4</div>
        <div class="step-body">
          <h3>Build the Receipt</h3>
          <p>Each scanned item glides into the active receipt tile with an animated entrance. Subtotal, tax, and grand total recalculate in real time as the cart grows. Low-stock items pulse with a warm amber warning.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">5</div>
        <div class="step-body">
          <h3>Manage Catalog (anytime)</h3>
          <p>The product catalog modal is always accessible. Operators can search, sort, filter, edit prices, adjust stock levels, delete obsolete SKUs, and add new items — all with inline edits protected by token-based security.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">6</div>
        <div class="step-body">
          <h3>Finalise &amp; Print</h3>
          <p>Confirm checkout to generate a unique receipt number and store the transaction in history. The receipt modal scales into view with a polished print-ready invoice. A single click delivers the physical proof of sale.</p>
        </div>
      </div>
      <div class="workflow-step">
        <div class="step-num">7</div>
        <div class="step-body">
          <h3>Continue Sales</h3>
          <p>A gentle fade resets the scan session. The catalog and history persist across sessions. Repeat the loop — fast, accurate, and delightful every time.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════════════════ FEATURES ══════════════════════ -->
<div class="dark-section" id="features">
  <div class="section">
    <p class="section-label">Unique Features</p>
    <h2>What Makes It Special</h2>
    <p>ScanBill Pro is built with a layered feature set that is both functional and delightful. Every capability is intentional and every detail is refined.</p>

    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">📷</div>
        <div class="feature-title">Smart Scanner</div>
        <div class="feature-desc">Browser-based barcode scanning via html5-qrcode. Responsive scan panel adapts to mobile and desktop camera feeds. Physical scanner hookup via POST + SSE stream.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧠</div>
        <div class="feature-title">AI Barcode Intelligence</div>
        <div class="feature-desc">Three-tier lookup: OpenFoodFacts → Gemini AI fallback → deterministic generator. Product metadata enriched with price, stock, summary, and image. Checkout is never blocked by missing data.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🛡️</div>
        <div class="feature-title">Secure Auth</div>
        <div class="feature-desc">JWT login, registration, and session validation. Role-aware endpoints guard every protected inventory operation. Secrets managed via environment variables.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🗂️</div>
        <div class="feature-title">Live Catalog Management</div>
        <div class="feature-desc">Real-time inline editing with immediate UI updates. Search, sort, and filter controls. Stock-level indicators pulse on low inventory. Bulk import endpoint ready for enterprise ingestion.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🧾</div>
        <div class="feature-title">Receipt Engine</div>
        <div class="feature-desc">Printable invoice with itemised totals, automatic tax calculation, and payment status badges. Optimised for both screen display and physical paper printing.</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">✨</div>
        <div class="feature-title">Animated UI</div>
        <div class="feature-desc">Motion-driven modal entrances and exits, hover states, pulse alerts for stock warnings, and a consistent animation language via motion/react that feels warm and premium throughout.</div>
      </div>
    </div>

    <!-- Complete Feature List -->
    <div style="margin-top: 64px;">
      <p class="section-label">Complete Feature List</p>
      <ul class="feature-list-grid">
        <li>Live barcode scanning with webcam camera</li>
        <li>Intelligent automatic product detection</li>
        <li>AI-powered fallback lookup (Gemini)</li>
        <li>OpenFoodFacts public product database</li>
        <li>Deterministic fallback product generator</li>
        <li>Product catalog management with inline editing</li>
        <li>Receipt generation and print-ready invoice</li>
        <li>Low-stock alert animations and warnings</li>
        <li>JWT login and secure API access</li>
        <li>Scan stream endpoint for external devices (SSE)</li>
        <li>Bulk product ingestion support</li>
        <li>Real-time transaction totals and tax calculations</li>
        <li>Dark theme aesthetic with gold accent highlights</li>
        <li>Smooth modal transitions and hover effects</li>
        <li>Custom product image previews and lightbox</li>
        <li>Search and sort capabilities in catalog</li>
        <li>Transaction receipt summary and history</li>
        <li>Backend request logging and debug outputs</li>
        <li>Token refresh and session validation support</li>
        <li>Simple deploy scripts via npm</li>
      </ul>
    </div>
  </div>
</div>

<!-- ══════════════════════ INSTALL ══════════════════════ -->
<div id="install">
  <div class="section">
    <p class="section-label">Installation</p>
    <h2>Up &amp; Running in Minutes</h2>
    <p>A clean five-step process to get the full ScanBill Pro experience running locally. If you don't have a Gemini API key, the app still works — AI enrichment is optional.</p>

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
          <div class="install-cmd">GEMINI_API_KEY=your_key &nbsp;&nbsp; JWT_SECRET=your_secret</div>
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
          <div class="install-title">Open in Browser</div>
          <div class="install-cmd">http://localhost:3000</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 12px;">
      <div class="install-step" style="border-color: rgba(74,124,89,.25);">
        <div class="install-badge" style="background: linear-gradient(135deg,#4a7c59,#6aaa80);">PRO</div>
        <div>
          <div class="install-title">Production Mode</div>
          <div class="install-cmd">npm start</div>
        </div>
      </div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════════════════ PROJECT STRUCTURE ══════════════════════ -->
<div class="dark-section" id="structure">
  <div class="section">
    <p class="section-label">Project Structure</p>
    <h2>Clean &amp; Focused</h2>
    <p>One backend, a focused frontend, and a modern component layout. The structure is intentionally simple — every file has a clear purpose.</p>

    <div class="code-block">
      <pre><span class="tree-dir">barcode-billing-dashboard/</span>
<span class="tree-branch">├──</span> <span class="tree-file">.env</span>                   <span class="tree-comment"># GEMINI_API_KEY, JWT_SECRET</span>
<span class="tree-branch">├──</span> <span class="tree-file">index.html</span>             <span class="tree-comment"># Vite entry point</span>
<span class="tree-branch">├──</span> <span class="tree-file">package.json</span>
<span class="tree-branch">├──</span> <span class="tree-file">server.js</span>              <span class="tree-comment"># Express API + scanner engine</span>
<span class="tree-branch">├──</span> <span class="tree-file">server.ts</span>              <span class="tree-comment"># TypeScript source</span>
<span class="tree-branch">├──</span> <span class="tree-file">tsconfig.json</span>
<span class="tree-branch">├──</span> <span class="tree-file">vite.config.ts</span>
<span class="tree-branch">├──</span> <span class="tree-file">database.sql</span>           <span class="tree-comment"># Schema reference</span>
<span class="tree-branch">├──</span> <span class="tree-file">metadata.json</span>
<span class="tree-branch">├──</span> <span class="tree-file">requirements.txt</span>
<span class="tree-branch">└──</span> <span class="tree-dir">src/</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">App.tsx</span>              <span class="tree-comment"># Application shell</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">main.tsx</span>             <span class="tree-comment"># React entry point</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">main.js</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">index.css</span>            <span class="tree-comment"># Global styles</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">types.ts</span>             <span class="tree-comment"># Shared TypeScript interfaces</span>
<span class="tree-branch">    └──</span> <span class="tree-dir">components/</span>
<span class="tree-branch">        ├──</span> <span class="tree-file">ProductCatalogModal.tsx</span>
<span class="tree-branch">        └──</span> <span class="tree-file">ReceiptModal.tsx</span></pre>
    </div>
  </div>
</div>

<!-- ══════════════════════ SCENARIOS ══════════════════════ -->
<div id="scenarios">
  <div class="section">
    <p class="section-label">Usage Patterns</p>
    <h2>Four Ways to Use ScanBill Pro</h2>
    <p>ScanBill Pro is purpose-built for real retail workflows. Here are the four primary usage patterns, each supported by both the UI and backend.</p>

    <div class="scenarios-grid">
      <div class="scenario-card">
        <div class="scenario-num">Scenario 01</div>
        <div class="scenario-title">Quick Retail Checkout</div>
        <ul class="scenario-steps">
          <li>Open the app and log in as cashier</li>
          <li>Activate the camera scanner</li>
          <li>Scan barcode after barcode</li>
          <li>Watch items appear in the transaction tile</li>
          <li>Print the receipt at end of sale</li>
        </ul>
      </div>
      <div class="scenario-card">
        <div class="scenario-num">Scenario 02</div>
        <div class="scenario-title">Inventory Audit</div>
        <ul class="scenario-steps">
          <li>Open the product catalog modal</li>
          <li>Search for a SKU or barcode</li>
          <li>Edit price or stock values inline</li>
          <li>Delete obsolete items</li>
          <li>Add missing inventory manually</li>
        </ul>
      </div>
      <div class="scenario-card">
        <div class="scenario-num">Scenario 03</div>
        <div class="scenario-title">AI Catalog Discovery</div>
        <ul class="scenario-steps">
          <li>Scan an unknown barcode</li>
          <li>Let the AI lookup engine attempt a match</li>
          <li>Review and accept generated product details</li>
          <li>Add the item to the live catalog</li>
        </ul>
      </div>
      <div class="scenario-card">
        <div class="scenario-num">Scenario 04</div>
        <div class="scenario-title">Physical Scanner Hookup</div>
        <ul class="scenario-steps">
          <li>Connect an external barcode scanner</li>
          <li>Send scan events to POST /api/scan</li>
          <li>Subscribe to SSE via /api/scan-stream</li>
          <li>Monitor activity in real time</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<hr />

<!-- ══════════════════════ EXTEND ══════════════════════ -->
<div class="dark-section" id="extend">
  <div class="section">
    <p class="section-label">Extending the Design</p>
    <h2>Built to Grow</h2>
    <p>ScanBill Pro is intentionally extensible. The architecture is solid and the patterns are clean — adding new capabilities is straightforward.</p>

    <div class="extend-grid">
      <div class="extend-item">
        <div class="extend-emoji">👥</div>
        <div class="extend-title">Admin Dashboard</div>
        <div class="extend-desc">Employee management, roles, and audit logs for multi-operator deployments.</div>
      </div>
      <div class="extend-item">
        <div class="extend-emoji">📊</div>
        <div class="extend-title">Product Analytics</div>
        <div class="extend-desc">Top-selling SKUs, scan volume charts, and revenue trends over time.</div>
      </div>
      <div class="extend-item">
        <div class="extend-emoji">📁</div>
        <div class="extend-title">Barcode Import / Export</div>
        <div class="extend-desc">CSV and Excel ingestion and export for bulk catalog management.</div>
      </div>
      <div class="extend-item">
        <div class="extend-emoji">🏪</div>
        <div class="extend-title">Multi-Store Sync</div>
        <div class="extend-desc">Centralised inventory sync layer across multiple locations or terminals.</div>
      </div>
      <div class="extend-item">
        <div class="extend-emoji">📱</div>
        <div class="extend-title">Mobile Cashier App</div>
        <div class="extend-desc">Dedicated mobile-first interface for tablet and handheld POS terminals.</div>
      </div>
      <div class="extend-item">
        <div class="extend-emoji">🔌</div>
        <div class="extend-title">Hardware Scanner Layer</div>
        <div class="extend-desc">WebSocket or HID integration for industrial barcode scanners and printers.</div>
      </div>
      <div class="extend-item">
        <div class="extend-emoji">📧</div>
        <div class="extend-title">Receipt Emailing</div>
        <div class="extend-desc">Send digital receipts directly to customers via email after checkout.</div>
      </div>
    </div>

    <!-- Testing & Validation -->
    <div style="margin-top: 72px;">
      <p class="section-label">Testing &amp; Validation</p>
      <h2>Resilient by Design</h2>
      <p>While primarily a UI-driven prototype, every layer is built to degrade gracefully rather than fail abruptly. The following validation checkpoints are built in:</p>
      <div style="margin-top: 28px; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 14px;">
        <div style="background:rgba(255,255,255,.04); border:1px solid rgba(212,168,67,.14); border-radius:12px; padding:16px 18px; font-size:.9rem; color:rgba(255,255,255,.55);">✓ &nbsp;Login and token validation</div>
        <div style="background:rgba(255,255,255,.04); border:1px solid rgba(212,168,67,.14); border-radius:12px; padding:16px 18px; font-size:.9rem; color:rgba(255,255,255,.55);">✓ &nbsp;Protected backend API routes</div>
        <div style="background:rgba(255,255,255,.04); border:1px solid rgba(212,168,67,.14); border-radius:12px; padding:16px 18px; font-size:.9rem; color:rgba(255,255,255,.55);">✓ &nbsp;Barcode string sanitisation</div>
        <div style="background:rgba(255,255,255,.04); border:1px solid rgba(212,168,67,.14); border-radius:12px; padding:16px 18px; font-size:.9rem; color:rgba(255,255,255,.55);">✓ &nbsp;Product payload field validation</div>
        <div style="background:rgba(255,255,255,.04); border:1px solid rgba(212,168,67,.14); border-radius:12px; padding:16px 18px; font-size:.9rem; color:rgba(255,255,255,.55);">✓ &nbsp;Graceful fallback for missing lookup data</div>
        <div style="background:rgba(255,255,255,.04); border:1px solid rgba(212,168,67,.14); border-radius:12px; padding:16px 18px; font-size:.9rem; color:rgba(255,255,255,.55);">✓ &nbsp;Transaction total and tax calculations</div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════ SECURITY + PRODUCTION ══════════════════════ -->
<div id="security">
  <div class="section">
    <p class="section-label">Security &amp; Production</p>
    <h2>Ready for the Real World</h2>
    <p>Security is built into core flows. A production deployment should add HTTPS, rate limiting, and a persistent database — but the security foundations are already in place.</p>

    <div class="goal-grid" style="margin-top:36px;">
      <div class="goal-card">
        <div class="goal-num">🔒</div>
        <div class="goal-text"><strong>JWT Auth</strong> — Every protected endpoint checks for a valid token. Admin operations are guarded with role checks.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">🗝️</div>
        <div class="goal-text"><strong>Secret Management</strong> — Sensitive keys stored in <code>.env</code>. Never committed to version control.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">🛡️</div>
        <div class="goal-text"><strong>Payload Validation</strong> — Backend validates required fields on every product and auth request.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">📡</div>
        <div class="goal-text"><strong>HTTPS Ready</strong> — Production version should terminate TLS at an edge load balancer with a CDN in front.</div>
      </div>
      <div class="goal-card">
        <div class="goal-num">🗄️</div>
        <div class="goal-text"><strong>Persistent Storage</strong> — Replace the in-memory store with a real database for users, products, and transactions.</div>
      </div>
    </div>

    <div style="margin-top: 56px;">
      <p class="section-label">Maintenance Checklist</p>
      <ul class="checklist">
        <li><div class="check-box">☐</div> Verify JWT_SECRET is set in production environment</li>
        <li><div class="check-box">☐</div> Replace in-memory storage with a persistent database</li>
        <li><div class="check-box">☐</div> Add end-to-end tests for scan and checkout flows</li>
        <li><div class="check-box">☐</div> Build better offline support for the scanner panel</li>
        <li><div class="check-box">☐</div> Improve error messages for network failures</li>
        <li><div class="check-box">☐</div> Add analytics for scan volume and product usage</li>
        <li><div class="check-box">☐</div> Tune UI animations for lighter CPU usage</li>
        <li><div class="check-box">☐</div> Add rate limiting to all public auth endpoints</li>
      </ul>
    </div>

    <div style="margin-top:56px;">
      <p class="section-label">Contribution Guidelines</p>
      <p>Keep the UI consistent and animation-friendly. Preserve security checks for protected endpoints. Add tests when extending backend logic. Avoid large bundle sizes or heavy dependencies. Every enhancement should make ScanBill Pro feel more polished.</p>

      <p class="section-label" style="margin-top:32px;">Learning Path</p>
      <p>This codebase is useful for learning how to build a modern retail dashboard. Study how React and Vite work together, how <code>motion/react</code> orchestrates animations, JWT authentication patterns, three-tier fallback data enrichment, and SSE for real-time device streaming.</p>
    </div>
  </div>
</div>

<hr />

<!-- ══════════════════════ AUTHOR ══════════════════════ -->
<div class="author-section" id="author">
  <div class="author-orbit">
    <div class="author-orbit-inner">
      <div class="author-initials">DP</div>
    </div>
  </div>
  <p class="author-eyebrow">Lead Artisan</p>
  <h2 class="author-name">Darshan <span>Paapani</span></h2>
  <p class="author-role">Crafted with classical elegance &amp; premium motion design</p>
  <p class="author-quote">
    "ScanBill Pro is built with a top-to-bottom design mindset. Every workflow is mapped, every animation is intentional, and the product is positioned as a premium retail experience — from scan to receipt."
  </p>
</div>

</main>

<!-- ══════════════════════ FOOTER ══════════════════════ -->
<footer>
  <span>ScanBill Pro</span> &nbsp;·&nbsp; Lead Artisan: Darshan Paapani &nbsp;·&nbsp; A Curated Retail Ledger
</footer>

<script>
/* ─── PARTICLES ─── */
(function () {
  var canvas = document.getElementById('particles');
  var ctx = canvas.getContext('2d');
  var W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a: Math.random()
    };
  }

  function init() {
    particles = [];
    for (var i = 0; i < 130; i++) particles.push(makeParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212,168,67,' + (p.a * 0.22) + ')';
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
    }
    requestAnimationFrame(draw);
  }

  resize(); init(); draw();
  window.addEventListener('resize', function () { resize(); init(); });
})();

/* ─── INTERSECTION OBSERVER ─── */
(function () {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });

  var selectors = [
    '.section',
    '.goal-card',
    '.feature-card',
    '.workflow-step',
    '.scenario-card',
    '.extend-item'
  ];

  document.querySelectorAll(selectors.join(', ')).forEach(function (el) {
    io.observe(el);
  });
})();

/* ─── WORKFLOW STEP STAGGER ─── */
document.querySelectorAll('.workflow-step').forEach(function (el, i) {
  el.style.transitionDelay = (i * 0.11) + 's';
});
</script>
</body>
</html>
