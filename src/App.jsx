import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://asvjmruxsdcjjqktjzye.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdmptcnV4c2Rjampxa3RqenllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODAzOTksImV4cCI6MjA5NDI1NjM5OX0.14apCycTxViARAJUmkOC-5di2oiLkDuvjnY3srTL88k";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{height:100%;font-family:'DM Sans',system-ui,sans-serif;background:#F7F6F3;color:#1A1917}
input,select,button{font-family:'DM Sans',system-ui,sans-serif}
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
.tab-ui{padding:6px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#7A7870;transition:all .15s}
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

@media(max-width:900px){.pos-g{grid-template-columns:1fr 300px!important}.pg{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))!important}}
@media(max-width:640px){
  .pos-g{grid-template-columns:1fr!important;grid-template-rows:1fr auto!important;height:100dvh!important}
  .cart-p{border-left:none!important;border-top:1.5px solid #E5E3DB!important;max-height:45dvh!important}
  .pg{grid-template-columns:repeat(auto-fill,minmax(108px,1fr))!important;gap:8px!important}
  .tb-p{padding:10px 14px!important}.tl-p{padding:10px 14px!important}
  .clk{display:none!important}.gs-p{padding:12px 14px!important}
  .cbody{max-height:110px!important}
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

function Modal({ show, onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    if (show) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Fld({ label, opt, children, cols }) {
  return (
    <div className="fld" style={cols ? { gridColumn: cols } : {}}>
      <label>{label}{opt && <span style={{ color: "#7A7870", textTransform: "none", fontSize: 10, marginLeft: 4, fontWeight: 400, letterSpacing: 0 }}>optional</span>}</label>
      {children}
    </div>
  );
}

function ProductModal({ product, onSave, onDelete, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState({ name: product?.name || "", category: product?.category || "Tops", price: product?.price || "", stock: product?.stock || "", emoji: product?.emoji || "👔", discount: product?.discount || "", disc_type: product?.disc_type || "pct" });
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
        {isEdit && <button className="b-dan" onClick={() => onDelete(product.id)}>Delete</button>}
        <button className="b-pri" onClick={() => { if (!form.name.trim() || !form.price) return; onSave(form, product?.id); }}>{isEdit ? "Save Changes" : "Add Product"}</button>
      </div>
    </Modal>
  );
}

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

function CheckoutModal({ cart, cd, onConfirm, onClose, saving }) {
  const [form, setForm] = useState({ name: "", mobile: "", email: "", payment: "Cash" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const sub = cart.reduce((s, c) => s + effPrice(c) * c.qty, 0);
  const disc = cd.on && cd.v > 0 ? (cd.t === "pct" ? sub * cd.v / 100 : Math.min(cd.v, sub)) : 0;
  const vat = (sub - disc) * 0.05, total = sub - disc + vat;
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
        <div className="rr" style={{ color: "#7A7870" }}><span>VAT 5%</span><span>{fmt(vat)}</span></div>
        <div className="rr" style={{ fontWeight: 700, fontSize: 14 }}><span>Total</span><span>{fmt(total)}</span></div>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Cancel</button>
        <button className="b-pri" onClick={() => onConfirm(form, sub, disc, vat, total)} disabled={saving}>{saving ? "Saving…" : "Confirm Sale →"}</button>
      </div>
    </Modal>
  );
}

function ReceiptModal({ sale, onClose }) {
  if (!sale) return null;
  return (
    <Modal show onClose={onClose}>
      <h3 style={{ color: "#3A7D44" }}>✓ Sale Complete!</h3>
      <div className="rbk">
        <div className="rr" style={{ fontWeight: 700 }}><span>{sale.txn_id}</span><span>{new Date(sale.created_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>
        <div className="rd" />
        {sale.customer_name !== "Walk-in" && <div className="rr"><span>Customer</span><span>{sale.customer_name}</span></div>}
        {sale.customer_mobile && <div className="rr"><span>Mobile</span><span>{sale.customer_mobile}</span></div>}
        {sale.customer_email && <div className="rr"><span>Email</span><span>{sale.customer_email}</span></div>}
        <div className="rr"><span>Payment</span><span>{sale.payment_method}</span></div>
        <div className="rd" />
        {sale.items?.map((it, i) => <div key={i} className="rr"><span>{it.emoji} {it.name} ×{it.qty}</span><span>{fmt(it.line_total)}</span></div>)}
        <div className="rd" />
        {sale.discount > 0 && <div className="rr" style={{ color: "#C94A3F" }}><span>Discount</span><span>−{fmt(sale.discount)}</span></div>}
        <div className="rr" style={{ color: "#7A7870" }}><span>VAT 5%</span><span>{fmt(sale.vat)}</span></div>
        <div className="rr" style={{ fontWeight: 700, fontSize: 15 }}><span>Total</span><span>{fmt(sale.total)}</span></div>
      </div>
      <div className="mbtns">
        <button className="b-def" onClick={onClose}>Close</button>
        <button className="b-pri" onClick={() => window.print()}>🖨 Print Receipt</button>
      </div>
    </Modal>
  );
}

function OwnerView({ products }) {
  const [tab, setTab] = useState("sales");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (tab !== "sales") return;
    setLoading(true);
    supabase.from("sales").select("*, sale_items(*)").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setSales(data || []); setLoading(false); });
  }, [tab]);
  const rev = sales.reduce((s, x) => s + Number(x.total), 0);
  const sold = sales.reduce((s, x) => s + (x.sale_items?.reduce((a, c) => a + c.qty, 0) || 0), 0);
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[["sales", "Sales History"], ["inventory", "Inventory"]].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: "8px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", border: tab === id ? "none" : "1.5px solid #E5E3DB", background: tab === id ? "#1A1917" : "#fff", color: tab === id ? "#fff" : "#7A7870", transition: "all .15s" }}>{lbl}</button>
        ))}
      </div>
      {tab === "sales" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
          {[["Total Sales", sales.length], ["Revenue", fmt(rev)], ["Items Sold", sold]].map(([l, v]) => (
            <div key={l} className="stat-c"><div className="stat-l">{l}</div><div className="stat-v" style={{ fontSize: typeof v === "string" ? 15 : 26 }}>{v}</div></div>
          ))}
        </div>
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
    </div>
  );
}

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
  const [prodModal, setProdModal] = useState(null);
  const [itemDiscModal, setItemDiscModal] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [savingSale, setSavingSale] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); }, []);

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
    if (id) { await supabase.from("products").update(p).eq("id", id); setCart(c => c.map(ci => ci.id === id ? { ...ci, ...p } : ci)); showToast("Product updated ✓"); }
    else { await supabase.from("products").insert(p); showToast("Product added ✓"); }
    setProdModal(null); loadProducts();
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    setCart(c => c.filter(ci => ci.id !== id));
    setProdModal(null); loadProducts(); showToast("Product deleted");
  };

  const addToCart = (p) => {
    if (p.stock === 0) return;
    setCart(prev => { const ex = prev.find(c => c.id === p.id); if (ex) { if (ex.qty >= p.stock) return prev; return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c); } return [...prev, { ...p, qty: 1, iDisc: 0, iDt: "pct" }]; });
  };
  const changeQty = (id, d) => setCart(prev => { const c = prev.find(x => x.id === id); if (!c) return prev; if (c.qty + d <= 0) return prev.filter(x => x.id !== id); return prev.map(x => x.id === id ? { ...x, qty: x.qty + d } : x); });
  const removeItem = (id) => setCart(prev => prev.filter(x => x.id !== id));
  const saveItemDisc = (val, type) => { setCart(prev => prev.map(c => c.id === itemDiscModal.id ? { ...c, iDisc: val, iDt: type } : c)); setItemDiscModal(null); };
  const clearItemDisc = () => { setCart(prev => prev.map(c => c.id === itemDiscModal.id ? { ...c, iDisc: 0 } : c)); setItemDiscModal(null); };

  const sub = cart.reduce((s, c) => s + effPrice(c) * c.qty, 0);
  const discAmt = cd.on && cd.v > 0 ? (cd.t === "pct" ? sub * cd.v / 100 : Math.min(cd.v, sub)) : 0;
  const vat = (sub - discAmt) * 0.05, total = sub - discAmt + vat;
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const confirmSale = async (form, sub, disc, vat, total) => {
    setSavingSale(true);
    const txn_id = "TXN" + Date.now().toString().slice(-6);
    const { data: sd, error } = await supabase.from("sales").insert({ txn_id, customer_name: form.name || "Walk-in", customer_mobile: form.mobile || null, customer_email: form.email || null, payment_method: form.payment, subtotal: sub, discount: disc, vat, total }).select().single();
    if (error) { showToast("Error saving sale"); setSavingSale(false); return; }
    const items = cart.map(c => ({ sale_id: sd.id, product_id: c.id, name: c.name, emoji: c.emoji, qty: c.qty, unit_price: effPrice(c), line_total: effPrice(c) * c.qty }));
    await supabase.from("sale_items").insert(items);
    for (const c of cart) { const p = products.find(x => x.id === c.id); if (p) await supabase.from("products").update({ stock: Math.max(0, p.stock - c.qty) }).eq("id", c.id); }
    setReceipt({ ...sd, items }); setCart([]); setCd({ v: 0, t: "pct", on: false }); setCdInput("");
    setCheckoutOpen(false); setSavingSale(false); loadProducts(); showToast("Sale saved ✓");
  };

  const cats = ["All", ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => (activeCat === "All" || p.category === activeCat) && p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 12, color: "#7A7870", background: "#F7F6F3" }}>
      <div style={{ fontSize: 44 }}>🔌</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>Connecting to Supabase…</div>
    </div>
  );

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#F7F6F3" }}>
      {toast && <div className="toast">{toast}</div>}

      <div className="pos-g" style={{ display: "grid", gridTemplateColumns: "1fr 360px", height: "100vh", overflow: "hidden" }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <div className="tb-p" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "1px solid #E5E3DB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1A1917" }} />
              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.3px" }}>Youth <span style={{ color: "#7A7870", fontWeight: 400 }}>Fashion Shop</span></span>
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
            <div className="tl-p" style={{ padding: "12px 20px", background: "#fff", borderBottom: "1px solid #E5E3DB" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#7A7870", fontSize: 14, pointerEvents: "none" }}>🔍</span>
                  <input style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 9, border: "1.5px solid #E5E3DB", background: "#F7F6F3", fontSize: 13, color: "#1A1917", outline: "none" }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => setProdModal("add")} style={{ padding: "9px 16px", borderRadius: 9, background: "#1A1917", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>＋ Product</button>
              </div>
              <div className="cat-row">
                {cats.map(c => <button key={c} className={`cat-p${activeCat === c ? " on" : ""}`} onClick={() => setActiveCat(c)}>{c}</button>)}
              </div>
            </div>

            {/* Grid */}
            <div className="gs-p" style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
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

        {/* Cart */}
        <div className="cart-p" style={{ background: "#fff", borderLeft: "1.5px solid #E5E3DB", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #E5E3DB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.3px" }}>Cart</h3>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7A7870", background: "#F0EFE9", padding: "3px 10px", borderRadius: 10 }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
          </div>

          <div className="cbody" style={{ flex: 1, overflowY: "auto", padding: "4px 16px" }}>
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

          {/* Footer */}
          <div style={{ padding: "14px 16px", borderTop: "1.5px solid #E5E3DB" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7A7870", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 7 }}>Cart Discount</div>
            <div style={{ display: "flex", gap: 5, alignItems: "center", marginBottom: 12 }}>
              <input type="number" min="0" value={cdInput} onChange={e => setCdInput(e.target.value)} placeholder="0" style={{ width: 58, padding: "7px 8px", fontSize: 13, border: "1.5px solid #E5E3DB", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", outline: "none" }} />
              <select value={cd.t} onChange={e => setCd(x => ({ ...x, t: e.target.value }))} style={{ padding: "7px 5px", fontSize: 13, border: "1.5px solid #E5E3DB", borderRadius: 8, background: "#F7F6F3", color: "#1A1917", outline: "none" }}>
                <option value="pct">%</option><option value="fixed">AED</option>
              </select>
              <button onClick={() => { const v = parseFloat(cdInput) || 0; if (v > 0) setCd({ v, t: cd.t, on: true }); }} style={{ padding: "7px 12px", fontSize: 12, fontWeight: 700, borderRadius: 8, background: "#F0EFE9", border: "1px solid #E5E3DB", cursor: "pointer" }}>Apply</button>
              {cd.on && <button onClick={() => { setCd({ v: 0, t: "pct", on: false }); setCdInput(""); }} style={{ fontSize: 12, fontWeight: 700, padding: "7px 10px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#C94A3F" }}>Clear</button>}
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7A7870", marginBottom: 4 }}><span>Subtotal</span><span>{fmt(sub)}</span></div>
              {discAmt > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#C94A3F", marginBottom: 4 }}><span>Discount ({cd.t === "pct" ? cd.v + "%" : "AED " + cd.v})</span><span>−{fmt(discAmt)}</span></div>}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7A7870", marginBottom: 4 }}><span>VAT (5%)</span><span>{fmt(vat)}</span></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, letterSpacing: "-.4px", marginBottom: 12 }}><span>Total</span><span>{fmt(total)}</span></div>
            <button onClick={() => setCheckoutOpen(true)} disabled={cart.length === 0}
              style={{ width: "100%", padding: 13, borderRadius: 12, background: cart.length === 0 ? "#D5D3CB" : "#1A1917", color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: cart.length === 0 ? "not-allowed" : "pointer", letterSpacing: "-.2px" }}>
              Checkout →
            </button>
          </div>
        </div>
      </div>

      {/* Modals — always rendered outside the grid */}
      {prodModal && <ProductModal product={prodModal === "add" ? null : prodModal} onSave={saveProduct} onDelete={deleteProduct} onClose={() => setProdModal(null)} />}
      {itemDiscModal && <ItemDiscModal item={itemDiscModal} onSave={saveItemDisc} onClear={clearItemDisc} onClose={() => setItemDiscModal(null)} />}
      {checkoutOpen && <CheckoutModal cart={cart} cd={cd} onConfirm={confirmSale} onClose={() => setCheckoutOpen(false)} saving={savingSale} />}
      {receipt && <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
