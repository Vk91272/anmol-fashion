const API_BASE = "https://anmol-fashion.onrender.com";

let cart = [];

function addProduct(name, price, sizeId, colorId) {
  const sizeElement = document.getElementById(sizeId);
  const colorElement = document.getElementById(colorId);

  if (!sizeElement || !colorElement) {
    alert("Product option error. Please refresh the page.");
    return;
  }

  const size = sizeElement.value;
  const color = colorElement.value;

  if (size === "") {
    alert("Please select Size");
    return;
  }

  if (color === "") {
    alert("Please select Colour");
    return;
  }

  const existingItem = cart.find(function(item) {
    return (
      item.name === name &&
      item.size === size &&
      item.color === color
    );
  });

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      size: size,
      color: color,
      quantity: 1
    });
  }

  updateCart();

  alert(name + " cart me add ho gaya!");
}

function increaseQuantity(index) {
  if (cart[index]) {
    cart[index].quantity += 1;
    updateCart();
  }
}

function decreaseQuantity(index) {
  if (!cart[index]) return;

  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  updateCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartCount || !cartItems || !cartTotal) {
    return;
  }

  const totalQuantity = cart.reduce(function(total, item) {
    return total + item.quantity;
  }, 0);

  cartCount.textContent = totalQuantity;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0";
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map(function(item, index) {

    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    return `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong><br>
          Size: ${item.size}<br>
          Colour: ${item.color}<br>
          Price: ₹${item.price}
        </div>

        <div>
          <button type="button" onclick="decreaseQuantity(${index})">−</button>

          <b>${item.quantity}</b>

          <button type="button" onclick="increaseQuantity(${index})">+</button>

          <button type="button" onclick="removeFromCart(${index})">
            Remove
          </button>
        </div>
      </div>
    `;

  }).join("");

  cartTotal.textContent = total;
}

function toggleMenu() {
  const nav = document.getElementById("nav");

  if (nav) {
    nav.classList.toggle("show");
  }
}

const orderForm = document.getElementById("orderForm");

if (orderForm) {

  orderForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    if (cart.length === 0) {
      alert("Pehle product cart me add karein.");
      return;
    }

    const customerName =
      document.getElementById("customerName").value.trim();

    const mobile =
      document.getElementById("mobile").value.trim();

    const address =
      document.getElementById("address").value.trim();

    const city =
      document.getElementById("city").value.trim();

    const pincode =
      document.getElementById("pincode").value.trim();

    const paymentMethod =
      document.getElementById("paymentMethod").value;

    const total = cart.reduce(function(sum, item) {
      return sum + item.price * item.quantity;
    }, 0);

    const orderId = "AF-" + Date.now();

    const orderData = {
      order_id: orderId,
      customer_name: customerName,
      mobile: mobile,
      address: address,
      city: city,
      pincode: pincode,
      payment_method: paymentMethod,
      items: cart,
      total: total
    };

    const message = document.getElementById("orderMessage");

    message.textContent = "Order submit ho raha hai...";

    try {

      const response = await fetch(
        API_BASE + "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Order submit nahi hua"
        );
      }

      message.textContent =
        "✅ Order successfully place ho gaya! Order ID: " +
        orderId;

      alert(
        "Order successfully place ho gaya!\n\nOrder ID: " +
        orderId
      );

      cart = [];

      updateCart();

      orderForm.reset();

    } catch (error) {

      console.error(error);

      message.textContent =
        "❌ Order submit nahi hua. Please dobara try karein.";

      alert(
        "Order submit nahi hua. Please dobara try karein."
      );
    }

  });
}

updateCart();
```javascript
/* =========================================
   PRODUCT DETAILS
========================================= */

let currentProduct = null;
let detailsQuantity = 1;

function openProductDetails(
  name,
  price,
  oldPrice,
  imageClass,
  description,
  sizes,
  colors,
  sizeId,
  colorId
) {

  currentProduct = {
    name: name,
    price: price,
    oldPrice: oldPrice,
    imageClass: imageClass,
    description: description,
    sizes: sizes,
    colors: colors,
    sizeId: sizeId,
    colorId: colorId
  };

  detailsQuantity = 1;

  const detailsPage = document.getElementById("productDetails");

  document.getElementById("detailsName").textContent = name;
  document.getElementById("detailsPrice").textContent = price;
  document.getElementById("detailsOldPrice").textContent =
    "₹" + oldPrice;

  document.getElementById("detailsDescription").textContent =
    description;

  const detailsPic = document.getElementById("detailsPic");

  detailsPic.className = "details-pic " + imageClass;

  const sizeSelect = document.getElementById("detailsSize");
  const colorSelect = document.getElementById("detailsColor");

  sizeSelect.innerHTML =
    '<option value="">Select Size</option>';

  colorSelect.innerHTML =
    '<option value="">Select Colour</option>';

  sizes.forEach(function(size) {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = size;
    sizeSelect.appendChild(option);
  });

  colors.forEach(function(color) {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    colorSelect.appendChild(option);
  });

  document.getElementById("detailsQuantity").textContent = "1";

  detailsPage.classList.add("active");

  document.body.classList.add("details-open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function closeProductDetails() {

  const detailsPage =
    document.getElementById("productDetails");

  detailsPage.classList.remove("active");

  document.body.classList.remove("details-open");

}


function changeDetailsQuantity(amount) {

  detailsQuantity += amount;

  if (detailsQuantity < 1) {
    detailsQuantity = 1;
  }

  if (detailsQuantity > 10) {
    detailsQuantity = 10;
  }

  document.getElementById("detailsQuantity").textContent =
    detailsQuantity;
}


function addDetailsProduct(buyNow = false) {

  if (!currentProduct) {
    return;
  }

  const size =
    document.getElementById("detailsSize").value;

  const color =
    document.getElementById("detailsColor").value;

  if (size === "") {
    alert("Please select Size");
    return;
  }

  if (color === "") {
    alert("Please select Colour");
    return;
  }

  const existingItem = cart.find(function(item) {

    return (
      item.name === currentProduct.name &&
      item.size === size &&
      item.color === color
    );

  });

  if (existingItem) {

    existingItem.quantity += detailsQuantity;

  } else {

    cart.push({
      name: currentProduct.name,
      price: currentProduct.price,
      size: size,
      color: color,
      quantity: detailsQuantity
    });

  }

  updateCart();

  alert(
    currentProduct.name +
    " cart me " +
    detailsQuantity +
    " item add ho gaya!"
  );

  closeProductDetails();

  if (buyNow) {

    setTimeout(function() {

      const orderBox =
        document.querySelector(".order-box");

      if (orderBox) {

        orderBox.scrollIntoView({
          behavior: "smooth"
        });

      }

    }, 300);

  }

}
```

