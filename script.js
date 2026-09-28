const API_BASE = "https://anmol-fashion.onrender.com";

let cart = JSON.parse(localStorage.getItem("anmol_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("anmol_wishlist") || "[]");

let selectedSize = "M";
let selectedColor = "Black";


/* ================= PRODUCTS ================= */

const products = [

  {
    id:1,
    name:"Men's Casual Shirt",
    category:"Men",
    price:499,
    oldPrice:799,
    tag:"Best Seller",
    image:"https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=700&q=85",
    sizes:["S","M","L","XL"],
    colors:["Black","White","Blue"]
  },

  {
    id:2,
    name:"Women's Premium Kurti",
    category:"Women",
    price:599,
    oldPrice:999,
    tag:"New",
    image:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=85",
    sizes:["S","M","L","XL"],
    colors:["Black","Red","Cream"]
  },

  {
    id:3,
    name:"Men's Denim Jeans",
    category:"Men",
    price:799,
    oldPrice:1299,
    tag:"Trending",
    image:"https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=700&q=85",
    sizes:["30","32","34","36"],
    colors:["Blue","Black"]
  },

  {
    id:4,
    name:"Women's Everyday Top",
    category:"Women",
    price:499,
    oldPrice:799,
    tag:"Popular",
    image:"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=700&q=85",
    sizes:["S","M","L","XL"],
    colors:["White","Pink","Black"]
  },

  {
    id:5,
    name:"Kids Premium T-Shirt",
    category:"Kids",
    price:399,
    oldPrice:599,
    tag:"Kids",
    image:"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=85",
    sizes:["4Y","6Y","8Y","10Y"],
    colors:["Blue","Yellow","White"]
  },

  {
    id:6,
    name:"Kids Party Dress",
    category:"Kids",
    price:599,
    oldPrice:899,
    tag:"New",
    image:"https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=700&q=85",
    sizes:["4Y","6Y","8Y","10Y"],
    colors:["Pink","Red","White"]
  }

];


/* ================= HELPERS ================= */

function money(value){

  return "₹" + Number(value).toLocaleString("en-IN");

}


function saveData(){

  localStorage.setItem(
    "anmol_cart",
    JSON.stringify(cart)
  );

  localStorage.setItem(
    "anmol_wishlist",
    JSON.stringify(wishlist)
  );

}


function $(id){

  return document.getElementById(id);

}


/* ================= PRODUCT CARD ================= */

function productCard(product){

  const liked = wishlist.includes(product.id);

  return `

    <article class="product-card"
      onclick="openProduct(${product.id})">

      <div class="product-image">

        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >

        <span class="product-tag">
          ${product.tag}
        </span>

        <button
          class="wishlist-btn"
          onclick="event.stopPropagation(); toggleWishlist(${product.id})">

          ${liked ? "♥" : "♡"}

        </button>

      </div>

      <div class="product-info">

        <h3>${product.name}</h3>

        <div class="product-category">
          ${product.category}
        </div>

        <div class="price">

          ${money(product.price)}

          <span class="old-price">
            ${money(product.oldPrice)}
          </span>

        </div>

      </div>

    </article>

  `;

}


/* ================= RENDER ================= */

function renderProducts(){

  const newBox = $("newProducts");
  const menBox = $("menProducts");
  const womenBox = $("womenProducts");
  const kidsBox = $("kidsProducts");

  if(newBox){

    newBox.innerHTML =
      products.slice(0,4).map(productCard).join("");

  }

  if(menBox){

    menBox.innerHTML =
      products
      .filter(p => p.category === "Men")
      .map(productCard)
      .join("");

  }

  if(womenBox){

    womenBox.innerHTML =
      products
      .filter(p => p.category === "Women")
      .map(productCard)
      .join("");

  }

  if(kidsBox){

    kidsBox.innerHTML =
      products
      .filter(p => p.category === "Kids")
      .map(productCard)
      .join("");

  }

  updateCounts();

}


/* ================= PRODUCT DETAIL ================= */
function openProduct(id){

  const product =
    products.find(p => p.id === id);

  if(!product) return;

  selectedSize =
    product.sizes[1] || product.sizes[0];

  selectedColor =
    product.colors[0];

  let detailQty = 1;

  $("productDetails").innerHTML = `

    <div class="detail">

      <div class="detail-image">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

      </div>


      <div class="detail-info">

        <span class="eyebrow">
          ${product.category} COLLECTION
        </span>

        <h2>${product.name}</h2>


        <div class="detail-price">

          <strong>
            ${money(product.price)}
          </strong>

          <span class="old-price">
            ${money(product.oldPrice)}
          </span>

        </div>


        <p class="detail-description">

          Premium quality fashion designed
          for comfort, confidence and everyday
          style. Carefully selected fabric with
          a modern fit for your everyday look.

        </p>


        <!-- SIZE -->

        <div class="option-title">
          Select Size
        </div>

        <div class="options">

          ${product.sizes.map(size => `

            <button
              class="${size === selectedSize ? "selected" : ""}"
              onclick="selectSize(this,'${size}')">

              ${size}

            </button>

          `).join("")}

        </div>


        <!-- COLOR -->

        <div class="option-title">
          Select Colour
        </div>

        <div class="options">

          ${product.colors.map(color => `

            <button
              class="${color === selectedColor ? "selected" : ""}"
              onclick="selectColor(this,'${color}')">

              ${color}

            </button>

          `).join("")}

        </div>


        <!-- QUANTITY -->

        <div class="option-title">
          Quantity
        </div>

        <div class="quantity-box">

          <button
            onclick="changeDetailQty(-1)">
            −
          </button>

          <span id="detailQty">
            ${detailQty}
          </span>

          <button
            onclick="changeDetailQty(1)">
            +
          </button>

        </div>


        <!-- SHOPPING BUTTONS -->

        <div class="detail-buttons">

          <button
            class="detail-add"
            onclick="addDetailedProduct(${product.id})">

            🛒 ADD TO CART

          </button>


          <button
            class="detail-buy"
            onclick="buyDetailedProduct(${product.id})">

            ⚡ BUY NOW

          </button>

        </div>


        <!-- DELIVERY -->

        <div class="delivery-box">

          <strong>
            Check delivery availability
          </strong>

          <div class="delivery-check">

            <input
              id="deliveryPincode"
              maxlength="6"
              placeholder="Enter pincode"
            >

            <button
              onclick="checkDelivery()">

              CHECK

            </button>

          </div>

          <small
            id="deliveryMessage"
            style="display:block;margin-top:8px;color:#777">

          </small>

        </div>


        <!-- TRUST -->

        <div class="product-trust">

          <div>
            🔒 Secure<br>Payment
          </div>

          <div>
            🚚 Fast<br>Delivery
          </div>

          <div>
            ↩ 7 Day<br>Returns
          </div>

        </div>

      </div>

    </div>
  `;

  $("productModal").classList.add("show");

  window.currentDetailQty = 1;
}
function changeDetailQty(change){

  if(!window.currentDetailQty){
    window.currentDetailQty = 1;
  }

  window.currentDetailQty += change;

  if(window.currentDetailQty < 1){
    window.currentDetailQty = 1;
  }

  if(window.currentDetailQty > 10){
    window.currentDetailQty = 10;
  }

  const qty = $("detailQty");

  if(qty){
    qty.textContent = window.currentDetailQty;
  }
}


function addDetailedProduct(id){

  const product = products.find(p => p.id === id);

  if(!product) return;

  const quantity = window.currentDetailQty || 1;

  const existing = cart.find(item =>
    item.id === id &&
    item.size === selectedSize &&
    item.color === selectedColor
  );

  if(existing){

    existing.qty += quantity;

  }else{

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      qty: quantity
    });

  }

  saveData();
  updateCounts();

  closeModal("productModal");
  openCart();
}


function buyDetailedProduct(id){

  const product = products.find(p => p.id === id);

  if(!product) return;

  const quantity = window.currentDetailQty || 1;

  cart = [{
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    size: selectedSize,
    color: selectedColor,
    qty: quantity
  }];

  saveData();
  updateCounts();

  closeModal("productModal");
  openCheckout();
}


function checkDelivery(){

  const input = $("deliveryPincode");
  const message = $("deliveryMessage");

  if(!input || !message) return;

  const pincode = input.value.trim();

  if(!/^[0-9]{6}$/.test(pincode)){

    message.textContent =
      "Please enter a valid 6 digit pincode.";

    return;
  }

  message.textContent =
    "✓ Delivery available. Estimated delivery: 3–7 working days.";
}



/* ================= CART ================= */

function addToCart(id){

  const product =
    products.find(p => p.id === id);

  if(!product) return;

  const existing =
    cart.find(item =>
      item.id === id &&
      item.size === selectedSize &&
      item.color === selectedColor
    );

  if(existing){

    existing.qty++;

  }else{

    cart.push({

      id:product.id,
      name:product.name,
      price:product.price,
      image:product.image,
      size:selectedSize,
      color:selectedColor,
      qty:1

    });

  }

  saveData();

  updateCounts();

  closeModal("productModal");

  openCart();

}


function updateCartQty(index,change){

  if(!cart[index]) return;

  cart[index].qty += change;

  if(cart[index].qty <= 0){

    cart.splice(index,1);

  }

  saveData();

  renderCart();

  updateCounts();

}


function removeCartItem(index){

  cart.splice(index,1);

  saveData();

  renderCart();

  updateCounts();

}


function renderCart(){

  const box = $("cartItems");

  if(!box) return;

  if(cart.length === 0){

    box.innerHTML = `

      <div style="text-align:center;padding:60px 10px">

        <div style="font-size:50px">🛍</div>

        <h3>Your bag is empty</h3>

        <p style="color:#888;margin-top:8px">
          Add something you love.
        </p>

      </div>

    `;

    $("cartTotal").textContent = "₹0";

    return;

  }

  let total = 0;

  box.innerHTML = cart.map((item,index) => {

    total += item.price * item.qty;

    return `

      <div class="cart-item">

        <img src="${item.image}" alt="${item.name}">

        <div>

          <h4>${item.name}</h4>

          <p>
            Size: ${item.size} · ${item.color}
          </p>

          <p>${money(item.price)}</p>

          <div class="qty">

            <button
              onclick="updateCartQty(${index},-1)">
              −
            </button>

            <span>${item.qty}</span>

            <button
              onclick="updateCartQty(${index},1)">
              +
            </button>

          </div>

        </div>

        <button
          class="remove"
          onclick="removeCartItem(${index})">

          Remove

        </button>

      </div>

    `;

  }).join("");

  $("cartTotal").textContent = money(total);

}


function openCart(){

  renderCart();

  $("cartDrawer").classList.add("show");
  $("drawerOverlay").classList.add("show");

}


function closeCart(){

  $("cartDrawer").classList.remove("show");
  $("drawerOverlay").classList.remove("show");

}


/* ================= WISHLIST ================= */

function toggleWishlist(id){

  if(wishlist.includes(id)){

    wishlist =
      wishlist.filter(x => x !== id);

  }else{

    wishlist.push(id);

  }

  saveData();

  renderProducts();

  updateCounts();

}


function openWishlist(){

  const liked =
    products.filter(p => wishlist.includes(p.id));

  if(liked.length === 0){

    alert("Your wishlist is empty.");

    return;

  }

  $("searchResults").innerHTML =
    liked.map(productCard).join("");

  $("searchPanel").style.display = "block";

}


/* ================= SEARCH ================= */

function openSearch(){

  $("searchPanel").style.display = "block";

  setTimeout(() => {

    $("searchInput").focus();

  },100);

}


function closeSearch(){

  $("searchPanel").style.display = "none";

}


function searchProducts(){

  const value =
    $("searchInput").value
      .trim()
      .toLowerCase();

  if(!value){

    $("searchResults").innerHTML = "";

    return;

  }

  const results =
    products.filter(p =>
      p.name.toLowerCase().includes(value) ||
      p.category.toLowerCase().includes(value)
    );

  $("searchResults").innerHTML =
    results.length
      ? results.map(productCard).join("")
      : "<p>No products found.</p>";

}


/* ================= COUNTS ================= */

function updateCounts(){

  const cartCount =
    cart.reduce((sum,item) => sum + item.qty,0);

  $("cartCount").textContent = cartCount;

  $("wishlistCount").textContent =
    wishlist.length;

}


/* ================= FILTER ================= */

function filterCategory(category){

  const filtered =
    category === "all"
      ? products
      : products.filter(p => p.category === category);

  $("newProducts").innerHTML =
    filtered.map(productCard).join("");

  window.scrollTo({

    top:$("new").offsetTop - 80,
    behavior:"smooth"

  });

}


/* ================= CHECKOUT ================= */

function openCheckout(){

  if(cart.length === 0){

    alert("Your cart is empty.");

    return;

  }

  closeCart();

  $("checkoutModal").classList.add("show");

}


async function placeOrder(event){

  event.preventDefault();

  if(cart.length === 0){

    alert("Cart is empty.");

    return;

  }

  const customerName =
    $("customerName").value.trim();

  const mobile =
    $("mobile").value.trim();

  const address =
    $("address").value.trim();

  const city =
    $("city").value.trim();

  const pincode =
    $("pincode").value.trim();

  const email =
    $("email").value.trim();

  const paymentMethod =
    document.querySelector(
      'input[name="paymentMethod"]:checked'
    ).value;


  if(!/^[0-9]{10}$/.test(mobile)){

    alert("Please enter a valid 10 digit mobile number.");

    return;

  }


  if(!/^[0-9]{6}$/.test(pincode)){

    alert("Please enter a valid 6 digit pincode.");

    return;

  }


  const orderId =
    "AF-" + Date.now();


  const total =
    cart.reduce(
      (sum,item) =>
        sum + item.price * item.qty,
      0
    );


  const orderData = {

    orderId,

    customerName,

    mobile,

    email,

    address,

    city,

    pincode,

    paymentMethod,

    items:cart,

    total

  };


  const button =
    event.submitter;

  if(button){

    button.disabled = true;
    button.textContent = "PROCESSING...";

  }


  try{

    const response =
      await fetch(
        `${API_BASE}/api/orders`,
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify(orderData)
        }
      );


    const result =
      await response.json();


    if(!response.ok){

      throw new Error(
        result.message ||
        "Order failed"
      );

    }


    cart = [];

    saveData();

    updateCounts();

    closeModal("checkoutModal");

    $("checkoutForm").reset();

    alert(
      `Order placed successfully!\n\nYour Order ID: ${orderId}`
    );


  }catch(error){

    console.error(error);

    alert(
      "Order place nahi ho saka. Please try again."
    );

  }finally{

    if(button){

      button.disabled = false;
      button.textContent = "PLACE ORDER →";

    }

  }

}


/* ================= MODAL ================= */

function closeModal(id){

  $(id).classList.remove("show");

}


window.addEventListener("click",function(event){

  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      if(event.target === modal){

        modal.classList.remove("show");

      }

    });

});


/* ================= MOBILE ================= */

function toggleMobileMenu(){

  const nav =
    $("navLinks");

  nav.style.display =
    nav.style.display === "flex"
      ? "none"
      : "flex";

}


/* ================= HOME ================= */

function showHome(){

  window.scrollTo({

    top:0,
    behavior:"smooth"

  });

}


/* ================= NEWSLETTER ================= */

function subscribe(event){

  event.preventDefault();

  const email =
    $("newsletterEmail").value;

  alert(
    `Thank you! ${email} is now subscribed to Anmol Fashion.`
  );

  event.target.reset();

}


/* ================= START ================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderProducts();

    renderCart();

    updateCounts();

  }
);
