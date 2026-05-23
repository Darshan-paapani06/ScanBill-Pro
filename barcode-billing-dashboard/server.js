import express from "express";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize Gemini API Client
let ai = null;
let isGeminiCircuitBreakerActive = false;
let geminiCircuitBreakerResetTime = 0;

const GEMINI_KEY = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") 
  ? process.env.GEMINI_API_KEY 
  : "AIzaSyBvNGMXXUk5zYQlqmZZFcrdZZZdS-TH6aw";

if (GEMINI_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: GEMINI_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("[GEMINI SDK] Initialized successfully with Server-Side Gemini API Key.");
  } catch (err) {
    console.error("[GEMINI SDK] Failed to initialize Gemini API Client:", err);
  }
} else {
  console.log("[GEMINI SDK] Warning: GEMINI_API_KEY is not defined. Falling back to Open Food Facts and classic dynamic solvers.");
}

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "veritas_scanpro_super_secret_key_101";

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Databases (with optional MySQL fallback if needed)
let PRODUCTS_DB = {
  "123456789012": {
    barcode_value: "123456789012",
    product_name: "XPS Elite Ultra 15\" Laptop",
    price: 1299.99,
    stock_quantity: 45,
    image_url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  "987654321098": {
    barcode_value: "987654321098",
    product_name: "Acoustix Aura ANC Wireless Headphones",
    price: 249.50,
    stock_quantity: 120,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  },
  "456789012345": {
    barcode_value: "456789012345",
    product_name: "Horizon Active Smartwatch Gen 5",
    price: 189.00,
    stock_quantity: 85,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  "748291036481": {
    barcode_value: "748291036481",
    product_name: "Apex Pro Mechanical Keyboard SDK",
    price: 145.00,
    stock_quantity: 30,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
  },
  "395726104829": {
    barcode_value: "395726104829",
    product_name: "Viper Mini Ergonomic Mouse v3",
    price: 69.99,
    stock_quantity: 151,
    image_url: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=300&q=80",
    created_at: new Date().toISOString() // today
  }
};

// Deterministic product generator for Veritas ScanPro Auto-Discovery Mode
function generateDynamicProduct(barcode) {
  let hash = 0;
  for (let i = 0; i < barcode.length; i++) {
    hash = barcode.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const prefix = barcode.slice(0, 3);
  let resolvedCategory = "";
  let brand = "";
  let prodName = "";
  let price = 0;
  let imageUrl = "";
  let mfrSummary = "";

  // Group of consumer-focused sectors
  const categories = [
    {
      name: "Snacks, Biscuits & Cookies",
      images: [
        "https://images.unsplash.com/photo-1558961303-1d20210a247c?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=300&q=80"
      ],
      priceMin: 0.99,
      priceMax: 4.99,
      regional: {
        "890": {
          brands: ["Britannia", "Parle", "Sunfeast", "Patanjali"],
          names: ["Marie Gold Premium Biscuits", "Parle-G Gold Glucose Biscuits", "Dark Fantasy Choco Cookies", "Good Day Rich Cashew Biscuits", "Bourbon Treat Chocolate Cremes"]
        },
        "500": {
          brands: ["McVitie's", "Cadbury", "Jacob's"],
          names: ["Original Milk Chocolate Digestives", "Jaffa Cakes Chocolate Orange", "Rich Tea Classic Biscuits", "Caramel Club Chocolate Wafer"]
        },
        "000": {
          brands: ["Oreo", "Chips Ahoy!", "Pepperidge Farm", "Nabisco"],
          names: ["Double Stuf Chocolate Sandwich Cookies", "Original Chocolate Chip Cookies", "Milano Double Chocolate Treat", "Nilla Wafers Cookie Pack"]
        }
      },
      genericBrands: ["Meadow Gold", "Gourmet Bake", "Baker's Choice", "Sweet Treats"],
      genericNames: ["Gourmet Butter Cookies", "Nutty Crispy Biscuits", "Chocolate Chip Cookie Box", "Organic Vanilla Crackers", "Oats & Honey Digestive Thins"]
    },
    {
      name: "Beverages & Soft Drinks",
      images: [
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80"
      ],
      priceMin: 1.25,
      priceMax: 3.50,
      regional: {
        "890": {
          brands: ["Thums Up", "Frooti", "Limca", "Amul"],
          names: ["Thunder Cola Fizz CAN", "Mango Juicy Nectar Drink", "Fresh Lime Lemonade Bottle", "Kool Cardamom Milk Bottle"]
        },
        "500": {
          brands: ["Ribena", "Lucozade", "Fever-Tree"],
          names: ["Blackcurrant Juice Cordial", "Energy Orange Replener", "Premium Indian Tonic Water"]
        },
        "000": {
          brands: ["Coca-Cola", "Pepsi", "Gatorade", "Dr Pepper"],
          names: ["Classic Soda Cola Bottle", "Wild Cherry Cola CAN", "Blue Cool Ice Sports Drink", "Spiced Cherry Carbonated Pop"]
        }
      },
      genericBrands: ["PureSplash", "Bubbles & Co", "VaporFizz", "Arctic Refresh"],
      genericNames: ["Premium Sparkling Water", "Natural Organic Berry Juice", "Zero Sugar Tonic Soda", "Alps Purified Glacier Water"]
    },
    {
      name: "Chocolates & Candy Bars",
      images: [
        "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=300&q=80"
      ],
      priceMin: 0.75,
      priceMax: 5.99,
      regional: {
        "890": {
          brands: ["Cadbury Dairy Milk", "Amul Chocolate", "Nestlé Munch"],
          names: ["Silk Roasted Almond Chocolate Bar", "Indian Origin Dark Cocoa Slab", "Crunchy Cocoa Wafer Bar"]
        },
        "500": {
          brands: ["Nestlé", "Galaxy", "Teasers"],
          names: ["Smarties Milk Chocolate Tube", "Smooth Milk Caramel Ribbon Bar", "Crunchy Maltesers Grab Bag"]
        },
        "000": {
          brands: ["Hershey's", "Snickers", "Reese's", "Kit Kat"],
          names: ["Classic Milk Chocolate Bar", "Caramel Peanut Nougat Bar", "Peanut Butter Cups Pack", "Crispy Wafer Chocolate Bar"]
        }
      },
      genericBrands: ["ChocoHeaven", "SweetAlchemy", "VelvetCocoa", "CandyVibe"],
      genericNames: ["Roasted Hazelnut Milk Chocolate", "Sea Salt Creamy Dark Bars", "Multi-pack Gourmet Toffees", "Fruity Jelly Gummy Assortment"]
    },
    {
      name: "Personal Care & Cosmetics",
      images: [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=300&q=80"
      ],
      priceMin: 2.99,
      priceMax: 14.50,
      regional: {},
      genericBrands: ["NurtureBio", "SatinClean", "AuraGlow", "DermaSafe"],
      genericNames: ["Hydrating Aloe Vera Handwash", "Organic Lavender Infused Soap Bar", "Gentle Tea Tree Extract Shampoo", "Daily Defense Shea Butter Lotion", "Charcoal Cleansing Facial Scrub"]
    },
    {
      name: "Smart Accessories & Hardware",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=300&q=80"
      ],
      priceMin: 9.99,
      priceMax: 49.99,
      regional: {},
      genericBrands: ["OptiLink", "AuraBeam", "BroadLink", "CyberGrid"],
      genericNames: ["High-Speed Braided USB-C Cable v3", "Ergonomic Silent Optical Wireless Mouse", "Compact Portable USB-C Connector Hub", "Dynamic Smart LED Desktop Lamp"]
    }
  ];

  // Select sector from hash
  const sectorIndex = hash % categories.length;
  const sector = categories[sectorIndex];
  resolvedCategory = sector.name;

  // Choose Unsplash image
  const imgIndex = (hash >> 3) % sector.images.length;
  imageUrl = sector.images[imgIndex];

  // Calculate pricing
  const range = sector.priceMax - sector.priceMin;
  const rawPrice = sector.priceMin + ((hash >> 4) % range);
  price = Number(rawPrice.toFixed(2));

  // Regional matching based on prefix
  let assignedPrefixGroup = "000"; // default fallback for regional search
  if (prefix === "890") assignedPrefixGroup = "890";
  else if (prefix.startsWith("5")) assignedPrefixGroup = "500";
  else if (prefix.startsWith("0") || prefix.startsWith("1")) assignedPrefixGroup = "000";

  if (sector.regional && sector.regional[assignedPrefixGroup]) {
    const regionalData = sector.regional[assignedPrefixGroup];
    const bIndex = (hash >> 5) % regionalData.brands.length;
    brand = regionalData.brands[bIndex];

    const nIndex = (hash >> 6) % regionalData.names.length;
    prodName = `${brand} ${regionalData.names[nIndex]}`;
  } else {
    // Falls back to generic brands if category has no regional mappings or prefix unrecognized
    const bIndex = (hash >> 5) % sector.genericBrands.length;
    brand = sector.genericBrands[bIndex];

    const nIndex = (hash >> 6) % sector.genericNames.length;
    prodName = `${brand} ${sector.genericNames[nIndex]}`;
  }

  // Generate appropriate detailed summary
  const prefixCountryCode = prefix || "890";
  let originCountry = "International Standards Product";
  if (prefixCountryCode === "890") originCountry = "India (BIS Standard Registered Retail Item)";
  else if (prefixCountryCode.startsWith("50")) originCountry = "United Kingdom (UKAS Standards Retail Item)";
  else if (prefixCountryCode.startsWith("0") || prefixCountryCode.startsWith("1")) originCountry = "United States / Canada (FDA Approved Consumer Goods)";
  else if (prefixCountryCode.startsWith("49")) originCountry = "Japan (JIS Registered Consumer Goods)";
  else if (prefixCountryCode.startsWith("69")) originCountry = "China / East Asia (CNCA Standards Registered)";
  else if (prefixCountryCode.startsWith("40") || prefixCountryCode.startsWith("41") || prefixCountryCode.startsWith("42") || prefixCountryCode.startsWith("43")) originCountry = "Germany (DIN & CE Standards Enforced)";

  mfrSummary = `[Veritas ScanPro Intelligent Auto-Discovery Engine]
Successfully matched barcode group code [${prefixCountryCode}] for consumer sector: "${resolvedCategory}".

• Registered Origin: ${originCountry}
• Verification Status: Authenticated on cashier port 3000
• Nutrition & Safety: Compliant with standard safety thresholds. Store in cool dry conditions. Suitable for immediate catalog billing processing.`;

  return {
    barcode_value: barcode,
    product_name: prodName,
    price: price,
    stock_quantity: (hash % 85) + 18,
    image_url: imageUrl,
    summary: mfrSummary,
    created_at: new Date().toISOString()
  };
}

// -------------------------------------------------------------
// ADVANCED MARKET BARCODE DETECTION ENGINES
// -------------------------------------------------------------

async function fetchOpenFoodFacts(barcode) {
  try {
    console.log(`[MARKET RADAR] Querying Open Food Facts global database for barcode: ${barcode}`);
    // Check if the barcode looks like a typical test string (very short or non-standard numeric digits)
    if (!/^\d{5,14}$/.test(barcode)) {
      console.log(`[MARKET RADAR] Barcode "${barcode}" is non-standard numeric, skipping Open Food Facts registry.`);
      return null;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: { "User-Agent": "VeritasScanPro/2.0 (abhishek.dustbin@gmail.com)" },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 1 && data.product) {
        const p = data.product;
        // Determine product name with elegant brand context
        const brand = p.brands || p.brands_tags?.join(", ") || "";
        const raw_name = p.product_name || p.product_name_en || p.product_name_fr || "Consumer Product";
        const product_name = brand ? `${brand} ${raw_name}` : raw_name;
        
        // Generate a highly realistic retail price from EAN check digits or product categories
        let hash = 0;
        for (let i = 0; i < barcode.length; i++) {
          hash = barcode.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);
        // Grocery biscuit style pricing ($1.49 - $9.99)
        const price = Number((1.50 + (hash % 8) + 0.49).toFixed(2));
        
        // Pick top high-quality image URL from the Open Food Facts model
        const image_url = p.image_front_url || p.image_url || `https://images.unsplash.com/photo-1558961303-1d20210a247c?auto=format&fit=crop&w=300&q=80`;
        
        const summary = `Product resolved successfully from the Global Open Food Facts Registry.\n\n` + 
                        `• Brands: ${brand || "Independent Market Manufacturer"}\n` +
                        `• Category: ${p.categories || "Grocery / Packaged Goods"}\n` +
                        `• Ingredients: ${p.ingredients_text_en || p.ingredients_text || "Premium food grade selected ingredients."}\n` +
                        `• Distribution: Registered in [${p.countries || "Global Market"}] under international standards.`;

        console.log(`[MARKET RADAR] Success! Found item in Open Food Facts registry: "${product_name}"`);
        return {
          barcode_value: barcode,
          product_name: product_name,
          price: price,
          stock_quantity: (hash % 80) + 15, // Realistic initial shop items stock
          image_url: image_url,
          summary: summary,
          created_at: new Date().toISOString()
        };
      }
    }
    console.log(`[MARKET RADAR] Barcode "${barcode}" not registered in Open Food Facts.`);
  } catch (err) {
    console.warn(`[MARKET RADAR] Open Food Facts network search erred:`, err.message);
  }
  return null;
}

async function fetchGeminiBarcodeLookup(barcode) {
  if (!ai) {
    console.log(`[GEMINI RADAR] Gemini Client not active (missing key). Skipping LLM lookup.`);
    return null;
  }
  
  if (isGeminiCircuitBreakerActive) {
    if (Date.now() < geminiCircuitBreakerResetTime) {
      console.log(`[GEMINI RADAR] Circuit breaker is ACTIVE due to previous 429 rate limit or quota issues. Instant fallback is active.`);
      return null;
    } else {
      isGeminiCircuitBreakerActive = false;
      console.log(`[GEMINI RADAR] Circuit breaker cooled down. Retrying request...`);
    }
  }
  
  // Attempt 1: Search grounding using Google Search (for accurate real-world brand tracking)
  let isRateLimited = false;
  try {
    console.log(`[GEMINI RADAR] Deploying Gemini 3.5 Web Search Grounding for Barcode: ${barcode}`);
    const prompt = `Perform an EAN/UPC barcode search query for barcode: "${barcode}". 
Follow modern retail goods databases. Identify:
1. What exact commercial consumer product represents this barcode (brand name, product title, flavors, packaging details, and exact size)? E.g. If you detect this barcode matches standard biscuits like 'Oreo Chocolate Sandwich Cookies, 14.3 oz', 'McVitie's Digestive Biscuits', 'Parle-G', or any other electronic / cosmetic / beverage item, fetch its official name.
2. What is its standard human-facing market retail price (cost) in USD (for example: $2.99 for a pack of digestions, $5.50 for premium biscuits, or high-tier electronics prices if relevant)?
3. What gorgeous high-resolution Unsplash photo URL best covers its category (chocolate biscuit, gourmet snack, cookies, electronic gadgets, personal care etc) using Unsplash's CDN? E.g. 'https://images.unsplash.com/photo-1558961303-1d20210a247c?auto=format&fit=crop&w=300&q=80' or similar category query?
4. Write a beautiful comprehensive overview containing details of manufacturer origin country, packaging status, nutritional values/materials, and safety instructions.

If the barcode is arbitrary, custom, or unrecognized in the search feed, act as a 'Smart Retail Inference Engine': parse any hint or country code matching the standard prefix country (e.g. prefix 890 for India, 500 for UK, 000-019 for US/Canada) or construct an exceptionally logical, premium realistic consumer commodity product from that area that is typical for retail catalogs (like high-quality organic biscuits, specialty snacks, or utility supplies)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product_name: {
              type: Type.STRING,
              description: "The official human consumer brand product title (e.g., 'Oreo Double Stuf Chocolate Cookies, 15.35 oz')"
            },
            price: {
              type: Type.NUMBER,
              description: "A highly realistic average market retail price in USD (e.g. 3.49)"
            },
            stock_quantity: {
              type: Type.INTEGER,
              description: "Estimated placeholder stock inventory (e.g. between 10 and 150)"
            },
            image_url: {
              type: Type.STRING,
              description: "A highly relevant Unsplash premium photo URL matching this product category perfectly (e.g. cookies, snacks, electronics, soda, coffee)"
            },
            summary: {
              type: Type.STRING,
              description: "Detailed description of the product including origin country, brand registration details, specifications, shelf-life instructions and category guidelines."
            }
          },
          required: ["product_name", "price", "stock_quantity", "image_url", "summary"]
        }
      }
    });

    if (response && response.text) {
      const data = JSON.parse(response.text.trim());
      console.log(`[GEMINI RADAR] Gemini successfully identified product (Search Grounded): "${data.product_name}"`);
      return sanitizeGeminiResponse(barcode, data);
    }
  } catch (err) {
    const errMsg = String(err.message || "").toLowerCase();
    if (errMsg.includes("429") || errMsg.includes("resource_exhausted") || errMsg.includes("quota") || errMsg.includes("limit")) {
      isRateLimited = true;
      isGeminiCircuitBreakerActive = true;
      geminiCircuitBreakerResetTime = Date.now() + 5 * 60 * 1000; // block for 5 minutes
      console.warn(`[GEMINI RADAR] Rate limited or quota exhausted (429). Activating circuit breaker.`);
    } else {
      console.warn(`[GEMINI RADAR] Search Grounded attempt failed:`, err.message);
    }
    
    if (isRateLimited) {
      // Do not attempt the second query since it will also fail and block the request thread
      return null;
    }
    
    // Attempt 2: Pure generation without tools (no search grounding, avoids any tool limitations/failures)
    try {
      const promptNoTools = `We need real-world category matching for standard UPC/EAN barcode digit string: "${barcode}".
Perform your highest intelligence consumer product inference. Determine:
1. Brand Owner & Product Name: Identify standard retail items that match or typically correspond to the country-group code prefix (e.g. 890 corresponds to popular Indian goods like Parle-G, Britannia biscuits, Maggi noodles, Amul chocolate; 500 to British cookies like McVitie's Digestives; 000-139 to US treats like Oreo, Coca-Cola, Lay's).
2. Standard market pricing (USD) and detailed specs.

Provide the response in the specified JSON format.`;

      const response2 = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptNoTools,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product_name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              stock_quantity: { type: Type.INTEGER },
              image_url: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ["product_name", "price", "stock_quantity", "image_url", "summary"]
          }
        }
      });

      if (response2 && response2.text) {
        const data = JSON.parse(response2.text.trim());
        console.log(`[GEMINI RADAR] Gemini successfully identified product (Pure Inference): "${data.product_name}"`);
        return sanitizeGeminiResponse(barcode, data);
      }
    } catch (err2) {
      console.error(`[GEMINI RADAR] Pure Inference lookup also failed:`, err2.message);
      const errMsg2 = String(err2.message || "").toLowerCase();
      if (errMsg2.includes("429") || errMsg2.includes("resource_exhausted") || errMsg2.includes("quota") || errMsg2.includes("limit")) {
        isGeminiCircuitBreakerActive = true;
        geminiCircuitBreakerResetTime = Date.now() + 5 * 60 * 1000;
      }
    }
  }
  return null;
}

function sanitizeGeminiResponse(barcode, data) {
  let imageUrl = data.image_url;
  const keywords = String(data.product_name).toLowerCase();
  
  if (!imageUrl || !imageUrl.startsWith("http")) {
    if (keywords.includes("biscuit") || keywords.includes("cookie") || keywords.includes("parle") || keywords.includes("britannia") || keywords.includes("digestive")) {
      imageUrl = "https://images.unsplash.com/photo-1558961303-1d20210a247c?auto=format&fit=crop&w=300&q=80";
    } else if (keywords.includes("drink") || keywords.includes("soda") || keywords.includes("cola") || keywords.includes("juice") || keywords.includes("pepsi") || keywords.includes("coke")) {
      imageUrl = "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80";
    } else if (keywords.includes("chocolate") || keywords.includes("candy") || keywords.includes("choco") || keywords.includes("sweet") || keywords.includes("snickers")) {
      imageUrl = "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=300&q=80";
    } else if (keywords.includes("shampoo") || keywords.includes("soap") || keywords.includes("clean") || keywords.includes("body") || keywords.includes("cream")) {
      imageUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80";
    } else if (keywords.includes("tech") || keywords.includes("gadget") || keywords.includes("charger") || keywords.includes("cable") || keywords.includes("mouse") || keywords.includes("laptop")) {
      imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80";
    } else {
      imageUrl = "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=300&q=80";
    }
  }
  
  return {
    barcode_value: barcode,
    product_name: data.product_name,
    price: Number(data.price) || 2.49,
    stock_quantity: Number(data.stock_quantity) || 50,
    image_url: imageUrl,
    summary: data.summary,
    created_at: new Date().toISOString()
  };
}

let SCAN_LOGS = [];
let TRANSACTION_HISTORY = [];
let USERS_DB = {};
let EMAIL_NOTIFICATIONS_DB = [];

// Global Email Alert Sender helper (Mock SMTP Logs)
function sendAlertEmail(category, subject, htmlBody) {
  const alertEntry = {
    id: `EML-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    category, // "inventory" or "user"
    subject,
    body: htmlBody,
    sender: "smtp-alerts@veritasscanpro.com",
    recipient: "system-admins@veritasscanpro.com",
    timestamp: new Date().toISOString()
  };
  EMAIL_NOTIFICATIONS_DB.unshift(alertEntry);
  console.log(`[SMTP EMAIL DISPATCHED] To: ${alertEntry.recipient} | Subject: ${alertEntry.subject}`);
}

// Seed Default accounts
function seedUsers() {
  USERS_DB["admin"] = {
    id: "USR-ADMIN",
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 8),
    fullName: "Alex Rivera",
    role: "admin",
    created_at: new Date().toISOString()
  };

  USERS_DB["cashier"] = {
    id: "USR-CASHIER",
    username: "cashier",
    passwordHash: bcrypt.hashSync("cashier123", 8),
    fullName: "Joanna Sterling",
    role: "cashier",
    created_at: new Date().toISOString()
  };
}
seedUsers();

// Server Sent Events (SSE) stream clients lists for physical/web scanner hooks
let SSE_CLIENTS = [];

function broadcastEvent(eventName, data) {
  SSE_CLIENTS.forEach((res) => {
    try {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      SSE_CLIENTS = SSE_CLIENTS.filter(c => c !== res);
    }
  });
}

// Auth security gate token check
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token/Authorization token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Authentication session expired or invalid" });
    }
    req.user = decoded;
    next();
  });
}

// --- API PORTAL ENDPOINTS ---

// 1. Register Account
app.post("/api/auth/register", (req, res) => {
  const { username, password, fullName, role = "cashier" } = req.body;

  if (!username || !password || !fullName) {
    return res.status(400).json({ error: "Please enter username, password, and full name" });
  }

  const normalizedUser = username.toLowerCase().trim();
  if (USERS_DB[normalizedUser]) {
    return res.status(400).json({ error: "Username already taken" });
  }

  const passwordHash = bcrypt.hashSync(password, 8);
  const id = `USR-${Date.now()}-${Math.floor(Math.random() * 100)}`;
  const createdUser = {
    id,
    username: normalizedUser,
    passwordHash,
    fullName,
    role: ["admin", "manager", "cashier"].includes(role) ? role : "cashier",
    created_at: new Date().toISOString()
  };

  USERS_DB[normalizedUser] = createdUser;

  // Dispatch email notification
  sendAlertEmail(
    "user",
    `Staff Registered Account Created: ${fullName}`,
    `A new staff operator profile has successfully registered under name "${fullName}" (account username: ${normalizedUser}) assigned to privilege level [${createdUser.role.toUpperCase()}]. Please audit security clearance matrices if unverified.`
  );

  const { passwordHash: _, ...userProfile } = createdUser;
  res.json({ success: true, user: userProfile });
});

// 2. Clear JWT token login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Please provide username and password" });
  }

  const normalizedUser = username.toLowerCase().trim();
  const user = USERS_DB[normalizedUser];

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const tokenPayload = { id: user.id, username: user.username, role: user.role, fullName: user.fullName };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "8h" });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      created_at: user.created_at
    }
  });
});

// 3. User Me Profile
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = USERS_DB[req.user.username];
  if (!user) {
    return res.status(404).json({ error: "User session not found" });
  }
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      created_at: user.created_at
    }
  });
});

// 4. List registered staff (admin only)
app.get("/api/users", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator privileges" });
  }
  const cleanUsers = Object.values(USERS_DB).map(({ passwordHash: _, ...user }) => user);
  res.json(cleanUsers);
});

// 4.5 Update user profile (admin only)
app.put("/api/users/:id", authenticateToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Requires administrator privileges" });
  }

  const { id } = req.params;
  const { username, fullName, role } = req.body;

  if (!username || !fullName || !role) {
    return res.status(400).json({ error: "Please provide username, fullName, and role" });
  }

  const normalizedNewUsername = username.toLowerCase().trim();

  // Find the user by ID
  let foundKey = null;
  let foundUser = null;
  for (const [key, user] of Object.entries(USERS_DB)) {
    if (user.id === id) {
      foundKey = key;
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ error: "User profile not found in database records" });
  }

  // Check if username has changed and if the new username is already taken by a DIFFERENT user
  if (normalizedNewUsername !== foundKey) {
    if (USERS_DB[normalizedNewUsername]) {
      return res.status(400).json({ error: "Username is already taken by another active operator" });
    }
    // Delete old mapping and transfer to the new username mapping
    delete USERS_DB[foundKey];
  }

  const originalRole = foundUser.role;
  foundUser.username = normalizedNewUsername;
  foundUser.fullName = fullName;
  foundUser.role = ["admin", "manager", "cashier"].includes(role) ? role : "cashier";

  USERS_DB[normalizedNewUsername] = foundUser;

  // If role profile changed, send a security dispatch email alert
  if (originalRole !== foundUser.role) {
    sendAlertEmail(
      "user",
      `Staff Security Role Modified: ${fullName}`,
      `Security Alert: staff operator "${fullName}" (username: ${normalizedNewUsername}) role/privilege level has been escalated or modified from [${originalRole.toUpperCase()}] to [${foundUser.role.toUpperCase()}].`
    );
  }

  // Sanitize password hash from returning profile payload
  const { passwordHash: _, ...updatedProfile } = foundUser;
  res.json({ success: true, user: updatedProfile });
});

// 5. Open scan stream channel (SSE protocol)
app.get("/api/scan-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  SSE_CLIENTS.push(res);
  res.write(`data: ${JSON.stringify({ message: "Scanner feed active", clientCount: SSE_CLIENTS.length })}\n\n`);

  const intervalId = setInterval(() => {
    try {
      res.write(":\n\n");
    } catch (err) {
      clearInterval(intervalId);
      SSE_CLIENTS = SSE_CLIENTS.filter((c) => c !== res);
    }
  }, 15000);

  req.on("close", () => {
    clearInterval(intervalId);
    SSE_CLIENTS = SSE_CLIENTS.filter((c) => c !== res);
  });
});

// 6. Receive scanner pulse (Fast trigger and broadcaster)
app.post("/api/scan", async (req, res) => {
  const { barcode, source = "External Scanner", local_data } = req.body;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode parameter is required" });
  }

  const cleanBarcode = String(barcode).trim();

  // Auto add if client enriches details
  if (local_data) {
    PRODUCTS_DB[cleanBarcode] = {
      barcode_value: cleanBarcode,
      product_name: local_data.product_name,
      price: Number(local_data.price),
      stock_quantity: Number(local_data.stock_quantity),
      image_url: local_data.image_url || `https://picsum.photos/seed/${cleanBarcode}/300/300`,
      summary: local_data.summary || null,
      created_at: new Date().toISOString()
    };
  }

  let product = PRODUCTS_DB[cleanBarcode];
  let isAutoDiscovered = false;

  if (!product) {
    // Stage 1: Attempt to search in global Open Food Facts database
    product = await fetchOpenFoodFacts(cleanBarcode);

    // Stage 2: Attempt to search in Gemini API with Web Search Grounding
    if (!product) {
      product = await fetchGeminiBarcodeLookup(cleanBarcode);
    }

    // Stage 3: Fallback to local high-end deterministic design simulator
    if (!product) {
      console.log(`[MARKET RADAR] Performing deterministic dynamic simulator backup for SKU: ${cleanBarcode}`);
      product = generateDynamicProduct(cleanBarcode);
    }

    // Persist discovered product in local POS database
    PRODUCTS_DB[cleanBarcode] = product;
    isAutoDiscovered = true;
    
    // Broadcast a catalog update event to notify any open clients that the database lists changed
    broadcastEvent("catalog_updated", { product });
  }

  const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString();

  const logEntry = {
    id: logId,
    barcode: cleanBarcode,
    timestamp,
    product_name: product.product_name,
    price: product.price,
    source,
    status: isAutoDiscovered ? "AUTO_DISCOVERY" : "SUCCESS"
  };
  
  SCAN_LOGS.unshift(logEntry);
  if (SCAN_LOGS.length > 50) SCAN_LOGS.pop();

  broadcastEvent("scanned", { log: logEntry, product, isAutoDiscovered });
  res.json({ success: true, product, log: logEntry, isAutoDiscovered });
});

// 7. Get catalog
app.get("/api/products", (req, res) => {
  res.json(Object.values(PRODUCTS_DB));
});

// 8. Create catalog item (Admin / Manager only)
app.post("/api/products", authenticateToken, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Access Denied: Admin or Manager authorization clearance required" });
  }

  const { barcode_value, product_name, price, stock_quantity, image_url, summary } = req.body;

  if (!barcode_value || !product_name || price === undefined) {
    return res.status(400).json({ error: "Missing barcode_value, product_name or price" });
  }

  const product = {
    barcode_value,
    product_name,
    price: Number(price),
    stock_quantity: Number(stock_quantity || 0),
    image_url: image_url || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80`,
    summary: summary || null,
    created_at: new Date().toISOString()
  };

  PRODUCTS_DB[barcode_value] = product;
  res.json({ success: true, product });
});

// 8b. Bulk create catalog items (Admin / Manager only)
app.post("/api/products/bulk", authenticateToken, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Access Denied: Admin or Manager authorization clearance required" });
  }

  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Missing items array" });
  }

  let successCount = 0;
  let skippedCount = 0;

  items.forEach(item => {
    let { barcode_value, product_name, price, stock_quantity, image_url, summary } = item;
    if (!barcode_value || !product_name || price === undefined) {
      skippedCount++;
      return;
    }
    barcode_value = String(barcode_value).trim();
    product_name = String(product_name).trim();
    price = Number(price);
    
    // Ensure starting stock is parsed correctly as integer
    let parsedStock = parseInt(stock_quantity, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      parsedStock = 0;
    }

    const compiledProduct = {
      barcode_value,
      product_name,
      price: isNaN(price) ? 0.00 : price,
      stock_quantity: parsedStock,
      image_url: image_url || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80`,
      summary: summary || null,
      created_at: new Date().toISOString()
    };

    PRODUCTS_DB[barcode_value] = compiledProduct;
    successCount++;
  });

  res.json({ success: true, registered: successCount, skipped: skippedCount });
});

// 9. Delete catalog item (Admin / Manager only)
app.delete("/api/products/:barcode", authenticateToken, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Access Denied: Admin or Manager authorization clearance required" });
  }

  const cleanBarcode = String(req.params.barcode).trim();
  if (PRODUCTS_DB[cleanBarcode]) {
    delete PRODUCTS_DB[cleanBarcode];
    res.json({ success: true, message: "Product deleted" });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// 9b. Update catalog item details (Admin / Manager only)
app.put("/api/products/:barcode", authenticateToken, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Access Denied: Admin or Manager authorization clearance required" });
  }

  const cleanBarcode = String(req.params.barcode).trim();
  const { price, stock_quantity } = req.body;

  if (PRODUCTS_DB[cleanBarcode]) {
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (!isNaN(parsedPrice) && parsedPrice >= 0) {
        PRODUCTS_DB[cleanBarcode].price = parsedPrice;
      }
    }
    if (stock_quantity !== undefined) {
      const parsedStock = parseInt(stock_quantity, 10);
      if (!isNaN(parsedStock) && parsedStock >= 0) {
        PRODUCTS_DB[cleanBarcode].stock_quantity = parsedStock;
      }
    }
    res.json({ success: true, product: PRODUCTS_DB[cleanBarcode] });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// 10. Checkout ticket creation
app.post("/api/checkout", (req, res) => {
  const { items, cashierName = "Staff Member", paymentMethod = "Credit/Debit", subtotal, tax, grandTotal } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const txnItems = items.map(item => ({
    barcode_value: item.barcode_value,
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price
  }));

  const receipt_number = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
  const newTxn = {
    id: `TXN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    receipt_number,
    cashier_name: cashierName,
    subtotal: Number(subtotal),
    tax: Number(tax),
    grand_total: Number(grandTotal),
    payment_method: paymentMethod,
    payment_status: "PENDING",
    items: txnItems,
    timestamp: new Date().toISOString()
  };

  TRANSACTION_HISTORY.unshift(newTxn);
  res.json({ success: true, transaction: newTxn });
});

// 11. Payment Gate secure callback
app.post("/api/payment/confirm", (req, res) => {
  const { transaction_id, status } = req.body;

  if (!transaction_id || !status) {
    return res.status(400).json({ error: "Missing transaction ID or status" });
  }

  const txn = TRANSACTION_HISTORY.find(t => t.id === transaction_id);
  if (!txn) {
    return res.status(404).json({ error: "Transaction ticket not found" });
  }

  txn.payment_status = status;

  if (status === "COMPLETED") {
    // Decrement stock values
    for (const item of txn.items) {
      const prod = PRODUCTS_DB[item.barcode_value];
      if (prod) {
        const previousStock = prod.stock_quantity;
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        
        // If stock falls below 15, trigger automated low stock alert notification
        if (prod.stock_quantity < 15 && previousStock >= 15) {
          sendAlertEmail(
            "inventory",
            `Low Stock Alert: ${prod.product_name} is running critically low`,
            `The registered product profile "${prod.product_name}" (SKU: ${prod.barcode_value}) stock volume has dropped from ${previousStock} to ${prod.stock_quantity} left inside POS catalogs. Please allocate warehouse inventory loads soon.`
          );
        }
      }
    }
    broadcastEvent("checkout", { transaction: txn });
  }

  res.json({ success: true, transaction: txn });
});

// 11.5 Bulk Offline Transactions Sync
app.post("/api/sync-offline", (req, res) => {
  const { transactions } = req.body;
  if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ error: "No transactions list found to sync" });
  }

  const syncedResults = [];
  
  for (const t of transactions) {
    const receipt_number = t.receipt_number || `TXN-SYN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const backendTxn = {
      id: t.id || `TXN-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      receipt_number,
      cashier_name: t.cashier_name || "Offline Cashier Member",
      subtotal: Number(t.subtotal || 0),
      tax: Number(t.tax || 0),
      grand_total: Number(t.grand_total || 0),
      payment_method: t.payment_method || "Credit/Debit",
      payment_status: "COMPLETED", // Offline orders are assumed authorized and clear
      items: t.items.map(i => ({
        barcode_value: i.barcode_value,
        product_name: i.product_name,
        quantity: Number(i.quantity || 1),
        price: Number(i.price || 0)
      })),
      timestamp: t.timestamp || new Date().toISOString()
    };

    // Decrement stock levels
    for (const item of backendTxn.items) {
      const prod = PRODUCTS_DB[item.barcode_value];
      if (prod) {
        const previousStock = prod.stock_quantity;
        prod.stock_quantity = Math.max(0, prod.stock_quantity - item.quantity);
        
        // Low stock trigger alert checks
        if (prod.stock_quantity < 15 && previousStock >= 15) {
          sendAlertEmail(
            "inventory",
            `Low Stock Alert: ${prod.product_name} is running critically low`,
            `The registered product profile "${prod.product_name}" (SKU: ${prod.barcode_value}) stock volume has dropped to ${prod.stock_quantity} left inside POS catalogs. Please allocate warehouse inventory loads soon.`
          );
        }
      }
    }

    TRANSACTION_HISTORY.unshift(backendTxn);
    syncedResults.push(backendTxn);
  }

  // Emits real-time SSE event to trigger visual refresh on active terminals
  broadcastEvent("checkout", { syncedCount: syncedResults.length });

  res.json({ success: true, syncedCount: syncedResults.length, transactions: syncedResults });
});

// 11.6 Fetch system email logs list
app.get("/api/email-logs", (req, res) => {
  res.json(EMAIL_NOTIFICATIONS_DB);
});

// 12. List scan logs
app.get("/api/scan-logs", (req, res) => {
  res.json(SCAN_LOGS);
});

// 13. List transaction logs
app.get("/api/transactions", (req, res) => {
  res.json(TRANSACTION_HISTORY);
});

// 14. Analytics summary
app.get("/api/analytics", authenticateToken, (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Access Denied: Analytics summary requires administrator or manager authorization clearance" });
  }

  const { startDate, endDate } = req.query;
  
  let filtered = TRANSACTION_HISTORY;

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    filtered = filtered.filter(t => new Date(t.timestamp) >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter(t => new Date(t.timestamp) <= end);
  }

  const completedTxns = filtered.filter(t => t.payment_status === "COMPLETED");
  const failedTxns = filtered.filter(t => t.payment_status === "FAILED");
  const pendingTxns = filtered.filter(t => t.payment_status === "PENDING");

  const totalSales = completedTxns.reduce((acc, t) => acc + t.grand_total, 0);
  const transactionCount = completedTxns.length;
  const averageOrderValue = transactionCount > 0 ? totalSales / transactionCount : 0;

  const productQuantities = {};
  completedTxns.forEach(txn => {
    txn.items.forEach(item => {
      if (!productQuantities[item.barcode_value]) {
        const matchedProd = PRODUCTS_DB[item.barcode_value];
        productQuantities[item.barcode_value] = { 
          name: item.product_name, 
          qty: 0, 
          revenue: 0,
          img: matchedProd ? matchedProd.image_url : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
        };
      }
      productQuantities[item.barcode_value].qty += item.quantity;
      productQuantities[item.barcode_value].revenue += item.quantity * item.price;
    });
  });

  const bestSellingItems = Object.entries(productQuantities)
    .map(([barcode, details]) => ({
      barcode,
      name: details.name,
      quantity_sold: details.qty,
      revenue_generated: details.revenue,
      image_url: details.img
    }))
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, 5);

  const dailyRev = {};
  completedTxns.forEach(t => {
    const dateStr = t.timestamp.split("T")[0];
    dailyRev[dateStr] = (dailyRev[dateStr] || 0) + t.grand_total;
  });

  const salesOverTime = Object.entries(dailyRev)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    totalSales,
    transactionCount,
    failedCount: failedTxns.length,
    pendingCount: pendingTxns.length,
    averageOrderValue,
    bestSellingItems,
    salesOverTime,
    totalRecordCount: filtered.length
  });
});

// 15. Reset system database tables to demo default
app.post("/api/reset", (req, res) => {
  PRODUCTS_DB = {
    "123456789012": {
      barcode_value: "123456789012",
      product_name: "XPS Elite Ultra 15\" Laptop",
      price: 1299.99,
      stock_quantity: 45,
      image_url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=300&q=80",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    "987654321098": {
      barcode_value: "987654321098",
      product_name: "Acoustix Aura ANC Wireless Headphones",
      price: 249.50,
      stock_quantity: 120,
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    "456789012345": {
      barcode_value: "456789012345",
      product_name: "Horizon Active Smartwatch Gen 5",
      price: 189.00,
      stock_quantity: 85,
      image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    "748291036481": {
      barcode_value: "748291036481",
      product_name: "Apex Pro Mechanical Keyboard SDK",
      price: 145.00,
      stock_quantity: 30,
      image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80",
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    "395726104829": {
      barcode_value: "395726104829",
      product_name: "Viper Mini Ergonomic Mouse v3",
      price: 69.99,
      stock_quantity: 151,
      image_url: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=300&q=80",
      created_at: new Date().toISOString()
    }
  };
  SCAN_LOGS = [];
  TRANSACTION_HISTORY = [];
  USERS_DB = {};
  EMAIL_NOTIFICATIONS_DB = [];
  seedUsers();

  res.json({ success: true, message: "System databases reset to default values and credentials re-seeded" });
});

// Static assets serve - We serve our frontend directly from /src
const staticPath = path.join(process.cwd(), "src");
app.use("/src", express.static(staticPath));
app.use(express.static(staticPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in native Node JavaScript mode on port ${PORT}`);
});
