const API_BASE = "https://anmol-fashion.onrender.com";

let cart = [];

function addProduct(name, price, sizeId, colorId) {

  const size = document.getElementById(sizeId).value;
  const color = document.getElementById(colorId).value;

  if (!size) {
    alert("Please select Size");
    return;
  }

  if (!color) {
    alert("Please select Colour");
    return;
  }

  const existingItem = cart.find(item =>
    item.name === name &&
    item.size === size &&
    item.color === color
  );

  if (existingItem) {

    existingItem.quantity++;

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

  cart[index].quantity++;

  updateCart();
}


function decreaseQuantity(index) {

  if (cart[index].quantity > 1) {

    cart[index].quantity--;

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

  document.getElementById("cartCount").textContent =
    cart.reduce((total, item) => total + item.quantity, 0);

  const cartItems =
    document.getElementById("cartItems");

  const cartTotal =
    document.getElementById("cartTotal");

  if (cart.length === 0) {

    cartItems.innerHTML =
      "<p>Your cart is empty.</p>";

    cartTotal.textContent = "0";

    return;
  }

  let total = 0;

  cartItems.innerHTML = cart.map((item, index) => {

    const itemTotal =
      item.price * item.quantity;

    total += itemTotal;

    return `
      <div class="cart-item">

        <div>
          <strong>${item.name}</strong>

          <br>

          Size: ${item.size}

          <br>

          Colour: ${item.color}

          <br>

          ₹${item.price} × ${item.quantity}
        </div>

        <div>

          <button
            type="button"
            onclick="decreaseQuantity(${index})">
            −
          </button>

          <b>${item.quantity}</b>

          <button
            type="button"
            onclick="increaseQuantity(${index})">
            +
          </button>

          <button
            type="button"
            onclick="removeFromCart(${index})">
            Remove
          </button>

        </div>

      </div>
    `;

  }).join("");

  cartTotal.textContent = total;
}


function toggleMenu() {

  document
    .getElementById("nav")
    .classList.toggle("show");

}


document
  .getElementById("orderForm")
  .addEventListener("submit", async function(event) {

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

    const total =
      cart.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );

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

    message.textContent =
      "Order submit ho raha hai...";


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


      const result =
        await response.json();


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

      document
        .getElementById("orderForm")
        .reset();


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
