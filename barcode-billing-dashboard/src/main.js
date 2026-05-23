// Veritas ScanPro - Core Engine Native ES6 System
let ACCESS_TOKEN = localStorage.getItem("token") || "";
let ACTIVE_USER = JSON.parse(localStorage.getItem("user") || "null");
let globalCatalog = [];

let currentTab = "POS";
let cartItems = [];
let selectedPaymentMethod = "Credit/Debit";
let activeCheckoutTransaction = null;
let sseSource = null;

// Real webcam lens status & network state managers
let IS_OFFLINE_MODE = false;
let html5QrcodeScanner = null;
let isWebcamScannerRunning = false;
let isWebcamScannerTransitioning = false;
let scannerQueue = Promise.resolve();
let desiredScannerState = "idle"; // "idle" or "scanning"
let actualScannerState = "idle"; // "idle" or "scanning" or "transitioning"
let isSyncing = false;
let OFFLINE_TXN_QUEUE = JSON.parse(localStorage.getItem("offline_transactions") || "[]");

// Built-in Audio Synthesizer (Native Web Audio Context to avoid static file assets dependency)
let audioCtx = null;
let isAudioMuted = localStorage.getItem("audio_master_mute") === "true";
let isScannerSoundMuted = localStorage.getItem("scanner_sound_mute") === "true";
let isWideScanMode = localStorage.getItem("scanner_wide_mode") === "true";
let audioSettings = JSON.parse(localStorage.getItem("audio_settings") || '{"scan":true,"error":true,"checkout":true,"manual_scan":true}');

// Column Sorting states for Product Catalog
let catalogSortField = null; // 'name', 'price', or 'stock'
let catalogSortAsc = true;   // true = Ascending, false = Descending

function playSynthesizerBeep(frequency = 880, type = "sine", duration = 0.1) {
  if (isAudioMuted) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    // Quick gain envelope for a neat synth blip
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.warn("WebAudio context failed to start:", err);
  }
}

// Spark system sounds
function playScanSuccessSound() {
  if (isAudioMuted || isScannerSoundMuted || !audioSettings.scan) return;
  playSynthesizerBeep(980, "sine", 0.08);
}
function playManualScanSuccessSound() {
  if (isAudioMuted || !audioSettings.manual_scan) return;
  // A distinct manual scan confirmation sound! Twice quick higher sweet beep notes
  playSynthesizerBeep(784, "sine", 0.06); 
  setTimeout(() => {
    if (isAudioMuted || !audioSettings.manual_scan) return;
    playSynthesizerBeep(1046.5, "sine", 0.08); 
  }, 70);
}
function playScanWarningSound() {
  if (isAudioMuted || !audioSettings.error) return;
  playSynthesizerBeep(260, "sawtooth", 0.25);
}
function playCheckoutDoneSound() {
  if (isAudioMuted || !audioSettings.checkout) return;
  playSynthesizerBeep(587, "sine", 0.1);
  setTimeout(() => {
    if (isAudioMuted || !audioSettings.checkout) return;
    playSynthesizerBeep(880, "sine", 0.12);
  }, 100);
}

// Global Audio settings dropdown mechanics
function toggleAudioSettingsMenu(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("audio-settings-dropdown");
  if (dropdown) dropdown.classList.toggle("hidden");
  syncAudioSettingsUI();
}

function updateAudioOption(option) {
  audioSettings[option] = !audioSettings[option];
  localStorage.setItem("audio_settings", JSON.stringify(audioSettings));
  playSynthesizerBeep(700, "sine", 0.05);
  syncAudioSettingsUI();
}

function toggleMasterMute() {
  isAudioMuted = !isAudioMuted;
  localStorage.setItem("audio_master_mute", isAudioMuted);
  playSynthesizerBeep(880, "sine", 0.05);
  syncAudioSettingsUI();
}

function syncAudioSettingsUI() {
  const masterBtn = document.getElementById("master-mute-btn");
  const volumeIcon = document.getElementById("volume-ctrl-icon");
  const volumeBtn = document.getElementById("volume-ctrl-btn");

  if (!masterBtn || !volumeIcon || !volumeBtn) return;

  // Options
  ['scan', 'error', 'checkout', 'manual_scan'].forEach(opt => {
    const active = audioSettings[opt];
    const icon = document.getElementById(`check-icon-${opt}`);
    if (icon) {
      if (active && !isAudioMuted) {
        icon.setAttribute("data-lucide", "check-square");
        icon.className = "h-3.5 w-3.5 text-[#10B981]";
      } else {
        icon.setAttribute("data-lucide", "square");
        icon.className = "h-3.5 w-3.5 text-zinc-500";
      }
    }
  });

  if (isAudioMuted) {
    masterBtn.innerText = "Unmute All";
    masterBtn.className = "text-[8px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-white/5 px-1.5 py-0.5 rounded uppercase hover:bg-zinc-750 transition cursor-pointer";
    volumeIcon.setAttribute("data-lucide", "volume-x");
    volumeBtn.classList.remove("text-[#10B981]");
    volumeBtn.classList.add("text-rose-500");
  } else {
    masterBtn.innerText = "Mute All";
    masterBtn.className = "text-[8px] font-mono font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/35 px-1.5 py-0.5 rounded uppercase hover:bg-[#8B5CF6]/20 transition cursor-pointer";
    
    if (!audioSettings.scan && !audioSettings.error && !audioSettings.checkout) {
      volumeIcon.setAttribute("data-lucide", "volume");
      volumeBtn.classList.remove("text-[#10B981]");
      volumeBtn.classList.add("text-zinc-500");
    } else {
      volumeIcon.setAttribute("data-lucide", "volume-2");
      volumeBtn.classList.add("text-[#10B981]");
      volumeBtn.classList.remove("text-rose-500", "text-zinc-500");
    }
  }

  lucide.createIcons();
}

// Close audio dropdown on outside background clicks
window.addEventListener("click", (e) => {
  const dropdown = document.getElementById("audio-settings-dropdown");
  const btn = document.getElementById("volume-ctrl-btn");
  if (dropdown && !dropdown.classList.contains("hidden")) {
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  }
});

// ============================================
// WEBCAM CAMERA SCANNER & NETWORK OUTAGE CACHE UTILS
// ============================================

function syncScannerState() {
  if (isSyncing) return;
  isSyncing = true;
  
  scannerQueue = scannerQueue.then(async () => {
    isSyncing = false;
    
    while (actualScannerState !== desiredScannerState) {
      if (desiredScannerState === "scanning" && actualScannerState === "idle") {
        actualScannerState = "transitioning";
        isWebcamScannerTransitioning = true;
        
        const activeBox = document.getElementById("camera-active-scanner-box");
        const staticBox = document.getElementById("camera-static-overlay");
        if (activeBox) activeBox.classList.remove("hidden");
        if (staticBox) staticBox.classList.add("hidden");
        
        try {
          // Always create a fresh scanner on start to ensure clean state machine
          html5QrcodeScanner = new Html5Qrcode("webcam-reader", false);
          
          let formats = [];
          const supportedFormats = window.Html5QrcodeSupportedFormats || (window.Html5Qrcode && window.Html5Qrcode.SupportedFormats);
          if (supportedFormats) {
            formats = [
              supportedFormats.EAN_13,
              supportedFormats.EAN_8,
              supportedFormats.UPC_A,
              supportedFormats.UPC_E,
              supportedFormats.CODE_128,
              supportedFormats.CODE_39,
              supportedFormats.QR_CODE
            ].filter(f => f !== undefined);
          }
          if (!formats || formats.length === 0) {
            formats = [0, 3, 5, 9, 10, 14, 15];
          }

          const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            playScanSuccessSound();
            if (activeBox) {
              activeBox.style.borderColor = "#10B981";
              setTimeout(() => { activeBox.style.borderColor = "transparent"; }, 400);
            }
            const cleanBarcode = String(decodedText).trim();
            if (typeof IS_OFFLINE_MODE !== "undefined" && IS_OFFLINE_MODE) {
              lookupScannedProductOffline(cleanBarcode);
            } else {
              fireScanEmulation(cleanBarcode, "Camera Stream");
            }
          };

          const config = {
            fps: 30,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
            aspectRatio: 1.777778,
            formatsToSupport: formats
          };

          if (!isWideScanMode) {
            config.qrbox = function(viewfinderWidth, viewfinderHeight) {
              const w = Math.floor(viewfinderWidth * 0.82);
              const h = Math.floor(viewfinderHeight * 0.52);
              const targetW = w > 280 ? 280 : w;
              const targetH = h > 110 ? 110 : h;
              return { width: targetW, height: targetH };
            };
          }

          let started = false;
          let activeError = null;

          // Attempt 1: Standard ideal environment and aspect ratio
          try {
            console.log("[WEBCAM SCANNER] Attempting standard startup (ideal environment + aspect ratio)...");
            await html5QrcodeScanner.start(
              { facingMode: { ideal: "environment" } },
              config,
              qrCodeSuccessCallback,
              () => {}
            );
            started = true;
          } catch (e) {
            console.warn("[WEBCAM SCANNER] Attempt 1 failed:", e);
            activeError = e;
          }

          // Attempt 2: Relax constraints (remove aspectRatio) to resolve OverconstrainedError
          if (!started) {
            try {
              console.log("[WEBCAM SCANNER] Attempting Relaxed startup (environment without aspectRatio)...");
              html5QrcodeScanner = new Html5Qrcode("webcam-reader", false);
              await new Promise(resolve => setTimeout(resolve, 50));
              
              const relaxedConfig = { ...config };
              delete relaxedConfig.aspectRatio;

              await html5QrcodeScanner.start(
                { facingMode: "environment" },
                relaxedConfig,
                qrCodeSuccessCallback,
                () => {}
              );
              started = true;
            } catch (e) {
              console.warn("[WEBCAM SCANNER] Attempt 2 failed:", e);
              activeError = e;
            }
          }

          // Attempt 3: Switch facingMode to "user" (e.g., if front camera only or environment constraint unsupported)
          if (!started) {
            try {
              console.log("[WEBCAM SCANNER] Attempting user-facing camera fallback...");
              html5QrcodeScanner = new Html5Qrcode("webcam-reader", false);
              await new Promise(resolve => setTimeout(resolve, 50));
              
              const relaxedConfig = { ...config };
              delete relaxedConfig.aspectRatio;

              await html5QrcodeScanner.start(
                { facingMode: "user" },
                relaxedConfig,
                qrCodeSuccessCallback,
                () => {}
              );
              started = true;
            } catch (e) {
              console.warn("[WEBCAM SCANNER] Attempt 3 failed:", e);
              activeError = e;
            }
          }

          // Attempt 4: Query explicit device list and use the first available camera ID with totally loose config
          if (!started) {
            try {
              console.log("[WEBCAM SCANNER] Attempting explicit camera device ID query...");
              const devices = await Html5Qrcode.getCameras();
              if (devices && devices.length > 0) {
                // Try each device until one starts successfully
                for (const device of devices) {
                  try {
                    console.log(`[WEBCAM SCANNER] Trying explicit camera ID: ${device.label || device.id}`);
                    html5QrcodeScanner = new Html5Qrcode("webcam-reader", false);
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                    const looseConfig = {
                      fps: 30,
                      formatsToSupport: formats
                    };
                    if (config.qrbox) looseConfig.qrbox = config.qrbox;

                    await html5QrcodeScanner.start(
                      device.id,
                      looseConfig,
                      qrCodeSuccessCallback,
                      () => {}
                    );
                    started = true;
                    break;
                  } catch (devErr) {
                    console.warn(`[WEBCAM SCANNER] Failed to start device ${device.id}:`, devErr);
                    activeError = devErr;
                  }
                }
              }
            } catch (e) {
              console.warn("[WEBCAM SCANNER] Attempt 4 (explicit device ID fallback) failed:", e);
              activeError = e;
            }
          }

          // Final verification of start status
          if (!started) {
            throw activeError || new Error("All camera start strategies failed.");
          }

          actualScannerState = "scanning";
          isWebcamScannerRunning = true;
          
          try {
            const runningTrack = html5QrcodeScanner.getRunningTrack();
            if (runningTrack && typeof runningTrack.getCapabilities === "function") {
              const capabilities = runningTrack.getCapabilities();
              const zoomControl = document.getElementById("scanner-zoom-control");
              const zoomWidget = document.getElementById("scanner-zoom-widget");
              const valDisplay = document.getElementById("scanner-zoom-value");
              
              if (capabilities.zoom && zoomControl) {
                const min = capabilities.zoom.min || 1;
                const max = capabilities.zoom.max || 5;
                const step = capabilities.zoom.step || 0.1;
                
                zoomControl.min = min;
                zoomControl.max = max;
                zoomControl.step = step;
                zoomControl.value = min;
                zoomControl.disabled = false;
                
                if (valDisplay) valDisplay.innerText = `${Number(min).toFixed(1)}x`;
                if (zoomWidget) {
                  zoomWidget.className = "pointer-events-auto bg-black/80 hover:bg-black border border-emerald-500/30 px-2 py-1 rounded-lg text-[9px] text-zinc-300 font-mono flex items-center gap-1.5 transition-all shadow-md zoom-hud-widget";
                }
              } else {
                if (zoomWidget) {
                  zoomWidget.className = "pointer-events-auto bg-black/40 border border-white/5 opacity-50 px-2 py-1 rounded-lg text-[9px] text-zinc-500 font-mono flex items-center gap-1.5 transition-all zoom-hud-widget cursor-not-allowed";
                }
                if (zoomControl) zoomControl.disabled = true;
              }
            }
          } catch(e) {}
        } catch (startErr) {
          console.error("[WEBCAM] start failed completely:", startErr);
          actualScannerState = "idle";
          isWebcamScannerRunning = false;
          desiredScannerState = "idle";
          
          if (activeBox) activeBox.classList.add("hidden");
          if (staticBox) staticBox.classList.remove("hidden");
          alert("Camera Permission Alert: Please ensure you grant camera permissions inside your web browser software.");
        } finally {
          isWebcamScannerTransitioning = false;
        }
      } else if (desiredScannerState === "idle" && actualScannerState === "scanning") {
        actualScannerState = "transitioning";
        isWebcamScannerTransitioning = true;
        
        const activeBox = document.getElementById("camera-active-scanner-box");
        const staticBox = document.getElementById("camera-static-overlay");
        if (activeBox) activeBox.classList.add("hidden");
        if (staticBox) staticBox.classList.remove("hidden");

        try {
          if (html5QrcodeScanner) {
            let isInnerScanning = false;
            try {
              if (html5QrcodeScanner.getState() === 2) {
                isInnerScanning = true;
              }
            } catch (e) {}

            if (isInnerScanning) {
              await html5QrcodeScanner.stop();
            }
          }
          actualScannerState = "idle";
          isWebcamScannerRunning = false;
        } catch (stopErr) {
          console.error("[WEBCAM] stop failed:", stopErr);
          actualScannerState = "idle";
          isWebcamScannerRunning = false;
        } finally {
          isWebcamScannerTransitioning = false;
        }
      } else {
        actualScannerState = "idle";
        isWebcamScannerRunning = false;
        isWebcamScannerTransitioning = false;
      }
    }
  }).catch((queueErr) => {
    isWebcamScannerTransitioning = false;
    isSyncing = false;
    console.error("[WEBCAM] Queue error in syncScannerState:", queueErr);
  });
}

function startWebcamScanner() {
  const activeBox = document.getElementById("camera-active-scanner-box");
  const staticBox = document.getElementById("camera-static-overlay");
  
  if (!activeBox || !staticBox) return;
  
  desiredScannerState = "scanning";
  
  activeBox.classList.remove("hidden");
  staticBox.classList.add("hidden");
  
  setTimeout(() => {
    updateScannerSoundToggleButtonUI();
    if (typeof updateWideScanModeUI === "function") {
      updateWideScanModeUI();
    }
  }, 50);
  
  syncScannerState();
}

function stopWebcamScanner() {
  const activeBox = document.getElementById("camera-active-scanner-box");
  const staticBox = document.getElementById("camera-static-overlay");
  
  if (activeBox) activeBox.classList.add("hidden");
  if (staticBox) staticBox.classList.remove("hidden");
  
  desiredScannerState = "idle";
  
  syncScannerState();
  
  return scannerQueue;
}

function lookupScannedProductOffline(barcode) {
  // Search globalCatalog list
  const matched = globalCatalog.find(p => p.barcode_value === barcode);
  if (matched) {
    appendProductToCart(matched);
    playScanSuccessSound();
  } else {
    // Generate a mock fallback profile for unrecognized offline items
    const mockUnrecognized = {
      barcode_value: barcode,
      product_name: `Offline Item [${barcode}]`,
      price: 15.00,
      stock_quantity: 50,
      image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
    };
    appendProductToCart(mockUnrecognized);
    playScanWarningSound();
  }
}

function toggleOfflineSimMode() {
  IS_OFFLINE_MODE = !IS_OFFLINE_MODE;
  
  const simBtn = document.getElementById("offline-sim-btn");
  const simIcon = document.getElementById("offline-sim-icon");
  const pin = document.getElementById("sse-blink-indicator");
  const label = document.getElementById("sse-status-label");
  const subHead = document.getElementById("scan-stream-status");
  
  if (IS_OFFLINE_MODE) {
    // Force Offline State indicators in UI
    simBtn.className = "p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-500 hover:bg-amber-500/2 transition cursor-pointer";
    simBtn.title = "SIMULATING OUTAGE/OFFLINE MODE (Click to restore)";
    
    label.innerText = "OUTAGE (OFFLINE)";
    label.className = "text-[9px] font-bold tracking-tighter uppercase font-mono text-amber-500";
    pin.className = "w-2 h-2 rounded-full bg-amber-500 animate-ping";
    if (subHead) {
      subHead.innerText = "TEMPORARY CACHE ACTIVE";
      subHead.className = "bg-amber-500/15 border border-amber-500/20 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono";
    }
    
    // Close live streaming channel to demonstrate true network disconnection
    disconnectScanStreamSSE();
    playScanWarningSound();
  } else {
    // Restore Online State
    simBtn.className = "p-1.5 rounded-lg bg-[#18181B] border border-white/10 hover:bg-[#27272A] text-[#10B981] transition cursor-pointer";
    simBtn.title = "Simulate Offline/Outage Mode (Click to test)";
    
    playCheckoutDoneSound();
    
    // Reconnect SSE channel
    connectScanStreamSSE();
    
    // Auto synchronize any cached transactions with POS database
    synchronizeQueueWithServer();
  }
}

function updateOfflineSyncBadge() {
  const container = document.getElementById("offline-sync-badge-container");
  const countLabel = document.getElementById("offline-sync-badge-count");
  if (!container || !countLabel) return;

  if (OFFLINE_TXN_QUEUE.length > 0) {
    container.classList.remove("hidden");
    countLabel.innerText = `${OFFLINE_TXN_QUEUE.length} PENDING SYNCS`;
  } else {
    container.classList.add("hidden");
  }
}

async function synchronizeQueueWithServer() {
  if (OFFLINE_TXN_QUEUE.length === 0) return;
  console.log(`[OFFLINE ENGINE] Synchronizing ${OFFLINE_TXN_QUEUE.length} offline cached tickets...`);
  
  try {
    const response = await fetch("/api/sync-offline", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({ transactions: OFFLINE_TXN_QUEUE })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      console.log(`[OFFLINE ENGINE] Successfully synced ${data.syncedCount} items with server.`);
      OFFLINE_TXN_QUEUE = [];
      localStorage.setItem("offline_transactions", "[]");
      updateOfflineSyncBadge();
      
      // Spark global refresh sound
      playCheckoutDoneSound();
      
      // Reload UI lists
      loadCatalogList();
      if (currentTab === "Analytics") {
        loadAnalyticsDashboard();
      }
    } else {
      throw new Error(data.error || "Sync rejection feedback");
    }
  } catch (err) {
    console.warn("[OFFLINE ENGINE] Synchronization attempt failed, will retry on status change:", err);
  }
}

// Telmetry logs center poller
async function pollAlertLogs() {
  if (!ACCESS_TOKEN || !ACTIVE_USER) return;
  
  try {
    const res = await fetch("/api/email-logs");
    if (!res.ok) return;
    const items = await res.json();
    
    const container = document.getElementById("alert-logs-flow");
    if (!container) return;
    
    if (items.length === 0) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center p-12 text-zinc-500 font-mono text-center">
          <i data-lucide="mail" class="w-6 h-6 mb-2 text-zinc-650"></i>
          <span class="text-[10px] tracking-tight text-zinc-500 uppercase">NO ALERTS DISPATCHED IN SESSION</span>
        </div>
      `;
      lucide.createIcons();
      return;
    }
    
    container.innerHTML = items.map(alert => {
      const isInventory = alert.category === "inventory";
      const icon = isInventory ? "package" : "shield-alert";
      const badgeBg = isInventory ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-purple-500/10 text-purple-400 border-purple-500/20";
      
      return `
        <div class="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1.5 transition hover:border-white/10">
          <div class="flex items-center justify-between">
            <span class="px-2 py-0.5 rounded border text-[8px] font-mono font-bold uppercase tracking-wider ${badgeBg}">
              ${alert.category.toUpperCase()}
            </span>
            <span class="text-[8px] font-mono text-zinc-500">
              ${new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p class="text-xs font-bold text-zinc-200 mt-1">${alert.subject}</p>
          <p class="text-[10px] text-zinc-400 font-sans leading-relaxed">${alert.body}</p>
          <div class="pt-1 text-[8px] font-mono text-zinc-500 flex justify-between">
            <span>FROM: ${alert.sender}</span>
            <span>TO: ${alert.recipient}</span>
          </div>
        </div>
      `;
    }).join("");
    
  } catch (err) {
    console.warn("Mail poller stall:", err);
  }
}

// Start polling email alert triggers periodically
setInterval(pollAlertLogs, 5000);

// Initialize on window mount
window.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  // Connect to Active login state
  updateAuthUIPresentation();
  
  // Load initial static state triggers for simulators
  loadDefaultFastSimulatorList();

  // Initialize audio settings menu UI
  syncAudioSettingsUI();
});

// ============================================
// LAYER 1: AUTHENTICATION FLOW
// ============================================
let isRegisterMode = false;

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  
  const boxTitle = document.getElementById("auth-box-title");
  const btnText = document.getElementById("auth-btn-text");
  const modeToggle = document.getElementById("auth-mode-toggle");
  
  const fieldFullName = document.getElementById("field-fullname");
  const fieldRole = document.getElementById("field-role");
  
  hideAuthError();

  if (isRegisterMode) {
    boxTitle.innerText = "Register New Desk Account";
    btnText.innerText = "Initiate New Operator Setup";
    modeToggle.innerText = "Access existing account";
    fieldFullName.className = "block";
    fieldRole.className = "block";
  } else {
    boxTitle.innerText = "Operator Identity Entry";
    btnText.innerText = "Log in to desk";
    modeToggle.innerText = "Create Account";
    fieldFullName.className = "hidden";
    fieldRole.className = "hidden";
  }
}

function showAuthError(msg) {
  const container = document.getElementById("auth-error");
  const label = document.getElementById("auth-error-msg");
  if (label) label.innerText = msg;
  if (container) container.classList.remove("hidden");
  playScanWarningSound();
}

function hideAuthError() {
  const el = document.getElementById("auth-error");
  if (el) el.classList.add("hidden");
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  hideAuthError();
  
  const username = document.getElementById("auth-username").value.trim();
  const password = document.getElementById("auth-password").value;
  const fullName = document.getElementById("auth-fullname").value.trim();
  const role = document.getElementById("auth-role").value;

  try {
    if (isRegisterMode) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName, role })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed registration");
      
      // Auto login after registering
      isRegisterMode = false;
      document.getElementById("auth-username").value = username;
      document.getElementById("auth-password").value = password;
      toggleAuthMode();
      alert("Registration complete! You may now login using these operator details.");
    } else {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Access Denied");
      
      ACCESS_TOKEN = data.token;
      ACTIVE_USER = data.user;
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      playCheckoutDoneSound();
      updateAuthUIPresentation();
    }
  } catch (err) {
    showAuthError(err.message);
  }
}

async function handleFastLogin(profile) {
  const username = profile === "admin" ? "admin" : "cashier";
  const password = profile === "admin" ? "admin123" : "cashier123";
  isRegisterMode = false;
  
  document.getElementById("auth-username").value = username;
  document.getElementById("auth-password").value = password;
  
  const fakeEvent = { preventDefault: () => {} };
  await handleAuthSubmit(fakeEvent);
}

function handleLogout() {
  ACCESS_TOKEN = "";
  ACTIVE_USER = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  disconnectScanStreamSSE();
  updateAuthUIPresentation();
  playScanWarningSound();
}

function updateAuthUIPresentation() {
  const portal = document.getElementById("auth-portal");
  const workspace = document.getElementById("system-workspace");
  const catalogBtn = document.getElementById("tab-btn-catalog");
  const analyticsBtn = document.getElementById("tab-btn-analytics");
  const operatorsBtn = document.getElementById("tab-btn-operators");

  if (ACCESS_TOKEN && ACTIVE_USER) {
    if (portal) portal.classList.add("hidden");
    if (workspace) workspace.classList.remove("hidden");
    
    // Header label includes privileged role
    const staffTag = document.getElementById("header-staff-tag");
    if (staffTag) {
      staffTag.innerText = `${ACTIVE_USER.fullName} (${ACTIVE_USER.role.toUpperCase()})`;
    }
    
    // Role based granular visibility
    const forbiddenBanner = document.getElementById("catalog-write-forbidden-banner");
    const addForm = document.getElementById("catalog-add-form");

    if (ACTIVE_USER.role === "admin") {
      if (catalogBtn) catalogBtn.classList.remove("hidden");
      if (analyticsBtn) analyticsBtn.classList.remove("hidden");
      if (operatorsBtn) operatorsBtn.classList.remove("hidden");
      if (forbiddenBanner) forbiddenBanner.classList.add("hidden");
      if (addForm) addForm.classList.remove("hidden");
    } else if (ACTIVE_USER.role === "manager") {
      if (catalogBtn) catalogBtn.classList.remove("hidden");
      if (analyticsBtn) analyticsBtn.classList.remove("hidden");
      if (operatorsBtn) operatorsBtn.classList.add("hidden"); // strictly blocked
      if (forbiddenBanner) forbiddenBanner.classList.add("hidden");
      if (addForm) addForm.classList.remove("hidden");
      if (currentTab === "Operators") {
        switchActiveTab("POS");
      }
    } else {
      // Cashier level - POS & Read-Only Catalog
      if (catalogBtn) catalogBtn.classList.remove("hidden");
      if (analyticsBtn) analyticsBtn.classList.add("hidden");
      if (operatorsBtn) operatorsBtn.classList.add("hidden");
      if (forbiddenBanner) forbiddenBanner.classList.remove("hidden");
      if (addForm) addForm.classList.add("hidden");
      if (currentTab === "Operators" || currentTab === "Analytics") {
        switchActiveTab("POS");
      }
    }
    
    // Connect SSE channel
    connectScanStreamSSE();
    
    // Initialize POS Data list
    loadCatalogList();
    loadScanHistoryLogs();
    
    // Update offline state and SMTP telemetry
    updateOfflineSyncBadge();
    pollAlertLogs();
    
  } else {
    if (portal) portal.classList.remove("hidden");
    if (workspace) workspace.classList.add("hidden");
  }
  
  setTimeout(() => lucide.createIcons(), 50);
}

// ============================================
// LAYER 2: WORKSPACE TABS ROUTER
// ============================================
function switchActiveTab(target) {
  currentTab = target;
  
  // Views Array
  const views = ["POS", "Catalog", "Analytics", "Operators"];
  views.forEach(v => {
    const viewContainer = document.getElementById(`viewport-${v}`);
    const viewBtn = document.getElementById(`tab-btn-${v.toLowerCase()}`);
    
    if (v === target) {
      if (viewContainer) viewContainer.classList.remove("hidden");
      if (viewBtn) {
        viewBtn.classList.add("bg-[#8B5CF6]", "text-white");
        viewBtn.classList.remove("text-zinc-400");
      }
    } else {
      if (viewContainer) viewContainer.classList.add("hidden");
      if (viewBtn) {
        viewBtn.classList.remove("bg-[#8B5CF6]", "text-white");
        viewBtn.classList.add("text-zinc-400");
      }
    }
  });

  if (target === "POS") {
    renderPOSCartList();
  } else {
    // Automatically stop camera stream when moving away from POS to conserve performance and battery
    stopWebcamScanner();
    
    if (target === "Catalog") {
      loadCatalogList();
    } else if (target === "Analytics") {
      loadAnalyticsDashboard();
    } else if (target === "Operators") {
      loadOperatorsList();
    }
  }
}

// ============================================
// LAYER 3: REAL-TIME SCANSTREAM CLIENT (SSE ON PORT 3000)
// ============================================
function connectScanStreamSSE() {
  disconnectScanStreamSSE();
  
  const pin = document.getElementById("sse-blink-indicator");
  const label = document.getElementById("sse-status-label");
  const subHead = document.getElementById("scan-stream-status");

  label.innerText = "CONNECTING...";
  label.className = "text-[9px] font-bold tracking-tighter uppercase font-mono text-amber-500";
  pin.className = "w-2 h-2 rounded-full bg-amber-500 animate-pulse";

  sseSource = new EventSource("/api/scan-stream");

  sseSource.onopen = () => {
    label.innerText = "ONLINE (SSE)";
    label.className = "text-[9px] font-bold tracking-tighter uppercase font-mono text-[#10B981]";
    pin.className = "w-2 h-2 rounded-full bg-[#10B981]";
    if (subHead) {
      subHead.innerText = "LISTENING FEED";
      subHead.className = "bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono";
    }
  };

  // Match success catalog scans (and Veritas ScanPro auto-discovered products)
  sseSource.addEventListener("scanned", (event) => {
    const payload = JSON.parse(event.data);
    const src = payload.log ? (payload.log.source || "") : "";
    
    // Play sound ONLY if not triggered locally (local events play instantly for extreme responsiveness)
    const localSources = ["Camera Stream", "Manual Input", "Virtual Click Sim", "POS Scanner Engine"];
    if (!localSources.includes(src)) {
      if (src === "External Scanner" || src === "Remote Panel") {
        playScanSuccessSound();
      } else if (src === "Manual Remote Sim") {
        playManualScanSuccessSound();
      }
    }
    
    processScannedProduct(payload.product, payload.log, payload.isAutoDiscovered, src);
  });

  // Match unlisted code scans
  sseSource.addEventListener("unknown_barcode", (event) => {
    const payload = JSON.parse(event.data);
    playScanWarningSound();
    
    // Auto flash logs list
    loadScanHistoryLogs();
    
    // Show register quick assist wizard
    openUnrecognizedWizard(payload.log.barcode);
  });

  // Match finalized invoice clearance to update inventory stats
  sseSource.addEventListener("checkout", (event) => {
    playCheckoutDoneSound();
    loadCatalogList();
    if (currentTab === "Analytics") {
      loadAnalyticsDashboard();
    }
  });

  // Match live product catalog auto-discovery or smart update notifications
  sseSource.addEventListener("catalog_updated", (event) => {
    console.log("[MARKET INTEL] Real-time catalog updated event received.");
    loadCatalogList();
  });

  sseSource.onerror = () => {
    label.innerText = "STALL STREAM";
    label.className = "text-[9px] font-bold tracking-tighter uppercase font-mono text-rose-500";
    pin.className = "w-2 h-2 rounded-full bg-rose-500";
    if (subHead) {
      subHead.innerText = "CONN OFFLINE";
      subHead.className = "bg-rose-500/15 border border-rose-500/20 text-rose-400 text-[8px] font-bold px-2 py-0.5 rounded uppercase font-mono";
    }
  };
}

function disconnectScanStreamSSE() {
  if (sseSource) {
    sseSource.close();
    sseSource = null;
  }
}

// ============================================
// LAYER 4: POINT OF SALE CHECKOUT DESK
// ============================================
let lastHandledScanTime = 0;
let lastHandledBarcode = "";

function processScannedProduct(product, log, isAutoDiscovered, source = "") {
  if (!product || !product.barcode_value) return;
  const now = Date.now();
  const targetBarcode = String(product.barcode_value).trim();
  
  // Prevent duplicate processing from SSE and AJAX fallback occurring within 805ms
  if (targetBarcode === lastHandledBarcode && (now - lastHandledScanTime) < 805) {
    return;
  }
  lastHandledBarcode = targetBarcode;
  lastHandledScanTime = now;

  // Auto-append recognized product to cart immediately!
  appendProductToCart(product);

  // Auto-flash logs list
  loadScanHistoryLogs();

  // Display the Veritas ScanPro high-precision Scan receipt diagnostic bill modal 
  if (currentTab === "POS") {
    showVeritasScanProReport(product, log, isAutoDiscovered);
  }
}

async function fireScanEmulation(barcode, source = "POS Scanner Engine") {
  const cleanBarcode = String(barcode).trim();
  if (!cleanBarcode) return;
  
  try {
    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode: cleanBarcode, source: source })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.product) {
        // Play local responsive audio feedback before updating lists to give perfect feedback feel
        if (source === "Manual Input" || source === "Virtual Click Sim") {
          playManualScanSuccessSound();
        }
        processScannedProduct(data.product, data.log, data.isAutoDiscovered, source);
      }
    }
  } catch (err) {
    console.warn("Scan network post failed", err);
  }
}

async function handleCodeDispatchSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("manual-sku-field");
  const barcode = input.value.trim();
  if (!barcode) return;
  
  input.value = "";
  await fireScanEmulation(barcode, "Manual Input");
}

function appendProductToCart(product) {
  if (!product || !product.barcode_value) return;
  
  const targetBarcode = String(product.barcode_value).trim();
  const existing = cartItems.find(item => String(item.barcode_value).trim() === targetBarcode);
  const matched = globalCatalog.find(p => String(p.barcode_value).trim() === targetBarcode);
  
  // High-reliability stock parsing to prevent NaN or zero lockouts
  let maxStock = 999;
  if (matched && matched.stock_quantity !== undefined) {
    const parsed = parseInt(matched.stock_quantity, 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxStock = parsed;
    }
  } else if (product.stock_quantity !== undefined) {
    const parsed = parseInt(product.stock_quantity, 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxStock = parsed;
    }
  }

  if (existing) {
    const currentQty = parseInt(existing.quantity, 10) || 1;
    if (currentQty + 1 > maxStock) {
      existing.quantity = maxStock;
      playScanWarningSound();
      console.warn(`Quantity capped at maximum available stock: ${maxStock}`);
    } else {
      existing.quantity = currentQty + 1;
    }
  } else {
    cartItems.push({
      barcode_value: targetBarcode,
      product_name: product.product_name,
      price: Number(product.price) || 0,
      quantity: 1,
      image_url: product.image_url
    });
  }
  
  renderPOSCartList();
}

function changeCartItemQty(barcode, countDiff) {
  const targetBarcode = String(barcode).trim();
  const item = cartItems.find(i => String(i.barcode_value).trim() === targetBarcode);
  if (!item) return;
  
  // Force strict base-10 integer parsing to avoid string append errors
  const diff = parseInt(countDiff, 10);
  if (isNaN(diff)) return;
  
  let currentQty = parseInt(item.quantity, 10);
  if (isNaN(currentQty)) {
    currentQty = 1;
  }
  
  const newQty = currentQty + diff;
  
  // Match stock limit safely
  const matched = globalCatalog.find(p => String(p.barcode_value).trim() === targetBarcode);
  let maxStock = 999;
  if (matched && matched.stock_quantity !== undefined) {
    const parsed = parseInt(matched.stock_quantity, 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxStock = parsed;
    }
  }
  
  if (newQty <= 0) {
    cartItems = cartItems.filter(i => String(i.barcode_value).trim() !== targetBarcode);
  } else if (newQty > maxStock) {
    item.quantity = maxStock;
    playScanWarningSound();
    console.warn(`Quantity limited to maximum stock ceiling: ${maxStock}`);
  } else {
    item.quantity = newQty;
  }
  
  playSynthesizerBeep(640, "sine", 0.05);
  renderPOSCartList();
}

function removeCartItemCompletely(barcode) {
  const targetBarcode = String(barcode).trim();
  cartItems = cartItems.filter(i => String(i.barcode_value).trim() !== targetBarcode);
  playScanWarningSound();
  renderPOSCartList();
}

function clearPOSCart() {
  cartItems = [];
  renderPOSCartList();
  playScanWarningSound();
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  
  const cardBtn = document.getElementById("gate-btn-card");
  const paypalBtn = document.getElementById("gate-btn-paypal");
  
  if (method === "Credit/Debit") {
    cardBtn.className = "border border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6] py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer";
    paypalBtn.className = "border border-white/5 bg-black/40 text-zinc-400 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer";
    document.getElementById("gateway-provider-label").innerText = "CHANNEL: STRIPE SECURE API";
  } else {
    paypalBtn.className = "border border-amber-500 bg-amber-500/10 text-amber-500 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer";
    cardBtn.className = "border border-white/5 bg-black/40 text-zinc-400 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center justify-center gap-1 cursor-pointer";
    document.getElementById("gateway-provider-label").innerText = "CHANNEL: PAYPAL EXPRESS WIRE";
  }
}

function renderPOSCartList() {
  const container = document.getElementById("pos-cart-list");
  const emptyMsg = document.getElementById("cart-empty-message");
  
  if (!container || !emptyMsg) return;
  
  // Clear layout but retain reference
  container.innerHTML = "";
  
  const subtotalEl = document.getElementById("pos-calc-subtotal");
  const taxEl = document.getElementById("pos-calc-tax");
  const grandEl = document.getElementById("pos-calc-grand");
  const headerTotalEl = document.getElementById("header-cart-total");
  
  if (cartItems.length === 0) {
    container.appendChild(emptyMsg);
    emptyMsg.classList.remove("hidden");
    
    if (subtotalEl) subtotalEl.innerText = "$0.00";
    if (taxEl) taxEl.innerText = "$0.00";
    if (grandEl) grandEl.innerText = "$0.00";
    if (headerTotalEl) headerTotalEl.innerText = "$0.00";
    return;
  }
  
  emptyMsg.classList.add("hidden");
  
  let subtotal = 0;
  
  cartItems.forEach(item => {
    subtotal += item.price * item.quantity;
    
    // Find item stock status from globalCatalog list
    const matched = globalCatalog.find(p => p.barcode_value === item.barcode_value);
    const itemStock = matched ? matched.stock_quantity : 99; // Default to safe if unrecognized
    
    let warningIcon = "";
    if (itemStock <= 5) {
      warningIcon = `<span class="text-amber-500 hover:text-amber-400 animate-pulse font-bold ml-1.5 text-xs" title="Warning: Critically Low Stock! (${itemStock} remaining) ⚠️">⚠️</span>`;
    }

    const row = document.createElement("div");
    row.className = "flex items-center justify-between bg-black/35 p-3 rounded-xl border border-white/5 gap-3 hover:border-zinc-800 transition duration-150";
    row.innerHTML = `
      <div class="flex items-center space-x-3.5">
        <img src="${item.image_url}" alt="skupreview" class="w-10 h-10 object-cover rounded-lg border border-white/5 bg-white/5" referrepolicy="no-referrer" />
        <div>
          <h5 class="text-xs font-semibold text-zinc-200 line-clamp-1 flex items-center">${item.product_name} ${warningIcon}</h5>
          <span class="text-[10px] text-zinc-500 font-mono">${item.barcode_value} // $${item.price.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-1.5 bg-[#18181B] border border-white/10 rounded-lg p-1">
          <button onclick="changeCartItemQty('${item.barcode_value}', -1)" class="w-5 h-5 bg-black/50 hover:bg-zinc-850 rounded text-xs font-bold font-mono transition text-zinc-300">-</button>
          <span class="text-xs font-mono px-1 min-w-[20px] text-center font-bold text-zinc-200">${item.quantity}</span>
          <button onclick="changeCartItemQty('${item.barcode_value}', 1)" class="w-5 h-5 bg-black/50 hover:bg-zinc-850 rounded text-xs font-bold font-mono transition text-zinc-300">+</button>
        </div>
        
        <span class="text-xs font-mono font-bold text-zinc-300 min-w-[55px] text-right">$${(item.price * item.quantity).toFixed(2)}</span>
        
        <button onclick="removeCartItemCompletely('${item.barcode_value}')" class="text-zinc-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition" title="Delete entry">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    
    container.appendChild(row);
  });

  const tax = subtotal * 0.18; // 18% GST Enterprise Level Tax
  const grandTotal = subtotal + tax;
  
  if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.innerText = `$${tax.toFixed(2)}`;
  if (grandEl) grandEl.innerText = `$${grandTotal.toFixed(2)}`;
  if (headerTotalEl) headerTotalEl.innerText = `$${grandTotal.toFixed(2)}`;
  
  lucide.createIcons();
}

async function loadDefaultFastSimulatorList() {
  try {
    const response = await fetch("/api/products");
    const catalog = await response.json();
    
    const container = document.getElementById("pos-sim-list");
    container.innerHTML = "";
    
    catalog.forEach(item => {
      const btn = document.createElement("button");
      btn.onclick = () => fireScanEmulation(item.barcode_value);
      
      const outOfStock = item.stock_quantity <= 0;
      let stockWarning = "";
      if (item.stock_quantity > 0 && item.stock_quantity <= 5) {
        stockWarning = `<span class="text-amber-500 animate-pulse font-bold ml-1 text-xs" title="Warning: Critically Low Stock! (${item.stock_quantity} left) ⚠️">⚠️</span>`;
      }
      
      if (outOfStock) {
        btn.disabled = true;
        btn.className = "py-2 px-3 text-[11px] bg-red-950/10 border border-red-950/20 rounded-xl text-left transition duration-150 opacity-45 cursor-not-allowed flex flex-col justify-between w-full select-none";
        btn.title = "OUT OF STOCK - Add to Cart Disabled";
        btn.innerHTML = `
          <span class="block text-zinc-650 font-medium truncate w-full flex items-center justify-between">
            ${item.product_name}
            <span class="text-[8px] bg-red-500/10 text-red-500 px-1 rounded uppercase font-bold font-mono">SOLD OUT</span>
          </span>
          <div class="flex justify-between items-center mt-1.5 w-full">
            <span class="text-[9px] font-mono text-zinc-650">${item.barcode_value.slice(-5)}</span>
            <span class="text-[10px] font-mono text-zinc-650 font-bold">$${item.price.toFixed(2)}</span>
          </div>
        `;
      } else {
        btn.className = "py-2 px-3 text-[11px] bg-black/45 hover:bg-zinc-850 border border-white/5 rounded-xl text-left transition duration-150 hover:border-white/10 group overflow-hidden cursor-pointer flex flex-col justify-between w-full";
        btn.innerHTML = `
          <span class="block text-zinc-400 font-medium group-hover:text-white transition truncate w-full flex items-center gap-1">${item.product_name} ${stockWarning}</span>
          <div class="flex justify-between items-center mt-1.5 w-full">
            <span class="text-[9px] font-mono text-[#8B5CF6]">${item.barcode_value.slice(-5)}</span>
            <span class="text-[10px] font-mono text-emerald-400 font-bold">$${item.price.toFixed(2)}</span>
          </div>
        `;
      }
      
      container.appendChild(btn);
    });
  } catch (err) {
    console.error("Failed simulator seeder loading", err);
  }
}

async function loadScanHistoryLogs() {
  try {
    const response = await fetch("/api/scan-logs");
    const logs = await response.json();
    
    const container = document.getElementById("scan-logs-flow");
    container.innerHTML = "";
    
    if (logs.length === 0) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center py-16 opacity-40">
          <i data-lucide="layers" class="h-8 w-8 text-zinc-500 mb-2"></i>
          <p class="text-[10px] text-zinc-400 uppercase">NO SCAN EVENTS DISPATCHED</p>
        </div>
      `;
      setTimeout(() => lucide.createIcons(), 20);
      return;
    }
    
    logs.forEach(log => {
      const row = document.createElement("div");
      
      const badgeStyle = log.status === "SUCCESS" 
        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
        : "bg-rose-500/10 text-rose-400 border border-rose-500/20";
        
      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const contentName = log.status === "SUCCESS" ? log.product_name : `Unlisted Code [SKU ${log.barcode}]`;
      const contentDetail = log.status === "SUCCESS" ? `$${Number(log.price).toFixed(2)}` : "Needs dynamic catalog listing";
      
      row.className = "p-3 bg-black/35 rounded-xl border border-white/5 space-y-1 hover:border-zinc-800 transition";
      row.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="${badgeStyle} text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">${log.status}</span>
          <span class="text-[9px] font-mono text-zinc-500">${timeStr}</span>
        </div>
        <p class="text-xs text-zinc-200 line-clamp-1 font-medium">${contentName}</p>
        <p class="text-[10px] font-mono text-zinc-400">${contentDetail}</p>
      `;
      container.appendChild(row);
    });
    
  } catch (err) {
    console.error("Scan logs loader failure", err);
  }
}

// ============================================
// LAYER 5: PRODUCT CATALOG MANAGEMENT DATABASE
// ============================================


function updateLowStockReplenishmentBadges() {
  const lowStockItems = globalCatalog.filter(i => i.stock_quantity <= 5);
  const count = lowStockItems.length;

  const tabBadge = document.getElementById("pos-low-stock-badge-tab");
  const alertPanel = document.getElementById("low-stock-alert-panel");
  const alertCountText = document.getElementById("low-stock-count-text");
  
  const headerStat = document.getElementById("low-stock-header-stat");
  const headerCount = document.getElementById("low-stock-header-count");

  // Tab Badge Update
  if (tabBadge) {
    if (count > 0) {
      tabBadge.innerText = count;
      tabBadge.classList.remove("hidden");
    } else {
      tabBadge.classList.add("hidden");
    }
  }

  // POS Left Pane Alert Panel Update
  if (alertPanel) {
    if (count > 0) {
      alertPanel.classList.remove("hidden");
      if (alertCountText) {
        alertCountText.innerText = count;
      }
    } else {
      alertPanel.classList.add("hidden");
    }
  }

  // Header Panel indicators
  if (headerStat) {
    if (count > 0) {
      headerStat.classList.remove("hidden");
      if (headerCount) {
        headerCount.innerText = count;
      }
    } else {
      headerStat.classList.add("hidden");
    }
  }
}

async function loadCatalogList() {
  try {
    const response = await fetch("/api/products");
    globalCatalog = await response.json();
    
    // Auto update statistic counters
    document.getElementById("cat-stat-total-count").innerText = globalCatalog.length;
    
    const sumStock = globalCatalog.reduce((acc, i) => acc + i.stock_quantity, 0);
    document.getElementById("cat-stat-total-stock").innerText = sumStock;
    
    renderCatalogList();
    updateLowStockReplenishmentBadges();
  } catch (err) {
    console.error("Failed catalog items list fetching", err);
  }
}

function toggleCatalogSort(field) {
  if (catalogSortField === field) {
    catalogSortAsc = !catalogSortAsc;
  } else {
    catalogSortField = field;
    catalogSortAsc = true;
  }
  renderCatalogList();
  updateSortIcons();
}

function updateSortIcons() {
  const fields = ['name', 'price', 'stock'];
  fields.forEach(f => {
    const el = document.getElementById(`sort-icon-${f}`);
    if (!el) return;
    if (catalogSortField === f) {
      if (catalogSortAsc) {
        el.setAttribute('data-lucide', 'chevron-up');
        el.classList.remove('opacity-50');
        el.classList.add('text-[#8B5CF6]', 'opacity-100');
      } else {
        el.setAttribute('data-lucide', 'chevron-down');
        el.classList.remove('opacity-50');
        el.classList.add('text-[#8B5CF6]', 'opacity-100');
      }
    } else {
      el.setAttribute('data-lucide', 'chevrons-up-down');
      el.classList.add('opacity-50');
      el.classList.remove('text-[#8B5CF6]', 'opacity-100');
    }
  });
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderCatalogList() {
  const container = document.getElementById("catalog-table-body");
  const searchQuery = document.getElementById("catalog-search").value.toLowerCase().trim();
  
  // Custom filter inputs
  const minPrice = parseFloat(document.getElementById("catalog-filter-min-price").value) || 0;
  const maxPrice = parseFloat(document.getElementById("catalog-filter-max-price").value) || Infinity;
  const stockChoice = document.getElementById("catalog-filter-stock").value; // ALL, OUT_OF_STOCK, LOW_STOCK, IN_STOCK
  const dateChoice = document.getElementById("catalog-filter-date").value;  // ALL, 7_DAYS, 30_DAYS

  container.innerHTML = "";
  
  let filtered = globalCatalog.filter(i => {
    // 1. Title/SKU match check
    const matchesSearch = i.product_name.toLowerCase().includes(searchQuery) || 
                          i.barcode_value.toLowerCase().includes(searchQuery);
    if (!matchesSearch) return false;
    
    // 2. Pricing range validation
    if (i.price < minPrice || i.price > maxPrice) return false;
    
    // 3. Stock metrics validation
    if (stockChoice === "OUT_OF_STOCK" && i.stock_quantity > 0) return false;
    if (stockChoice === "LOW_STOCK" && (i.stock_quantity === 0 || i.stock_quantity >= 15)) return false;
    if (stockChoice === "IN_STOCK" && i.stock_quantity < 15) return false;
    
    // 4. Registration dates check (utilizes re-seeded timestamps)
    if (dateChoice !== "ALL" && i.created_at) {
      const addedDate = new Date(i.created_at);
      const diffMs = Date.now() - addedDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (dateChoice === "7_DAYS" && diffDays > 7) return false;
      if (dateChoice === "30_DAYS" && diffDays > 30) return false;
    }
    
    return true;
  });

  // Sort filtered list if a sort criteria is active
  if (catalogSortField) {
    filtered.sort((a, b) => {
      let valA, valB;
      if (catalogSortField === 'name') {
        valA = a.product_name.toLowerCase();
        valB = b.product_name.toLowerCase();
      } else if (catalogSortField === 'price') {
        valA = a.price;
        valB = b.price;
      } else if (catalogSortField === 'stock') {
        valA = a.stock_quantity;
        valB = b.stock_quantity;
      }
      
      if (valA < valB) return catalogSortAsc ? -1 : 1;
      if (valA > valB) return catalogSortAsc ? 1 : -1;
      return 0;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="px-4 py-12 text-center text-zinc-500">
          <i data-lucide="search-code" class="h-6 w-6 mx-auto mb-2 opacity-50"></i>
          <span>No registered products found containing query filter</span>
        </td>
      </tr>
    `;
    setTimeout(() => lucide.createIcons(), 20);
    return;
  }

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-white/[0.02] transition duration-150";
    
    // Dynamic stock tags
    let qtyStyle = "text-emerald-400 font-bold bg-emerald-500/10 border-emerald-500/20";
    if (item.stock_quantity === 0) {
      qtyStyle = "text-rose-500 font-bold bg-rose-500/10 border-rose-500/20";
    } else if (item.stock_quantity <= 5) {
      qtyStyle = "text-red-400 animate-pulse bg-red-500/10 border-red-500/20 font-bold";
    } else if (item.stock_quantity < 15) {
      qtyStyle = "text-rose-400 bg-rose-500/5 border-rose-500/15";
    } else if (item.stock_quantity < 40) {
      qtyStyle = "text-amber-400 bg-amber-500/5 border-amber-500/15";
    }
    
    const hasWriteAccess = (ACTIVE_USER && (ACTIVE_USER.role === "admin" || ACTIVE_USER.role === "manager"));
    const isEditing = hasWriteAccess && (editingProducts[item.barcode_value] !== undefined);

    let priceMarkup = ``;
    let stockMarkup = ``;
    let actionMarkup = ``;

    if (isEditing) {
      priceMarkup = `
        <div class="flex items-center justify-end">
          <span class="text-emerald-400 font-bold mr-1">$</span>
          <input type="number" step="0.01" min="0" id="edit-price-${item.barcode_value}" value="${editingProducts[item.barcode_value].price}" class="w-20 px-1.5 py-1 bg-zinc-950 border border-violet-500/50 rounded text-right text-emerald-400 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono">
        </div>
      `;
      stockMarkup = `
        <div class="flex justify-center">
          <input type="number" min="0" id="edit-stock-${item.barcode_value}" value="${editingProducts[item.barcode_value].stock_quantity}" class="w-16 px-1.5 py-1 bg-zinc-950 border border-violet-500/50 rounded text-center text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono font-bold">
        </div>
      `;
      actionMarkup = `
        <div class="flex items-center justify-center gap-1.5">
          <button onclick="saveCatalogItemInline('${item.barcode_value}')" class="bg-emerald-500/15 border border-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 p-1.5 rounded-lg transition cursor-pointer" title="Save changes">
            <i data-lucide="check" class="w-4 h-4"></i>
          </button>
          <button onclick="cancelCatalogItemInline('${item.barcode_value}')" class="bg-zinc-800 border border-white/5 hover:bg-zinc-700 text-zinc-400 p-1.5 rounded-lg transition cursor-pointer" title="Cancel">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      `;
    } else {
      priceMarkup = `$${item.price.toFixed(2)}`;
      stockMarkup = `
        <span class="${qtyStyle} text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border">
          ${item.stock_quantity === 0 ? "OUT OF STOCK" : `${item.stock_quantity} LEFT`}
        </span>
      `;
      actionMarkup = hasWriteAccess ? `
        <div class="flex items-center justify-center gap-1.5">
          <button onclick="startCatalogItemInline('${item.barcode_value}')" class="bg-violet-500/15 border border-violet-500/20 hover:bg-violet-500/30 text-violet-400 p-1.5 rounded-lg transition cursor-pointer" title="Edit Item Details">
            <i data-lucide="edit-2" class="w-4 h-4"></i>
          </button>
          <button onclick="deleteCatalogItem('${item.barcode_value}')" class="bg-rose-500/15 border border-rose-500/20 hover:bg-rose-500/30 text-rose-400 p-1.5 rounded-lg transition cursor-pointer" title="Delete SKU">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      ` : `
        <span class="text-zinc-600 inline-flex items-center" title="Admin/Manager clearance required"><i data-lucide="lock" class="h-4 w-4"></i></span>
      `;
    }

    // Low stock warning icon if stock_quantity <= 5
    let warningIcon = "";
    if (item.stock_quantity > 0 && item.stock_quantity <= 5) {
      warningIcon = `<span class="text-amber-500 animate-pulse font-bold ml-1.5" title="Warning: Critically Low Stock! (${item.stock_quantity} left) ⚠️">⚠️</span>`;
    }

    tr.innerHTML = `
      <td class="px-4 py-3.5 flex items-center space-x-3">
        <img src="${item.image_url}" alt="img" class="w-10 h-10 object-cover rounded-lg border border-white/5 bg-white/5 cursor-zoom-in hover:scale-105 hover:opacity-85 transition-all duration-200" referrerPolicy="no-referrer" onclick="openLightboxModalByBarcode('${item.barcode_value}')" title="Click to view full size">
        <span class="font-semibold text-zinc-200 line-clamp-1 max-w-[200px] flex items-center">${item.product_name} ${warningIcon}</span>
      </td>
      <td class="px-4 py-3.5 font-mono text-zinc-400">${item.barcode_value}</td>
      <td class="px-4 py-3.5 text-right font-mono text-emerald-400 font-bold">${priceMarkup}</td>
      <td class="px-4 py-3.5 text-center">${stockMarkup}</td>
      <td class="px-4 py-3.5 text-center">
        ${actionMarkup}
      </td>
    `;
    
    container.appendChild(tr);
  });
  
  lucide.createIcons();
}

async function handleProductCreationSubmit(e) {
  e.preventDefault();
  
  const barcode_value = document.getElementById("cat-barcode").value.trim();
  const product_name = document.getElementById("cat-name").value.trim();
  const price = Number(document.getElementById("cat-price").value);
  const stock_quantity = Number(document.getElementById("cat-stock").value);
  const image_url = document.getElementById("cat-image").value.trim() || `https://picsum.photos/seed/${barcode_value}/300/300`;

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({ barcode_value, product_name, price, stock_quantity, image_url })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Catalog post failed");
    }
    
    // Reset form elements
    document.getElementById("cat-barcode").value = "";
    document.getElementById("cat-name").value = "";
    document.getElementById("cat-price").value = "";
    document.getElementById("cat-stock").value = "";
    document.getElementById("cat-image").value = "";
    
    playCheckoutDoneSound();
    
    // Refresh active local registers
    await loadCatalogList();
    await loadDefaultFastSimulatorList();
    
  } catch (err) {
    alert(err.message);
  }
}

async function deleteCatalogItem(barcode) {
  if (!confirm(`Are you sure you want to delete SKU [${barcode}] from system registers?`)) return;
  
  try {
    const response = await fetch(`/api/products/${barcode}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      }
    });
    
    if (response.ok) {
      playScanWarningSound();
      await loadCatalogList();
      await loadDefaultFastSimulatorList();
    } else {
      const data = await response.json();
      alert(data.error || "Delete call failed");
    }
  } catch (err) {
    console.error(err);
  }
}

// In-Memory map for items currently being edited inline
let editingProducts = {};

function startCatalogItemInline(barcode) {
  const item = globalCatalog.find(p => String(p.barcode_value).trim() === String(barcode).trim());
  if (!item) return;
  editingProducts[barcode] = {
    price: item.price,
    stock_quantity: item.stock_quantity
  };
  renderCatalogList();
}

function cancelCatalogItemInline(barcode) {
  delete editingProducts[barcode];
  renderCatalogList();
}

async function saveCatalogItemInline(barcode) {
  const priceInput = document.getElementById(`edit-price-${barcode}`);
  const stockInput = document.getElementById(`edit-stock-${barcode}`);
  if (!priceInput || !stockInput) return;

  const price = parseFloat(priceInput.value);
  const stock_quantity = parseInt(stockInput.value, 10);

  if (isNaN(price) || price < 0) {
    alert("Please enter a valid price (greater than or equal to 0).");
    return;
  }
  if (isNaN(stock_quantity) || stock_quantity < 0) {
    alert("Please enter a valid stock quantity (greater than or equal to 0).");
    return;
  }

  try {
    const response = await fetch(`/api/products/${barcode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({ price, stock_quantity })
    });

    if (response.ok) {
      delete editingProducts[barcode];
      if (typeof playCheckoutDoneSound === "function") {
        playCheckoutDoneSound();
      }
      await loadCatalogList();
      await loadDefaultFastSimulatorList();
    } else {
      const data = await response.json();
      alert(data.error || "Failed to update product details.");
    }
  } catch (err) {
    console.error("Error updating product inline:", err);
    alert("Error communicating with server.");
  }
}

// ============================================
// LAYER 6: ANALYTICS REPORTS DESK
// ============================================
async function loadAnalyticsDashboard() {
  try {
    const startFilters = document.getElementById("report-filter-start").value;
    const endFilters = document.getElementById("report-filter-end").value;
    
    let path = "/api/analytics";
    const queries = [];
    if (startFilters) queries.push(`startDate=${startFilters}`);
    if (endFilters) queries.push(`endDate=${endFilters}`);
    if (queries.length > 0) path += "?" + queries.join("&");
    
    const response = await fetch(path, {
      headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` }
    });
    if (!response.ok) throw new Error("Access denied or analytics pipeline errored");
    
    const summary = await response.json();
    
    // Write counters
    document.getElementById("rep-total-sales").innerText = `$${summary.totalSales.toFixed(2)}`;
    document.getElementById("rep-completed-count").innerText = summary.transactionCount;
    document.getElementById("rep-avg-value").innerText = `$${summary.averageOrderValue.toFixed(2)}`;
    document.getElementById("rep-failed-count").innerText = summary.failedCount;
    document.getElementById("rep-pending-count").innerText = summary.pendingCount;

    // Best Sellers listing
    renderAnalyticsBestSellers(summary.bestSellingItems);
    
    // Analytics Daily Chrono Trends SVGs Chart
    renderAnalyticsSalesTimelineChart(summary.salesOverTime);

    // Dynamic completed checkout transaction logs table
    await loadAnalyticsTransactionsTable();
    
  } catch (err) {
    console.error(err);
  }
}

function triggerAnalyticsReload() {
  loadAnalyticsDashboard();
}

function renderAnalyticsBestSellers(items) {
  const container = document.getElementById("rep-best-sellers-list");
  container.innerHTML = "";
  
  if (!items || items.length === 0) {
    container.innerHTML = `<div class="py-12 text-center opacity-40 text-xs text-zinc-500 uppercase">No completed catalog invoice lines logged</div>`;
    return;
  }
  
  const topSalesVal = Math.max(...items.map(i => i.quantity_sold), 1);
  
  items.forEach(item => {
    const ratio = (item.quantity_sold / topSalesVal) * 100;
    
    const itemCard = document.createElement("div");
    itemCard.className = "space-y-1.5 p-1";
    itemCard.innerHTML = `
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2.5">
          <img src="${item.image_url}" alt="preview" class="w-8 h-8 rounded object-cover border border-white/5 bg-white/5" referrerPolicy="no-referrer" />
          <div>
            <span class="block font-semibold text-zinc-200 line-clamp-1 max-w-[150px]">${item.name}</span>
            <span class="block text-[9px] font-mono text-zinc-400 uppercase">SKU ${item.barcode.slice(-5)}</span>
          </div>
        </div>
        <div class="text-right">
          <span class="block font-bold text-zinc-300 font-mono">${item.quantity_sold} sold</span>
          <span class="block text-[10px] text-emerald-400 font-mono font-semibold">$${item.revenue_generated.toFixed(2)}</span>
        </div>
      </div>
      <div class="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
        <div class="bg-gradient-to-r from-violet-500 to-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${ratio}%"></div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}

function renderAnalyticsSalesTimelineChart(timeline) {
  const canvas = document.getElementById("timeline-chart-canvas");
  canvas.innerHTML = "";
  
  if (!timeline || timeline.length === 0) {
    canvas.innerHTML = `<div class="h-full flex items-center justify-center opacity-40 text-xs font-bold text-center text-zinc-500 uppercase">NO TRANSACTIONS RECORDED IN STATEMENT TIMELINE</div>`;
    return;
  }

  // Draw a standard beautiful SVG line chart natively
  const width = canvas.clientWidth || 550;
  const height = canvas.clientHeight || 210;
  
  const padding = 35;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  const maxVal = Math.max(...timeline.map(t => t.revenue), 100) * 1.15;
  
  // Create coordinate map points
  const points = timeline.map((t, idx) => {
    const x = padding + (idx / Math.max(timeline.length - 1, 1)) * graphWidth;
    const y = padding + graphHeight - (t.revenue / maxVal) * graphHeight;
    return { x, y, val: t.revenue, date: t.date };
  });

  let polylinePath = "";
  let areaPath = `M ${points[0].x} ${padding + graphHeight} `;
  
  points.forEach((p, idx) => {
    if (idx === 0) {
      polylinePath += `M ${p.x} ${p.y} `;
    } else {
      polylinePath += `L ${p.x} ${p.y} `;
    }
    areaPath += `L ${p.x} ${p.y} `;
  });
  
  areaPath += `L ${points[points.length - 1].x} ${padding + graphHeight} Z`;

  // Draw the full responsive inline SVG
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.overflow = "visible";

  // Grid line helpers
  for (let idx = 0; idx <= 4; idx++) {
    const yPos = padding + (idx / 4) * graphHeight;
    const lineVal = maxVal - (idx / 4) * maxVal;
    
    // Grid horizontal rule line
    const gridLine = document.createElementNS(svgNS, "line");
    gridLine.setAttribute("x1", padding);
    gridLine.setAttribute("y1", yPos);
    gridLine.setAttribute("x2", width - padding);
    gridLine.setAttribute("y2", yPos);
    gridLine.setAttribute("stroke", "rgba(255, 255, 255, 0.04)");
    gridLine.setAttribute("stroke-dasharray", "4");
    svg.appendChild(gridLine);
    
    // Text labels
    const gridLabel = document.createElementNS(svgNS, "text");
    gridLabel.setAttribute("x", padding - 8);
    gridLabel.setAttribute("y", yPos + 3);
    gridLabel.setAttribute("fill", "#6B7280");
    gridLabel.setAttribute("font-size", "8px");
    gridLabel.setAttribute("font-family", "JetBrains Mono");
    gridLabel.setAttribute("text-anchor", "end");
    gridLabel.textContent = `$${Math.round(lineVal)}`;
    svg.appendChild(gridLabel);
  }

  // Draw translucent gradient filled area
  const gradientDef = `
    <defs>
      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
  `;
  svg.innerHTML += gradientDef;

  const areaElement = document.createElementNS(svgNS, "path");
  areaElement.setAttribute("d", areaPath);
  areaElement.setAttribute("fill", "url(#chart-area-grad)");
  svg.appendChild(areaElement);

  // Draw core polyline
  const lineElement = document.createElementNS(svgNS, "path");
  lineElement.setAttribute("d", polylinePath);
  lineElement.setAttribute("fill", "none");
  lineElement.setAttribute("stroke", "#8B5CF6");
  lineElement.setAttribute("stroke-width", "2.5");
  lineElement.setAttribute("stroke-linecap", "round");
  lineElement.setAttribute("stroke-linejoin", "round");
  svg.appendChild(lineElement);

  // Draw glowing data node bubble points
  points.forEach((p) => {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "4.5");
    circle.setAttribute("fill", "#09090B");
    circle.setAttribute("stroke", "#10B981");
    circle.setAttribute("stroke-width", "1.5");
    circle.style.cursor = "pointer";
    circle.style.transition = "r 150ms ease, stroke 150ms ease, stroke-width 150ms ease";
    
    circle.addEventListener("mouseenter", (event) => {
      circle.setAttribute("r", "7");
      circle.setAttribute("stroke", "#8B5CF6");
      circle.setAttribute("stroke-width", "2.5");
      
      let tooltip = document.getElementById("chart-tooltip");
      if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "chart-tooltip";
        tooltip.className = "fixed pointer-events-none bg-zinc-950/95 border border-white/10 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl font-mono z-50 flex flex-col space-y-0.5 backdrop-blur-sm transition-opacity duration-150";
        document.body.appendChild(tooltip);
      }
      
      tooltip.style.opacity = "1";
      tooltip.style.display = "flex";
      tooltip.innerHTML = `
        <span class="text-zinc-500 text-[8px] uppercase font-mono tracking-wider">Statement Date</span>
        <span class="font-bold text-zinc-100">${p.date}</span>
        <span class="text-emerald-400 font-extrabold font-mono text-xs mt-0.5">$${p.val.toFixed(2)}</span>
      `;
      
      tooltip.style.left = (event.clientX + 12) + "px";
      tooltip.style.top = (event.clientY - 45) + "px";
    });

    circle.addEventListener("mousemove", (event) => {
      const tooltip = document.getElementById("chart-tooltip");
      if (tooltip) {
        tooltip.style.left = (event.clientX + 12) + "px";
        tooltip.style.top = (event.clientY - 45) + "px";
      }
    });

    circle.addEventListener("mouseleave", () => {
      circle.setAttribute("r", "4.5");
      circle.setAttribute("stroke", "#10B981");
      circle.setAttribute("stroke-width", "1.5");
      
      const tooltip = document.getElementById("chart-tooltip");
      if (tooltip) {
        tooltip.style.opacity = "0";
        tooltip.style.display = "none";
      }
    });

    svg.appendChild(circle);
    
    // Draw text values
    const textVal = document.createElementNS(svgNS, "text");
    textVal.setAttribute("x", p.x);
    textVal.setAttribute("y", p.y - 8);
    textVal.setAttribute("fill", "#10B981");
    textVal.setAttribute("font-size", "7.5px");
    textVal.setAttribute("font-weight", "bold");
    textVal.setAttribute("font-family", "JetBrains Mono");
    textVal.setAttribute("text-anchor", "middle");
    textVal.textContent = `$${p.val.toFixed(0)}`;
    svg.appendChild(textVal);

    // Draw date triggers underneath
    const textDate = document.createElementNS(svgNS, "text");
    textDate.setAttribute("x", p.x);
    textDate.setAttribute("y", padding + graphHeight + 14);
    textDate.setAttribute("fill", "#6B7280");
    textDate.setAttribute("font-size", "7.5px");
    textDate.setAttribute("font-family", "JetBrains Mono");
    textDate.setAttribute("text-anchor", "middle");
    textDate.textContent = p.date.split("-").slice(1).join("/"); // Show MM/DD only
    svg.appendChild(textDate);
  });

  canvas.appendChild(svg);
}

async function loadAnalyticsTransactionsTable() {
  try {
    const response = await fetch("/api/transactions");
    const list = await response.json();
    
    // Dynamic cashier unique options dropdown builder
    const cashierSelect = document.getElementById("txn-filter-cashier");
    if (cashierSelect) {
      const currentSelection = cashierSelect.value || "ALL";
      const uniqueCashiers = ["ALL", ...new Set(list.map(t => t.cashier_name).filter(Boolean))];
      cashierSelect.innerHTML = uniqueCashiers.map(c => `
        <option value="${c}" ${c === currentSelection ? 'selected' : ''}>${c === 'ALL' ? 'All Cashiers' : c.toUpperCase()}</option>
      `).join("");
    }

    const searchVal = document.getElementById("txn-search").value.toLowerCase().trim();
    const statusVal = document.getElementById("txn-filter-status").value;
    const cashierVal = document.getElementById("txn-filter-cashier").value;
    const startDateVal = document.getElementById("txn-filter-start-date") ? document.getElementById("txn-filter-start-date").value : "";
    const endDateVal = document.getElementById("txn-filter-end-date") ? document.getElementById("txn-filter-end-date").value : "";
    
    const tbody = document.getElementById("transactions-log-table-body");
    tbody.innerHTML = "";
    
    const filteredList = list.filter(item => {
      // 1. Text Search matching (receipt, cashier or name of items bought)
      const itemSummaries = item.items.map(sub => `${sub.product_name}`).join(", ").toLowerCase();
      const matchesSearch = item.receipt_number.toLowerCase().includes(searchVal) || 
                            item.cashier_name.toLowerCase().includes(searchVal) || 
                            itemSummaries.includes(searchVal);
      if (!matchesSearch) return false;
      
      // 2. Payment status code check
      if (statusVal !== "ALL" && item.payment_status !== statusVal) return false;
      
      // 3. Granular cashier checkup
      if (cashierVal !== "ALL" && item.cashier_name !== cashierVal) return false;
      
      // 4. Date Range check
      if (item.timestamp) {
        const itemDate = new Date(item.timestamp);
        if (startDateVal) {
          const startDate = new Date(startDateVal + "T00:00:00");
          if (itemDate < startDate) return false;
        }
        if (endDateVal) {
          const endDate = new Date(endDateVal + "T23:59:59");
          if (itemDate > endDate) return false;
        }
      }
      
      return true;
    });

    if (filteredList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-zinc-500">No matching receipts archived in current database selection</td></tr>`;
      return;
    }
    
    filteredList.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-white/[0.015] transition";
      
      let badgeStyle = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      if (item.payment_status === "COMPLETED") {
        badgeStyle = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      } else if (item.payment_status === "FAILED") {
        badgeStyle = "text-rose-400 bg-rose-500/10 border-rose-500/20";
      }
      
      const itemSummaries = item.items.map(sub => `${sub.product_name} (x${sub.quantity})`).join(", ");
      const formattedTime = new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
      
      tr.innerHTML = `
        <td class="px-4 py-3.5 font-mono text-[#8B5CF6] font-bold">${item.receipt_number}</td>
        <td class="px-4 py-3.5 uppercase font-semibold text-zinc-300 font-mono text-[10px]">${item.cashier_name}</td>
        <td class="px-4 py-3.5 text-zinc-400 max-w-[280px] truncate" title="${itemSummaries}">${itemSummaries}</td>
        <td class="px-4 py-3.5 text-right font-mono text-zinc-200 font-bold">$${item.grand_total.toFixed(2)}</td>
        <td class="px-4 py-3.5 text-center">
          <span class="${badgeStyle} text-[9px] uppercase font-mono px-2 py-0.5 rounded border">
            ${item.payment_status}
          </span>
        </td>
        <td class="px-4 py-3.5 text-center font-mono text-[10px] text-zinc-500">${formattedTime}</td>
      `;
      
      tbody.appendChild(tr);
    });
    
  } catch (err) {
    console.error(err);
  }
}

// RESTORE MOCK DATABASES SEED
async function triggerSystemRestore() {
  if (!confirm("Are you sure you want to restore the entire catalog registers and wipe active sales histories/logs?")) return;
  
  try {
    const response = await fetch("/api/reset", {
      method: "POST"
    });
    const data = await response.json();
    
    playScanWarningSound();
    alert(data.message);
    
    // Refresh all panels
    cartItems = [];
    renderPOSCartList();
    loadCatalogList();
    loadDefaultFastSimulatorList();
    loadScanHistoryLogs();
    if (localStorage.getItem("token")) {
      loadAnalyticsDashboard();
    }
  } catch (err) {
    console.error("System reset failed", err);
  }
}

// EXPORT TO EXCEL SYSTEM CSV
async function exportAnalyticsCSV() {
  try {
    const response = await fetch("/api/transactions");
    const txns = await response.json();
    
    if (txns.length === 0) {
      alert("No transaction records available to export yet.");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Receipt Number,Timestamp,Cashier Name,Payment Method,Subtotal,Tax (18%),Grand Total,Status,Items List\r\n";
    
    txns.forEach(t => {
      const serializedItems = t.items.map(i => `${i.product_name} (Qty:${i.quantity} @$${i.price})`).join(" | ");
      const row = [
        t.receipt_number,
        t.timestamp,
        `"${t.cashier_name}"`,
        t.payment_method,
        t.subtotal,
        t.tax,
        t.grand_total,
        t.payment_status,
        `"${serializedItems}"`
      ].join(",");
      csvContent += row + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `Veritas_ScanPro_Statement_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    playScanSuccessSound();
    
  } catch (err) {
    alert("Export execution failed");
  }
}

// ============================================
// LAYER 7: MODAL WIZARDS MANAGEMENT (POPUPS)
// ============================================

// 7.1 PAYMENT GATEWAY MODAL
function initiateSecurePayment() {
  if (cartItems.length === 0) {
    playScanWarningSound();
    alert("Checkout cannot proceed. Your billing cart is currently empty.");
    return;
  }
  
  const subTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const tax = subTotal * 0.18;
  const grandTotal = subTotal + tax;
  
  // Start checkout creation in backend first
  createCheckoutTicket(subTotal, tax, grandTotal);
}

async function createCheckoutTicket(subtotal, tax, grandTotal) {
  if (IS_OFFLINE_MODE) {
    // Simulated local ticket preparation to withstand outage
    const receipt_number = `TXN-OFF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const offlineTxn = {
      id: `TXN-OFF-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      receipt_number,
      cashier_name: ACTIVE_USER ? ACTIVE_USER.fullName : "Offline Cashier",
      subtotal: Number(subtotal),
      tax: Number(tax),
      grand_total: Number(grandTotal),
      payment_method: selectedPaymentMethod,
      payment_status: "PENDING",
      items: cartItems.map(item => ({
        barcode_value: item.barcode_value,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price
      })),
      timestamp: new Date().toISOString()
    };
    
    activeCheckoutTransaction = offlineTxn;
    
    // Fill values into Gateway screen
    document.getElementById("gate-calc-bill").innerText = `$${grandTotal.toFixed(2)}`;
    document.getElementById("gate-calc-ticket").innerText = offlineTxn.receipt_number;
    
    // Reset gate step fields
    document.getElementById("gate-step-form").classList.remove("hidden");
    document.getElementById("gate-step-processing").classList.add("hidden");
    document.getElementById("gate-step-done").classList.add("hidden");
    document.getElementById("gate-error-banner").classList.add("hidden");
    
    // Reset card values
    document.getElementById("gate-card-num").value = "";
    document.getElementById("gate-card-exp").value = "";
    document.getElementById("gate-card-cvc").value = "";
    document.getElementById("gate-card-holder").value = ACTIVE_USER ? ACTIVE_USER.fullName : "Offline Guest";
    
    // Reveal Modal Interface
    document.getElementById("modal-payment-gateway").classList.remove("hidden");
    playSynthesizerBeep(784, "sine", 0.08);
    return;
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems,
        cashierName: ACTIVE_USER ? ACTIVE_USER.fullName : "Joanna Sterling",
        paymentMethod: selectedPaymentMethod,
        subtotal,
        tax,
        grandTotal
      })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Checkout ticketing error");
    
    activeCheckoutTransaction = data.transaction;
    
    // Fill values into Gateway screen
    document.getElementById("gate-calc-bill").innerText = `$${grandTotal.toFixed(2)}`;
    document.getElementById("gate-calc-ticket").innerText = activeCheckoutTransaction.receipt_number;
    
    // Reset gate step fields
    document.getElementById("gate-step-form").classList.remove("hidden");
    document.getElementById("gate-step-processing").classList.add("hidden");
    document.getElementById("gate-step-done").classList.add("hidden");
    document.getElementById("gate-error-banner").classList.add("hidden");
    
    // Reset card values
    document.getElementById("gate-card-num").value = "";
    document.getElementById("gate-card-exp").value = "";
    document.getElementById("gate-card-cvc").value = "";
    document.getElementById("gate-card-holder").value = ACTIVE_USER ? ACTIVE_USER.fullName : "Abhishek Dustbin";
    
    // Reveal Modal Interface
    document.getElementById("modal-payment-gateway").classList.remove("hidden");
    playSynthesizerBeep(784, "sine", 0.08);
    
  } catch (err) {
    alert(err.message);
  }
}

function closePaymentGateway() {
  document.getElementById("modal-payment-gateway").classList.add("hidden");
  activeCheckoutTransaction = null;
}

// Secure inputs typing masks
function formatCardNum(el) {
  let v = el.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let matches = v.match(/\d{4,16}/g);
  let match = matches && matches[0] || '';
  let parts = [];

  for (let i=0, len=match.length; i<len; i+=4) {
    parts.push(match.substring(i, i+4));
  }

  if (parts.length > 0) {
    el.value = parts.join(' ');
  } else {
    el.value = v;
  }
}

function formatExpiry(el) {
  let v = el.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (v.length >= 2) {
    el.value = v.substring(0, 2) + '/' + v.substring(2, 4);
  } else {
    el.value = v;
  }
}

async function confirmSecureGatewayCharge() {
  if (!activeCheckoutTransaction) return;
  
  const cardNum = document.getElementById("gate-card-num").value.replace(/\s+/g, '');
  const exp = document.getElementById("gate-card-exp").value;
  const cvc = document.getElementById("gate-card-cvc").value;
  const holder = document.getElementById("gate-card-holder").value.toLowerCase().trim();
  
  const errorBanner = document.getElementById("gate-error-banner");
  errorBanner.classList.add("hidden");

  if (cardNum.length < 15 || exp.length < 5 || cvc.length < 3 || holder.length < 3) {
    playScanWarningSound();
    errorBanner.innerText = "Validation failure: Please fill complete valid payment credentials.";
    errorBanner.classList.remove("hidden");
    return;
  }

  // Swap GUI steps to Loading spinner state
  document.getElementById("gate-step-form").classList.add("hidden");
  document.getElementById("gate-step-processing").classList.remove("hidden");
  playScanSuccessSound();

  if (IS_OFFLINE_MODE) {
    // Outage Simulation: Cache offline directly in browser queue
    setTimeout(() => {
      let finalStatus = "COMPLETED";
      if (cardNum.endsWith("0002") || holder.includes("decline") || holder.includes("failed")) {
        finalStatus = "FAILED";
      }

      if (finalStatus === "COMPLETED") {
        activeCheckoutTransaction.payment_status = "COMPLETED";
        
        // Feed local queue list
        OFFLINE_TXN_QUEUE.push(activeCheckoutTransaction);
        localStorage.setItem("offline_transactions", JSON.stringify(OFFLINE_TXN_QUEUE));
        
        updateOfflineSyncBadge(); // UI indicator refresh

        // Swap UI step to green check
        document.getElementById("gate-step-processing").classList.add("hidden");
        document.getElementById("gate-step-done").classList.remove("hidden");
        playCheckoutDoneSound();
        
        // Wipe local register cart
        cartItems = [];
        renderPOSCartList();
      } else {
        // Return to form with error messages
        document.getElementById("gate-step-processing").classList.add("hidden");
        document.getElementById("gate-step-form").classList.remove("hidden");
        
        errorBanner.innerText = "Authorization Declined: Selected secure card network refused verification (Mock Code 0002). Try using standard simulator inputs.";
        errorBanner.classList.remove("hidden");
        playScanWarningSound();
      }
    }, 1200);
    return;
  }

  // Simulate remote server authorization delay
  setTimeout(async () => {
    let finalStatus = "COMPLETED";
    
    // Simulate Decline triggers (Ends in 0002 / name contains "decline")
    if (cardNum.endsWith("0002") || holder.includes("decline") || holder.includes("failed")) {
      finalStatus = "FAILED";
    }

    try {
      const response = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_id: activeCheckoutTransaction.id,
          status: finalStatus
        })
      });
      
      const data = await response.json();
      
      if (finalStatus === "COMPLETED") {
        activeCheckoutTransaction = data.transaction;
        // Swap UI step to green check
        document.getElementById("gate-step-processing").classList.add("hidden");
        document.getElementById("gate-step-done").classList.remove("hidden");
        playCheckoutDoneSound();
        
        // Wipe local register cart
        cartItems = [];
        renderPOSCartList();
        
      } else {
        // Return to form with error messages
        document.getElementById("gate-step-processing").classList.add("hidden");
        document.getElementById("gate-step-form").classList.remove("hidden");
        
        errorBanner.innerText = "Authorization Declined: Selected secure card network refused verification (Mock Code 0002). Try using standard simulator inputs.";
        errorBanner.classList.remove("hidden");
        playScanWarningSound();
      }
      
    } catch (err) {
      document.getElementById("gate-step-processing").classList.add("hidden");
      document.getElementById("gate-step-form").classList.remove("hidden");
      errorBanner.innerText = "Network Gateway error: " + err.message;
      errorBanner.classList.remove("hidden");
      playScanWarningSound();
    }
    
  }, 1800);
}

// 7.15 VERITAS SCANPRO REAL-TIME SYSTEM DIAGNOSTIC REPORT BILL
function showVeritasScanProReport(product, log, isAutoDiscovered) {
  // Fraction of a second calculations (e.g., 0.01s - 0.08s) to prove Veritas extreme speed and accuracy
  const speedSec = (0.012 + Math.random() * 0.05).toFixed(3);
  const precision = (99.85 + (Math.random() * 0.14)).toFixed(2) + "% Auto Calibration";
  
  document.getElementById("scanpro-metric-speed").innerText = `${speedSec} Seconds`;
  document.getElementById("scanpro-metric-precision").innerText = precision;
  
  document.getElementById("scanpro-prod-image").src = product.image_url;
  
  const statusLabel = isAutoDiscovered ? "Auto-Discovered Code" : "Verified SKU Listing";
  const tagEl = document.getElementById("scanpro-prod-tag");
  tagEl.innerText = statusLabel;
  if (isAutoDiscovered) {
    tagEl.className = "bg-amber-500/10 text-amber-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase border border-amber-500/20";
  } else {
    tagEl.className = "bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase border border-emerald-500/20";
  }
  
  document.getElementById("scanpro-prod-name").innerText = product.product_name;
  document.getElementById("scanpro-prod-barcode").innerText = `Barcode: ${product.barcode_value}`;
  document.getElementById("scanpro-prod-stock").innerText = `${product.stock_quantity} IN STOCK`;
  
  // High quality details summary
  let detailsSummary = product.summary;
  if (!detailsSummary) {
    detailsSummary = `[Veritas ScanPro Real-time Verification Engine] Item successfully matched. Authenticated and matched with active cloud-native registers on port 3000. Hardware and inventory statuses updated cleanly.`;
  }
  document.getElementById("scanpro-prod-summary").innerText = detailsSummary;
  
  // Real-time bill pricing mechanics
  const priceUnit = Number(product.price);
  const calculatedTax = Number((priceUnit * 0.18).toFixed(2));
  const grandTotalPayable = Number((priceUnit + calculatedTax).toFixed(2));
  
  document.getElementById("scanpro-invoice-qty-name").innerText = `1x ${product.product_name}`;
  document.getElementById("scanpro-invoice-unit-price").innerText = `$${priceUnit.toFixed(2)}`;
  document.getElementById("scanpro-invoice-subtotal").innerText = `$${priceUnit.toFixed(2)}`;
  document.getElementById("scanpro-invoice-tax").innerText = `$${calculatedTax.toFixed(2)}`;
  document.getElementById("scanpro-invoice-grand").innerText = `$${grandTotalPayable.toFixed(2)}`;
  
  // Since we already auto-appended the product to the cart upon scan,
  // we alter the modal buttons layout so the user either "Confirms" it or "Discards/Refunds" it.
  const dismissBtn = document.getElementById("scanpro-dismiss-btn");
  if (dismissBtn) {
    dismissBtn.innerHTML = `<i data-lucide="trash-2" class="h-3.5 w-3.5"></i> Discard Item`;
    dismissBtn.className = "py-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 hover:bg-rose-950/80 text-xs font-bold uppercase transition text-rose-450 cursor-pointer text-center flex items-center justify-center gap-1.5";
    dismissBtn.onclick = () => {
      removeCartItemCompletely(product.barcode_value);
      closeScanProReport();
    };
  }
  
  const addCartBtn = document.getElementById("scanpro-add-cart-btn");
  if (product.stock_quantity <= 0) {
    addCartBtn.disabled = true;
    addCartBtn.innerHTML = `<i data-lucide="shopping-cart" class="h-3.5 w-3.5"></i> Out of Stock`;
    addCartBtn.className = "py-2.5 rounded-lg bg-zinc-800 text-zinc-500 font-bold uppercase transition cursor-not-allowed text-center flex items-center justify-center gap-1.5 opacity-55 col-span-1 w-full";
    addCartBtn.title = "OUT OF STOCK - CANNOT APPEND TO CART";
  } else {
    addCartBtn.disabled = false;
    addCartBtn.innerHTML = `<i data-lucide="check" class="h-3.5 w-3.5"></i> Confirm Item`;
    addCartBtn.className = "py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold uppercase text-white transition shadow-lg cursor-pointer text-center flex items-center justify-center gap-1.5";
    addCartBtn.title = "Keep this authenticated item in the cart register";
    addCartBtn.onclick = () => {
      closeScanProReport();
    };
  }
  
  // Display the professional ScanPro ticket dialog modal
  document.getElementById("modal-scanpro-report").classList.remove("hidden");
  
  setTimeout(() => lucide.createIcons(), 35);
}

function closeScanProReport() {
  document.getElementById("modal-scanpro-report").classList.add("hidden");
}

// 7.2 UNRECOGNIZED BARCODE WIZARD REGISTRATION MODULE
function openUnrecognizedWizard(barcode) {
  document.getElementById("wizard-target-sku").innerText = barcode;
  document.getElementById("wizard-field-barcode").value = barcode;
  document.getElementById("wizard-field-name").value = "";
  document.getElementById("wizard-field-price").value = "";
  
  // show modal
  document.getElementById("modal-unrecognized-wizard").classList.remove("hidden");
  playScanWarningSound();
}

function closeUnrecognizedWizard() {
  document.getElementById("modal-unrecognized-wizard").classList.add("hidden");
}

async function handleWizardQuickRegisterSubmit(e) {
  e.preventDefault();
  
  const barcode_value = document.getElementById("wizard-field-barcode").value;
  const product_name = document.getElementById("wizard-field-name").value.trim();
  const price = Number(document.getElementById("wizard-field-price").value);
  const stock_quantity = 50; // default initial layout stock
  const image_url = `https://picsum.photos/seed/${barcode_value}/300/300`;

  try {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({ barcode_value, product_name, price, stock_quantity, image_url })
    });
    
    if (response.ok) {
      closeUnrecognizedWizard();
      playCheckoutDoneSound();
      
      // Flash catalog states
      await loadCatalogList();
      await loadDefaultFastSimulatorList();
      
      // Auto Append newly registered SKU cleanly to live sales ticket Cart item list
      const matched = globalCatalog.find(i => i.barcode_value === barcode_value) || {
        barcode_value, product_name, price, quantity: 1, image_url
      };
      appendProductToCart(matched);
      
    } else {
      const data = await response.json();
      alert(data.error || "Wizard failed to compile product");
    }
  } catch (err) {
    console.error(err);
  }
}

// 7.3 RECEIPT POPUP VIEWERS SLIPS
function showPrintedReceiptFromGate() {
  if (!activeCheckoutTransaction) return;
  
  closePaymentGateway();
  
  document.getElementById("rect-receipt-num").innerText = activeCheckoutTransaction.receipt_number;
  document.getElementById("rect-timestamp").innerText = new Date(activeCheckoutTransaction.timestamp).toLocaleString();
  document.getElementById("rect-cashier").innerText = activeCheckoutTransaction.cashier_name;
  
  // Fill receipts lines
  const parent = document.getElementById("rect-items-body");
  parent.innerHTML = "";
  
  activeCheckoutTransaction.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "flex justify-between items-start text-[10px] text-zinc-800";
    row.innerHTML = `
      <div class="max-w-[190px]">
        <span class="block font-bold">${item.product_name}</span>
        <span class="text-[9px] text-zinc-500">${item.quantity} Qty x $${item.price.toFixed(2)}</span>
      </div>
      <span class="font-mono font-semibold">$${(item.quantity * item.price).toFixed(2)}</span>
    `;
    parent.appendChild(row);
  });
  
  const subTotal = activeCheckoutTransaction.subtotal;
  const tax = activeCheckoutTransaction.tax;
  const grandTotal = activeCheckoutTransaction.grand_total;
  
  document.getElementById("rect-calc-subtotal").innerText = `$${subTotal.toFixed(2)}`;
  document.getElementById("rect-calc-tax").innerText = `$${tax.toFixed(2)}`;
  document.getElementById("rect-calc-grand").innerText = `$${grandTotal.toFixed(2)}`;
  
  // Display Modal
  document.getElementById("modal-receipt").classList.remove("hidden");
  playCheckoutDoneSound();
}

function closeReceiptModal() {
  document.getElementById("modal-receipt").classList.add("hidden");
}

function toggleAudioMuted() {
  isAudioMuted = !isAudioMuted;
  const btn = document.getElementById("volume-ctrl-btn");
  if (isAudioMuted) {
    btn.innerHTML = `<i data-lucide="volume-x" class="h-4 w-4"></i>`;
    btn.className = "p-1.5 rounded-lg bg-[#18181B] border border-white/10 hover:bg-[#27272A] text-rose-450 transition cursor-pointer";
  } else {
    btn.innerHTML = `<i data-lucide="volume-2" class="h-4 w-4"></i>`;
    btn.className = "p-1.5 rounded-lg bg-[#18181B] border border-white/10 hover:bg-[#27272A] text-[#10B981] transition cursor-pointer";
    playScanSuccessSound();
  }
  lucide.createIcons();
}

// ============================================
// LAYER 8: OPERATOR LEDGER CONTROLLER
// ============================================
let globalOperators = [];
let editingOperator = null;
let editOperatorRoleState = "cashier";

async function loadOperatorsList() {
  const loading = document.getElementById("operators-loading-state");
  const grid = document.getElementById("operators-grid");
  const errBanner = document.getElementById("operator-error-banner");
  const successBanner = document.getElementById("operator-success-banner");

  errBanner.classList.add("hidden");
  successBanner.classList.add("hidden");
  loading.classList.remove("hidden");
  grid.classList.add("opacity-40");

  try {
    const res = await fetch("/api/users", {
      headers: { "Authorization": `Bearer ${ACCESS_TOKEN}` }
    });
    if (res.ok) {
      globalOperators = await res.json();
      renderOperatorsList();
    } else {
      const data = await res.json();
      showOperatorError(data.error || "Failed to fetch administrative users list.");
    }
  } catch (err) {
    showOperatorError("Network error fetching user profiles.");
  } finally {
    loading.classList.add("hidden");
    grid.classList.remove("opacity-40");
  }
}

function showOperatorError(msg) {
  const banner = document.getElementById("operator-error-banner");
  const text = document.getElementById("operator-error-msg");
  text.innerText = msg;
  banner.classList.remove("hidden");
  playScanWarningSound();
}

function showOperatorSuccess(msg) {
  const banner = document.getElementById("operator-success-banner");
  const text = document.getElementById("operator-success-msg");
  text.innerText = msg;
  banner.classList.remove("hidden");
  playScanSuccessSound();
}

function renderOperatorsList() {
  const tbody = document.getElementById("operators-table-body");
  tbody.innerHTML = "";

  globalOperators.forEach(u => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-white/5 transition duration-150";

    const initials = u.fullName.slice(0, 2).toUpperCase();
    const createdDate = new Date(u.created_at).toLocaleDateString();

    const roleBadge = u.role === "admin" 
      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
      : "bg-emerald-500/10 text-[#10B981] border border-emerald-400/20";

    tr.innerHTML = `
      <td class="p-4 flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 flex items-center justify-center font-bold text-xs font-mono">
          ${initials}
        </div>
        <span class="font-semibold text-zinc-200">${u.fullName}</span>
      </td>
      <td class="p-4 text-zinc-400 font-mono">${u.username}</td>
      <td class="p-4 text-center">
        <span class="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${roleBadge}">
          ${u.role}
        </span>
      </td>
      <td class="p-4 text-zinc-500 font-mono">${createdDate}</td>
      <td class="p-4 text-right">
        <button
          onclick="startEditOperator('${u.id}')"
          class="px-2 py-1 bg-zinc-800 hover:bg-[#8B5CF6]/15 hover:text-[#8B5CF6] text-zinc-300 rounded border border-white/5 hover:border-[#8B5CF6]/30 text-[10px] font-mono uppercase font-bold flex items-center gap-1 cursor-pointer ml-auto transition duration-150"
          title="Edit User Profile"
        >
          <i data-lucide="edit-2" class="h-2.5 w-2.5"></i>
          Edit
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  lucide.createIcons();
}

function startEditOperator(opId) {
  const operator = globalOperators.find(o => o.id === opId);
  if (!operator) return;

  editingOperator = operator;
  
  // Hide empty state and show form
  document.getElementById("operator-edit-empty").classList.add("hidden");
  document.getElementById("operator-edit-form").classList.remove("hidden");

  // Populate inputs
  document.getElementById("edit-op-id").value = operator.id;
  document.getElementById("edit-op-fullname").value = operator.fullName;
  document.getElementById("edit-op-username").value = operator.username;
  
  setEditOperatorRole(operator.role);

  // Clear notify states
  document.getElementById("operator-error-banner").classList.add("hidden");
  document.getElementById("operator-success-banner").classList.add("hidden");
  
  playSynthesizerBeep(640, "sine", 0.05);
}

function setEditOperatorRole(role) {
  editOperatorRoleState = role;

  const cashierBtn = document.getElementById("role-btn-cashier");
  const adminBtn = document.getElementById("role-btn-admin");

  if (role === "cashier") {
    cashierBtn.className = "py-2 rounded-lg text-center font-bold text-[9px] font-mono tracking-wider uppercase border transition cursor-pointer bg-[#10B981]/15 border-[#10B981] text-[#10B981]";
    adminBtn.className = "py-2 rounded-lg text-center font-bold text-[9px] font-mono tracking-wider uppercase border transition cursor-pointer bg-black/20 border-white/10 text-zinc-400";
  } else {
    adminBtn.className = "py-2 rounded-lg text-center font-bold text-[9px] font-mono tracking-wider uppercase border transition cursor-pointer bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#8B5CF6]";
    cashierBtn.className = "py-2 rounded-lg text-center font-bold text-[9px] font-mono tracking-wider uppercase border transition cursor-pointer bg-black/20 border-white/10 text-zinc-400";
  }
}

function cancelOperatorEdit() {
  editingOperator = null;
  document.getElementById("operator-edit-empty").classList.remove("hidden");
  document.getElementById("operator-edit-form").classList.add("hidden");
}

async function handleOperatorUpdateSubmit(e) {
  e.preventDefault();
  if (!editingOperator) return;

  const id = document.getElementById("edit-op-id").value;
  const fullName = document.getElementById("edit-op-fullname").value.trim();
  const username = document.getElementById("edit-op-username").value.toLowerCase().trim();
  const role = editOperatorRoleState;

  const saveBtn = document.getElementById("operator-save-btn");
  saveBtn.disabled = true;
  saveBtn.innerHTML = `<div class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...`;

  try {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, fullName, role })
    });

    const data = await res.json();
    if (res.ok) {
      showOperatorSuccess(`User "${fullName}" profile updated successfully!`);
      
      // If the updated user is the currently logged in user, refresh their local credentials and main UI label
      if (ACTIVE_USER && ACTIVE_USER.id === id) {
        ACTIVE_USER.fullName = fullName;
        ACTIVE_USER.username = username;
        ACTIVE_USER.role = role;
        localStorage.setItem("user", JSON.stringify(ACTIVE_USER));
        updateAuthUIPresentation();
      }

      cancelOperatorEdit();
      await loadOperatorsList();
    } else {
      showOperatorError(data.error || "Failed to update user profile");
    }
  } catch (err) {
    showOperatorError("Failed to contact user updates server endpoint.");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i data-lucide="save" class="h-3.5 w-3.5"></i> Save Profile Configuration`;
    lucide.createIcons();
  }
}

// ============================================
// LAYER 8: BULK CSV INVENTORY REGISTER
// ============================================
function triggerCSVSelect() {
  if (ACTIVE_USER && ACTIVE_USER.role !== "admin" && ACTIVE_USER.role !== "manager") {
    const statusBox = document.getElementById("bulk-upload-status");
    statusBox.classList.remove("hidden");
    statusBox.className = "text-[10px] text-center p-3 bg-rose-950/25 border border-rose-500/20 text-rose-400 rounded-xl leading-normal font-sans space-y-1 block mt-2";
    statusBox.innerHTML = `⚠️ Access Denied: Admin or Manager authorization clearance required.`;
    playScanWarningSound();
    return;
  }
  document.getElementById("bulk-csv-file-input").click();
}

function handleBulkCSVSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  const statusBox = document.getElementById("bulk-upload-status");
  statusBox.classList.remove("hidden");
  statusBox.className = "text-[10px] text-zinc-400 font-mono text-center p-2 rounded-lg bg-zinc-900/40 border border-white/5 mt-2";
  statusBox.innerText = `🔄 Parsing "${file.name}"...`;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const text = e.target.result;
      const parsedItems = parseCSV(text);
      
      if (parsedItems.length === 0) {
        statusBox.className = "text-[10px] text-center p-3 bg-rose-950/25 border border-rose-500/20 text-rose-400 rounded-xl leading-normal font-sans space-y-1 block mt-2";
        statusBox.innerHTML = `⚠️ CSV file had no data or was formatted incorrectly. Check headers.`;
        playScanWarningSound();
        return;
      }

      statusBox.innerText = `🔄 Uploading ${parsedItems.length} products itemized records to registry...`;
      
      const response = await fetch("/api/products/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ACCESS_TOKEN}`
        },
        body: JSON.stringify({ items: parsedItems })
      });

      const data = await response.json();
      if (response.ok) {
        statusBox.className = "text-[10.5px] text-center p-3.5 bg-emerald-950/25 border border-emerald-500/20 text-[#10B981] rounded-xl leading-relaxed font-sans mt-2";
        statusBox.innerHTML = `
          <div class="font-bold flex items-center justify-center gap-1.5 uppercase tracking-wide mb-1 text-emerald-400">
            <i data-lucide="check-circle" class="h-4 w-4"></i> Batch Completed Successfully
          </div>
          Batch enrolled: <span class="font-bold font-mono text-white">${data.registered} registered</span>, 
          skipped or invalid: <span class="font-bold font-mono text-zinc-400">${data.skipped} skipped</span>.
        `;
        playScanSuccessSound();
        
        // Refresh Lists & simulation lists
        await loadCatalogList();
        await loadDefaultFastSimulatorList();
        
      } else {
        statusBox.className = "text-[10px] text-center p-3 bg-rose-950/25 border border-rose-500/20 text-rose-400 rounded-xl leading-normal font-sans space-y-1 block mt-2";
        statusBox.innerHTML = `⚠️ Bulk Registry Error: ${data.error || "Verification issue encountered."}`;
        playScanWarningSound();
      }

    } catch (err) {
      statusBox.className = "text-[10px] text-center p-3 bg-rose-950/25 border border-rose-500/20 text-rose-400 rounded-xl leading-normal font-sans space-y-1 block mt-2";
      statusBox.innerHTML = `⚠️ Failed to parse or upload CSV spreadsheet: ${err.message}`;
      playScanWarningSound();
    } finally {
      // Reset input value so same file can be chosen again
      event.target.value = "";
      lucide.createIcons();
    }
  };

  reader.readAsText(file);
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  // Clean headers (lowercase, stripped space & double quotes)
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const list = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse commas, keeping text blocks inside matching quotes safe
    const columns = [];
    let curToken = "";
    let withinQuotes = false;
    
    for (let x = 0; x < line.length; x++) {
      const char = line[x];
      if (char === '"' || char === "'") {
        withinQuotes = !withinQuotes;
      } else if (char === ',' && !withinQuotes) {
        columns.push(curToken.trim());
        curToken = "";
      } else {
        curToken += char;
      }
    }
    columns.push(curToken.trim());
    
    const obj = {};
    headers.forEach((hdr, idx) => {
      let val = columns[idx] || "";
      val = val.replace(/^["']|["']$/g, '').trim();
      
      // Match key header aliases to comply with API properties
      if (hdr === "barcode" || hdr === "barcode_value") {
        obj["barcode_value"] = val;
      } else if (hdr === "name" || hdr === "product_name") {
        obj["product_name"] = val;
      } else if (hdr === "price") {
        obj["price"] = parseFloat(val) || 0;
      } else if (hdr === "stock" || hdr === "stock_quantity") {
        obj["stock_quantity"] = parseInt(val, 10) || 0;
      } else if (hdr === "image" || hdr === "image_url") {
        obj["image_url"] = val;
      } else {
        obj[hdr] = val;
      }
    });

    // Fallbacks
    if (obj.barcode_value && obj.product_name) {
      list.push(obj);
    }
  }
  return list;
}

// ============================================
// LAYER 9: LIGHTBOX PREVIEW MODAL FUNCTIONS
// ============================================
function openLightboxModalByBarcode(barcode) {
  const matched = globalCatalog.find(p => p.barcode_value === barcode);
  if (!matched) return;
  
  const modal = document.getElementById("modal-lightbox");
  const img = document.getElementById("lightbox-image-img");
  const title = document.getElementById("lightbox-product-name");
  const bTag = document.getElementById("lightbox-barcode");
  
  if (modal && img) {
    img.src = matched.image_url;
    if (title) title.innerText = matched.product_name;
    if (bTag) bTag.innerText = `SKU: ${matched.barcode_value} • PRICE: $${matched.price.toFixed(2)} • STOCK: ${matched.stock_quantity} units`;
    modal.classList.remove("hidden");
    
    if (typeof playSynthesizerBeep === "function") {
      try {
        playSynthesizerBeep(750, "sine", 0.05);
      } catch (e) {}
    }
  }
}

function closeLightboxModal() {
  const modal = document.getElementById("modal-lightbox");
  if (modal) {
    modal.classList.add("hidden");
    if (typeof playSynthesizerBeep === "function") {
      try {
        playSynthesizerBeep(600, "sine", 0.05);
      } catch (e) {}
    }
  }
}

// Global escape key listener to dismiss lightboxes easily
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightboxModal();
  }
});

// Explicitly register all interactive handlers into the global window namespace
// to prevent scoping, module, or enclosure isolation issues in modern browsers.
window.changeCartItemQty = changeCartItemQty;
window.removeCartItemCompletely = removeCartItemCompletely;
window.clearPOSCart = clearPOSCart;
window.selectPaymentMethod = selectPaymentMethod;
window.switchActiveTab = switchActiveTab;
window.toggleOfflineSimMode = toggleOfflineSimMode;
window.toggleAudioSettingsMenu = toggleAudioSettingsMenu;
window.toggleMasterMute = toggleMasterMute;
window.updateAudioOption = updateAudioOption;
window.triggerSystemRestore = triggerSystemRestore;
window.handleLogout = handleLogout;
window.stopWebcamScanner = stopWebcamScanner;
window.startWebcamScanner = startWebcamScanner;
window.initiateSecurePayment = initiateSecurePayment;
window.closePaymentGateway = closePaymentGateway;
window.confirmSecureGatewayCharge = confirmSecureGatewayCharge;
window.showPrintedReceiptFromGate = showPrintedReceiptFromGate;
window.closeUnrecognizedWizard = closeUnrecognizedWizard;
window.closeScanProReport = closeScanProReport;
window.closeReceiptModal = closeReceiptModal;
window.closeLightboxModal = closeLightboxModal;
window.toggleCatalogSort = toggleCatalogSort;
window.triggerCSVSelect = triggerCSVSelect;
window.exportAnalyticsCSV = exportAnalyticsCSV;
window.cancelOperatorEdit = cancelOperatorEdit;
window.setEditOperatorRole = setEditOperatorRole;
window.handleCodeDispatchSubmit = handleCodeDispatchSubmit;
window.handleFastLogin = handleFastLogin;
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.handleBulkCSVSelected = handleBulkCSVSelected;
window.startCatalogItemInline = startCatalogItemInline;
window.cancelCatalogItemInline = cancelCatalogItemInline;
window.saveCatalogItemInline = saveCatalogItemInline;

// ============================================
// WEBCAM SCANNER HUD CONTROLS
// ============================================
function handleScannerZoomChange(val) {
  const valueDisplay = document.getElementById("scanner-zoom-value");
  if (valueDisplay) {
    valueDisplay.innerText = `${Number(val).toFixed(1)}x`;
  }
  
  if (html5QrcodeScanner && isWebcamScannerRunning) {
    try {
      const runningTrack = html5QrcodeScanner.getRunningTrack();
      if (runningTrack && typeof runningTrack.applyConstraints === "function") {
        runningTrack.applyConstraints({
          advanced: [{ zoom: parseFloat(val) }]
        }).catch(err => {
          console.warn("[WEBCAM ZOOM] Could not apply zoom constraint on active track:", err);
        });
      }
    } catch (e) {
      console.warn("[WEBCAM ZOOM] Error invoking track applyConstraints for zoom:", e);
    }
  }
}

function toggleScannerSound() {
  isScannerSoundMuted = !isScannerSoundMuted;
  localStorage.setItem("scanner_sound_mute", isScannerSoundMuted);
  updateScannerSoundToggleButtonUI();
  
  // Play a quick feedback beep (unless muted) to confirm toggle
  if (!isScannerSoundMuted && typeof playSynthesizerBeep === "function") {
    try {
      playSynthesizerBeep(880, "sine", 0.04);
    } catch (err) {}
  }
}

function updateScannerSoundToggleButtonUI() {
  const btn = document.getElementById("scanner-sound-toggle-btn");
  const iconWrapper = document.getElementById("scanner-sound-icon-wrapper");
  const textVal = document.getElementById("scanner-sound-status-text");
  
  if (!btn) return;
  
  if (isScannerSoundMuted) {
    btn.className = "pointer-events-auto bg-black/80 hover:bg-black border border-rose-500/35 px-2 py-1 rounded-lg text-[9px] text-rose-400 font-mono flex items-center gap-1 transition-all shadow-md cursor-pointer header-hud-btn";
    if (iconWrapper) {
      iconWrapper.innerHTML = `<i data-lucide="volume-x" class="w-3.5 h-3.5"></i>`;
    }
    if (textVal) {
      textVal.innerText = "Muted";
    }
  } else {
    btn.className = "pointer-events-auto bg-black/80 hover:bg-black border border-[#10B981]/35 px-2 py-1 rounded-lg text-[9px] text-[#10B981] font-mono flex items-center gap-1 transition-all shadow-md cursor-pointer header-hud-btn";
    if (iconWrapper) {
      iconWrapper.innerHTML = `<i data-lucide="volume-2" class="w-3.5 h-3.5"></i>`;
    }
    if (textVal) {
      textVal.innerText = "Audio On";
    }
  }
  
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch (e) {}
  }
}

window.handleScannerZoomChange = handleScannerZoomChange;
window.toggleScannerSound = toggleScannerSound;
window.updateScannerSoundToggleButtonUI = updateScannerSoundToggleButtonUI;

function toggleWideScanMode() {
  isWideScanMode = !isWideScanMode;
  localStorage.setItem("scanner_wide_mode", isWideScanMode);
  updateWideScanModeUI();
  
  // Audio feedback beep on toggle
  if (!isScannerSoundMuted && typeof playSynthesizerBeep === "function") {
    try {
      playSynthesizerBeep(700, "sine", 0.05);
    } catch (e) {}
  }
  
  // Since the configuration change (qrbox parameter) requires a camera restart to take effect:
  if (isWebcamScannerRunning && html5QrcodeScanner) {
    console.log("[WEBCAM HUD] Restarting camera to apply wide scan mode...");
    stopWebcamScanner().then(() => {
      startWebcamScanner();
    }).catch(err => {
      console.warn("[WEBCAM HUD] Error recycling scanner for wide mode:", err);
    });
  }
}

function updateWideScanModeUI() {
  const btn = document.getElementById("scanner-wide-toggle-btn");
  const iconWrapper = document.getElementById("scanner-wide-icon-wrapper");
  const textVal = document.getElementById("scanner-wide-status-text");
  
  if (!btn) return;
  
  if (isWideScanMode) {
    btn.className = "pointer-events-auto bg-black/80 hover:bg-black border border-[#10B981]/35 px-2 py-1 rounded-lg text-[9px] text-[#10B981] font-mono flex items-center gap-1 transition-all shadow-md cursor-pointer header-hud-btn";
    if (iconWrapper) {
      iconWrapper.innerHTML = `<i data-lucide="scan" class="w-3.5 h-3.5 text-[#10B981]"></i>`;
    }
    if (textVal) {
      textVal.innerText = "Ultra-Scan";
    }
  } else {
    btn.className = "pointer-events-auto bg-black/80 hover:bg-black border border-zinc-500/35 px-2 py-1 rounded-lg text-[9px] text-zinc-350 font-mono flex items-center gap-1 transition-all shadow-md cursor-pointer header-hud-btn";
    if (iconWrapper) {
      iconWrapper.innerHTML = `<i data-lucide="maximize" class="w-3.5 h-3.5 text-zinc-400"></i>`;
    }
    if (textVal) {
      textVal.innerText = "Focus Area";
    }
  }
  
  // Update border style of our viewfinder overlay
  const viewfinderGuide = document.querySelector("#camera-active-scanner-box .w-\\[85\\%\\]");
  if (viewfinderGuide) {
    if (isWideScanMode) {
      viewfinderGuide.style.borderColor = "rgba(16, 185, 129, 0.25)";
      viewfinderGuide.style.borderStyle = "dashed";
    } else {
      viewfinderGuide.style.borderColor = "rgba(16, 185, 129, 0.5)";
      viewfinderGuide.style.borderStyle = "solid";
    }
  }
  
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    try {
      window.lucide.createIcons();
    } catch (e) {}
  }
}

window.toggleWideScanMode = toggleWideScanMode;
window.updateWideScanModeUI = updateWideScanModeUI;


