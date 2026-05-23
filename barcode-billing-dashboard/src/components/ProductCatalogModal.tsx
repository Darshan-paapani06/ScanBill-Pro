import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, PlusCircle, Database, Trash2, Edit2, Package, Tag, DollarSign, Image as ImageIcon } from "lucide-react";
import { Product } from "../types";

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Omit<Product, "">) => Promise<void>;
  onDeleteProduct: (barcode: string) => Promise<void>;
}

interface ProductCatalogRowProps {
  p: Product;
  onDeleteProduct: (barcode: string) => Promise<void>;
  onShowLightbox: (p: Product) => void;
}

function ProductCatalogRow({ p, onDeleteProduct, onShowLightbox }: ProductCatalogRowProps) {
  const [pulse, setPulse] = useState(false);
  const prevStockRef = useRef<number>(p.stock_quantity);

  const [isEditing, setIsEditing] = useState(false);
  const [tempPrice, setTempPrice] = useState(p.price.toString());
  const [tempStock, setTempStock] = useState(p.stock_quantity.toString());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (prevStockRef.current !== p.stock_quantity) {
      setPulse(true);
      prevStockRef.current = p.stock_quantity;
      const timer = setTimeout(() => {
        setPulse(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [p.stock_quantity]);

  const handleStartEdit = () => {
    setTempPrice(p.price.toString());
    setTempStock(p.stock_quantity.toString());
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const priceNum = parseFloat(tempPrice);
    const stockNum = parseInt(tempStock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      alert("Please enter a valid price (greater than or equal to 0).");
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      alert("Please enter a valid stock quantity (greater than or equal to 0).");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`/api/products/${p.barcode_value}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ price: priceNum, stock_quantity: stockNum })
      });

      if (response.ok) {
        setIsEditing(false);
        if (typeof (window as any).loadCatalogList === "function") {
          (window as any).loadCatalogList();
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update product details.");
      }
    } catch (err) {
      console.error("Error updating online:", err);
      alert("Error communicating with server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.tr
      animate={pulse ? {
        backgroundColor: [
          "rgba(24, 24, 27, 0)",
          "rgba(139, 92, 246, 0.25)",
          "rgba(139, 92, 246, 0.1)",
          "rgba(139, 92, 246, 0.25)",
          "rgba(24, 24, 27, 0)"
        ],
        scale: [1, 1.01, 0.995, 1.005, 1]
      } : {}}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className={`hover:bg-zinc-800/20 transition group border-b border-zinc-800/50 ${pulse ? "relative z-10" : ""}`}
    >
      <td className="p-3 flex items-center gap-3">
        <img
          src={p.image_url}
          alt={p.product_name}
          referrerPolicy="no-referrer"
          className="h-10 w-10 object-cover rounded-lg border border-zinc-800 cursor-zoom-in hover:scale-105 hover:opacity-85 transition-all duration-200 bg-zinc-950/20"
          onClick={() => onShowLightbox(p)}
          title="Click to view full size"
        />
        <span className="font-medium text-zinc-200 group-hover:text-zinc-100 max-w-[150px] truncate flex items-center gap-1">
          {p.product_name}
          {p.stock_quantity <= 5 && (
            <span className="text-amber-500 animate-pulse text-xs" title="Warning: Critically Low Stock! ⚠️">
              ⚠️
            </span>
          )}
        </span>
      </td>
      <td className="p-3 font-mono text-zinc-400">{p.barcode_value}</td>
      <td className="p-3 font-semibold text-emerald-400 text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-1">
            <span className="text-emerald-400 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              className="w-20 px-1.5 py-1 bg-zinc-950 border border-violet-500/50 rounded text-right text-emerald-400 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
            />
          </div>
        ) : (
          `$${p.price.toFixed(2)}`
        )}
      </td>
      <td className="p-3 text-center">
        {isEditing ? (
          <div className="flex justify-center">
            <input
              type="number"
              min="0"
              value={tempStock}
              onChange={(e) => setTempStock(e.target.value)}
              className="w-16 px-1.5 py-1 bg-zinc-950 border border-violet-500/50 rounded text-center text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono font-bold"
            />
          </div>
        ) : (
          <span className={`px-2 py-0.5 rounded-full text-[10px] transition-all duration-300 inline-block ${
            pulse 
              ? "scale-110 bg-violet-600/30 text-violet-200 ring-2 ring-violet-500 font-bold"
              : p.stock_quantity <= 5 
              ? "bg-red-500/10 text-red-400 animate-pulse border border-red-500/15" 
              : p.stock_quantity <= 15
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/15"
              : "bg-emerald-500/10 text-emerald-400"
          }`}>
            {p.stock_quantity} units
          </span>
        )}
      </td>
      <td className="p-3 text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50 transition cursor-pointer"
              title="Save Item"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="p-1.5 rounded bg-zinc-850 text-zinc-400 hover:bg-zinc-800 disabled:opacity-50 transition cursor-pointer"
              title="Cancel"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={handleStartEdit}
              className="p-1.5 rounded bg-zinc-850 text-violet-400 hover:bg-violet-500/10 transition cursor-pointer"
              title="Edit Item details"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDeleteProduct(p.barcode_value)}
              className="p-1.5 rounded bg-zinc-850 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 transition cursor-pointer"
              title="Delete Item"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </td>
    </motion.tr>
  );
}

export function ProductCatalogModal({ isOpen, onClose, products, onAddProduct, onDeleteProduct }: ProductCatalogModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [sortField, setSortField] = useState<"name" | "price" | "stock" | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);
  
  // Form States
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSort = (field: "name" | "price" | "stock") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode_value.includes(searchTerm)
  );

  let sortedProducts = [...filteredProducts];
  if (sortField) {
    sortedProducts.sort((a, b) => {
      let valA: any, valB: any;
      if (sortField === "name") {
        valA = a.product_name.toLowerCase();
        valB = b.product_name.toLowerCase();
      } else if (sortField === "price") {
        valA = a.price;
        valB = b.price;
      } else if (sortField === "stock") {
        valA = a.stock_quantity;
        valB = b.stock_quantity;
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!barcode || !name || !price) {
      setErrorMsg("Barcode, Product Name, and Price are required.");
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg("Price must be a valid positive number.");
      return;
    }

    if (stock && (isNaN(Number(stock)) || Number(stock) < 0 || !Number.isInteger(Number(stock)))) {
      setErrorMsg("Starting Stock quantity must be a non-negative integer.");
      return;
    }

    try {
      await onAddProduct({
        barcode_value: barcode,
        product_name: name,
        price: Number(price),
        stock_quantity: Number(stock || 0),
        image_url: imgUrl || `https://picsum.photos/seed/${barcode}/300/300`
      });

      // Clear Form
      setBarcode("");
      setName("");
      setPrice("");
      setStock("");
      setImgUrl("");
      setIsAdding(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add product database record.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl h-[85vh] bg-[#18181B] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-[#09090B] border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-600/20 text-violet-400 rounded-lg">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">Local Inventory Catalog</h2>
                <p className="text-xs text-zinc-400">Manage real-time products matched against scans</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Product List */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden border-r border-zinc-800/50">
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by product name or barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("csv-bulk-modal-input");
                      el?.click();
                    }}
                    className="flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 hover:border-zinc-600 rounded-lg py-2 px-3 text-xs font-medium cursor-pointer transition select-none"
                    title="Upload bulk products from CSV file"
                  >
                    Upload CSV
                  </button>
                  <input
                    type="file"
                    id="csv-bulk-modal-input"
                    accept=".csv"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const text = await file.text();
                        const lines = text.split("\n");
                        for (let i = 1; i < lines.length; i++) {
                          const line = lines[i].trim();
                          if (!line) continue;
                          const parts = line.split(",");
                          if (parts.length < 3) continue;
                          const barcode_val = parts[0].trim().replace(/^"|"$/g, "");
                          const prod_name = parts[1].trim().replace(/^"|"$/g, "");
                          const val_price = Number(parts[2].trim().replace(/[^0-9.]/g, ""));
                          const qty_stock = parts[3] ? Number(parts[3].trim().replace(/[^0-9]/g, "")) : 0;
                          const img_uri = parts[4] ? parts[4].trim().replace(/^"|"$/g, "") : "";
                          if (barcode_val && prod_name && !isNaN(val_price)) {
                            await onAddProduct({
                              barcode_value: barcode_val,
                              product_name: prod_name,
                              price: val_price,
                              stock_quantity: qty_stock,
                              image_url: img_uri || `https://picsum.photos/seed/${barcode_val}/300/300`
                            });
                          }
                        }
                      } catch (err) {
                        console.error("Bulk upload processing error:", err);
                      }
                      e.target.value = "";
                    }}
                  />
                  {!isAdding && (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="flex items-center justify-center gap-1.5 py-2 px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition active:scale-95 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Product
                    </button>
                  )}
                </div>
              </div>

              {/* Product Inventory Table View */}
              <div className="flex-1 overflow-y-auto border border-zinc-800 rounded-xl bg-zinc-900/50">
                {sortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-zinc-500">
                    <Package className="h-10 w-10 mb-2 stroke-1" />
                    <p className="text-sm">No products found</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#09090B] border-b border-zinc-805 text-zinc-400 font-medium select-none text-[10px] tracking-wider uppercase font-mono">
                        <th className="p-3 cursor-pointer hover:text-white transition" onClick={() => handleSort("name")}>
                          <span className="flex items-center gap-1">
                            Product details {sortField === "name" ? (sortAsc ? "↑" : "↓") : "⇅"}
                          </span>
                        </th>
                        <th className="p-3">Barcode</th>
                        <th className="p-3 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort("price")}>
                          <span className="flex items-center justify-end gap-1">
                            Price {sortField === "price" ? (sortAsc ? "↑" : "↓") : "⇅"}
                          </span>
                        </th>
                        <th className="p-3 text-center cursor-pointer hover:text-white transition" onClick={() => handleSort("stock")}>
                          <span className="flex items-center justify-center gap-1">
                            Stock {sortField === "stock" ? (sortAsc ? "↑" : "↓") : "⇅"}
                          </span>
                        </th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {sortedProducts.map((p) => (
                        <ProductCatalogRow
                          key={p.barcode_value}
                          p={p}
                          onDeleteProduct={onDeleteProduct}
                          onShowLightbox={setLightboxProduct}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Right Column: Register New Item Panel */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "350px" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="bg-[#101012] p-6 border-l border-zinc-800/80 flex flex-col justify-between overflow-y-auto"
                >
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <h3 className="font-display font-semibold text-zinc-200 flex items-center gap-2">
                        <Package className="h-4 w-4 text-violet-400" />
                        Register New Product
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-900/20 text-red-400 rounded-lg text-xs border border-red-900/50">
                        {errorMsg}
                      </div>
                    )}

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1.5">Barcode ID (12-Digit EAN/UPC)</label>
                        <div className="relative">
                          <Tag className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. 123456789012"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value.replace(/\D/g, "").slice(0, 15))}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-medium mb-1.5">Product Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HyperGlide Pro Wireless Controller"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-400 font-medium mb-1.5">Price (USD)</label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                            <input
                              type="number"
                              required
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="w-full pl-7 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-400 font-medium mb-1.5">Starting Stock</label>
                          <input
                            type="number"
                            placeholder="e.g. 50"
                            value={stock}
                            onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-medium mb-1.5">Product Thumbnail Image URL</label>
                        <div className="relative">
                          <ImageIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... (Optional)"
                            value={imgUrl}
                            onChange={(e) => setImgUrl(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition cursor-pointer text-xs"
                      >
                        Register Product
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  <p className="text-[10px] text-zinc-500 mt-4 leading-normal">
                    This directly registers the schema fields (`id`, `barcode_value`, `product_name`, `price`, `stock_quantity`, `image_url`) on your database cluster.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {lightboxProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLightboxProduct(null)}
                className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-[99] cursor-zoom-out"
              >
                <div className="absolute top-5 right-5 flex items-center gap-4 z-[100]" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-bold text-zinc-300 font-sans tracking-wide bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                    {lightboxProduct.product_name}
                  </span>
                  <button 
                    onClick={() => setLightboxProduct(null)}
                    className="text-zinc-400 hover:text-white transition text-lg bg-zinc-900 border border-white/10 p-2 rounded-full cursor-pointer hover:bg-zinc-800 leading-none flex items-center justify-center w-9 h-9"
                  >
                    ✕
                  </button>
                </div>
                
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative max-w-4xl max-h-[85vh] flex items-center justify-center" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={lightboxProduct.image_url} 
                    alt={lightboxProduct.product_name} 
                    className="max-w-[90vw] max-h-[75vh] object-contain rounded-xl border border-zinc-800 shadow-2xl bg-zinc-950/20" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-[-45px] left-0 right-0 text-center">
                    <span className="text-[10px] font-mono text-violet-400 tracking-wider uppercase bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full select-none">
                      SKU: {lightboxProduct.barcode_value} • PRICE: ${lightboxProduct.price.toFixed(2)} • STOCK: {lightboxProduct.stock_quantity} units
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
