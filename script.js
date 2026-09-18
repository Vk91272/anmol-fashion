const API_BASE = "https://anmol-fashion.onrender.com";

let cart = [];

function addToCart(name, price) {
  cart.push({
    name: name,
    price: price
  });

  updateCart();

  alert(name + " cart me add ho gaya!");
}

function updateCart() {

  document.getElementById("cartCount").textContent = cart.length;

  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0";
    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map((item, index) => {

    total += item.price;

    return `
      <div class="cart-item">
        <span>${item.name} - ₹${item.price}</span>
        <button type="button" onclick="removeFromCart(${index})">
          Remove
        </button>
      </div>
    `;

  }).join("");

  cartTotal.textContent = total;
}

function removeFromCart(index) {

  cart.splice(index, 1);

  updateCart();
}

function toggleMenu() {

  document.getElementById("nav").classList.toggle("show");
}


document
  .getElementById("orderForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();

    if (cart.length === 0) {
      alert("Pehle koi product cart me add karein.");
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

    const total =
      cart.reduce((sum, item) => sum + item.price, 0);

    const orderId =
      "AF-" + Date.now();

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

    const message =
      document.getElementById("orderMessage");

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
        "Order successfully place ho gaya!\nOrder ID: " +
        orderId
      );

      cart = [];

      updateCart();

      document.getElementById("orderForm").reset();

    } catch (error) {

      console.error(error);

      message.textContent =
        "❌ Order submit nahi hua. Please dobara try karein.";

      alert(
        "Order submit nahi hua. Please dobara try karein."
      );
    }

  });

updateCart();
