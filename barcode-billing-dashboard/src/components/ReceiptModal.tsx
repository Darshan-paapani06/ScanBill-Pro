import { motion, AnimatePresence } from "motion/react";
import { Printer, X, ShoppingBag, FileText, CheckCircle2, CreditCard } from "lucide-react";
import { Transaction } from "../types";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
        {/* Animated Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 font-sans"
        >
          {/* Header Action Row */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-display font-medium text-sm text-zinc-300">Transaction Complete</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Receipt Wrapper (Print Target) */}
          <div id="printable-receipt" className="p-6 bg-zinc-950 text-black print:bg-white print:text-black">
            {/* Paper Tear / Visual Receipts Border Indicator (For Screen Only) */}
            <div className="hidden sm:block absolute -top-1 left-0 right-0 h-2 bg-gradient-to-r from-zinc-900 via-transparent to-zinc-900 bg-repeat-x pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #09090b 4px, transparent 5px)", backgroundSize: "12px 12px" }}></div>
            
            {/* Screen Receipt Wrapper */}
            <div className="p-6 bg-white border border-zinc-200 rounded-xl shadow-md text-zinc-800 flex flex-col font-mono text-xs">
              
              {/* Receipt Header details */}
              <div className="text-center border-b border-dashed border-zinc-300 pb-4 mb-4">
                <h2 className="font-display font-bold text-lg text-zinc-950 uppercase tracking-wider flex items-center justify-center gap-1">
                  <ShoppingBag className="h-5 w-5 text-violet-600 print:text-black" />
                  APEX RETAIL
                </h2>
                <p className="text-zinc-500 text-[10px] mt-1 font-sans">
                  Enterprise POS Hub #8492 — Silicon Oasis
                </p>
                <div className="mt-2 text-[10px] text-zinc-400 font-mono">
                  Tel: +1 (555) 902-1840 | support@apexretail.io
                </div>
              </div>

              {/* Cashier & Meta */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-zinc-600 border-b border-dashed border-zinc-300 pb-4">
                <div>
                  <span className="text-zinc-400">RECEIPT:</span><br />
                  <span className="font-bold text-zinc-950">{transaction.receipt_number}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400">DATE & TIME:</span><br />
                  <span>{new Date(transaction.timestamp).toLocaleString("en-US", { hour12: false })}</span>
                </div>
                <div>
                  <span className="text-zinc-400">CASHIER:</span><br />
                  <span className="font-medium text-zinc-800">{transaction.cashier_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400">PAYMENT:</span><br />
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase font-bold inline-flex items-center gap-1 mt-0.5 ${
                    transaction.payment_status === "COMPLETED" 
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : transaction.payment_status === "FAILED"
                      ? "bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    <CreditCard className="h-3 w-3" />
                    {transaction.payment_status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-4">
                <div className="grid grid-cols-12 font-bold text-zinc-900 border-b border-zinc-300 pb-1.5 mb-2">
                  <span className="col-span-6">ITEM DESCRIPTION</span>
                  <span className="col-span-2 text-center">QTY</span>
                  <span className="col-span-4 text-right">AMOUNT</span>
                </div>
                
                <div className="space-y-2 border-b border-zinc-300 pb-3">
                  {transaction.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-zinc-700 font-mono">
                      <div className="col-span-6 flex flex-col">
                        <span className="font-medium text-zinc-900 truncate">{item.product_name}</span>
                        <span className="text-[9px] text-zinc-400">ID: {item.barcode_value}</span>
                      </div>
                      <span className="col-span-2 text-center self-center">{item.quantity}</span>
                      <span className="col-span-4 text-right self-center text-zinc-950">
                        ${(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="space-y-1 text-zinc-600 border-b border-zinc-300 pb-3 mb-4">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span className="text-zinc-900">${transaction.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST / SALES TAX (18.0%)</span>
                  <span className="text-zinc-900">${transaction.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-950 pt-1">
                  <span>GRAND TOTAL</span>
                  <span>${transaction.grand_total.toFixed(2)}</span>
                </div>
              </div>

              {/* Invoice Footer Details & Barcode Visual representation */}
              <div className="text-center flex flex-col items-center justify-center">
                <p className="font-sans font-medium text-[10px] text-zinc-500 mb-2">
                  Thank you for shopping at Apex Retail.
                </p>
                
                {/* Simulated receipt barcode */}
                <div className="bg-zinc-100 p-2.5 rounded border border-zinc-200 mt-1 flex flex-col items-center">
                  <span className="block h-7 w-44 bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_4px,black_4px,black_5px)]" />
                  <span className="text-[8px] text-zinc-400 tracking-widest mt-1 font-mono">
                    {transaction.receipt_number}
                  </span>
                </div>
                <p className="text-[8px] text-zinc-400 mt-3 font-sans uppercase">
                  Processed on AI-Studio POS Engine v1.4
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-2 p-4 bg-zinc-950 border-t border-zinc-800">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 active:scale-95 rounded-xl transition font-medium text-sm border border-zinc-700"
            >
              <Printer className="h-4 w-4" />
              Print Paper Copy
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl active:scale-95 font-medium text-sm shadow-lg shadow-emerald-900/20 transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              New Sale Invoice
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
