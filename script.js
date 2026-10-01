const API_BASE="https://anmol-fashion.onrender.com";

const products=[
{id:1,name:"Men's Casual Shirt",category:"men",price:499,oldPrice:799,emoji:"👔",sizes:["S","M","L","XL"],colors:["Blue","Black"],rating:4.4,new:true},
{id:2,name:"Women's Kurti",category:"women",price:599,oldPrice:999,emoji:"👗",sizes:["S","M","L","XL"],colors:["Pink","Blue"],rating:4.6,new:true},
{id:3,name:"Men's Jeans",category:"men",price:799,oldPrice:1299,emoji:"👖",sizes:["30","32","34","36"],colors:["Blue","Black"],rating:4.5,new:false},
{id:4,name:"Women's Top",category:"women",price:499,oldPrice:799,emoji:"👚",sizes:["S","M","L","XL"],colors:["White","Pink"],rating:4.3,new:true},
{id:5,name:"Kids T-Shirt",category:"kids",price:399,oldPrice:599,emoji:"👕",sizes:["S","M","L","XL"],colors:["Red","Blue"],rating:4.5,new:false},
{id:6,name:"Kids Dress",category:"kids",price:599,oldPrice:899,emoji:"🧒",sizes:["S","M","L","XL"],colors:["Pink","Yellow"],rating:4.7,new:true}
];

let cart=JSON.parse(localStorage.getItem("anmol_cart")||"[]");
let currentCategory="all";

const $=id=>document.getElementById(id);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const discount=p=>Math.round((1-p.price/p.oldPrice)*100);

function saveCart(){localStorage.setItem("anmol_cart",JSON.stringify(cart));updateCartCount();}
function updateCartCount(){$("cartCount").textContent=cart.reduce((s,i)=>s+i.qty,0);}

function renderProducts(){
 let list=[...products];
 const q=($("searchInput").value||"").trim().toLowerCase();
 if(currentCategory==="new") list=list.filter(p=>p.new);
 else if(currentCategory==="offers") list=list.filter(p=>discount(p)>=30);
 else if(currentCategory!=="all") list=list.filter(p=>p.category===currentCategory);
 if(q) list=list.filter(p=>(p.name+" "+p.category).toLowerCase().includes(q));
 const max=$("priceFilter").value;
 if(max!=="all") list=list.filter(p=>p.price<=Number(max));
 const sizes=[...document.querySelectorAll(".checks input:checked")].map(x=>x.value);
 if(sizes.length) list=list.filter(p=>sizes.some(s=>p.sizes.includes(s)));
 const sort=$("sortSelect").value;
 if(sort==="low") list.sort((a,b)=>a.price-b.price);
 if(sort==="high") list.sort((a,b)=>b.price-a.price);
 if(sort==="discount") list.sort((a,b)=>discount(b)-discount(a));
 $("resultCount").textContent=`${list.length} product${list.length===1?"":"s"}`;
 $("sectionTitle").textContent=currentCategory==="all"?"Featured Products":currentCategory==="new"?"New Arrivals":currentCategory==="offers"?"Best Offers":currentCategory[0].toUpperCase()+currentCategory.slice(1)+" Fashion";
 $("productGrid").innerHTML=list.map(p=>`
 <article class="product-card">
  <div class="product-img" onclick="openProduct(${p.id})">
   ${p.new?'<span class="badge">NEW</span>':''}<button class="heart" onclick="event.stopPropagation();wishlist(${p.id})">♡</button>${p.emoji}
  </div>
  <div class="product-info">
   <span class="cat">${p.category}</span><h3 onclick="openProduct(${p.id})" style="cursor:pointer">${p.name}</h3>
   <div class="rating">★ ${p.rating} <span>(New)</span></div>
   <div class="price"><strong>${money(p.price)}</strong><del>${money(p.oldPrice)}</del><span class="discount">${discount(p)}% off</span></div>
   <div class="card-actions"><button class="add" onclick="addToCart(${p.id})">Add to Cart</button><button class="buy" onclick="buyNow(${p.id})">Buy Now</button></div>
  </div>
 </article>`).join("");
}

function filterCategory(cat){currentCategory=cat;document.querySelectorAll(".filter-cat").forEach(b=>b.classList.toggle("active",b.dataset.cat===cat));renderProducts();$("shop").scrollIntoView({behavior:"smooth"});$("categoryMenu").classList.remove("show");}
function clearFilters(){currentCategory="all";$("priceFilter").value="all";document.querySelectorAll(".checks input").forEach(x=>x.checked=false);renderProducts();}
function toggleCategories(){$("categoryMenu").classList.toggle("show");}
function toggleFilters(){$("filters").classList.toggle("show");}
function goHome(){filterCategory("all");window.scrollTo({top:0,behavior:"smooth"});}

function openProduct(id){
 const p=products.find(x=>x.id===id);if(!p)return;
 $("productDetail").innerHTML=`<div class="product-detail"><div class="detail-image">${p.emoji}</div><div class="detail-info"><span class="cat">${p.category} · Anmol Fashion</span><h2>${p.name}</h2><div class="rating">★ ${p.rating} · 100+ ratings</div><div class="detail-price">${money(p.price)} <del>${money(p.oldPrice)}</del> <span class="discount">${discount(p)}% off</span></div><p>Premium quality fashion product from Anmol Fashion. Select your size and colour before adding it to cart.</p><label>Size<select id="detailSize">${p.sizes.map(s=>`<option>${s}</option>`).join("")}</select></label><label>Colour<select id="detailColor">${p.colors.map(c=>`<option>${c}</option>`).join("")}</select></label><button class="primary full" onclick="addDetailToCart(${p.id})">ADD TO CART</button><button class="outline full" onclick="buyDetail(${p.id})">BUY NOW</button></div></div>`;
 show("productModal");
}
function addDetailToCart(id){addToCart(id,$("detailSize").value,$("detailColor").value);closeAll();openCart();}
function buyDetail(id){addToCart(id,$("detailSize").value,$("detailColor").value);closeAll();openCheckout();}

function addToCart(id,size=null,color=null){
 const p=products.find(x=>x.id===id);if(!p)return;
 size=size||p.sizes[1];color=color||p.colors[0];
 const found=cart.find(i=>i.id===id&&i.size===size&&i.color===color);
 if(found)found.qty++;else cart.push({id,size,color,qty:1});
 saveCart();toast("Added to cart");
}
function buyNow(id){addToCart(id);openCheckout();}
function changeQty(index,n){cart[index].qty+=n;if(cart[index].qty<=0)cart.splice(index,1);saveCart();renderCart();}
function removeCart(index){cart.splice(index,1);saveCart();renderCart();}

function renderCart(){
 const box=$("cartItems");
 if(!cart.length){box.innerHTML='<div style="padding:40px;text-align:center;color:#667085">Your cart is empty.<br><button class="primary" style="margin-top:15px" onclick="closeAll();filterCategory(\'all\')">Start Shopping</button></div>';$("cartSubtotal").textContent="₹0";return;}
 box.innerHTML=cart.map((i,idx)=>{const p=products.find(x=>x.id===i.id);return `<div class="cart-item"><div class="cart-thumb">${p.emoji}</div><div><h4>${p.name}</h4><small>${i.size} · ${i.color}</small><div class="qty"><button onclick="changeQty(${idx},-1)">−</button>${i.qty}<button onclick="changeQty(${idx},1)">+</button></div></div><div><b>${money(p.price*i.qty)}</b><button style="display:block;margin-top:12px;color:#b42318" onclick="removeCart(${idx})">Remove</button></div></div>`}).join("");
 const total=cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);$("cartSubtotal").textContent=money(total);
}
function cartTotal(){return cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);}
function openCart(){renderCart();show("cartDrawer");}
function openCheckout(){if(!cart.length){toast("Cart is empty","error");return}closeAll();renderCheckout();show("checkoutModal");}
function renderCheckout(){$("checkoutSummary").innerHTML=cart.map(i=>{const p=products.find(x=>x.id===i.id);return `<div class="summary-row"><span>${p.name} × ${i.qty}</span><b>${money(p.price*i.qty)}</b></div>`}).join("");$("checkoutTotal").textContent=money(cartTotal());}
async function placeOrder(e){
 e.preventDefault();
 const mobile=$("customerMobile").value.trim(),pin=$("customerPincode").value.trim();
 if(!/^\d{10}$/.test(mobile)){orderMsg("Enter a valid 10 digit mobile number","error");return}
 if(!/^\d{6}$/.test(pin)){orderMsg("Enter a valid 6 digit pincode","error");return}
 const payment=document.querySelector('input[name="payment"]:checked').value;
 const payload={orderId:"AF-"+Date.now(),customerName:$("customerName").value.trim(),mobile,address:$("customerAddress").value.trim(),city:$("customerCity").value.trim(),pincode:pin,email:$("customerEmail").value.trim(),paymentMethod:payment,items:cart.map(i=>{const p=products.find(x=>x.id===i.id);return {id:p.id,name:p.name,price:p.price,quantity:i.qty,size:i.size,color:i.color}}),total:cartTotal()};
 $("orderMessage").innerHTML='<div class="message">Placing your order...</div>';
 try{
  const r=await fetch(API_BASE+"/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||"Order could not be placed");
  localStorage.setItem("anmol_last_order",payload.orderId);
  const loggedAccount=getAccount();
  if(loggedAccount){
   const customerOrders=JSON.parse(localStorage.getItem("anmol_customer_orders")||"[]");
   if(!customerOrders.includes(payload.orderId)) customerOrders.unshift(payload.orderId);
   localStorage.setItem("anmol_customer_orders",JSON.stringify(customerOrders));
  }
  cart=[];saveCart();
  $("orderMessage").innerHTML=`<div class="message success-msg"><b>Order placed successfully!</b><br>Order ID: <strong>${data.orderId||payload.orderId}</strong></div>`;
  $("checkoutForm").reset();$("customerCity").value="Gorakhpur";renderCheckout();
 }catch(err){orderMsg(err.message,"error")}
}
function orderMsg(msg,type){$("orderMessage").innerHTML=`<div class="message ${type==="error"?"error-msg":"success-msg"}">${msg}</div>`;}

function show(id){$("overlay").classList.add("show");$(id).classList.add("show")}
function closeAll(){document.querySelectorAll(".drawer,.modal").forEach(x=>x.classList.remove("show"));$("overlay").classList.remove("show");$("categoryMenu").classList.remove("show")}
function openAccount(){show("accountModal")}
function showOrders(){show("ordersModal")}
async function lookupOrder(){
 const id=$("orderLookup").value.trim();if(!id){$("orderResult").innerHTML='<div class="message error-msg">Enter an order ID.</div>';return}
 try{
  const r=await fetch(API_BASE+"/api/orders/"+encodeURIComponent(id));const d=await r.json();
  if(!r.ok)throw new Error(d.error||"Order not found");
  $("orderResult").innerHTML=`<div class="message success-msg"><b>Order found</b><br>Status: ${d.status||"Processing"}<br>Order ID: ${d.order_id||id}</div>`;
 }catch(e){$("orderResult").innerHTML=`<div class="message error-msg">${e.message}</div>`}
}
function wishlist(id){let w=JSON.parse(localStorage.getItem("anmol_wishlist")||"[]");if(!w.includes(id))w.push(id);localStorage.setItem("anmol_wishlist",JSON.stringify(w));toast("Added to wishlist")}
function toast(msg,type="success"){const t=document.createElement("div");t.textContent=msg;t.style.cssText="position:fixed;bottom:25px;left:50%;transform:translateX(-50%);z-index:100;background:"+(type==="error"?"#b42318":"#111827")+";color:white;padding:12px 18px;border-radius:6px;box-shadow:0 8px 20px #0003";document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}

$("searchInput").addEventListener("input",renderProducts);
$("searchBtn").addEventListener("click",()=>{$("shop").scrollIntoView({behavior:"smooth"});renderProducts()});
$("sortSelect").addEventListener("change",renderProducts);
$("priceFilter").addEventListener("change",renderProducts);
document.querySelectorAll(".checks input").forEach(x=>x.addEventListener("change",renderProducts));
$("checkoutForm").addEventListener("submit",placeOrder);
$("overlay").addEventListener("click",closeAll);
$("mobileMenu").addEventListener("click",()=>$("nav").classList.toggle("show"));
updateCartCount();renderProducts();

/* =========================
   CUSTOMER ACCOUNT
========================= */
let accountMode = "login";

function getAccount(){
  try{return JSON.parse(localStorage.getItem("anmol_customer")||"null")}catch(e){return null}
}

async function hashPassword(password){
  const data=new TextEncoder().encode(password);
  const hash=await crypto.subtle.digest("SHA-256",data);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

function setAccount(account){localStorage.setItem("anmol_customer",JSON.stringify(account));}
function clearAccount(){localStorage.removeItem("anmol_customer");}

function openAccount(mode=null){
  const account=getAccount();
  if(account && !mode) renderAccountProfile();
  else {accountMode=mode||"login";renderAccountAuth();}
  show("accountModal");
}

function renderAccountAuth(){
  $("accountContent").innerHTML=`
    <h2 class="account-title">${accountMode==="login"?"Welcome Back":"Create Your Account"}</h2>
    <p class="account-subtitle">${accountMode==="login"?"Login karke orders aur profile manage karein.":"Anmol Fashion par free account banayein."}</p>
    <div class="account-tabs">
      <button class="account-tab ${accountMode==="login"?"active":""}" onclick="accountMode='login';renderAccountAuth()">Login</button>
      <button class="account-tab ${accountMode==="register"?"active":""}" onclick="accountMode='register';renderAccountAuth()">Register</button>
    </div>
    <form class="account-form" onsubmit="submitAccount(event)">
      ${accountMode==="register"?`<label>Full Name<input id="accountName" required placeholder="Enter your full name"></label>`:""}
      <label>Mobile Number<input id="accountMobile" required maxlength="10" inputmode="numeric" placeholder="10 digit mobile"></label>
      <label>Email Address<input id="accountEmail" type="email" required placeholder="you@example.com"></label>
      <label>Password<input id="accountPassword" type="password" required minlength="6" placeholder="Minimum 6 characters"></label>
      ${accountMode==="register"?`<label>Confirm Password<input id="accountConfirm" type="password" required minlength="6" placeholder="Re-enter password"></label>`:""}
      <div id="accountMessage"></div>
      <button class="primary full" type="submit">${accountMode==="login"?"LOGIN":"CREATE ACCOUNT"}</button>
    </form>
    <p class="account-note">Your account details are stored in this browser. For production multi-device login, a secure backend authentication system should be connected.</p>
  `;
}

async function submitAccount(e){
  e.preventDefault();
  const mobile=$("accountMobile").value.trim();
  const email=$("accountEmail").value.trim().toLowerCase();
  const password=$("accountPassword").value;
  const msg=$("accountMessage");
  if(!/^\d{10}$/.test(mobile)){msg.innerHTML='<div class="auth-msg error">Enter a valid 10 digit mobile number.</div>';return;}
  if(password.length<6){msg.innerHTML='<div class="auth-msg error">Password must be at least 6 characters.</div>';return;}
  const passwordHash=await hashPassword(password);

  if(accountMode==="register"){
    const name=$("accountName").value.trim();
    const confirm=$("accountConfirm").value;
    if(!name){msg.innerHTML='<div class="auth-msg error">Enter your full name.</div>';return;}
    if(password!==confirm){msg.innerHTML='<div class="auth-msg error">Passwords do not match.</div>';return;}
    if(getAccount()){msg.innerHTML='<div class="auth-msg error">An account already exists in this browser. Please login.</div>';return;}
    setAccount({name,mobile,email,passwordHash,createdAt:new Date().toISOString()});
    prefillCheckout();
    msg.innerHTML='<div class="auth-msg success">Account created successfully.</div>';
    setTimeout(renderAccountProfile,500);
    return;
  }

  const account=getAccount();
  if(!account || account.mobile!==mobile || account.email!==email || account.passwordHash!==passwordHash){
    msg.innerHTML='<div class="auth-msg error">Mobile, email or password is incorrect.</div>';return;
  }
  prefillCheckout();
  msg.innerHTML='<div class="auth-msg success">Login successful.</div>';
  setTimeout(renderAccountProfile,400);
}

function renderAccountProfile(){
  const a=getAccount();
  if(!a){accountMode="login";renderAccountAuth();return;}
  const orders=JSON.parse(localStorage.getItem("anmol_customer_orders")||"[]");
  $("accountContent").innerHTML=`
    <h2 class="account-title">My Account</h2>
    <p class="account-subtitle">Manage your Anmol Fashion profile.</p>
    <div class="profile-head"><div class="profile-avatar">${escapeAccountHTML((a.name||"A").charAt(0).toUpperCase())}</div><div><h3>${escapeAccountHTML(a.name)}</h3><p>${escapeAccountHTML(a.email)}</p></div></div>
    <div class="profile-grid">
      <div class="profile-card"><span>Mobile</span><strong>${escapeAccountHTML(a.mobile)}</strong></div>
      <div class="profile-card"><span>Orders on this browser</span><strong>${orders.length}</strong></div>
    </div>
    <div class="account-actions">
      <button class="primary" onclick="closeAll();showOrders()">Track Order</button>
      <button class="outline" onclick="closeAll();openCheckout()">Buy Products</button>
      <button class="outline" onclick="logoutAccount()">Logout</button>
    </div>
    <p class="account-note">Tip: Checkout form me aapka saved name, mobile aur email automatically fill ho jayega.</p>
  `;
}

function escapeAccountHTML(value){return String(value??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function logoutAccount(){clearAccount();toast("Logged out successfully");accountMode="login";renderAccountAuth();}
function prefillCheckout(){
  const a=getAccount();if(!a)return;
  if($("customerName"))$("customerName").value=a.name||"";
  if($("customerMobile"))$("customerMobile").value=a.mobile||"";
  if($("customerEmail"))$("customerEmail").value=a.email||"";
}

const originalPlaceOrder=placeOrder;
placeOrder=async function(e){
  await originalPlaceOrder(e);
  const msg=$("orderMessage");
  if(msg && msg.textContent.includes("Order placed successfully")){
    const a=getAccount();
    if(a){
      const id=localStorage.getItem("anmol_last_order");
      const orders=JSON.parse(localStorage.getItem("anmol_customer_orders")||"[]");
      if(id && !orders.includes(id)){orders.unshift(id);localStorage.setItem("anmol_customer_orders",JSON.stringify(orders));}
    }
  }
};

const _openCheckout=openCheckout;
openCheckout=function(){_openCheckout();prefillCheckout();};

// Restore saved account data into checkout when the page loads.
setTimeout(prefillCheckout,0);
