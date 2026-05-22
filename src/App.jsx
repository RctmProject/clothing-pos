import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const SUPABASE_URL = "https://asvjmruxsdcjjqktjzye.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdmptcnV4c2Rjampxa3RqenllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODAzOTksImV4cCI6MjA5NDI1NjM5OX0.14apCycTxViARAJUmkOC-5di2oiLkDuvjnY3srTL88k";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── Shop info ────────────────────────────────────────────────────────────── */
const SHOP = {
  name: "WHITE EAGLE",
  legal: "Al Nisr Al Abyad Readymade Garments Trading",
  address: "Budaniq Area, Near Megamall, Sharjah UAE",
  phone: "+971 54 5666 177",
};

const SEED = [
  {name:"White Linen Shirt",category:"Tops",price:89,stock:12,emoji:"👔",discount:0,disc_type:"pct"},
  {name:"Black Trousers",category:"Bottoms",price:120,stock:8,emoji:"👖",discount:0,disc_type:"pct"},
  {name:"Floral Summer Dress",category:"Dresses",price:145,stock:3,emoji:"👗",discount:15,disc_type:"pct"},
  {name:"Denim Jacket",category:"Outerwear",price:195,stock:5,emoji:"🧥",discount:0,disc_type:"pct"},
  {name:"Striped Polo",category:"Tops",price:65,stock:0,emoji:"👕",discount:0,disc_type:"pct"},
  {name:"Beige Chinos",category:"Bottoms",price:110,stock:7,emoji:"👖",discount:0,disc_type:"pct"},
  {name:"Maxi Skirt",category:"Bottoms",price:95,stock:2,emoji:"🩱",discount:10,disc_type:"fixed"},
  {name:"Crop Blazer",category:"Outerwear",price:175,stock:4,emoji:"🥼",discount:0,disc_type:"pct"},
  {name:"Casual Sneakers",category:"Footwear",price:130,stock:6,emoji:"👟",discount:0,disc_type:"pct"},
  {name:"Leather Belt",category:"Accessories",price:45,stock:15,emoji:"🪢",discount:0,disc_type:"pct"},
  {name:"Canvas Tote",category:"Accessories",price:55,stock:9,emoji:"👜",discount:0,disc_type:"pct"},
  {name:"Ribbed Tank Top",category:"Tops",price:35,stock:1,emoji:"👕",discount:0,disc_type:"pct"},
];

const EMOJIS = ["👔","👕","👗","👖","🧥","🥼","🩱","🩲","👟","👠","👜","🪢","🎩","🧣","🧦","👒","✨","🌸","💎","🛍️","🩴","🎀","👛","🕶️"];
const CATS = ["Tops","Bottoms","Dresses","Outerwear","Footwear","Accessories","Other"];

const fmt = (n) => "AED " + Number(n).toFixed(2);
const discPrice = (p) => p.discount > 0 ? (p.disc_type === "pct" ? p.price * (1 - p.discount / 100) : Math.max(0, p.price - p.discount)) : p.price;
const effPrice = (c) => { let p = discPrice(c); if (c.iDisc > 0) p = c.iDt === "pct" ? p * (1 - c.iDisc / 100) : Math.max(0, p - c.iDisc); return p; };

/* ── Global CSS ───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;font-family:'DM Sans',system-ui,sans-serif;background:#F7F6F3;color:#1A1917}
input,select,button,textarea{font-family:'DM Sans',system-ui,sans-serif}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:#D5D3CB;border-radius:4px}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;backdrop-filter:blur(3px)}
.modal-box{background:#fff;border-radius:16px;border:1px solid #E5E3DB;padding:24px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.22)}
.modal-box h3{font-size:17px;font-weight:700;letter-spacing:-.4px;margin-bottom:18px;color:#1A1917}

.fld{margin-bottom:12px}
.fld label{font-size:10px;font-weight:700;color:#7A7870;text-transform:uppercase;letter-spacing:.07em;display:block;margin-bottom:5px}
.fld input,.fld select{width:100%;padding:10px 12px;font-size:14px;border:1.5px solid #E5E3DB;border-radius:9px;background:#F7F6F3;color:#1A1917;outline:none;transition:border-color .15s}
.fld input:focus,.fld select:focus{border-color:#1A1917;background:#fff}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:10px}

.emoji-grid{display:flex;flex-wrap:wrap;gap:5px;padding:10px;background:#F0EFE9;border-radius:10px;max-height:96px;overflow-y:auto;margin-bottom:8px;border:1.5px solid #E5E3DB}
.e-opt{font-size:22px;cursor:pointer;padding:4px;border-radius:7px;border:2px solid transparent;transition:all .1s;line-height:1}
.e-opt:hover{background:#E5E3DB}
.e-opt.on{border-color:#1A1917;background:#fff}

.mbtns{display:flex;gap:8px;margin-top:20px}
.mbtns button{flex:1;padding:12px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .15s;border:none}
.mbtns button:hover{opacity:.83}
.b-def{background:#F0EFE9!important;border:1.5px solid #E5E3DB!important;color:#1A1917!important}
.b-pri{background:#1A1917!important;color:#fff!important}
.b-dan{background:#FCECEA!important;border:1.5px solid #F09595!important;color:#C94A3F!important}

.tabs-ui{display:flex;background:#F0EFE9;border-radius:10px;padding:3px;gap:2px}
.tab-ui{padding:6px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#7A7870;transition:all .15s}
.tab-ui.on{background:#fff;color:#1A1917;box-shadow:0 1px 4px rgba(0,0,0,.09)}

.cat-row{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px}
.cat-row::-webkit-scrollbar{display:none}
.cat-p{padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid #E5E3DB;background:#fff;color:#7A7870;white-space:nowrap;transition:all .15s}
.cat-p.on{background:#1A1917;border-color:#1A1917;color:#fff}

.pcard{background:#fff;border:1.5px solid #E5E3DB;border-radius:13px;padding:14px 12px;cursor:pointer;position:relative;transition:transform .15s,box-shadow .15s,border-color .15s;user-select:none}
.pcard:hover{transform:translateY(-2px);box-shadow:0 6px 22px rgba(0,0,0,.1);border-color:#C8C6BE}
.pcard.out{opacity:.5;cursor:not-allowed}
.pcard.out:hover{transform:none;box-shadow:none;border-color:#E5E3DB}
.pcard .ei{position:absolute;top:9px;right:9px;width:27px;height:27px;border-radius:50%;background:#F0EFE9;border:1.5px solid #E5E3DB;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .15s;font-size:13px;color:#7A7870}
.pcard:hover .ei{opacity:1}
.dbadge{position:absolute;top:9px;left:9px;background:#C94A3F;color:#fff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;letter-spacing:.4px}

.stag{font-size:10px;padding:3px 8px;border-radius:6px;font-weight:600}
.s-ok{background:#EDFAF1;color:#3A7D44}
.s-lo{background:#FFF4E5;color:#B97B2A}
.s-ou{background:#FCECEA;color:#C94A3F}

.ci{display:flex;gap:10px;padding:12px 0;border-bottom:1px solid #E5E3DB}
.ci-av{font-size:18px;width:36px;height:36px;border-radius:9px;background:#F0EFE9;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cidt{font-size:10px;background:#FCECEA;color:#C94A3F;padding:2px 6px;border-radius:5px;cursor:pointer;border:none;font-weight:600;font-family:'DM Sans',sans-serif}
.ciad{font-size:10px;background:#F0EFE9;color:#7A7870;padding:2px 6px;border-radius:5px;cursor:pointer;border:1.5px solid #E5E3DB;font-family:'DM Sans',sans-serif}
.qbtn{width:27px;height:27px;border-radius:7px;border:1.5px solid #E5E3DB;background:#F0EFE9;cursor:pointer;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;transition:background .1s;line-height:1}
.qbtn:hover{background:#E5E3DB}

.stat-c{background:#fff;border:1.5px solid #E5E3DB;border-radius:13px;padding:16px}
.stat-l{font-size:10px;font-weight:700;color:#7A7870;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px}
.stat-v{font-size:26px;font-weight:700;letter-spacing:-.5px}

.inv-r{display:grid;grid-template-columns:2fr 1fr 1fr 62px;gap:8px;align-items:center;background:#fff;border:1.5px solid #E5E3DB;border-radius:9px;padding:10px 12px;margin-bottom:6px}
.ibadge{font-size:10px;padding:3px 9px;border-radius:6px;font-weight:600;display:inline-block;text-align:center}

.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1A1917;color:#fff;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:600;z-index:99999;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.25);animation:tin .2s ease}
@keyframes tin{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.rbk{background:#F7F6F3;border-radius:10px;padding:13px;margin:12px 0;font-size:12px;border:1px solid #E5E3DB}
.rr{display:flex;justify-content:space-between;margin-bottom:4px;color:#1A1917}
.rd{border-top:1px dashed #D5D3CB;margin:8px 0}

/* Cart drawer for mobile */
.cart-drawer{transition:max-height .3s ease}

/* Action buttons row */
.action-row{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.action-btn{padding:8px 14px;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid #E5E3DB;background:#fff;color:#1A1917;display:flex;align-items:center;gap:6px;transition:all .15s;white-space:nowrap}
.action-btn:hover{background:#F0EFE9}
.action-btn.primary{background:#1A1917;color:#fff;border-color:#1A1917}
.action-btn.primary:hover{opacity:.85}

/* Report table */
.report-table{width:100%;border-collapse:collapse;font-size:12px}
.report-table th{background:#F0EFE9;padding:8px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#7A7870;border-bottom:1.5px solid #E5E3DB}
.report-table td{padding:8px 10px;border-bottom:1px solid #E5E3DB;color:#1A1917}
.report-table tr:last-child td{border-bottom:none}
.report-table tr:hover td{background:#F7F6F3}

/* Print styles */
@media print {
  body * { visibility: hidden; }
  .printable, .printable * { visibility: visible; }
  .printable { position: fixed; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
}

/* Thermal receipt print */
@media print {
  .thermal-receipt { font-family: monospace; font-size: 12px; width: 58mm; margin: 0 auto; }
}

/* Responsive */
@media(max-width:900px){
  .pos-g{grid-template-columns:1fr 300px!important}
  .pg{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))!important}
}

/* Mobile: stacked layout with collapsible cart */
@media(max-width:640px){
  .pos-g{grid-template-columns:1fr!important;grid-template-rows:1fr auto!important;height:100dvh!important}
  .cart-p{border-left:none!important;border-top:2px solid #E5E3DB!important}
  .pg{grid-template-columns:repeat(auto-fill,minmax(108px,1fr))!important;gap:8px!important}
  .tb-p{padding:10px 14px!important}
  .tl-p{padding:10px 14px!important}
  .clk{display:none!important}
  .gs-p{padding:12px 14px!important}
  .brand-legal{display:none!important}
}
`;

function useStyles() {
  useEffect(() => {
    if (!document.getElementById("pos-css")) {
      const s = document.createElement("style");
      s.id = "pos-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);
}

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);
  return <span className="clk" style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#7A7870" }}>{t}</span>;
}

function Modal({ show, onClose, children, wide }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (show) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={wide ? { maxWidth: 720 } : {}} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Fld({ label, opt, children }) {
  return (
    <div className="fld">
      <label>{label}{opt && <span style={{ color: "#7A7870", textTransform: "none", fontSize: 10, marginLeft: 4, fontWeight: 400, letterSpacing: 0 }}>optional</span>}</label>
      {children}
    </div>
  );
}

/* ── Product Modal ────────────────────────────────────────────────────────── */
function ProductModal({ product, onSave, onDelete, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || "", category: product?.category || "Tops",
    price: product?.price || "", stock: product?.stock || "",
    emoji: product?.emoji || "👔", discount: product?.discount || "",
    disc_type: product?.disc_type || "pct"
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <Modal show onClose={onClose}>
      <h3>{isEdit ? "Edit Product" : "Add New Product"}</h3>
      <Fld label="Icon">
        <div className="emoji-grid">
          {EMOJIS.map(e => <span key={e} className={`e-opt${form.emoji === e ? " on" : ""}`} onClick={() => set("emoji", e)}>{e}</span>)}
        </div>
        <input style={{ width: "100%", padding: "8px 10px", fontSize: 14, border: "1.5px solid #E5E3DB", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", outline: "none" }} value={form.emoji} onChange={e => set("emoji", e.target.value)} placeholder="Or type any emoji" maxLength={4} />
      </Fld>
      <Fld label="Product Name"><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. White Linen Shirt" /></Fld>
      <div className="two-col">
        <Fld label="Category"><select value={form.category} onChange={e => set("category", e.target.value)}>{CATS.map(c => <option key={c}>{c}</option>)}</select></Fld>
        <Fld label="Price (AED)"><input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" min="0" /></Fld>
      </div>
      <div className="two-col">
        <Fld label="Stock Qty"><input type="number" value={form.stock} onChange={e => set("stock", e.target.value)} placeholder="0" min="0" /></Fld>
        <Fld label="Discount" opt>
          <div style={{ display: "flex", gap: 5 }}>
            <input type="number" value={form.discount} onChange={e => set("discount", e.target.value)} placeholder="0" min="0" style={{ flex: 1 }} />
            <select value={form.disc_type} onChange={e => set("disc_type", e.target.value)} style={{ width: 66 }}>
              <option value="pct">%</option><option value="fixed">AED</option>
            </select>
          </div>
        </Fld>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Cancel</button>
        {isEdit && <button className="b-dan" onClick={() => { if (window.confirm("Delete this product?")) onDelete(product.id); }}>Delete</button>}
        <button className="b-pri" onClick={() => { if (!form.name.trim() || !form.price) return; onSave(form, product?.id); }}>{isEdit ? "Save Changes" : "Add Product"}</button>
      </div>
    </Modal>
  );
}

/* ── Item Discount Modal ──────────────────────────────────────────────────── */
function ItemDiscModal({ item, onSave, onClear, onClose }) {
  const [val, setVal] = useState(item.iDisc || "");
  const [type, setType] = useState(item.iDt || "pct");
  return (
    <Modal show onClose={onClose}>
      <h3>Item Discount</h3>
      <p style={{ fontSize: 13, color: "#7A7870", marginBottom: 14, marginTop: -10 }}>{item.emoji} {item.name}</p>
      <div className="two-col">
        <Fld label="Amount"><input type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="0" min="0" autoFocus /></Fld>
        <Fld label="Type"><select value={type} onChange={e => setType(e.target.value)}><option value="pct">% Percent</option><option value="fixed">AED Fixed</option></select></Fld>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Cancel</button>
        <button className="b-dan" onClick={onClear}>Remove</button>
        <button className="b-pri" onClick={() => onSave(parseFloat(val) || 0, type)}>Apply</button>
      </div>
    </Modal>
  );
}

/* ── Checkout Modal ───────────────────────────────────────────────────────── */
function CheckoutModal({ cart, cd, onConfirm, onClose, saving }) {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", payment: "Cash" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const sub = cart.reduce((s, c) => s + effPrice(c) * c.qty, 0);
  const disc = cd.on && cd.v > 0 ? (cd.t === "pct" ? sub * cd.v / 100 : Math.min(cd.v, sub)) : 0;
  const total = sub - disc;
  return (
    <Modal show onClose={onClose}>
      <h3>Checkout</h3>
      <Fld label="Customer Name" opt><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sarah Ahmed" /></Fld>
      <div className="two-col">
        <Fld label="Mobile" opt><input type="tel" value={form.mobile} onChange={e => set("mobile", e.target.value)} placeholder="+971 50…" /></Fld>
        <Fld label="Email" opt><input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@…" /></Fld>
      </div>
      <Fld label="Payment Method"><select value={form.payment} onChange={e => set("payment", e.target.value)}><option>Cash</option><option>Card</option><option>Apple Pay</option></select></Fld>
      <div className="rbk">
        {cart.map(c => <div key={c.id} className="rr"><span>{c.emoji} {c.name} ×{c.qty}</span><span>{fmt(effPrice(c) * c.qty)}</span></div>)}
        <div className="rd" />
        {disc > 0 && <div className="rr" style={{ color: "#C94A3F" }}><span>Discount</span><span>−{fmt(disc)}</span></div>}
        <div className="rr" style={{ fontWeight: 700, fontSize: 14 }}><span>Total</span><span>{fmt(total)}</span></div>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Cancel</button>
        <button className="b-pri" onClick={() => onConfirm(form, sub, disc, total)} disabled={saving}>{saving ? "Saving…" : "Confirm Sale →"}</button>
      </div>
    </Modal>
  );
}

/* ── Receipt Modal ────────────────────────────────────────────────────────── */
function ReceiptModal({ sale, onClose }) {
  if (!sale) return null;

  const handlePrint = () => {
    const w = window.open("", "_blank", "width=400,height=600");
    w.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body{font-family:monospace;font-size:12px;width:58mm;margin:0 auto;padding:8px}
        .center{text-align:center}.bold{font-weight:bold}.line{border-top:1px dashed #000;margin:6px 0}
        .row{display:flex;justify-content:space-between;margin-bottom:3px}
        .big{font-size:16px;font-weight:bold}.small{font-size:10px}
      </style></head><body>
      <div class="center bold big">${SHOP.name}</div>
      <div class="center small">${SHOP.legal}</div>
      <div class="line"></div>
      <div class="center small">${SHOP.address}</div>
      <div class="center small">${SHOP.phone}</div>
      <div class="line"></div>
      <div class="row"><span>${sale.txn_id}</span><span>${new Date(sale.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span></div>
      ${sale.customer_name !== "Walk-in" ? `<div class="row"><span>Customer:</span><span>${sale.customer_name}</span></div>` : ""}
      ${sale.customer_mobile ? `<div class="row"><span>Mobile:</span><span>${sale.customer_mobile}</span></div>` : ""}
      <div class="row"><span>Payment:</span><span>${sale.payment_method}</span></div>
      <div class="line"></div>
      ${sale.items?.map(it => `<div class="row"><span>${it.emoji} ${it.name} x${it.qty}</span><span>${fmt(it.line_total)}</span></div>`).join("")}
      <div class="line"></div>
      ${sale.discount > 0 ? `<div class="row"><span>Discount:</span><span>-${fmt(sale.discount)}</span></div>` : ""}
      <div class="row bold"><span>TOTAL:</span><span>${fmt(sale.total)}</span></div>
      <div class="line"></div>
      <div class="center small">Thank you for shopping at ${SHOP.name}!</div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <Modal show onClose={onClose}>
      <h3 style={{ color: "#3A7D44" }}>✓ Sale Complete!</h3>
      <div className="rbk">
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{SHOP.name}</div>
          <div style={{ fontSize: 10, color: "#7A7870" }}>{SHOP.legal}</div>
        </div>
        <div className="rd" />
        <div className="rr" style={{ fontWeight: 700 }}><span>{sale.txn_id}</span><span>{new Date(sale.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
        {sale.customer_name !== "Walk-in" && <div className="rr"><span>Customer</span><span>{sale.customer_name}</span></div>}
        {sale.customer_mobile && <div className="rr"><span>Mobile</span><span>{sale.customer_mobile}</span></div>}
        {sale.customer_email && <div className="rr"><span>Email</span><span>{sale.customer_email}</span></div>}
        <div className="rr"><span>Payment</span><span>{sale.payment_method}</span></div>
        <div className="rd" />
        {sale.items?.map((it, i) => <div key={i} className="rr"><span>{it.emoji} {it.name} ×{it.qty}</span><span>{fmt(it.line_total)}</span></div>)}
        <div className="rd" />
        {sale.discount > 0 && <div className="rr" style={{ color: "#C94A3F" }}><span>Discount</span><span>−{fmt(sale.discount)}</span></div>}
        <div className="rr" style={{ fontWeight: 700, fontSize: 15 }}><span>Total</span><span>{fmt(sale.total)}</span></div>
        <div className="rd" />
        <div style={{ textAlign: "center", fontSize: 10, color: "#7A7870" }}>{SHOP.address}</div>
        <div style={{ textAlign: "center", fontSize: 10, color: "#7A7870" }}>{SHOP.phone}</div>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Close</button>
        <button className="b-pri" onClick={handlePrint}>🖨 Print Receipt</button>
      </div>
    </Modal>
  );
}

/* ── Sales Report Modal ───────────────────────────────────────────────────── */
function SalesReportModal({ sales, onClose }) {
  const total = sales.reduce((s, x) => s + Number(x.total), 0);
  const disc = sales.reduce((s, x) => s + Number(x.discount || 0), 0);
  const items = sales.reduce((s, x) => s + (x.sale_items?.reduce((a, c) => a + c.qty, 0) || 0), 0);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Sales Report - ${SHOP.name}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;padding:20px;color:#000}
        h1{font-size:22px;margin-bottom:4px}h2{font-size:13px;font-weight:normal;color:#666;margin-bottom:4px}
        .meta{font-size:11px;color:#666;margin-bottom:20px}
        table{width:100%;border-collapse:collapse;margin-bottom:20px}
        th{background:#f0f0f0;padding:8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;border-bottom:2px solid #ccc}
        td{padding:7px 8px;border-bottom:1px solid #eee;font-size:12px}
        .summary{background:#f8f8f8;padding:14px;border-radius:6px;display:flex;gap:30px}
        .s-item{text-align:center}.s-label{font-size:10px;text-transform:uppercase;color:#666}.s-val{font-size:18px;font-weight:bold}
        .footer{margin-top:30px;font-size:10px;color:#999;text-align:center}
      </style></head><body>
      <h1>${SHOP.name}</h1>
      <h2>${SHOP.legal}</h2>
      <div class="meta">${SHOP.address} | ${SHOP.phone}</div>
      <h2 style="font-size:16px;font-weight:bold;margin-bottom:12px">Sales Report — All Time</h2>
      <div class="summary">
        <div class="s-item"><div class="s-label">Total Sales</div><div class="s-val">${sales.length}</div></div>
        <div class="s-item"><div class="s-label">Items Sold</div><div class="s-val">${items}</div></div>
        <div class="s-item"><div class="s-label">Total Discount</div><div class="s-val">AED ${Number(disc).toFixed(2)}</div></div>
        <div class="s-item"><div class="s-label">Total Revenue</div><div class="s-val">AED ${Number(total).toFixed(2)}</div></div>
      </div>
      <br/>
      <table>
        <thead><tr><th>Date</th><th>Txn ID</th><th>Customer</th><th>Items</th><th>Payment</th><th>Discount</th><th>Total</th></tr></thead>
        <tbody>
          ${sales.map(s => `<tr>
            <td>${new Date(s.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
            <td>${s.txn_id}</td>
            <td>${s.customer_name}${s.customer_mobile ? "<br><small>" + s.customer_mobile + "</small>" : ""}</td>
            <td>${s.sale_items?.map(i => i.name + " ×" + i.qty).join(", ") || "-"}</td>
            <td>${s.payment_method}</td>
            <td>${s.discount > 0 ? "AED " + Number(s.discount).toFixed(2) : "-"}</td>
            <td><b>AED ${Number(s.total).toFixed(2)}</b></td>
          </tr>`).join("")}
        </tbody>
        <tfoot><tr style="background:#f0f0f0;font-weight:bold"><td colspan="6">TOTAL</td><td>AED ${Number(total).toFixed(2)}</td></tr></tfoot>
      </table>
      <div class="footer">Printed on ${new Date().toLocaleString("en-GB")} | ${SHOP.name}</div>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  const handleExcel = () => {
    const rows = sales.map(s => ({
      "Date": new Date(s.created_at).toLocaleString("en-GB"),
      "Transaction ID": s.txn_id,
      "Customer Name": s.customer_name || "Walk-in",
      "Mobile": s.customer_mobile || "",
      "Email": s.customer_email || "",
      "Items": s.sale_items?.map(i => i.name + " x" + i.qty).join(", ") || "",
      "Payment Method": s.payment_method,
      "Subtotal (AED)": Number(s.subtotal).toFixed(2),
      "Discount (AED)": Number(s.discount || 0).toFixed(2),
      "Total (AED)": Number(s.total).toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [20,16,18,14,22,40,14,14,14,14].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `${SHOP.name}_Sales_Report.xlsx`);
  };

  return (
    <Modal show onClose={onClose} wide>
      <h3>📊 Sales Report</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {[["Sales", sales.length], ["Items Sold", items], ["Discounts", fmt(disc)], ["Revenue", fmt(total)]].map(([l, v]) => (
          <div key={l} className="stat-c" style={{ padding: 12 }}>
            <div className="stat-l">{l}</div>
            <div className="stat-v" style={{ fontSize: 16 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ overflowX: "auto", maxHeight: 320, overflowY: "auto", marginBottom: 16 }}>
        <table className="report-table">
          <thead><tr><th>Date</th><th>Txn ID</th><th>Customer</th><th>Payment</th><th>Discount</th><th>Total</th></tr></thead>
          <tbody>
            {sales.map(s => (
              <tr key={s.id}>
                <td style={{ whiteSpace: "nowrap" }}>{new Date(s.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td>{s.txn_id}</td>
                <td>{s.customer_name}{s.customer_mobile ? <><br /><span style={{ fontSize: 10, color: "#7A7870" }}>{s.customer_mobile}</span></> : ""}</td>
                <td>{s.payment_method}</td>
                <td>{s.discount > 0 ? fmt(s.discount) : "—"}</td>
                <td style={{ fontWeight: 600 }}>{fmt(s.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td colSpan={5} style={{ fontWeight: 700, padding: "8px 10px", background: "#F0EFE9" }}>TOTAL</td><td style={{ fontWeight: 700, padding: "8px 10px", background: "#F0EFE9" }}>{fmt(total)}</td></tr></tfoot>
        </table>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Close</button>
        <button className="b-def" onClick={handleExcel}>⬇ Download Excel</button>
        <button className="b-pri" onClick={handlePrint}>🖨 Print A4</button>
      </div>
    </Modal>
  );
}

/* ── Customers Report Modal ───────────────────────────────────────────────── */
function CustomersModal({ sales, onClose }) {
  // Build unique customers from sales
  const customers = Object.values(
    sales.reduce((acc, s) => {
      const key = s.customer_mobile || s.customer_email || s.customer_name;
      if (!key || s.customer_name === "Walk-in") return acc;
      if (!acc[key]) {
        acc[key] = { name: s.customer_name, mobile: s.customer_mobile || "", email: s.customer_email || "", purchases: 0, total: 0, last: s.created_at };
      }
      acc[key].purchases += 1;
      acc[key].total += Number(s.total);
      if (new Date(s.created_at) > new Date(acc[key].last)) acc[key].last = s.created_at;
      return acc;
    }, {})
  );

  const handlePrint = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>Customer List - ${SHOP.name}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:12px;padding:20px}
        h1{font-size:22px;margin-bottom:4px}h2{font-size:13px;font-weight:normal;color:#666;margin-bottom:4px}
        .meta{font-size:11px;color:#666;margin-bottom:20px}
        table{width:100%;border-collapse:collapse}
        th{background:#f0f0f0;padding:8px;text-align:left;font-size:11px;text-transform:uppercase;border-bottom:2px solid #ccc}
        td{padding:7px 8px;border-bottom:1px solid #eee}
        .footer{margin-top:30px;font-size:10px;color:#999;text-align:center}
      </style></head><body>
      <h1>${SHOP.name}</h1><h2>${SHOP.legal}</h2>
      <div class="meta">${SHOP.address} | ${SHOP.phone}</div>
      <h2 style="font-size:16px;font-weight:bold;margin-bottom:12px">Customer Contact List</h2>
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Email</th><th>Purchases</th><th>Total Spent</th><th>Last Visit</th></tr></thead>
        <tbody>
          ${customers.map((c, i) => `<tr>
            <td>${i + 1}</td><td>${c.name}</td><td>${c.mobile}</td><td>${c.email}</td>
            <td>${c.purchases}</td><td>AED ${c.total.toFixed(2)}</td>
            <td>${new Date(c.last).toLocaleDateString("en-GB")}</td>
          </tr>`).join("")}
        </tbody>
      </table>
      <div class="footer">Total customers: ${customers.length} | Printed on ${new Date().toLocaleString("en-GB")} | ${SHOP.name}</div>
      </body></html>
    `);
    w.document.close(); w.print();
  };

  const handleExcel = () => {
    const rows = customers.map((c, i) => ({
      "#": i + 1,
      "Name": c.name,
      "Mobile": c.mobile,
      "Email": c.email,
      "Total Purchases": c.purchases,
      "Total Spent (AED)": c.total.toFixed(2),
      "Last Visit": new Date(c.last).toLocaleDateString("en-GB"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [5, 20, 16, 24, 14, 16, 14].map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `${SHOP.name}_Customers.xlsx`);
  };

  return (
    <Modal show onClose={onClose} wide>
      <h3>👥 Customer Contacts</h3>
      <p style={{ fontSize: 12, color: "#7A7870", marginBottom: 14, marginTop: -10 }}>{customers.length} unique customers with contact info</p>
      <div style={{ overflowX: "auto", maxHeight: 360, overflowY: "auto", marginBottom: 16 }}>
        <table className="report-table">
          <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Purchases</th><th>Total Spent</th><th>Last Visit</th></tr></thead>
          <tbody>
            {customers.length === 0
              ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#7A7870", padding: "20px" }}>No customer contacts yet — collect info at checkout</td></tr>
              : customers.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.mobile || "—"}</td>
                  <td>{c.email || "—"}</td>
                  <td style={{ textAlign: "center" }}>{c.purchases}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(c.total)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(c.last).toLocaleDateString("en-GB")}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Close</button>
        <button className="b-def" onClick={handleExcel}>⬇ Download Excel</button>
        <button className="b-pri" onClick={handlePrint}>🖨 Print A4</button>
      </div>
    </Modal>
  );
}

/* ── Owner Dashboard ──────────────────────────────────────────────────────── */
function OwnerView({ products }) {
  const [tab, setTab] = useState("sales");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);

  useEffect(() => {
    setLoading(true);
    supabase.from("sales").select("*, sale_items(*)").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => { setSales(data || []); setLoading(false); });
  }, []);

  const rev = sales.reduce((s, x) => s + Number(x.total), 0);
  const sold = sales.reduce((s, x) => s + (x.sale_items?.reduce((a, c) => a + c.qty, 0) || 0), 0);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
      {/* Tab row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[["sales", "Sales History"], ["inventory", "Inventory"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", border: tab === id ? "none" : "1.5px solid #E5E3DB", background: tab === id ? "#1A1917" : "#fff", color: tab === id ? "#fff" : "#7A7870", transition: "all .15s" }}>{lbl}</button>
        ))}
      </div>

      {tab === "sales" && <>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {[["Total Sales", sales.length], ["Revenue", fmt(rev)], ["Items Sold", sold]].map(([l, v]) => (
            <div key={l} className="stat-c"><div className="stat-l">{l}</div><div className="stat-v" style={{ fontSize: typeof v === "string" ? 15 : 26 }}>{v}</div></div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="action-row">
          <button className="action-btn primary" onClick={() => setShowReport(true)}>📊 Sales Report</button>
          <button className="action-btn" onClick={() => setShowCustomers(true)}>👥 Customer Contacts</button>
        </div>

        {/* Sales list */}
        {loading ? <p style={{ fontSize: 13, color: "#7A7870" }}>Loading…</p> : sales.length
          ? sales.map(s => (
            <div key={s.id} style={{ background: "#fff", border: "1.5px solid #E5E3DB", borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.customer_name}{s.customer_mobile ? " · " + s.customer_mobile : ""}</div>
                <div style={{ fontSize: 11, color: "#7A7870", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{s.sale_items?.map(i => i.name + " ×" + i.qty).join(", ")} · {s.payment_method}</div>
                <div style={{ fontSize: 11, color: "#7A7870", marginTop: 2 }}>{new Date(s.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {s.txn_id}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", color: "#2D5A3D" }}>{fmt(s.total)}</div>
            </div>
          ))
          : <div style={{ textAlign: "center", padding: "40px 0", color: "#7A7870", fontSize: 13, background: "#fff", border: "1.5px solid #E5E3DB", borderRadius: 12 }}>No sales yet — complete a transaction to see history.</div>
        }
      </>}

      {tab === "inventory" && <>
        <div className="inv-r" style={{ background: "#F0EFE9", marginBottom: 8 }}>
          {["Product", "Price", "Stock", "Status"].map((h, i) => <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#7A7870", textTransform: "uppercase", letterSpacing: ".06em", textAlign: i > 1 ? "center" : "left" }}>{h}</div>)}
        </div>
        {products.map(p => {
          const [bg, col, lbl] = p.stock === 0 ? ["#FCECEA", "#C94A3F", "Out"] : p.stock <= 3 ? ["#FFF4E5", "#B97B2A", "Low"] : ["#EDFAF1", "#3A7D44", "OK"];
          return <div key={p.id} className="inv-r"><div><div style={{ fontSize: 13, fontWeight: 600 }}>{p.emoji} {p.name}</div><div style={{ fontSize: 11, color: "#7A7870" }}>{p.category}</div></div><div style={{ fontSize: 13, fontWeight: 500 }}>{fmt(discPrice(p))}</div><div style={{ fontSize: 13, fontWeight: 500, textAlign: "center" }}>{p.stock}</div><div style={{ textAlign: "center" }}><span className="ibadge" style={{ background: bg, color: col }}>{lbl}</span></div></div>;
        })}
      </>}

      {showReport && <SalesReportModal sales={sales} onClose={() => setShowReport(false)} />}
      {showCustomers && <CustomersModal sales={sales} onClose={() => setShowCustomers(false)} />}
    </div>
  );
}

/* ── Mobile Cart Drawer ───────────────────────────────────────────────────── */
function MobileCartDrawer({ cart, cd, setCd, cdInput, setCdInput, sub, discAmt, total, onCheckout, onChangeQty, onRemove, onItemDisc, cartOpen, setCartOpen }) {
  return (
    <div className="cart-p" style={{ background: "#fff", borderTop: "2px solid #E5E3DB", display: "flex", flexDirection: "column" }}>
      {/* Cart toggle bar */}
      <div onClick={() => setCartOpen(o => !o)}
        style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>🛍️ Cart</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#7A7870", background: "#F0EFE9", padding: "2px 9px", borderRadius: 10 }}>{cart.reduce((s, c) => s + c.qty, 0)} items</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>{fmt(total)}</span>
          <span style={{ fontSize: 18, color: "#7A7870" }}>{cartOpen ? "▼" : "▲"}</span>
        </div>
      </div>

      {/* Expandable cart content */}
      {cartOpen && (
        <div style={{ maxHeight: "38dvh", overflowY: "auto", padding: "0 16px" }}>
          {cart.length === 0
            ? <div style={{ textAlign: "center", padding: "16px 0", color: "#7A7870", fontSize: 13 }}>Cart is empty — tap a product to add</div>
            : cart.map(c => {
              const e = effPrice(c), hd = c.discount > 0 || c.iDisc > 0;
              const dl = c.iDisc > 0 ? `-${c.iDt === "pct" ? c.iDisc + "%" : "AED " + c.iDisc}` : c.discount > 0 ? `-${c.disc_type === "pct" ? c.discount + "%" : "AED " + c.discount}` : "";
              return (
                <div key={c.id} className="ci">
                  <div className="ci-av">{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#7A7870" }}>{fmt(e)}</span>
                      {hd && <span style={{ fontSize: 10, color: "#7A7870", textDecoration: "line-through" }}>{fmt(c.price)}</span>}
                      {dl ? <button className="cidt" onClick={() => onItemDisc(c)}>{dl}</button> : <button className="ciad" onClick={() => onItemDisc(c)}>+ disc</button>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <button className="qbtn" onClick={() => onChangeQty(c.id, -1)}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{c.qty}</span>
                      <button className="qbtn" onClick={() => onChangeQty(c.id, 1)}>+</button>
                      <span style={{ fontSize: 12, color: "#7A7870", marginLeft: 4 }}>{fmt(e * c.qty)}</span>
                    </div>
                  </div>
                  <button onClick={() => onRemove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7870", fontSize: 20, padding: "4px 2px", lineHeight: 1, flexShrink: 0 }}>×</button>
                </div>
              );
            })}

          {/* Discount row */}
          <div style={{ padding: "8px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7A7870", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>Cart Discount</div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <input type="number" min="0" value={cdInput} onChange={e => setCdInput(e.target.value)} placeholder="0"
                style={{ width: 56, padding: "7px 8px", fontSize: 13, border: "1.5px solid #E5E3DB", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", outline: "none" }} />
              <select value={cd.t} onChange={e => setCd(x => ({ ...x, t: e.target.value }))}
                style={{ padding: "7px 5px", fontSize: 13, border: "1.5px solid #E5E3DB", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", outline: "none" }}>
                <option value="pct">%</option><option value="fixed">AED</option>
              </select>
              <button onClick={() => { const v = parseFloat(cdInput) || 0; if (v > 0) setCd({ v, t: cd.t, on: true }); }}
                style={{ padding: "7px 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, background: "#F0EFE9", border: "1px solid #E5E3DB", cursor: "pointer" }}>Apply</button>
              {cd.on && <button onClick={() => { setCd({ v: 0, t: "pct", on: false }); setCdInput(""); }}
                style={{ fontSize: 12, fontWeight: 600, padding: "7px 10px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#C94A3F" }}>Clear</button>}
            </div>
          </div>

          {/* Totals */}
          <div style={{ borderTop: "1px solid #E5E3DB", paddingTop: 8, paddingBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7A7870", marginBottom: 3 }}><span>Subtotal</span><span>{fmt(sub)}</span></div>
            {discAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#C94A3F", marginBottom: 3 }}><span>Discount</span><span>−{fmt(discAmt)}</span></div>}
          </div>
        </div>
      )}

      {/* Always visible checkout button */}
      <div style={{ padding: "10px 16px", borderTop: cartOpen ? "1px solid #E5E3DB" : "none" }}>
        <button onClick={onCheckout} disabled={cart.length === 0}
          style={{ width: "100%", padding: 13, borderRadius: 12, background: cart.length === 0 ? "#D5D3CB" : "#1A1917", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: cart.length === 0 ? "not-allowed" : "pointer" }}>
          Checkout → {cart.length > 0 && fmt(total)}
        </button>
      </div>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────────────────────── */
export default function App() {
  useStyles();
  const [view, setView] = useState("cashier");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [cd, setCd] = useState({ v: 0, t: "pct", on: false });
  const [cdInput, setCdInput] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  const [prodModal, setProdModal] = useState(null);
  const [itemDiscModal, setItemDiscModal] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); }, []);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error) { showToast("Error loading products"); return; }
    if (!data.length) {
      const { data: s } = await supabase.from("products").insert(SEED).select();
      setProducts(s || []);
    } else setProducts(data);
    setLoading(false);
  }, [showToast]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const saveProduct = async (form, id) => {
    const p = { name: form.name.trim(), category: form.category, price: parseFloat(form.price) || 0, stock: parseInt(form.stock) || 0, emoji: form.emoji || "👕", discount: parseFloat(form.discount) || 0, disc_type: form.disc_type };
    if (!p.name || !p.price) { showToast("Name and price are required"); return; }
    if (id) {
      await supabase.from("products").update(p).eq("id", id);
      setCart(c => c.map(ci => ci.id === id ? { ...ci, ...p } : ci));
      showToast("Product updated ✓");
    } else {
      await supabase.from("products").insert(p);
      showToast("Product added ✓");
    }
    setProdModal(null); loadProducts();
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    setCart(c => c.filter(ci => ci.id !== id));
    setProdModal(null); loadProducts(); showToast("Product deleted");
  };

  const addToCart = (p) => {
    if (p.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(c => c.id === p.id);
      if (ex) { if (ex.qty >= p.stock) return prev; return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c); }
      return [...prev, { ...p, qty: 1, iDisc: 0, iDt: "pct" }];
    });
    if (isMobile) setCartOpen(true);
  };

  const changeQty = (id, d) => setCart(prev => {
    const c = prev.find(x => x.id === id); if (!c) return prev;
    if (c.qty + d <= 0) return prev.filter(x => x.id !== id);
    return prev.map(x => x.id === id ? { ...x, qty: x.qty + d } : x);
  });
  const removeItem = (id) => setCart(prev => prev.filter(x => x.id !== id));
  const saveItemDisc = (val, type) => { setCart(prev => prev.map(c => c.id === itemDiscModal.id ? { ...c, iDisc: val, iDt: type } : c)); setItemDiscModal(null); };
  const clearItemDisc = () => { setCart(prev => prev.map(c => c.id === itemDiscModal.id ? { ...c, iDisc: 0 } : c)); setItemDiscModal(null); };

  const sub = cart.reduce((s, c) => s + effPrice(c) * c.qty, 0);
  const discAmt = cd.on && cd.v > 0 ? (cd.t === "pct" ? sub * cd.v / 100 : Math.min(cd.v, sub)) : 0;
  const total = sub - discAmt;
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const confirmSale = async (form, sub, disc, total) => {
    setSavingSale(true);
    const txn_id = "TXN" + Date.now().toString().slice(-6);
    const { data: sd, error } = await supabase.from("sales").insert({
      txn_id, customer_name: form.name || "Walk-in", customer_mobile: form.mobile || null,
      customer_email: form.email || null, payment_method: form.payment,
      subtotal: sub, discount: disc, vat: 0, total,
    }).select().single();
    if (error) { showToast("Error saving sale"); setSavingSale(false); return; }
    const items = cart.map(c => ({ sale_id: sd.id, product_id: c.id, name: c.name, emoji: c.emoji, qty: c.qty, unit_price: effPrice(c), line_total: effPrice(c) * c.qty }));
    await supabase.from("sale_items").insert(items);
    for (const c of cart) {
      const p = products.find(x => x.id === c.id);
      if (p) await supabase.from("products").update({ stock: Math.max(0, p.stock - c.qty) }).eq("id", c.id);
    }
    setReceipt({ ...sd, items });
    setCart([]); setCd({ v: 0, t: "pct", on: false }); setCdInput("");
    setCheckoutOpen(false); setSavingSale(false); loadProducts();
    showToast("Sale saved ✓");
  };

  const cats = ["All", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => (activeCat === "All" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, color: "#7A7870", background: "#F7F6F3" }}>
      <div style={{ fontSize: 44 }}>🔌</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>Connecting to Supabase…</div>
    </div>
  );

  /* ── Shared left panel content ── */
  const leftPanel = (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 }}>
      {/* Topbar */}
      <div className="tb-p" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "1px solid #E5E3DB", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1A1917", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.3px", lineHeight: 1.2 }}>{SHOP.name}</div>
            <div className="brand-legal" style={{ fontSize: 9, color: "#7A7870", letterSpacing: ".02em" }}>{SHOP.legal}</div>
          </div>
        </div>
        <div className="tabs-ui">
          {[["cashier", "Cashier"], ["owner", "Owner"]].map(([v, l]) => (
            <button key={v} className={`tab-ui${view === v ? " on" : ""}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
        <Clock />
      </div>

      {view === "cashier" && <>
        {/* Toolbar */}
        <div className="tl-p" style={{ padding: "12px 20px", background: "#fff", borderBottom: "1px solid #E5E3DB", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#7A7870", fontSize: 14, pointerEvents: "none" }}>🔍</span>
              <input style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 9, border: "1.5px solid #E5E3DB", background: "#F7F6F3", fontSize: 13, color: "#1A1917", outline: "none" }}
                placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setProdModal("add")}
              style={{ padding: "9px 16px", borderRadius: 9, background: "#1A1917", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>＋ Product</button>
          </div>
          <div className="cat-row">
            {cats.map(c => <button key={c} className={`cat-p${activeCat === c ? " on" : ""}`} onClick={() => setActiveCat(c)}>{c}</button>)}
          </div>
        </div>

        {/* Product grid — scrollable */}
        <div className="gs-p" style={{ flex: 1, overflowY: "auto", padding: "16px 20px", WebkitOverflowScrolling: "touch" }}>
          {filtered.length === 0
            ? <div style={{ color: "#7A7870", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No products found</div>
            : <div className="pg" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: 10 }}>
              {filtered.map(p => {
                const dp2 = discPrice(p), hd = p.discount > 0, so = p.stock === 0, sl = p.stock > 0 && p.stock <= 3;
                return (
                  <div key={p.id} className={`pcard${so ? " out" : ""}`} onClick={() => addToCart(p)}>
                    {hd && <div className="dbadge">{p.disc_type === "pct" ? p.discount + "%" : "AED " + p.discount} OFF</div>}
                    <div className="ei" onClick={e => { e.stopPropagation(); setProdModal(p); }}>✎</div>
                    <div style={{ fontSize: 30, textAlign: "center", marginBottom: 9 }}>{p.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.35, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#7A7870", marginBottom: 10 }}>{p.category}</div>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(dp2)}</div>
                        {hd && <div style={{ fontSize: 10, color: "#7A7870", textDecoration: "line-through" }}>{fmt(p.price)}</div>}
                      </div>
                      <span className={`stag ${so ? "s-ou" : sl ? "s-lo" : "s-ok"}`}>{so ? "Out" : sl ? p.stock + " left" : p.stock}</span>
                    </div>
                  </div>
                );
              })}
            </div>}
        </div>
      </>}

      {view === "owner" && <OwnerView products={products} />}
    </div>
  );

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#F7F6F3" }}>
      {toast && <div className="toast">{toast}</div>}

      {isMobile ? (
        /* ── Mobile layout ── */
        <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {leftPanel}
          </div>
          <MobileCartDrawer
            cart={cart} cd={cd} setCd={setCd} cdInput={cdInput} setCdInput={setCdInput}
            sub={sub} discAmt={discAmt} total={total}
            onCheckout={() => setCheckoutOpen(true)}
            onChangeQty={changeQty} onRemove={removeItem}
            onItemDisc={(c) => setItemDiscModal(c)}
            cartOpen={cartOpen} setCartOpen={setCartOpen}
          />
        </div>
      ) : (
        /* ── Desktop/Tablet layout ── */
        <div className="pos-g" style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "100vh", overflow: "hidden" }}>
          {leftPanel}

          {/* Cart panel */}
          <div className="cart-p" style={{ background: "#fff", borderLeft: "1.5px solid #E5E3DB", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #E5E3DB", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.3px" }}>Cart</h3>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#7A7870", background: "#F0EFE9", padding: "3px 10px", borderRadius: 10 }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px" }}>
              {cart.length === 0
                ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, gap: 8, color: "#7A7870" }}>
                  <span style={{ fontSize: 44, opacity: .2 }}>🛍️</span>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Cart is empty</div>
                  <div style={{ fontSize: 12 }}>Tap a product to add</div>
                </div>
                : cart.map(c => {
                  const e = effPrice(c), hd = c.discount > 0 || c.iDisc > 0;
                  const dl = c.iDisc > 0 ? `-${c.iDt === "pct" ? c.iDisc + "%" : "AED " + c.iDisc} extra` : c.discount > 0 ? `-${c.disc_type === "pct" ? c.discount + "%" : "AED " + c.discount}` : "";
                  return (
                    <div key={c.id} className="ci">
                      <div className="ci-av">{c.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#7A7870" }}>{fmt(e)} each</span>
                          {hd && <span style={{ fontSize: 10, color: "#7A7870", textDecoration: "line-through" }}>{fmt(c.price)}</span>}
                          {dl ? <button className="cidt" onClick={() => setItemDiscModal(c)}>{dl}</button> : <button className="ciad" onClick={() => setItemDiscModal(c)}>+ disc</button>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
                          <button className="qbtn" onClick={() => changeQty(c.id, -1)}>−</button>
                          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{c.qty}</span>
                          <button className="qbtn" onClick={() => changeQty(c.id, 1)}>+</button>
                          <span style={{ fontSize: 12, color: "#7A7870", marginLeft: 4 }}>{fmt(e * c.qty)}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7870", fontSize: 20, padding: "4px 2px", lineHeight: 1, flexShrink: 0, marginTop: 4 }}>×</button>
                    </div>
                  );
                })}
            </div>

            <div style={{ padding: "14px 16px", borderTop: "1.5px solid #E5E3DB", flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7A7870", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>Cart Discount</div>
              <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 12 }}>
                <input type="number" min="0" value={cdInput} onChange={e => setCdInput(e.target.value)} placeholder="0"
                  style={{ width: 58, padding: "7px 8px", fontSize: 13, border: "1.5px solid #E5E3DB", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", outline: "none" }} />
                <select value={cd.t} onChange={e => setCd(x => ({ ...x, t: e.target.value }))}
                  style={{ padding: "7px 5px", fontSize: 13, border: "1.5px solid #E5E3DB", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", outline: "none" }}>
                  <option value="pct">%</option><option value="fixed">AED</option>
                </select>
                <button onClick={() => { const v = parseFloat(cdInput) || 0; if (v > 0) setCd({ v, t: cd.t, on: true }); }}
                  style={{ padding: "7px 12px", fontSize: 12, fontWeight: 600, borderRadius: 8, background: "#F0EFE9", border: "1px solid #E5E3DB", cursor: "pointer" }}>Apply</button>
                {cd.on && <button onClick={() => { setCd({ v: 0, t: "pct", on: false }); setCdInput(""); }}
                  style={{ fontSize: 12, fontWeight: 600, padding: "7px 10px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#C94A3F" }}>Clear</button>}
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7A7870", marginBottom: 4 }}><span>Subtotal</span><span>{fmt(sub)}</span></div>
                {discAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#C94A3F", marginBottom: 4 }}><span>Discount ({cd.t === "pct" ? cd.v + "%" : "AED " + cd.v})</span><span>−{fmt(discAmt)}</span></div>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, letterSpacing: "-.4px", marginBottom: 12 }}><span>Total</span><span>{fmt(total)}</span></div>
              <button onClick={() => setCheckoutOpen(true)} disabled={cart.length === 0}
                style={{ width: "100%", padding: 13, borderRadius: 12, background: cart.length === 0 ? "#D5D3CB" : "#1A1917", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: cart.length === 0 ? "not-allowed" : "pointer" }}>
                Checkout →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {prodModal && <ProductModal product={prodModal === "add" ? null : prodModal} onSave={saveProduct} onDelete={deleteProduct} onClose={() => setProdModal(null)} />}
      {itemDiscModal && <ItemDiscModal item={itemDiscModal} onSave={saveItemDisc} onClear={clearItemDisc} onClose={() => setItemDiscModal(null)} />}
      {checkoutOpen && <CheckoutModal cart={cart} cd={cd} onConfirm={confirmSale} onClose={() => setCheckoutOpen(false)} saving={savingSale} />}
      {receipt && <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
