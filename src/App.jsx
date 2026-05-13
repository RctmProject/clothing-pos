import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://asvjmruxsdcjjqktjzye.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdmptcnV4c2Rjampxa3RqenllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODAzOTksImV4cCI6MjA5NDI1NjM5OX0.14apCycTxViARAJUmkOC-5di2oiLkDuvjnY3srTL88k";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const f = (n) => "AED " + Number(n).toFixed(2);
const dp = (p) => p.discount > 0 ? (p.disc_type === "pct" ? p.price * (1 - p.discount / 100) : Math.max(0, p.price - p.discount)) : p.price;
const ep = (c) => { let p = dp(c); if (c.iDisc > 0) { p = c.iDt === "pct" ? p * (1 - c.iDisc / 100) : Math.max(0, p - c.iDisc); } return p; };
const EMOJIS = ["👔","👕","👗","👖","🧥","🥼","🩱","🩲","👟","👠","👜","🪢","🎩","🧣","🧦","👒","✨","🌸","💎","🛍️"];
const CATS = ["Tops","Bottoms","Dresses","Outerwear","Footwear","Accessories","Other"];

// ── Seed products (inserted once if table is empty) ──────────────────────────
const SEED = [
  {name:"White linen shirt",category:"Tops",price:89,stock:12,emoji:"👔",discount:0,disc_type:"pct"},
  {name:"Black trousers",category:"Bottoms",price:120,stock:8,emoji:"👖",discount:0,disc_type:"pct"},
  {name:"Floral summer dress",category:"Dresses",price:145,stock:3,emoji:"👗",discount:15,disc_type:"pct"},
  {name:"Denim jacket",category:"Outerwear",price:195,stock:5,emoji:"🧥",discount:0,disc_type:"pct"},
  {name:"Striped polo",category:"Tops",price:65,stock:0,emoji:"👕",discount:0,disc_type:"pct"},
  {name:"Beige chinos",category:"Bottoms",price:110,stock:7,emoji:"👖",discount:0,disc_type:"pct"},
  {name:"Maxi skirt",category:"Bottoms",price:95,stock:2,emoji:"🩱",discount:10,disc_type:"fixed"},
  {name:"Crop blazer",category:"Outerwear",price:175,stock:4,emoji:"🥼",discount:0,disc_type:"pct"},
  {name:"Casual sneakers",category:"Footwear",price:130,stock:6,emoji:"👟",discount:0,disc_type:"pct"},
  {name:"Leather belt",category:"Accessories",price:45,stock:15,emoji:"🪢",discount:0,disc_type:"pct"},
  {name:"Canvas tote",category:"Accessories",price:55,stock:9,emoji:"👜",discount:0,disc_type:"pct"},
  {name:"Ribbed tank top",category:"Tops",price:35,stock:1,emoji:"👕",discount:0,disc_type:"pct"},
];

// ── Reusable UI pieces ────────────────────────────────────────────────────────
const Modal = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--color-background-primary)",borderRadius:12,border:"0.5px solid var(--color-border-tertiary)",padding:20,width:"100%",maxWidth:360,maxHeight:"90vh",overflowY:"auto"}}>
        {children}
      </div>
    </div>
  );
};

const Field = ({ label, optional, children }) => (
  <div style={{marginBottom:10}}>
    <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:3}}>
      {label}{optional && <span style={{fontSize:10,color:"var(--color-text-secondary)",marginLeft:4}}>optional</span>}
    </label>
    {children}
  </div>
);

const inp = {width:"100%",padding:"7px 9px",fontSize:13,border:"0.5px solid var(--color-border-secondary)",borderRadius:8,background:"var(--color-background-primary)",color:"var(--color-text-primary)"};
const Btn = ({onClick,children,variant="default",disabled,style={}}) => {
  const styles = {
    default:{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",color:"var(--color-text-primary)"},
    primary:{background:"#534AB7",border:"none",color:"#fff"},
    danger:{background:"#FCEBEB",border:"0.5px solid #F09595",color:"#A32D2D"},
  };
  return <button disabled={disabled} onClick={onClick} style={{flex:1,padding:"8px 12px",borderRadius:8,fontSize:13,fontWeight:500,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.4:1,...styles[variant],...style}}>{children}</button>;
};

// ── Product Modal (Add / Edit) ────────────────────────────────────────────────
function ProductModal({ product, onSave, onDelete, onClose }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name||"", category: product?.category||"Tops",
    price: product?.price||"", stock: product?.stock||"",
    emoji: product?.emoji||"👕", discount: product?.discount||"",
    disc_type: product?.disc_type||"pct",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <Modal show onClose={onClose}>
      <h3 style={{fontSize:15,fontWeight:500,marginBottom:14,color:"var(--color-text-primary)"}}>{isEdit?"Edit product":"Add product"}</h3>
      <Field label="Icon">
        <div style={{display:"flex",flexWrap:"wrap",gap:5,padding:8,background:"var(--color-background-secondary)",borderRadius:8,maxHeight:88,overflowY:"auto",marginBottom:6}}>
          {EMOJIS.map(e=><span key={e} onClick={()=>set("emoji",e)} style={{fontSize:20,cursor:"pointer",padding:3,borderRadius:5,border:`0.5px solid ${form.emoji===e?"#AFA9EC":"transparent"}`,background:form.emoji===e?"#EEEDFE":"transparent"}}>{e}</span>)}
        </div>
        <input style={inp} value={form.emoji} onChange={e=>set("emoji",e.target.value)} maxLength={4} placeholder="Or type any emoji"/>
      </Field>
      <Field label="Name"><input style={inp} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Product name"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Field label="Category">
          <select style={inp} value={form.category} onChange={e=>set("category",e.target.value)}>
            {CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Price (AED)"><input style={inp} type="number" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="0.00"/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Field label="Stock"><input style={inp} type="number" value={form.stock} onChange={e=>set("stock",e.target.value)} placeholder="0"/></Field>
        <Field label="Discount" optional>
          <div style={{display:"flex",gap:4}}>
            <input style={{...inp,flex:1}} type="number" value={form.discount} onChange={e=>set("discount",e.target.value)} placeholder="0"/>
            <select style={{...inp,width:62}} value={form.disc_type} onChange={e=>set("disc_type",e.target.value)}>
              <option value="pct">%</option><option value="fixed">AED</option>
            </select>
          </div>
        </Field>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}>
        <Btn onClick={onClose}>Cancel</Btn>
        {isEdit && <Btn variant="danger" onClick={()=>onDelete(product.id)}>Delete</Btn>}
        <Btn variant="primary" onClick={()=>onSave(form,product?.id)}>{isEdit?"Save changes":"Add product"}</Btn>
      </div>
    </Modal>
  );
}

// ── Item Discount Modal ───────────────────────────────────────────────────────
function ItemDiscModal({ item, onSave, onClear, onClose }) {
  const [val, setVal] = useState(item.iDisc||"");
  const [type, setType] = useState(item.iDt||"pct");
  return (
    <Modal show onClose={onClose}>
      <h3 style={{fontSize:15,fontWeight:500,marginBottom:8,color:"var(--color-text-primary)"}}>Item discount</h3>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:12}}>{item.name}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Field label="Amount"><input style={inp} type="number" value={val} onChange={e=>setVal(e.target.value)} placeholder="0"/></Field>
        <Field label="Type">
          <select style={inp} value={type} onChange={e=>setType(e.target.value)}>
            <option value="pct">% percent</option><option value="fixed">AED fixed</option>
          </select>
        </Field>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={onClear}>Remove</Btn>
        <Btn variant="primary" onClick={()=>onSave(parseFloat(val)||0,type)}>Apply</Btn>
      </div>
    </Modal>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({ cart, cd, onConfirm, onClose }) {
  const [form, setForm] = useState({name:"",mobile:"",email:"",payment:"Cash"});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const sub = cart.reduce((s,c)=>s+ep(c)*c.qty,0);
  const disc = cd.on && cd.v > 0 ? (cd.t==="pct" ? sub*cd.v/100 : Math.min(cd.v,sub)) : 0;
  const vat = (sub-disc)*0.05;
  const total = sub-disc+vat;
  return (
    <Modal show onClose={onClose}>
      <h3 style={{fontSize:15,fontWeight:500,marginBottom:14,color:"var(--color-text-primary)"}}>Checkout</h3>
      <Field label="Customer name" optional><input style={inp} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Sarah Ahmed"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Field label="Mobile" optional><input style={inp} type="tel" value={form.mobile} onChange={e=>set("mobile",e.target.value)} placeholder="+971 50…"/></Field>
        <Field label="Email" optional><input style={inp} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@…"/></Field>
      </div>
      <Field label="Payment method">
        <select style={inp} value={form.payment} onChange={e=>set("payment",e.target.value)}>
          <option>Cash</option><option>Card</option><option>Apple Pay</option>
        </select>
      </Field>
      <div style={{background:"var(--color-background-secondary)",borderRadius:8,padding:10,margin:"10px 0",fontSize:12}}>
        {cart.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-primary)"}}><span>{c.emoji} {c.name} ×{c.qty}</span><span>{f(ep(c)*c.qty)}</span></div>)}
        <div style={{borderTop:"0.5px dashed var(--color-border-secondary)",margin:"6px 0"}}/>
        {disc>0 && <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"#A32D2D"}}><span>Discount</span><span>-{f(disc)}</span></div>}
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-secondary)"}}><span>VAT 5%</span><span>{f(vat)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:500,color:"var(--color-text-primary)"}}><span>Total</span><span>{f(total)}</span></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={()=>onConfirm(form,sub,disc,vat,total)}>Confirm sale</Btn>
      </div>
    </Modal>
  );
}

// ── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptModal({ sale, onClose }) {
  if(!sale) return null;
  return (
    <Modal show onClose={onClose}>
      <h3 style={{fontSize:15,fontWeight:500,marginBottom:14,color:"#3B6D11"}}>✓ Sale complete!</h3>
      <div style={{background:"var(--color-background-secondary)",borderRadius:8,padding:10,fontSize:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontWeight:500,color:"var(--color-text-primary)"}}><span>{sale.txn_id}</span><span>{new Date(sale.created_at).toLocaleString("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span></div>
        <div style={{borderTop:"0.5px dashed var(--color-border-secondary)",margin:"6px 0"}}/>
        {sale.customer_name!=="Walk-in"&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-primary)"}}><span>Customer</span><span>{sale.customer_name}</span></div>}
        {sale.customer_mobile&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-primary)"}}><span>Mobile</span><span>{sale.customer_mobile}</span></div>}
        {sale.customer_email&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-primary)"}}><span>Email</span><span>{sale.customer_email}</span></div>}
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-primary)"}}><span>Payment</span><span>{sale.payment_method}</span></div>
        <div style={{borderTop:"0.5px dashed var(--color-border-secondary)",margin:"6px 0"}}/>
        {sale.items?.map((it,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-primary)"}}><span>{it.emoji} {it.name} ×{it.qty}</span><span>{f(it.line_total)}</span></div>)}
        <div style={{borderTop:"0.5px dashed var(--color-border-secondary)",margin:"6px 0"}}/>
        {sale.discount>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"#A32D2D"}}><span>Discount</span><span>-{f(sale.discount)}</span></div>}
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,color:"var(--color-text-secondary)"}}><span>VAT 5%</span><span>{f(sale.vat)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",fontWeight:500,fontSize:14,color:"var(--color-text-primary)"}}><span>Total</span><span>{f(sale.total)}</span></div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:14}}>
        <Btn onClick={onClose}>Close</Btn>
        <Btn variant="primary" onClick={()=>window.print()}>🖨 Print receipt</Btn>
      </div>
    </Modal>
  );
}

// ── Owner Dashboard ───────────────────────────────────────────────────────────
function OwnerView({ products }) {
  const [tab, setTab] = useState("sales");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab !== "sales") return;
    setLoading(true);
    supabase.from("sales").select("*, sale_items(*)").order("created_at",{ascending:false}).limit(50)
      .then(({data})=>{setSales(data||[]);setLoading(false);});
  }, [tab]);

  const rev = sales.reduce((s,x)=>s+Number(x.total),0);
  const itemsSold = sales.reduce((s,x)=>s+(x.sale_items?.reduce((a,c)=>a+c.qty,0)||0),0);

  const Tab = ({id,label})=><button onClick={()=>setTab(id)} style={{padding:"6px 14px",borderRadius:8,fontSize:13,cursor:"pointer",border:"0.5px solid var(--color-border-secondary)",background:tab===id?"var(--color-background-secondary)":"var(--color-background-primary)",color:tab===id?"var(--color-text-primary)":"var(--color-text-secondary)",fontWeight:tab===id?500:400}}>{label}</button>;

  return (
    <div>
      <div style={{display:"flex",gap:6,marginBottom:16}}><Tab id="sales" label="Sales history"/><Tab id="inventory" label="Inventory"/></div>
      {tab==="sales" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
            {[["Total sales",sales.length],["Revenue",f(rev)],["Items sold",itemsSold]].map(([label,val])=>(
              <div key={label} style={{background:"var(--color-background-secondary)",borderRadius:8,padding:10}}>
                <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:3}}>{label}</div>
                <div style={{fontSize:18,fontWeight:500,color:"var(--color-text-primary)"}}>{val}</div>
              </div>
            ))}
          </div>
          {loading ? <p style={{fontSize:13,color:"var(--color-text-secondary)"}}>Loading…</p> :
            sales.length ? sales.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:8,background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,marginBottom:6}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)"}}>{s.customer_name}{s.customer_mobile?" · "+s.customer_mobile:""}</div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.sale_items?.map(i=>i.name+" ×"+i.qty).join(", ")} · {s.payment_method}</div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)"}}>{new Date(s.created_at).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})} · {s.txn_id}</div>
                </div>
                <div style={{fontSize:13,fontWeight:500,color:"#3C3489",whiteSpace:"nowrap"}}>{f(s.total)}</div>
              </div>
            )) : <p style={{fontSize:13,color:"var(--color-text-secondary)",padding:"16px 0"}}>No sales yet — complete a transaction to see it here.</p>
          }
        </div>
      )}
      {tab==="inventory" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 56px",gap:6,padding:"7px 8px",background:"var(--color-background-secondary)",borderRadius:8,marginBottom:6}}>
            {["Product","Price","Stock","Status"].map(h=><div key={h} style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)",textAlign:h!=="Product"?"center":"left"}}>{h}</div>)}
          </div>
          {products.map(p=>{
            const badge = p.stock===0?["#FCEBEB","#A32D2D","Out"]:p.stock<=3?["#FAEEDA","#854F0B","Low"]:["#EAF3DE","#3B6D11","OK"];
            return(
              <div key={p.id} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 56px",gap:6,alignItems:"center",padding:"7px 8px",background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,marginBottom:5}}>
                <div><div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)"}}>{p.emoji} {p.name}</div><div style={{fontSize:11,color:"var(--color-text-secondary)"}}>{p.category}</div></div>
                <div style={{fontSize:13,color:"var(--color-text-primary)",textAlign:"center"}}>{f(dp(p))}</div>
                <div style={{fontSize:13,color:"var(--color-text-primary)",textAlign:"center"}}>{p.stock}</div>
                <div style={{textAlign:"center"}}><span style={{fontSize:10,padding:"2px 6px",borderRadius:8,background:badge[0],color:badge[1]}}>{badge[2]}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("cashier");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [cd, setCd] = useState({v:0,t:"pct",on:false});
  const [cdInput, setCdInput] = useState("");

  // Modals
  const [prodModal, setProdModal] = useState(null); // null | "add" | product object
  const [itemDiscModal, setItemDiscModal] = useState(null); // cart item
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  // Load products from Supabase
  const loadProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").order("id");
    if (error) { showToast("Error loading products: "+error.message); return; }
    if (data.length === 0) {
      // Seed initial products if table is empty
      const { data: seeded } = await supabase.from("products").insert(SEED).select();
      setProducts(seeded || []);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Product CRUD
  const saveProduct = async (form, id) => {
    const payload = { name:form.name, category:form.category, price:parseFloat(form.price)||0, stock:parseInt(form.stock)||0, emoji:form.emoji||"👕", discount:parseFloat(form.discount)||0, disc_type:form.disc_type };
    if (!payload.name || !payload.price) { showToast("Name and price are required."); return; }
    if (id) {
      await supabase.from("products").update(payload).eq("id",id);
      // Update cart item if present
      setCart(c=>c.map(ci=>ci.id===id?{...ci,...payload}:ci));
    } else {
      await supabase.from("products").insert(payload);
    }
    setProdModal(null);
    loadProducts();
    showToast(id?"Product updated ✓":"Product added ✓");
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id",id);
    setCart(c=>c.filter(ci=>ci.id!==id));
    setProdModal(null);
    loadProducts();
    showToast("Product deleted");
  };

  // Cart
  const addToCart = (p) => {
    if (p.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(c=>c.id===p.id);
      if (ex) { if(ex.qty>=p.stock) return prev; return prev.map(c=>c.id===p.id?{...c,qty:c.qty+1}:c); }
      return [...prev, {...p, qty:1, iDisc:0, iDt:"pct"}];
    });
  };
  const changeQty = (id,d) => setCart(prev=>{const c=prev.find(x=>x.id===id);if(!c)return prev;if(c.qty+d<=0)return prev.filter(x=>x.id!==id);return prev.map(x=>x.id===id?{...x,qty:x.qty+d}:x);});
  const removeItem = (id) => setCart(prev=>prev.filter(x=>x.id!==id));
  const saveItemDisc = (val,type) => { setCart(prev=>prev.map(c=>c.id===itemDiscModal.id?{...c,iDisc:val,iDt:type}:c)); setItemDiscModal(null); };
  const clearItemDisc = () => { setCart(prev=>prev.map(c=>c.id===itemDiscModal.id?{...c,iDisc:0}:c)); setItemDiscModal(null); };

  // Totals
  const sub = cart.reduce((s,c)=>s+ep(c)*c.qty,0);
  const discAmt = cd.on&&cd.v>0 ? (cd.t==="pct"?sub*cd.v/100:Math.min(cd.v,sub)) : 0;
  const vat = (sub-discAmt)*0.05;
  const total = sub-discAmt+vat;

  // Confirm sale — saves to Supabase
  const confirmSale = async (form, sub, disc, vat, total) => {
    const txn_id = "TXN"+Date.now().toString().slice(-6);
    // 1. Insert sale
    const { data: saleData, error: saleErr } = await supabase.from("sales").insert({
      txn_id, customer_name:form.name||"Walk-in", customer_mobile:form.mobile||null,
      customer_email:form.email||null, payment_method:form.payment,
      subtotal:sub, discount:disc, vat, total,
    }).select().single();
    if (saleErr) { showToast("Error saving sale: "+saleErr.message); return; }

    // 2. Insert sale items
    const saleItems = cart.map(c=>({ sale_id:saleData.id, product_id:c.id, name:c.name, emoji:c.emoji, qty:c.qty, unit_price:ep(c), line_total:ep(c)*c.qty }));
    await supabase.from("sale_items").insert(saleItems);

    // 3. Update stock for each product
    for (const c of cart) {
      const prod = products.find(p=>p.id===c.id);
      if (prod) await supabase.from("products").update({stock: Math.max(0,prod.stock-c.qty)}).eq("id",c.id);
    }

    setReceipt({...saleData, items:saleItems});
    setCart([]);
    setCd({v:0,t:"pct",on:false}); setCdInput("");
    setCheckoutOpen(false);
    loadProducts();
    showToast("Sale saved to Supabase ✓");
  };

  // Filtered products
  const cats = ["All",...new Set(products.map(p=>p.category))];
  const filtered = products.filter(p=>(activeCat==="All"||p.category===activeCat)&&p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:400,flexDirection:"column",gap:12,color:"var(--color-text-secondary)"}}>
      <div style={{fontSize:32}}>🔌</div>
      <div style={{fontSize:14}}>Connecting to Supabase…</div>
    </div>
  );

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",minHeight:640,background:"var(--color-background-tertiary)",position:"relative"}}>
      {/* Toast */}
      {toast && <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:"#534AB7",color:"#fff",padding:"8px 16px",borderRadius:8,fontSize:13,zIndex:200,whiteSpace:"nowrap"}}>{toast}</div>}

      {/* Left panel */}
      <div style={{padding:16,overflowY:"auto",maxHeight:640}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div style={{display:"flex",gap:6}}>
            {["cashier","owner"].map((v,i)=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:"6px 14px",borderRadius:8,fontSize:13,cursor:"pointer",border:"0.5px solid var(--color-border-secondary)",background:view===v?"var(--color-background-secondary)":"var(--color-background-primary)",color:"var(--color-text-primary)",fontWeight:view===v?500:400}}>
                {i===0?"Cashier":"Owner"}
              </button>
            ))}
          </div>
          <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
        </div>

        {view==="cashier" && (
          <>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <input style={{...inp,flex:1}} placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/>
              <button onClick={()=>setProdModal("add")} style={{padding:"7px 12px",borderRadius:8,background:"#534AB7",color:"#fff",border:"none",cursor:"pointer",fontSize:13,whiteSpace:"nowrap"}}>+ Product</button>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {cats.map(c=>(
                <button key={c} onClick={()=>setActiveCat(c)} style={{padding:"4px 10px",borderRadius:20,fontSize:12,cursor:"pointer",border:"0.5px solid var(--color-border-secondary)",background:activeCat===c?"#CECBF6":"var(--color-background-primary)",borderColor:activeCat===c?"#AFA9EC":"var(--color-border-secondary)",color:activeCat===c?"#3C3489":"var(--color-text-secondary)"}}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))",gap:10}}>
              {filtered.length===0 && <div style={{gridColumn:"1/-1",color:"var(--color-text-secondary)",fontSize:13,padding:"20px 0"}}>No products found</div>}
              {filtered.map(p=>{
                const dp2=dp(p), hd=p.discount>0;
                const so=p.stock===0, sl=p.stock>0&&p.stock<=3;
                return(
                  <div key={p.id} onClick={()=>addToCart(p)} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:10,cursor:so?"default":"pointer",position:"relative",opacity:so?.65:1}}>
                    {hd && <div style={{position:"absolute",top:6,left:6,background:"#E24B4A",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:8,fontWeight:500}}>{p.disc_type==="pct"?p.discount+"%":"AED "+p.discount+" off"}</div>}
                    <div onClick={e=>{e.stopPropagation();setProdModal(p);}} style={{position:"absolute",top:6,right:6,width:22,height:22,borderRadius:"50%",background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:2}}>
                      <i className="ti ti-edit" style={{fontSize:12}} aria-hidden="true"></i>
                    </div>
                    <div style={{fontSize:26,marginBottom:5,textAlign:"center"}}>{p.emoji}</div>
                    <div style={{fontSize:12,fontWeight:500,color:"var(--color-text-primary)",marginBottom:2,lineHeight:1.3}}>{p.name}</div>
                    <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:5}}>{p.category}</div>
                    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:4}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)"}}>{f(dp2)}</div>
                        {hd && <div style={{fontSize:10,color:"var(--color-text-secondary)",textDecoration:"line-through"}}>{f(p.price)}</div>}
                      </div>
                      <span style={{fontSize:10,padding:"2px 5px",borderRadius:8,background:so?"#FCEBEB":sl?"#FAEEDA":"var(--color-background-secondary)",color:so?"#A32D2D":sl?"#854F0B":"var(--color-text-secondary)"}}>
                        {so?"Out":sl?p.stock+" left":p.stock}
                      </span>
                    </div>
                    {so && <div style={{position:"absolute",inset:0,borderRadius:12,background:"rgba(255,255,255,.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#A32D2D",fontWeight:500,pointerEvents:"none"}}>Out of stock</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
        {view==="owner" && <OwnerView products={products}/>}
      </div>

      {/* Right panel — Cart */}
      <div style={{background:"var(--color-background-primary)",borderLeft:"0.5px solid var(--color-border-tertiary)",display:"flex",flexDirection:"column",maxHeight:640}}>
        <div style={{padding:"12px 14px 8px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
          <h3 style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>Cart {cart.length>0&&<span style={{fontSize:12,color:"var(--color-text-secondary)",fontWeight:400}}>({cart.reduce((s,c)=>s+c.qty,0)})</span>}</h3>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px 14px"}}>
          {cart.length===0
            ? <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:120,color:"var(--color-text-secondary)",fontSize:13,gap:8}}><span style={{fontSize:28}}>🛍️</span>Add items to start</div>
            : cart.map(c=>{
                const e=ep(c), hd=c.discount>0||c.iDisc>0;
                const dLabel=c.iDisc>0?`-${c.iDt==="pct"?c.iDisc+"%":"AED "+c.iDisc} extra`:c.discount>0?`-${c.disc_type==="pct"?c.discount+"%":"AED "+c.discount}`:"";
                return(
                  <div key={c.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
                    <div style={{fontSize:18}}>{c.emoji}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,color:"var(--color-text-primary)"}}>{c.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{f(e)}</span>
                        {hd && <span style={{fontSize:11,color:"var(--color-text-secondary)",textDecoration:"line-through"}}>{f(c.price)}</span>}
                        <button onClick={()=>setItemDiscModal(c)} style={{fontSize:10,padding:"1px 5px",borderRadius:6,border:`0.5px solid ${dLabel?"transparent":"var(--color-border-secondary)"}`,background:dLabel?"#FCEBEB":"var(--color-background-secondary)",color:dLabel?"#A32D2D":"var(--color-text-secondary)",cursor:"pointer"}}>
                          {dLabel||"+ disc"}
                        </button>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:5}}>
                        <button onClick={()=>changeQty(c.id,-1)} style={{width:20,height:20,borderRadius:"50%",border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-text-primary)"}}>−</button>
                        <span style={{fontSize:12,fontWeight:500,minWidth:14,textAlign:"center",color:"var(--color-text-primary)"}}>{c.qty}</span>
                        <button onClick={()=>changeQty(c.id,1)} style={{width:20,height:20,borderRadius:"50%",border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--color-text-primary)"}}>+</button>
                      </div>
                    </div>
                    <button onClick={()=>removeItem(c.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-secondary)",fontSize:14,padding:2,marginTop:2}} aria-label="Remove item">✕</button>
                  </div>
                );
              })
          }
        </div>
        <div style={{padding:"10px 14px",borderTop:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4}}>Cart-wide discount</div>
          <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:8}}>
            <input type="number" min="0" value={cdInput} onChange={e=>setCdInput(e.target.value)} placeholder="0" style={{...inp,width:56,padding:"5px 7px",fontSize:12}}/>
            <select value={cd.t} onChange={e=>setCd(x=>({...x,t:e.target.value}))} style={{...inp,padding:"5px 4px",fontSize:12,width:"auto"}}>
              <option value="pct">%</option><option value="fixed">AED</option>
            </select>
            <button onClick={()=>{const v=parseFloat(cdInput)||0;if(v>0)setCd({v,t:cd.t,on:true});}} style={{padding:"5px 9px",fontSize:12,borderRadius:8,background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",cursor:"pointer",color:"var(--color-text-primary)"}}>Apply</button>
            {cd.on && <button onClick={()=>{setCd({v:0,t:"pct",on:false});setCdInput("");}} style={{fontSize:12,padding:"5px 9px",borderRadius:8,background:"none",border:"none",cursor:"pointer",color:"#A32D2D"}}>Clear</button>}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--color-text-secondary)",marginBottom:3}}><span>Subtotal</span><span>{f(sub)}</span></div>
          {discAmt>0 && <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#A32D2D",marginBottom:3}}><span>Discount</span><span>-{f(discAmt)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--color-text-secondary)",marginBottom:3}}><span>VAT (5%)</span><span>{f(vat)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:500,color:"var(--color-text-primary)",margin:"6px 0 10px"}}><span>Total</span><span>{f(total)}</span></div>
          <button onClick={()=>setCheckoutOpen(true)} disabled={cart.length===0} style={{width:"100%",padding:9,borderRadius:8,background:"#534AB7",color:"#fff",fontSize:13,fontWeight:500,border:"none",cursor:cart.length===0?"not-allowed":"pointer",opacity:cart.length===0?.4:1}}>Checkout</button>
        </div>
      </div>

      {/* Modals */}
      {prodModal && (
        <ProductModal
          product={prodModal==="add"?null:prodModal}
          onSave={saveProduct}
          onDelete={deleteProduct}
          onClose={()=>setProdModal(null)}
        />
      )}
      {itemDiscModal && (
        <ItemDiscModal item={itemDiscModal} onSave={saveItemDisc} onClear={clearItemDisc} onClose={()=>setItemDiscModal(null)}/>
      )}
      {checkoutOpen && (
        <CheckoutModal cart={cart} cd={cd} onConfirm={confirmSale} onClose={()=>setCheckoutOpen(false)}/>
      )}
      {receipt && <ReceiptModal sale={receipt} onClose={()=>setReceipt(null)}/>}
    </div>
  );
}
