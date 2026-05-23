<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>ScanBill Pro — README</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}

:root{
  --ink:#1a110a;
  --parch:#f5ede0;
  --cream:#fdf7ef;
  --amber:#c98a3e;
  --ember:#8b3a1e;
  --sage:#4a7c59;
  --gold:#d4a843;
  --gold-dim:rgba(212,168,67,.18);
  --shadow:rgba(60,30,10,.14);
  --shadow-deep:rgba(60,30,10,.28);
  --dark1:#0a0704;
  --dark2:#160e07;
  --dark3:#261810;
}

body{
  font-family:'Cormorant Garamond',Georgia,serif;
  background:var(--cream);
  color:var(--ink);
  overflow-x:hidden;
  font-size:18px;
  line-height:1.8;
}

/* ── CANVAS ── */
#bg-canvas{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5}

/* ══════════════════════ HERO ══════════════════════ */
.hero{
  position:relative;
  min-height:100vh;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  overflow:hidden;
  background:radial-gradient(ellipse 80% 60% at 50% 30%,#2b1509 0%,#0a0704 100%);
  padding:80px 24px 120px;
}

.hero-grid{
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(212,168,67,.06) 1px,transparent 1px),
    linear-gradient(90deg,rgba(212,168,67,.06) 1px,transparent 1px);
  background-size:48px 48px;
  animation:gridDrift 60s linear infinite;
}
@keyframes gridDrift{from{background-position:0 0}to{background-position:48px 48px}}

.hero-glow{
  position:absolute;
  width:900px;height:900px;border-radius:50%;
  background:radial-gradient(circle,rgba(201,138,62,.18) 0%,transparent 65%);
  top:50%;left:50%;transform:translate(-50%,-50%);
  animation:glowPulse 5s ease-in-out infinite;
}
@keyframes glowPulse{
  0%,100%{opacity:.45;transform:translate(-50%,-50%) scale(1)}
  50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}
}

/* scan line */
.scan-line{
  position:absolute;left:0;right:0;height:2px;
  background:linear-gradient(to right,transparent 0%,rgba(212,168,67,.9) 50%,transparent 100%);
  animation:scanMove 4.5s ease-in-out infinite;
  top:20%;box-shadow:0 0 18px rgba(212,168,67,.6);
}
@keyframes scanMove{
  0%,100%{top:12%;opacity:0}
  8%{opacity:1}
  92%{opacity:1}
  50%{top:88%}
}

/* corner brackets */
.hero-brackets{
  position:absolute;inset:0;
  pointer-events:none;
}
.hero-brackets::before,.hero-brackets::after{
  content:'';position:absolute;width:70px;height:70px;
  border-color:rgba(212,168,67,.4);border-style:solid;
}
.hero-brackets::before{top:40px;left:40px;border-width:2px 0 0 2px}
.hero-brackets::after{bottom:40px;right:40px;border-width:0 2px 2px 0}

/* hero text */
.hero-eyebrow{
  font-family:'DM Mono',monospace;
  font-size:.72rem;letter-spacing:.38em;text-transform:uppercase;
  color:var(--gold);
  position:relative;z-index:2;margin-bottom:24px;
  opacity:0;animation:fadeUp .8s ease .3s forwards;
}

/* ── ANIMATED PROJECT NAME ── */
.hero-title{
  font-family:'Playfair Display',serif;
  font-size:clamp(4.5rem,14vw,10.5rem);
  font-weight:900;line-height:.9;
  color:#fff;text-align:center;
  position:relative;z-index:2;
  letter-spacing:-.02em;
  text-shadow:0 0 100px rgba(212,168,67,.3),0 4px 60px rgba(0,0,0,.95);
  opacity:0;animation:heroTitleIn 1.2s cubic-bezier(.16,1,.3,1) .6s forwards;
}
@keyframes heroTitleIn{
  0%{opacity:0;transform:translateY(60px) scale(.92);filter:blur(12px)}
  60%{opacity:1;filter:blur(0)}
  100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
}
.hero-title .t-scan{
  display:inline-block;
  color:#fff;
  animation:letterShimmer 6s ease-in-out 2s infinite;
}
@keyframes letterShimmer{
  0%,80%,100%{color:#fff;text-shadow:0 0 100px rgba(212,168,67,.3)}
  88%,93%{color:var(--gold);text-shadow:0 0 60px rgba(212,168,67,.9),0 0 120px rgba(212,168,67,.4)}
}
.hero-title .t-bill{
  color:var(--gold);
  display:inline-block;
  animation:goldPulse 3s ease-in-out 1.8s infinite;
  text-shadow:0 0 60px rgba(212,168,67,.5);
}
@keyframes goldPulse{
  0%,100%{text-shadow:0 0 40px rgba(212,168,67,.4)}
  50%{text-shadow:0 0 80px rgba(212,168,67,.8),0 0 160px rgba(212,168,67,.3)}
}
.hero-title .t-pro{
  display:inline-block;
  font-size:.5em;
  vertical-align:super;
  color:rgba(212,168,67,.7);
  font-style:italic;
  animation:proFade 2s ease-in-out 2.4s infinite alternate;
}
@keyframes proFade{from{opacity:.6}to{opacity:1}}

.hero-sub{
  font-size:1.15rem;font-weight:300;font-style:italic;
  color:rgba(255,255,255,.55);
  max-width:640px;text-align:center;
  position:relative;z-index:2;
  margin-top:28px;line-height:1.8;
  opacity:0;animation:fadeUp .9s ease 1.1s forwards;
}

/* badges */
.hero-badges{
  display:flex;flex-wrap:wrap;gap:10px;justify-content:center;
  margin-top:40px;position:relative;z-index:2;
  opacity:0;animation:fadeUp .9s ease 1.35s forwards;
}
.hero-badge{
  font-family:'DM Mono',monospace;font-size:.67rem;
  letter-spacing:.15em;text-transform:uppercase;
  padding:7px 15px;border-radius:40px;
  border:1px solid rgba(212,168,67,.3);
  color:rgba(212,168,67,.85);
  background:rgba(212,168,67,.07);
  transition:all .3s ease;
  cursor:default;
}
.hero-badge:hover{background:rgba(212,168,67,.18);border-color:rgba(212,168,67,.7);color:#fff;transform:translateY(-2px)}

/* pulse dots */
.hero-dots{display:flex;gap:9px;margin-top:48px;position:relative;z-index:2;opacity:0;animation:fadeUp .9s ease 1.6s forwards}
.hero-dot{width:8px;height:8px;border-radius:50%;background:var(--gold);animation:dotBlink 1.8s ease-in-out infinite}
.hero-dot:nth-child(2){animation-delay:.28s}
.hero-dot:nth-child(3){animation-delay:.56s}
@keyframes dotBlink{0%,100%{opacity:.2}50%{opacity:1}}

/* scroll hint */
.scroll-hint{
  position:absolute;bottom:40px;left:50%;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:10px;
  z-index:2;opacity:0;animation:fadeIn 1s ease 2.2s forwards;
  color:rgba(255,255,255,.3);
  font-family:'DM Mono',monospace;font-size:.63rem;letter-spacing:.24em;
}
.scroll-arrow{width:22px;height:33px;border:1.5px solid rgba(212,168,67,.4);border-radius:11px;position:relative}
.scroll-arrow::after{
  content:'';position:absolute;
  width:5px;height:5px;border-radius:50%;
  background:var(--gold);
  left:50%;top:7px;transform:translateX(-50%);
  animation:scrollDot 1.6s ease-in-out infinite;
}
@keyframes scrollDot{0%{top:7px;opacity:1}80%{top:18px;opacity:.1}100%{top:7px;opacity:1}}

/* ══════════════════════ NAV ══════════════════════ */
nav{
  position:sticky;top:0;z-index:100;
  background:rgba(10,7,4,.96);
  backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
  border-bottom:1px solid rgba(212,168,67,.14);
  padding:0 32px;
  display:flex;align-items:center;overflow-x:auto;gap:0;
}
nav a{
  font-family:'DM Mono',monospace;font-size:.68rem;
  letter-spacing:.17em;text-transform:uppercase;
  color:rgba(255,255,255,.4);text-decoration:none;
  padding:17px 16px;white-space:nowrap;
  border-bottom:2px solid transparent;
  transition:color .22s,border-color .22s;flex-shrink:0;
}
nav a:hover{color:var(--gold);border-color:var(--gold)}

/* ══════════════════════ SECTIONS ══════════════════════ */
main{position:relative;z-index:1}

.section{
  padding:96px 24px;max-width:1000px;margin:0 auto;
  opacity:0;transform:translateY(40px);
  transition:opacity .75s ease,transform .75s ease;
}
.section.visible{opacity:1;transform:none}

.section-label{
  font-family:'DM Mono',monospace;
  font-size:.68rem;letter-spacing:.32em;text-transform:uppercase;
  color:var(--amber);margin-bottom:14px;
  display:flex;align-items:center;gap:14px;
}
.section-label::after{content:'';flex:1;height:1px;background:linear-gradient(to right,rgba(201,138,62,.6),transparent)}

h2{
  font-family:'Playfair Display',serif;
  font-size:clamp(2rem,5vw,3.8rem);
  font-weight:700;line-height:1.06;color:var(--ink);margin-bottom:28px;
}
p{color:#4a3728;line-height:1.85;margin-bottom:1em}
p:last-child{margin-bottom:0}

hr{border:none;height:1px;background:linear-gradient(to right,transparent,rgba(201,138,62,.3),transparent);margin:0}

/* ── DARK SECTION ── */
.dark-section{
  background:linear-gradient(145deg,#0e0906 0%,#1e1208 55%,#261810 100%);
  position:relative;overflow:hidden;
}
.dark-section::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 60% 50% at 10% 60%,rgba(201,138,62,.07) 0%,transparent 70%),
    radial-gradient(ellipse 45% 60% at 90% 20%,rgba(139,58,30,.08) 0%,transparent 70%);
}
.dark-section h2{color:#fff}
.dark-section p{color:rgba(255,255,255,.52)}
.dark-section .section-label{color:var(--gold)}
.dark-section .section-label::after{background:linear-gradient(to right,rgba(212,168,67,.5),transparent)}

/* ══════════════════════ GOAL CARDS ══════════════════════ */
.goal-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
  gap:20px;margin-top:44px;
}
.goal-card{
  background:#fff;
  border:1px solid rgba(201,138,62,.16);
  border-radius:20px;padding:30px 26px;
  position:relative;overflow:hidden;
  box-shadow:0 4px 24px var(--shadow);
  opacity:0;transform:translateY(32px) rotate(.4deg);
  transition:opacity .6s ease,transform .6s ease,box-shadow .3s ease;
  cursor:default;
}
.goal-card.visible{opacity:1;transform:translateY(0) rotate(0)}
.goal-card:hover{box-shadow:0 20px 52px var(--shadow-deep);transform:translateY(-6px) rotate(0) !important}
.goal-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--amber),var(--gold));
  transform:scaleX(0);transform-origin:left;
  transition:transform .4s cubic-bezier(.25,.46,.45,.94);
}
.goal-card:hover::before{transform:scaleX(1)}
.goal-num{
  font-family:'Playfair Display',serif;font-size:3.2rem;
  font-weight:900;color:rgba(201,138,62,.11);line-height:1;margin-bottom:10px;
}
.goal-text{font-size:.97rem;color:var(--ink);line-height:1.65}

/* ══════════════════════ TOKEN ROW ══════════════════════ */
.token-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.token{
  display:flex;align-items:center;gap:10px;
  background:#fff;border:1px solid rgba(201,138,62,.18);
  border-radius:40px;padding:8px 16px;
  font-family:'DM Mono',monospace;font-size:.75rem;
  color:var(--ink);box-shadow:0 2px 10px var(--shadow);
  transition:transform .22s,box-shadow .22s;cursor:default;
}
.token:hover{transform:scale(1.07) translateY(-2px);box-shadow:0 8px 24px var(--shadow)}
.token-swatch{width:16px;height:16px;border-radius:50%;flex-shrink:0;box-shadow:0 1px 4px rgba(0,0,0,.2)}

/* ══════════════════════ CODE / TREE BLOCK ══════════════════════ */
.code-block{
  background:#080503;
  border:1px solid rgba(212,168,67,.18);
  border-radius:20px;padding:40px 32px 34px;
  font-family:'DM Mono',monospace;font-size:.77rem;line-height:2;
  color:rgba(255,255,255,.6);overflow-x:auto;
  position:relative;
  box-shadow:inset 0 1px 0 rgba(212,168,67,.07),0 32px 72px rgba(0,0,0,.65);
  margin-top:36px;
}
.code-block::before{
  content:'● ● ●';position:absolute;top:15px;left:22px;
  font-size:.67rem;color:rgba(255,255,255,.17);letter-spacing:.4em;
}
.code-block pre{white-space:pre;margin-top:6px}
.tree-dir{color:var(--gold);font-weight:500}
.tree-file{color:rgba(255,255,255,.5)}
.tree-branch{color:rgba(212,168,67,.28)}
.tree-comment{color:rgba(255,255,255,.22);font-style:italic}

/* ══════════════════════ WORKFLOW ══════════════════════ */
.workflow-steps{display:flex;flex-direction:column;gap:0;margin-top:48px}
.workflow-step{
  display:flex;gap:30px;align-items:flex-start;
  padding:32px 0;border-bottom:1px solid rgba(201,138,62,.1);
  opacity:0;transform:translateX(-28px);
  transition:opacity .6s ease,transform .6s ease;
}
.workflow-step:last-child{border-bottom:none}
.workflow-step.visible{opacity:1;transform:none}

.step-num{
  flex-shrink:0;width:56px;height:56px;border-radius:50%;
  border:1.5px solid var(--amber);
  display:flex;align-items:center;justify-content:center;
  font-family:'Playfair Display',serif;font-size:1.25rem;font-weight:900;
  color:var(--amber);background:rgba(201,138,62,.05);
  position:relative;
}
.step-num::before{
  content:'';position:absolute;
  width:68px;height:68px;border-radius:50%;
  border:1px solid rgba(201,138,62,.16);
  animation:ripple 2.8s ease-out infinite;
}
@keyframes ripple{
  0%{transform:scale(.88);opacity:.9}
  100%{transform:scale(1.6);opacity:0}
}
.step-body h3{font-family:'Playfair Display',serif;font-size:1.14rem;color:var(--ink);margin-bottom:6px}
.step-body p{font-size:.94rem;color:#5a4535;margin:0;line-height:1.72}
.step-body code{
  font-family:'DM Mono',monospace;font-size:.8em;
  background:#f5f0e8;border-radius:5px;padding:2px 7px;color:var(--ember);
}

/* ══════════════════════ FEATURE CARDS ══════════════════════ */
.feature-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(290px,1fr));
  gap:22px;margin-top:48px;
}
.feature-card{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(212,168,67,.13);
  border-radius:22px;padding:36px 30px;
  position:relative;overflow:hidden;
  opacity:0;transform:translateY(32px);
  transition:opacity .6s ease,transform .6s ease,background .28s,border-color .28s;
}
.feature-card.visible{opacity:1;transform:none}
.feature-card::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(circle at 70% 0%,rgba(212,168,67,.1) 0%,transparent 60%);
  opacity:0;transition:opacity .3s;
}
.feature-card:hover{background:rgba(255,255,255,.07);border-color:rgba(212,168,67,.42);transform:translateY(-5px) !important}
.feature-card:hover::after{opacity:1}
.feature-icon{font-size:2.2rem;margin-bottom:18px;display:inline-block;animation:iconFloat 3.5s ease-in-out infinite}
@keyframes iconFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.feature-card:nth-child(2) .feature-icon{animation-delay:.5s}
.feature-card:nth-child(3) .feature-icon{animation-delay:1s}
.feature-card:nth-child(4) .feature-icon{animation-delay:1.5s}
.feature-card:nth-child(5) .feature-icon{animation-delay:2s}
.feature-card:nth-child(6) .feature-icon{animation-delay:2.5s}
.feature-title{font-family:'Playfair Display',serif;font-size:1.18rem;font-weight:700;color:#fff;margin-bottom:10px}
.feature-desc{font-size:.9rem;color:rgba(255,255,255,.5);line-height:1.72}

/* ══════════════════════ FEATURE LIST ══════════════════════ */
.feature-list-grid{columns:2;column-gap:32px;margin-top:36px;list-style:none}
@media(max-width:600px){.feature-list-grid{columns:1}}
.feature-list-grid li{
  break-inside:avoid;
  display:flex;align-items:flex-start;gap:10px;
  padding:9px 0;border-bottom:1px solid rgba(201,138,62,.1);
  font-size:.93rem;color:#4a3728;line-height:1.5;
}
.feature-list-grid li::before{content:'◆';font-size:.52rem;color:var(--amber);flex-shrink:0;margin-top:6px}

/* ══════════════════════ INSTALL ══════════════════════ */
.install-steps{display:flex;flex-direction:column;gap:14px;margin-top:44px}
.install-step{
  background:#fff;border-radius:16px;
  border:1px solid rgba(201,138,62,.14);
  padding:22px 26px;
  display:flex;gap:18px;align-items:flex-start;
  box-shadow:0 3px 16px var(--shadow);
  transition:transform .26s ease,box-shadow .26s ease;
  opacity:0;transform:translateX(-20px);
  transition:opacity .5s ease,transform .5s ease,box-shadow .26s;
}
.install-step.visible{opacity:1;transform:none}
.install-step:hover{transform:translateX(8px) !important;box-shadow:0 10px 32px var(--shadow)}
.install-badge{
  flex-shrink:0;
  background:linear-gradient(135deg,var(--amber),var(--gold));
  color:#fff;border-radius:9px;
  width:38px;height:38px;
  display:flex;align-items:center;justify-content:center;
  font-family:'DM Mono',monospace;font-size:.76rem;font-weight:500;
}
.install-title{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;margin-bottom:6px;color:var(--ink)}
.install-cmd{
  font-family:'DM Mono',monospace;font-size:.77rem;
  background:#f5f0e8;border-radius:7px;padding:5px 11px;
  color:var(--ember);display:inline-block;margin-top:2px;
}

/* ══════════════════════ CHECKLIST ══════════════════════ */
.checklist{list-style:none;margin-top:32px;display:flex;flex-direction:column;gap:10px}
.checklist li{
  display:flex;align-items:center;gap:14px;
  font-size:.96rem;color:var(--ink);
  padding:14px 20px;background:#fff;
  border-radius:11px;border:1px solid rgba(201,138,62,.13);
  box-shadow:0 2px 10px var(--shadow);
  transition:transform .24s ease;
}
.checklist li:hover{transform:translateX(7px)}
.check-box{
  width:22px;height:22px;border-radius:6px;
  border:1.5px solid rgba(201,138,62,.36);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  color:var(--sage);font-size:.78rem;
}

/* ══════════════════════ SCENARIOS ══════════════════════ */
.scenarios-grid{
  display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:20px;margin-top:44px;
}
.scenario-card{
  background:#fff;border:1px solid rgba(201,138,62,.17);
  border-radius:18px;padding:28px 24px;
  box-shadow:0 4px 20px var(--shadow);
  opacity:0;transform:translateY(28px);
  transition:opacity .6s ease,transform .6s ease,box-shadow .28s;
}
.scenario-card.visible{opacity:1;transform:none}
.scenario-card:hover{box-shadow:0 18px 46px var(--shadow-deep);transform:translateY(-4px) !important}
.scenario-num{font-family:'DM Mono',monospace;font-size:.67rem;letter-spacing:.22em;text-transform:uppercase;color:var(--amber);margin-bottom:10px}
.scenario-title{font-family:'Playfair Display',serif;font-size:1.08rem;font-weight:700;color:var(--ink);margin-bottom:14px}
.scenario-steps{list-style:none;display:flex;flex-direction:column;gap:7px}
.scenario-steps li{font-size:.87rem;color:#5a4535;padding-left:18px;position:relative;line-height:1.6}
.scenario-steps li::before{content:'→';position:absolute;left:0;color:var(--amber);font-family:'DM Mono',monospace;font-size:.78rem}

/* ══════════════════════ EXTEND ══════════════════════ */
.extend-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:36px}
.extend-item{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(212,168,67,.12);
  border-radius:15px;padding:22px 20px;
  opacity:0;transform:translateY(24px);
  transition:opacity .5s ease,transform .5s ease,border-color .25s,background .25s;
}
.extend-item.visible{opacity:1;transform:none}
.extend-item:hover{border-color:rgba(212,168,67,.45);background:rgba(255,255,255,.07)}
.extend-emoji{font-size:1.45rem;margin-bottom:11px}
.extend-title{font-family:'Playfair Display',serif;font-size:.97rem;font-weight:700;color:rgba(255,255,255,.9);margin-bottom:6px}
.extend-desc{font-size:.81rem;color:rgba(255,255,255,.4);line-height:1.62}

/* ══════════════════════ SECURITY CARDS ══════════════════════ */
.sec-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;margin-top:36px}
.sec-card{
  background:#fff;border:1px solid rgba(201,138,62,.15);border-radius:18px;
  padding:26px 24px;box-shadow:0 4px 18px var(--shadow);
  opacity:0;transform:translateY(24px);
  transition:opacity .55s ease,transform .55s ease,box-shadow .28s;
}
.sec-card.visible{opacity:1;transform:none}
.sec-card:hover{box-shadow:0 14px 38px var(--shadow-deep);transform:translateY(-4px) !important}
.sec-icon{font-size:1.8rem;margin-bottom:12px}
.sec-title{font-family:'Playfair Display',serif;font-size:1rem;font-weight:700;color:var(--ink);margin-bottom:8px}
.sec-desc{font-size:.88rem;color:#5a4535;line-height:1.65}
.sec-desc code{font-family:'DM Mono',monospace;font-size:.82em;background:#f5f0e8;border-radius:4px;padding:2px 6px;color:var(--ember)}

/* ══════════════════════ AUTHOR ══════════════════════ */
.author-section{
  background:linear-gradient(150deg,#0a0704 0%,#1e1208 50%,#2a1910 100%);
  padding:140px 24px;text-align:center;
  position:relative;overflow:hidden;
}
.author-section::before{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 75% 85% at 50% 50%,rgba(201,138,62,.1) 0%,transparent 62%);
}

/* ── ANIMATED AUTHOR ORBIT ── */
.author-orbit-wrap{
  position:relative;width:220px;height:220px;margin:0 auto 44px;
}
.orbit-ring{
  position:absolute;inset:0;border-radius:50%;
  border:1px solid rgba(212,168,67,.25);
  animation:orbitSpin 12s linear infinite;
}
.orbit-ring-2{
  position:absolute;inset:16px;border-radius:50%;
  border:1px dashed rgba(212,168,67,.12);
  animation:orbitSpin 8s linear infinite reverse;
}
.orbit-dot{
  position:absolute;
  width:10px;height:10px;border-radius:50%;
  background:var(--gold);
  top:-5px;left:50%;transform:translateX(-50%);
  box-shadow:0 0 12px rgba(212,168,67,.8);
  animation:orbitDotGlow 2s ease-in-out infinite alternate;
}
@keyframes orbitDotGlow{from{box-shadow:0 0 8px rgba(212,168,67,.5)}to{box-shadow:0 0 20px rgba(212,168,67,1),0 0 40px rgba(212,168,67,.4)}}
@keyframes orbitSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.orbit-inner{
  position:absolute;
  inset:20px;border-radius:50%;
  background:radial-gradient(circle,rgba(201,138,62,.14) 0%,transparent 70%);
  border:1px solid rgba(212,168,67,.14);
  display:flex;align-items:center;justify-content:center;
}

/* ── AUTHOR NAME ANIMATION ── */
.author-initials{
  font-family:'Playfair Display',serif;
  font-size:3.4rem;font-weight:900;color:var(--gold);
  animation:initialsGlow 3s ease-in-out infinite alternate;
}
@keyframes initialsGlow{
  from{text-shadow:0 0 20px rgba(212,168,67,.4)}
  to{text-shadow:0 0 50px rgba(212,168,67,.9),0 0 100px rgba(212,168,67,.3)}
}

.author-eyebrow{
  font-family:'DM Mono',monospace;font-size:.7rem;
  letter-spacing:.36em;text-transform:uppercase;
  color:var(--gold);margin-bottom:18px;
  position:relative;z-index:1;
  animation:fadeIn 1s ease 0s both;
}

.author-name{
  font-family:'Playfair Display',serif;
  font-size:clamp(2.8rem,9vw,6rem);
  font-weight:900;color:#fff;
  position:relative;z-index:1;
  margin-bottom:14px;letter-spacing:-.018em;
  animation:authorNameIn 1.2s cubic-bezier(.16,1,.3,1) .2s both;
}
@keyframes authorNameIn{
  from{opacity:0;transform:translateY(40px);filter:blur(8px)}
  to{opacity:1;transform:none;filter:blur(0)}
}

/* each letter of author name gets shimmer */
.author-name .a-first{
  display:inline-block;
  animation:authorLetterShimmer 7s ease-in-out 3s infinite;
}
@keyframes authorLetterShimmer{
  0%,75%,100%{color:#fff}
  82%,88%{color:rgba(255,255,255,.7);text-shadow:none}
}
.author-name .a-last{
  color:var(--gold);display:inline-block;
  animation:authorGoldPulse 4s ease-in-out 2s infinite;
  text-shadow:0 0 50px rgba(212,168,67,.4);
}
@keyframes authorGoldPulse{
  0%,100%{text-shadow:0 0 30px rgba(212,168,67,.3)}
  50%{text-shadow:0 0 70px rgba(212,168,67,.8),0 0 140px rgba(212,168,67,.2)}
}

.author-role{
  font-size:1.05rem;font-style:italic;
  color:rgba(255,255,255,.42);
  position:relative;z-index:1;margin-bottom:40px;
  animation:fadeIn 1s ease .5s both;
}
.author-quote{
  max-width:600px;margin:0 auto;
  font-size:1.02rem;font-style:italic;
  color:rgba(255,255,255,.36);
  border-top:1px solid rgba(212,168,67,.16);
  padding-top:30px;
  position:relative;z-index:1;line-height:1.9;
  animation:fadeIn 1s ease .8s both;
}

/* ══════════════════════ FOOTER ══════════════════════ */
footer{
  background:#070403;padding:40px 24px;
  text-align:center;
  font-family:'DM Mono',monospace;font-size:.68rem;
  letter-spacing:.14em;color:rgba(255,255,255,.17);
  border-top:1px solid rgba(212,168,67,.1);
}
footer span{color:var(--gold)}

/* ══════════════════════ BADGE ROW ══════════════════════ */
.badge-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.badge{
  font-family:'DM Mono',monospace;font-size:.68rem;
  padding:6px 14px;border-radius:40px;
  border:1px solid rgba(201,138,62,.32);
  color:var(--amber);background:rgba(201,138,62,.07);
  letter-spacing:.08em;
  transition:background .22s,color .22s,transform .22s;cursor:default;
}
.badge:hover{background:var(--amber);color:#fff;transform:translateY(-2px)}

/* ══════════════════════ VALIDATION MINI CARDS ══════════════════════ */
.val-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:13px;margin-top:28px}
.val-item{
  background:rgba(255,255,255,.04);border:1px solid rgba(212,168,67,.12);
  border-radius:11px;padding:14px 18px;
  font-size:.88rem;color:rgba(255,255,255,.52);
  transition:border-color .25s,background .25s;
}
.val-item:hover{border-color:rgba(212,168,67,.4);background:rgba(255,255,255,.07)}

/* ══════════════════════ STAGGER DELAYS ══════════════════════ */
.goal-card:nth-child(1){transition-delay:.0s}
.goal-card:nth-child(2){transition-delay:.1s}
.goal-card:nth-child(3){transition-delay:.2s}
.goal-card:nth-child(4){transition-delay:.3s}
.goal-card:nth-child(5){transition-delay:.4s}
.feature-card:nth-child(1){transition-delay:.0s}
.feature-card:nth-child(2){transition-delay:.1s}
.feature-card:nth-child(3){transition-delay:.2s}
.feature-card:nth-child(4){transition-delay:.3s}
.feature-card:nth-child(5){transition-delay:.4s}
.feature-card:nth-child(6){transition-delay:.5s}
.scenario-card:nth-child(1){transition-delay:.0s}
.scenario-card:nth-child(2){transition-delay:.1s}
.scenario-card:nth-child(3){transition-delay:.2s}
.scenario-card:nth-child(4){transition-delay:.3s}
.extend-item:nth-child(1){transition-delay:.0s}
.extend-item:nth-child(2){transition-delay:.08s}
.extend-item:nth-child(3){transition-delay:.16s}
.extend-item:nth-child(4){transition-delay:.24s}
.extend-item:nth-child(5){transition-delay:.32s}
.extend-item:nth-child(6){transition-delay:.40s}
.extend-item:nth-child(7){transition-delay:.48s}
.sec-card:nth-child(1){transition-delay:.0s}
.sec-card:nth-child(2){transition-delay:.08s}
.sec-card:nth-child(3){transition-delay:.16s}
.sec-card:nth-child(4){transition-delay:.24s}
.sec-card:nth-child(5){transition-delay:.32s}
.install-step:nth-child(1){transition-delay:.0s}
.install-step:nth-child(2){transition-delay:.07s}
.install-step:nth-child(3){transition-delay:.14s}
.install-step:nth-child(4){transition-delay:.21s}
.install-step:nth-child(5){transition-delay:.28s}

/* ── keyframe helpers ── */
@keyframes fadeUp{
  from{opacity:0;transform:translateY(30px)}
  to{opacity:1;transform:none}
}
@keyframes fadeIn{
  from{opacity:0}to{opacity:1}
}

/* ── LEARNING PATH tags ── */
.learn-tags{display:flex;flex-wrap:wrap;gap:10px;margin-top:20px}
.learn-tag{
  font-family:'DM Mono',monospace;font-size:.74rem;
  padding:8px 16px;border-radius:8px;
  background:#fff;border:1px solid rgba(201,138,62,.2);
  color:var(--ink);box-shadow:0 2px 8px var(--shadow);
  transition:all .25s ease;cursor:default;
}
.learn-tag:hover{background:var(--amber);color:#fff;transform:translateY(-3px);box-shadow:0 8px 20px var(--shadow)}

/* ── typewriter cursor for eyebrow ── */
.typewriter{
  overflow:hidden;white-space:nowrap;
  border-right:2px solid var(--gold);
  width:0;
  animation:typeIn 1.4s steps(22,end) .5s forwards,
            cursorBlink .75s step-end 1.9s infinite;
}
@keyframes typeIn{from{width:0}to{width:100%}}
@keyframes cursorBlink{0%,100%{border-color:var(--gold)}50%{border-color:transparent}}
</style>
</head>
<body>

<canvas id="bg-canvas"></canvas>

<!-- ══════════════ HERO ══════════════ -->
<section class="hero">
  <div class="hero-grid"></div>
  <div class="hero-glow"></div>
  <div class="scan-line"></div>
  <div class="hero-brackets"></div>

  <p class="hero-eyebrow">
    <span class="typewriter">A Curated Retail Ledger</span>
  </p>

  <h1 class="hero-title">
    <span class="t-scan">Scan</span><span class="t-bill">Bill</span>&thinsp;<span class="t-pro">PRO</span>
  </h1>

  <p class="hero-sub">
    A refined barcode billing dashboard with intelligent discovery,<br>animated classical design, and a polished point-of-sale workflow.
  </p>

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

<!-- ══════════════ NAV ══════════════ -->
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

<!-- ══════════════ OVERVIEW ══════════════ -->
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
      <div class="goal-card"><div class="goal-num">01</div><div class="goal-text">Fast, accurate barcode scanning directly in the browser via webcam.</div></div>
      <div class="goal-card"><div class="goal-num">02</div><div class="goal-text">Intelligent product resolution for both standard and custom barcodes.</div></div>
      <div class="goal-card"><div class="goal-num">03</div><div class="goal-text">Clear, actionable inventory management with real-time inline editing.</div></div>
      <div class="goal-card"><div class="goal-num">04</div><div class="goal-text">Secure, maintainable collection of sale transactions with printable receipts.</div></div>
      <div class="goal-card"><div class="goal-num">05</div><div class="goal-text">A strong, extensible baseline for production-grade POS experiences.</div></div>
    </div>
  </div>
</div>

<hr/>

<!-- ══════════════ PHILOSOPHY ══════════════ -->
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

<hr/>

<!-- ══════════════ ARCHITECTURE ══════════════ -->
<div class="dark-section" id="architecture">
  <div class="section">
    <p class="section-label">Architecture &amp; Design Tree</p>
    <h2>The Blueprint</h2>
    <p>A complete map of the application — from top-level features down to individual UI and backend components. Use it as a design blueprint or developer architecture reference.</p>

    <div class="code-block"><pre><span class="tree-dir">ScanBill Pro</span>
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
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">POST /api/auth/login</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">POST /api/auth/register</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">GET  /api/auth/me</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">GET  /api/products</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">POST /api/scan</span>
<span class="tree-branch">│   │   ├──</span> <span class="tree-file">GET  /api/scan-stream  (SSE)</span>
<span class="tree-branch">│   │   └──</span> <span class="tree-file">POST /api/products/bulk</span>
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
<span class="tree-branch">    └──</span> <span class="tree-file">Tailored Error Messages</span></pre></div>
  </div>
</div>

<!-- ══════════════ WORKFLOW ══════════════ -->
<div id="workflow">
  <div class="section">
    <p class="section-label">Workflow Map</p>
    <h2>From Scan to Receipt</h2>
    <p>A narrative of how users move through the system and how data flows through every layer of the application — from first login to final printout.</p>

    <div class="workflow-steps">
      <div class="workflow-step"><div class="step-num">1</div><div class="step-body"><h3>Launch &amp; Authenticate</h3><p>The UI shell initialises with dark theme and motion. Users log in or register with email and password. A JWT token is created, stored in LocalStorage, and validated via <code>/api/auth/me</code> to unlock the full dashboard.</p></div></div>
      <div class="workflow-step"><div class="step-num">2</div><div class="step-body"><h3>Begin Scan Session</h3><p>The webcam scanner panel activates via <code>html5-qrcode</code> and listens continuously. When a valid barcode is detected, a <code>POST /api/scan</code> request fires instantly. A live scan history feed keeps the operator aware of recent activity.</p></div></div>
      <div class="workflow-step"><div class="step-num">3</div><div class="step-body"><h3>Intelligent Product Lookup</h3><p>Known items display with price, stock, and image immediately. Unknown barcodes trigger the three-tier fallback engine: OpenFoodFacts first, then Gemini AI, then a deterministic product generator — so the checkout flow is never blocked.</p></div></div>
      <div class="workflow-step"><div class="step-num">4</div><div class="step-body"><h3>Build the Receipt</h3><p>Each scanned item glides into the active receipt tile with an animated entrance. Subtotal, tax, and grand total recalculate in real time as the cart grows. Low-stock items pulse with a warm amber warning.</p></div></div>
      <div class="workflow-step"><div class="step-num">5</div><div class="step-body"><h3>Manage Catalog (anytime)</h3><p>The product catalog modal is always accessible. Operators can search, sort, filter, edit prices, adjust stock levels, delete obsolete SKUs, and add new items — all with inline edits protected by token-based security.</p></div></div>
      <div class="workflow-step"><div class="step-num">6</div><div class="step-body"><h3>Finalise &amp; Print</h3><p>Confirm checkout to generate a unique receipt number and store the transaction in history. The receipt modal scales into view with a polished print-ready invoice. A single click delivers the physical proof of sale.</p></div></div>
      <div class="workflow-step"><div class="step-num">7</div><div class="step-body"><h3>Continue Sales</h3><p>A gentle fade resets the scan session. The catalog and history persist across sessions. Repeat the loop — fast, accurate, and delightful every time.</p></div></div>
    </div>
  </div>
</div>

<hr/>

<!-- ══════════════ FEATURES ══════════════ -->
<div class="dark-section" id="features">
  <div class="section">
    <p class="section-label">Unique Features</p>
    <h2>What Makes It Special</h2>
    <p>ScanBill Pro is built with a layered feature set that is both functional and delightful. Every capability is intentional and every detail is refined.</p>

    <div class="feature-grid">
      <div class="feature-card"><div class="feature-icon">📷</div><div class="feature-title">Smart Scanner</div><div class="feature-desc">Browser-based barcode scanning via html5-qrcode. Responsive scan panel adapts to mobile and desktop camera feeds. Physical scanner hookup via POST + SSE stream.</div></div>
      <div class="feature-card"><div class="feature-icon">🧠</div><div class="feature-title">AI Barcode Intelligence</div><div class="feature-desc">Three-tier lookup: OpenFoodFacts → Gemini AI fallback → deterministic generator. Product metadata enriched with price, stock, summary, and image. Checkout is never blocked by missing data.</div></div>
      <div class="feature-card"><div class="feature-icon">🛡️</div><div class="feature-title">Secure Auth</div><div class="feature-desc">JWT login, registration, and session validation. Role-aware endpoints guard every protected inventory operation. Secrets managed via environment variables.</div></div>
      <div class="feature-card"><div class="feature-icon">🗂️</div><div class="feature-title">Live Catalog Management</div><div class="feature-desc">Real-time inline editing with immediate UI updates. Search, sort, and filter controls. Stock-level indicators pulse on low inventory. Bulk import endpoint ready for enterprise ingestion.</div></div>
      <div class="feature-card"><div class="feature-icon">🧾</div><div class="feature-title">Receipt Engine</div><div class="feature-desc">Printable invoice with itemised totals, automatic tax calculation, and payment status badges. Optimised for both screen display and physical paper printing.</div></div>
      <div class="feature-card"><div class="feature-icon">✨</div><div class="feature-title">Animated UI</div><div class="feature-desc">Motion-driven modal entrances and exits, hover states, pulse alerts for stock warnings, and a consistent animation language via motion/react that feels warm and premium throughout.</div></div>
    </div>

    <div style="margin-top:64px">
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

<!-- ══════════════ INSTALL ══════════════ -->
<div id="install">
  <div class="section">
    <p class="section-label">Installation</p>
    <h2>Up &amp; Running in Minutes</h2>
    <p>A clean five-step process to get the full ScanBill Pro experience running locally. If you don't have a Gemini API key, the app still works — AI enrichment is optional.</p>

    <div class="install-steps">
      <div class="install-step"><div class="install-badge">01</div><div><div class="install-title">Clone the Repository</div><div class="install-cmd">git clone https://github.com/&lt;username&gt;/barcode-billing-dashboard.git</div></div></div>
      <div class="install-step"><div class="install-badge">02</div><div><div class="install-title">Install Dependencies</div><div class="install-cmd">npm install</div></div></div>
      <div class="install-step"><div class="install-badge">03</div><div><div class="install-title">Configure Environment</div><div class="install-cmd">GEMINI_API_KEY=your_key &nbsp; JWT_SECRET=your_secret</div></div></div>
      <div class="install-step"><div class="install-badge">04</div><div><div class="install-title">Start Dev Server</div><div class="install-cmd">npm run dev</div></div></div>
      <div class="install-step"><div class="install-badge">05</div><div><div class="install-title">Open in Browser</div><div class="install-cmd">http://localhost:3000</div></div></div>
    </div>

    <div style="margin-top:12px">
      <div class="install-step" style="border-color:rgba(74,124,89,.25)">
        <div class="install-badge" style="background:linear-gradient(135deg,#4a7c59,#6aaa80)">PRO</div>
        <div><div class="install-title">Production Mode</div><div class="install-cmd">npm start</div></div>
      </div>
    </div>
  </div>
</div>

<hr/>

<!-- ══════════════ STRUCTURE ══════════════ -->
<div class="dark-section" id="structure">
  <div class="section">
    <p class="section-label">Project Structure</p>
    <h2>Clean &amp; Focused</h2>
    <p>One backend, a focused frontend, and a modern component layout. The structure is intentionally simple — every file has a clear purpose.</p>

    <div class="code-block"><pre><span class="tree-dir">barcode-billing-dashboard/</span>
<span class="tree-branch">├──</span> <span class="tree-file">.env</span>              <span class="tree-comment"># GEMINI_API_KEY, JWT_SECRET</span>
<span class="tree-branch">├──</span> <span class="tree-file">index.html</span>        <span class="tree-comment"># Vite entry point</span>
<span class="tree-branch">├──</span> <span class="tree-file">package.json</span>
<span class="tree-branch">├──</span> <span class="tree-file">server.js</span>         <span class="tree-comment"># Express API + scanner engine (compiled)</span>
<span class="tree-branch">├──</span> <span class="tree-file">server.ts</span>         <span class="tree-comment"># TypeScript source</span>
<span class="tree-branch">├──</span> <span class="tree-file">tsconfig.json</span>
<span class="tree-branch">├──</span> <span class="tree-file">vite.config.ts</span>
<span class="tree-branch">├──</span> <span class="tree-file">database.sql</span>      <span class="tree-comment"># Schema reference</span>
<span class="tree-branch">├──</span> <span class="tree-file">metadata.json</span>
<span class="tree-branch">├──</span> <span class="tree-file">requirements.txt</span>
<span class="tree-branch">└──</span> <span class="tree-dir">src/</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">App.tsx</span>           <span class="tree-comment"># Application shell</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">main.tsx</span>          <span class="tree-comment"># React entry point</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">main.js</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">index.css</span>         <span class="tree-comment"># Global styles</span>
<span class="tree-branch">    ├──</span> <span class="tree-file">types.ts</span>          <span class="tree-comment"># Shared TypeScript interfaces</span>
<span class="tree-branch">    └──</span> <span class="tree-dir">components/</span>
<span class="tree-branch">        ├──</span> <span class="tree-file">ProductCatalogModal.tsx</span>
<span class="tree-branch">        └──</span> <span class="tree-file">ReceiptModal.tsx</span></pre></div>
  </div>
</div>

<!-- ══════════════ SCENARIOS ══════════════ -->
<div id="scenarios">
  <div class="section">
    <p class="section-label">Usage Patterns</p>
    <h2>Four Ways to Use ScanBill Pro</h2>
    <p>ScanBill Pro is purpose-built for real retail workflows. Here are the four primary usage patterns, each supported by both the UI and backend.</p>

    <div class="scenarios-grid">
      <div class="scenario-card"><div class="scenario-num">Scenario 01</div><div class="scenario-title">Quick Retail Checkout</div><ul class="scenario-steps"><li>Open the app and log in as cashier</li><li>Activate the camera scanner</li><li>Scan barcode after barcode</li><li>Watch items appear in the transaction tile</li><li>Print the receipt at end of sale</li></ul></div>
      <div class="scenario-card"><div class="scenario-num">Scenario 02</div><div class="scenario-title">Inventory Audit</div><ul class="scenario-steps"><li>Open the product catalog modal</li><li>Search for a SKU or barcode</li><li>Edit price or stock values inline</li><li>Delete obsolete items</li><li>Add missing inventory manually</li></ul></div>
      <div class="scenario-card"><div class="scenario-num">Scenario 03</div><div class="scenario-title">AI Catalog Discovery</div><ul class="scenario-steps"><li>Scan an unknown barcode</li><li>Let the AI lookup engine attempt a match</li><li>Review and accept generated product details</li><li>Add the item to the live catalog</li></ul></div>
      <div class="scenario-card"><div class="scenario-num">Scenario 04</div><div class="scenario-title">Physical Scanner Hookup</div><ul class="scenario-steps"><li>Connect an external barcode scanner</li><li>Send scan events to POST /api/scan</li><li>Subscribe to SSE via /api/scan-stream</li><li>Monitor activity in real time</li></ul></div>
    </div>
  </div>
</div>

<hr/>

<!-- ══════════════ EXTEND ══════════════ -->
<div class="dark-section" id="extend">
  <div class="section">
    <p class="section-label">Extending the Design</p>
    <h2>Built to Grow</h2>
    <p>ScanBill Pro is intentionally extensible. The architecture is solid and the patterns are clean — adding new capabilities is straightforward.</p>

    <div class="extend-grid">
      <div class="extend-item"><div class="extend-emoji">👥</div><div class="extend-title">Admin Dashboard</div><div class="extend-desc">Employee management, roles, and audit logs for multi-operator deployments.</div></div>
      <div class="extend-item"><div class="extend-emoji">📊</div><div class="extend-title">Product Analytics</div><div class="extend-desc">Top-selling SKUs, scan volume charts, and revenue trends over time.</div></div>
      <div class="extend-item"><div class="extend-emoji">📁</div><div class="extend-title">Barcode Import / Export</div><div class="extend-desc">CSV and Excel ingestion and export for bulk catalog management.</div></div>
      <div class="extend-item"><div class="extend-emoji">🏪</div><div class="extend-title">Multi-Store Sync</div><div class="extend-desc">Centralised inventory sync layer across multiple locations or terminals.</div></div>
      <div class="extend-item"><div class="extend-emoji">📱</div><div class="extend-title">Mobile Cashier App</div><div class="extend-desc">Dedicated mobile-first interface for tablet and handheld POS terminals.</div></div>
      <div class="extend-item"><div class="extend-emoji">🔌</div><div class="extend-title">Hardware Scanner Layer</div><div class="extend-desc">WebSocket or HID integration for industrial barcode scanners and printers.</div></div>
      <div class="extend-item"><div class="extend-emoji">📧</div><div class="extend-title">Receipt Emailing</div><div class="extend-desc">Send digital receipts directly to customers via email after checkout.</div></div>
    </div>

    <div style="margin-top:72px">
      <p class="section-label">Testing &amp; Validation</p>
      <h2>Resilient by Design</h2>
      <p>While primarily a UI-driven prototype, every layer is built to degrade gracefully rather than fail abruptly.</p>
      <div class="val-grid">
        <div class="val-item">✓ &nbsp;Login and token validation</div>
        <div class="val-item">✓ &nbsp;Protected backend API routes</div>
        <div class="val-item">✓ &nbsp;Barcode string sanitisation</div>
        <div class="val-item">✓ &nbsp;Product payload field validation</div>
        <div class="val-item">✓ &nbsp;Graceful fallback for missing lookup data</div>
        <div class="val-item">✓ &nbsp;Transaction total and tax calculations</div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════ SECURITY ══════════════ -->
<div id="security">
  <div class="section">
    <p class="section-label">Security &amp; Production</p>
    <h2>Ready for the Real World</h2>
    <p>Security is built into core flows. A production deployment should add HTTPS, rate limiting, and a persistent database — but the foundations are already solid.</p>

    <div class="sec-grid">
      <div class="sec-card"><div class="sec-icon">🔒</div><div class="sec-title">JWT Auth</div><div class="sec-desc">Every protected endpoint checks for a valid token. Admin operations are guarded with role checks.</div></div>
      <div class="sec-card"><div class="sec-icon">🗝️</div><div class="sec-title">Secret Management</div><div class="sec-desc">Sensitive keys stored in <code>.env</code>. Never committed to version control.</div></div>
      <div class="sec-card"><div class="sec-icon">🛡️</div><div class="sec-title">Payload Validation</div><div class="sec-desc">Backend validates required fields on every product and auth request.</div></div>
      <div class="sec-card"><div class="sec-icon">📡</div><div class="sec-title">HTTPS Ready</div><div class="sec-desc">Production version should terminate TLS at an edge load balancer with a CDN in front.</div></div>
      <div class="sec-card"><div class="sec-icon">🗄️</div><div class="sec-title">Persistent Storage</div><div class="sec-desc">Replace the in-memory store with a real database for users, products, and transactions.</div></div>
    </div>

    <div style="margin-top:56px">
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

    <div style="margin-top:56px">
      <p class="section-label">Contribution Guidelines</p>
      <p>Keep the UI consistent and animation-friendly. Preserve security checks for protected endpoints. Add tests when extending backend logic. Avoid large bundle sizes or heavy dependencies.</p>

      <p class="section-label" style="margin-top:32px">Learning Path</p>
      <p>Study how React and Vite work together, how <code style="font-family:'DM Mono',monospace;font-size:.82em;background:#f5f0e8;border-radius:5px;padding:2px 7px;color:#8b3a1e">motion/react</code> orchestrates animations, JWT authentication patterns, three-tier fallback data enrichment, and SSE for real-time device streaming.</p>
      <div class="learn-tags">
        <div class="learn-tag">React + Vite</div>
        <div class="learn-tag">motion/react</div>
        <div class="learn-tag">JWT Auth</div>
        <div class="learn-tag">SSE Streaming</div>
        <div class="learn-tag">AI Fallbacks</div>
        <div class="learn-tag">Express.js</div>
        <div class="learn-tag">TypeScript</div>
      </div>
    </div>
  </div>
</div>

<hr/>

<!-- ══════════════ AUTHOR ══════════════ -->
<div class="author-section" id="author">
  <div class="author-orbit-wrap">
    <div class="orbit-ring">
      <div class="orbit-dot"></div>
    </div>
    <div class="orbit-ring-2"></div>
    <div class="orbit-inner">
      <div class="author-initials">DP</div>
    </div>
  </div>

  <p class="author-eyebrow">Lead Artisan</p>
  <h2 class="author-name">
    <span class="a-first">Darshan</span>&nbsp;<span class="a-last">Paapani</span>
  </h2>
  <p class="author-role">Crafted with classical elegance &amp; premium motion design</p>
  <p class="author-quote">
    "ScanBill Pro is built with a top-to-bottom design mindset. Every workflow is mapped, every animation is intentional, and the product is positioned as a premium retail experience — from scan to receipt."
  </p>
</div>

</main>

<footer>
  <span>ScanBill Pro</span> &nbsp;·&nbsp; Lead Artisan: <span>Darshan Paapani</span> &nbsp;·&nbsp; A Curated Retail Ledger
</footer>

<script>
/* ── PARTICLE CANVAS ── */
(function(){
  var c=document.getElementById('bg-canvas'),ctx=c.getContext('2d'),W,H,pts=[];
  function resize(){W=c.width=innerWidth;H=c.height=innerHeight}
  function mkPt(){return{x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,a:Math.random()}}
  function init(){pts=[];for(var i=0;i<140;i++)pts.push(mkPt())}
  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<pts.length;i++){
      var p=pts[i];
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(212,168,67,'+(p.a*.18)+')';ctx.fill();
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;else if(p.x>W)p.x=0;
      if(p.y<0)p.y=H;else if(p.y>H)p.y=0;
    }
    requestAnimationFrame(draw);
  }
  resize();init();draw();
  addEventListener('resize',function(){resize();init()});
})();

/* ── INTERSECTION OBSERVER ── */
(function(){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible')});
  },{threshold:.1});
  document.querySelectorAll('.section,.goal-card,.feature-card,.workflow-step,.scenario-card,.extend-item,.install-step,.sec-card').forEach(function(el){io.observe(el)});
})();

/* ── WORKFLOW STEP STAGGER ── */
document.querySelectorAll('.workflow-step').forEach(function(el,i){
  el.style.transitionDelay=(i*.12)+'s';
});

/* ── HERO BADGE STAGGER ON LOAD ── */
document.querySelectorAll('.hero-badge').forEach(function(el,i){
  el.style.transitionDelay=(i*.05)+'s';
});
</script>
</body>
</html>
