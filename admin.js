const API = "https://anmol-fashion.onrender.com";

let KEY = sessionStorage.getItem("af_admin_key") || "";
let orders = [];

const $ = (id) => document.getElementById(id);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[c]));

const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0
  });

const dt = (s) =>
  s
    ? new Date(s).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

const st = (s) =>
  String(s || "placed").replaceAll("_", " ");


/* =========================
   API
========================= */

async function api(path, options = {}) {

  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": KEY,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `API Error ${response.status}`);
  }

  return data;
}


/* =========================
   LOGIN
========================= */

async function login() {

  const input = $("key");
  const button = $("loginBtn");
  const message = $("loginMsg");

  const enteredKey = input.value.trim();

  message.textContent = "";

  if (!enteredKey) {
   message.textContent = "Please enter your Admin Key.";

    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = "Connecting...";

  KEY = enteredKey;

  try {

    await api("/api/admin/orders?limit=1");

    sessionStorage.setItem("af_admin_key", KEY);

    $("login").classList.add("hidden");
    $("crm").classList.remove("hidden");

    button.disabled = false;
    button.textContent = "Enter CRM";

    await load();

} catch (error) {
  console.error("CRM LOGIN ERROR:", error);

  KEY = "";
  sessionStorage.removeItem("af_admin_key");

  message.textContent =
    error.message || "Unable to connect to CRM.";

  button.disabled = false;
  button.textContent = "Enter CRM";
  input.focus();
}
}


/* =========================
   LOGIN EVENTS
========================= */

document.addEventListener("DOMContentLoaded", () => {

  const loginButton = $("loginBtn");
  const keyInput = $("key");

  if (loginButton) {
    loginButton.addEventListener("click", login);
  }

  if (keyInput) {

    keyInput.addEventListener("keydown", (event) => {

      if (event.key === "Enter") {
        event.preventDefault();
        login();
      }

    });

  }

  const logout = $("logout");

  if (logout) {

    logout.addEventListener("click", () => {

      sessionStorage.removeItem("af_admin_key");

      location.reload();

    });

  }

  document.querySelectorAll(".nav, .link").forEach((button) => {

    button.addEventListener("click", () => {

      page(button.dataset.page);

    });

  });

  const refresh = $("refresh");

  if (refresh) {
    refresh.addEventListener("click", load);
  }

  const close = $("close");

  if (close) {
    close.addEventListener("click", () => {
      $("modal").classList.add("hidden");
    });
  }

  const modal = $("modal");

  if (modal) {

    modal.addEventListener("click", (event) => {

      if (event.target === modal) {
        modal.classList.add("hidden");
      }

    });

  }

  const search = $("search");

  if (search) {

    search.addEventListener("input", (event) => {

      const q = event.target.value.toLowerCase();

      renderOrders(
        orders.filter((order) =>
          [
            order.order_id,
            order.customer_name,
            order.mobile,
            order.city
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(q)
          )
        )
      );

    });

  }

  /* Auto login if previous session exists */

  if (KEY) {

    $("key").value = KEY;

    login();

  }

});


/* =========================
   NAVIGATION
========================= */

function page(pageName) {

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.add("hidden");
  });

  const target = $(pageName);

  if (target) {
    target.classList.remove("hidden");
  }

  document.querySelectorAll(".nav").forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );

  });

  $("title").textContent =
    pageName.charAt(0).toUpperCase() +
    pageName.slice(1);

  if (pageName === "orders") {
    renderOrders();
  }

  if (pageName === "customers") {
    renderCustomers();
  }
}


/* =========================
   LOAD ORDERS
========================= */

async function load() {

  try {

    const data =
      await api("/api/admin/orders?limit=500");

    orders = data.orders || [];

    renderDashboard();
    renderOrders();
    renderCustomers();

  } catch (error) {

    console.error("LOAD ERROR:", error);

    const recent = $("recent");

    if (recent) {

      recent.innerHTML = `
        <tr>
          <td colspan="6">
            Unable to load orders.
          </td>
        </tr>
      `;

    }

  }
}


/* =========================
   DASHBOARD
========================= */

function renderDashboard() {

  const sales = orders.reduce(
    (sum, order) =>
      sum + Number(order.total || 0),
    0
  );

  const pending = orders.filter(
    (order) =>
      !["delivered", "cancelled"].includes(
        order.status
      )
  ).length;

  const delivered = orders.filter(
    (order) =>
      order.status === "delivered"
  ).length;

  $("ordersCount").textContent =
    orders.length;

  $("sales").textContent =
    money(sales);

  $("pending").textContent =
    pending;

  $("delivered").textContent =
    delivered;

  $("recent").innerHTML =
    orders
      .slice(0, 8)
      .map((order) => row(order, true))
      .join("") ||
    `
      <tr>
        <td colspan="6">
          No orders yet.
        </td>
      </tr>
    `;
}


/* =========================
   ORDER ROW
========================= */

function row(order, recent = false) {

  const itemsCount =
    Array.isArray(order.items)
      ? order.items.reduce(
          (sum, item) =>
            sum + Number(item.qty || 1),
          0
        )
      : "—";

  return `
    <tr>

      <td>
        <b class="id">
          ${esc(order.order_id)}
        </b>

        <span class="sub">
          ${esc(order.payment_method || "COD")}
        </span>
      </td>

      <td>
        <b>
          ${esc(order.customer_name)}
        </b>

        <span class="sub">
          ${esc(order.mobile)}
        </span>
      </td>

      ${
        recent
          ? `
            <td>
              <b>${money(order.total)}</b>
            </td>
          `
          : `
            <td>${itemsCount}</td>

            <td>
              <b>${money(order.total)}</b>
            </td>
          `
      }

      <td>
        <span class="badge ${esc(order.status)}">
          ${esc(st(order.status))}
        </span>
      </td>

      <td>
        ${dt(order.created_at)}
      </td>

      <td>
        <button
          class="action"
          onclick="manage('${esc(order.order_id)}')"
        >
          ${recent ? "View" : "Manage"}
        </button>
      </td>

    </tr>
  `;
}


/* =========================
   ORDERS
========================= */

function renderOrders(list = orders) {

  $("orderRows").innerHTML =
    list.map((order) =>
      row(order, false)
    ).join("") ||
    `
      <tr>
        <td colspan="7">
          No orders found.
        </td>
      </tr>
    `;
}


/* =========================
   CUSTOMERS
========================= */

function renderCustomers() {

  const customers = {};

  orders.forEach((order) => {

    const key =
      order.mobile ||
      order.customer_name ||
      "unknown";

    if (!customers[key]) {

      customers[key] = {
        name: order.customer_name || "Customer",
        mobile: order.mobile || "",
        orders: 0,
        total: 0
      };

    }

    customers[key].orders++;

    customers[key].total +=
      Number(order.total || 0);

  });

  $("customerGrid").innerHTML =
    Object.values(customers)
      .sort((a, b) =>
        b.orders - a.orders
      )
      .map((customer) => {

        const initial =
          (customer.name[0] || "A")
            .toUpperCase();

        return `
          <article class="customer">

            <div class="avatar">
              ${esc(initial)}
            </div>

            <h4>
              ${esc(customer.name)}
            </h4>

            <p>
              ${esc(customer.mobile)}
            </p>

            <b>
              ${customer.orders} order(s)
              ·
              ${money(customer.total)}
            </b>

          </article>
        `;

      })
      .join("") ||
    "<p>No customers yet.</p>";
}


/* =========================
   ORDER MANAGEMENT
========================= */

window.manage = function (id) {

  const order =
    orders.find(
      (item) =>
        item.order_id === id
    );

  if (!order) return;

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  $("modalBody").innerHTML = `

    <div class="kicker">
      ORDER MANAGEMENT
    </div>

    <h2>
      ${esc(order.order_id)}
    </h2>

    <p class="sub">
      ${dt(order.created_at)}
    </p>

    <div class="detail-grid">

      <div class="detail">
        <label>Customer</label>
        <b>
          ${esc(order.customer_name)}
          ·
          ${esc(order.mobile)}
        </b>
      </div>

      <div class="detail">
        <label>Total</label>
        <b>
          ${money(order.total)}
          ·
          ${esc(order.payment_method || "COD")}
        </b>
      </div>

      <div class="detail">
        <label>Address</label>
        <b>
          ${esc(
            [
              order.address,
              order.city,
              order.pincode
            ]
              .filter(Boolean)
              .join(", ")
          )}
        </b>
      </div>

      <div class="detail">
        <label>Products</label>
        <b>
          ${items.length} line item(s)
        </b>
      </div>

    </div>

    <div class="formgrid">

      <div class="field">

        <label>Status</label>

        <select id="s">

          ${
            [
              "placed",
              "confirmed",
              "packed",
              "shipped",
              "out_for_delivery",
              "delivered",
              "cancelled"
            ]
              .map(
                (status) => `
                  <option
                    value="${status}"
                    ${
                      order.status === status
                        ? "selected"
                        : ""
                    }
                  >
                    ${st(status)}
                  </option>
                `
              )
              .join("")
          }

        </select>

      </div>

      <div class="field">

        <label>Courier</label>

        <input
          id="c"
          value="${esc(order.courier_name || "")}"
          placeholder="Courier name"
        >

      </div>

      <div class="field">

        <label>Tracking Number</label>

        <input
          id="t"
          value="${esc(order.tracking_number || "")}"
          placeholder="Tracking number"
        >

      </div>

      <div class="field">

        <label>Expected Delivery</label>

        <input
          id="d"
          type="date"
          value="${esc(order.expected_delivery || "")}"
        >

      </div>

    </div>

    <button
      class="save"
      id="save"
    >
      Save Order Update
    </button>

    <p id="msg"></p>
  `;

  $("modal").classList.remove("hidden");

  $("save").onclick =
    () => save(id);
};


/* =========================
   SAVE ORDER
========================= */

async function save(id) {

  $("save").disabled = true;

  try {

    const data =
      await api(
        "/api/admin/orders/" +
        encodeURIComponent(id),
        {
          method: "PATCH",

          body: JSON.stringify({

            status: $("s").value,

            courier_name:
              $("c").value.trim(),

            tracking_number:
              $("t").value.trim(),

            expected_delivery:
              $("d").value || null

          })

        }
      );

    const index =
      orders.findIndex(
        (order) =>
          order.order_id === id
      );

    if (index >= 0) {
      orders[index] = data.order;
    }

    $("msg").textContent =
      "Saved successfully.";

    setTimeout(() => {

      $("modal").classList.add("hidden");

      renderDashboard();
      renderOrders();
      renderCustomers();

    }, 500);

  } catch (error) {

    console.error(
      "SAVE ERROR:",
      error
    );

    $("msg").textContent =
      error.message;

    $("save").disabled = false;
  }
}
