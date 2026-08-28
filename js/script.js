/* =========================================================================
   THE CROCHET QUEEN — script.js
   Vanilla JavaScript only. No build step, no backend, no dependencies.
   ========================================================================= */

/* =========================================================================
   1. PRODUCT CONFIGURATION
   -------------------------------------------------------------------------
   To add a new product: copy one object below, give it a new unique "id",
   change the values, and save. A new product card is generated
   automatically — you do not need to touch the HTML or CSS.

   Fields:
     id          - unique number, never reuse an old id
     name        - product name shown on the card
     code        - your internal product code (shown on card + order email)
     description - one short sentence
     price       - number only, in Indian Rupees (no ₹ symbol, no commas)
     image       - image URL. Can be a local path like "images/tote.jpg"
                   or a remote URL. If it fails to load, a soft placeholder
                   is shown automatically so the layout never breaks.
   ========================================================================= */
const products = [
  {
    id: 1,
    name: "Crochet Flower Bouquet",
    code: "CQ001",
    description: "A beautiful handmade crochet flower bouquet that never wilts.",
    price: 899,
    image: "https://placehold.co/600x600/F2E7D6/6B4A34?text=Flower+Bouquet"
  },
  {
    id: 2,
    name: "Handmade Crochet Tote Bag",
    code: "CQ002",
    description: "A sturdy, stylish everyday tote crocheted by hand.",
    price: 1299,
    image: "https://placehold.co/600x600/E9DAC3/6B4A34?text=Tote+Bag"
  },
  {
    id: 3,
    name: "Crochet Teddy Bear",
    code: "CQ003",
    description: "A soft, huggable teddy bear made with cozy yarn.",
    price: 749,
    image: "https://placehold.co/600x600/F2E7D6/6B4A34?text=Teddy+Bear"
  },
  {
    id: 4,
    name: "Crochet Coaster Set",
    code: "CQ004",
    description: "A set of 4 colourful coasters to dress up any table.",
    price: 499,
    image: "https://placehold.co/600x600/E9DAC3/6B4A34?text=Coaster+Set"
  },
  {
    id: 5,
    name: "Crochet Baby Booties",
    code: "CQ005",
    description: "Tiny, soft booties for tiny feet — a lovely baby gift.",
    price: 599,
    image: "https://placehold.co/600x600/F2E7D6/6B4A34?text=Baby+Booties"
  },
  {
    id: 6,
    name: "Crochet Mini Handbag",
    code: "CQ006",
    description: "A charming mini handbag, perfect for evenings out.",
    price: 999,
    image: "https://placehold.co/600x600/E9DAC3/6B4A34?text=Mini+Handbag"
  },
  {
    id: 7,
    name: "Crochet Plant Hanger",
    code: "CQ007",
    description: "A boho-style hanger to give your plants a cozy home.",
    price: 649,
    image: "https://placehold.co/600x600/F2E7D6/6B4A34?text=Plant+Hanger"
  },
  {
    id: 8,
    name: "Crochet Keychain",
    code: "CQ008",
    description: "A tiny handmade charm to personalise your keys or bag.",
    price: 299,
    image: "https://placehold.co/600x600/E9DAC3/6B4A34?text=Keychain"
  }
];

/* =========================================================================
   2. WEB3FORMS CONFIGURATION — REPLACE THESE TWO VALUES
   ========================================================================= */
const WEB3FORMS_CONFIG = {
  // 1) Replace with your Web3Forms Access Key (get one free at https://web3forms.com)
  accessKey: "YOUR_WEB3FORMS_ACCESS_KEY",
  // 2) Replace with the email address where you want to receive orders.
  //    This must match / be added to the account that owns the access key above.
  receivingEmail: "YOUR_ORDER_RECEIVING_EMAIL@example.com",
  endpoint: "https://api.web3forms.com/submit"
};

/* =========================================================================
   3. STATE
   ========================================================================= */
const CART_STORAGE_KEY = "crochetQueenCart";
let cart = loadCart();

/* =========================================================================
   4. DOM REFERENCES
   ========================================================================= */
const productGrid = document.getElementById("product-grid");

const cartCountLabel = document.getElementById("cart-count-label");
const cartCountLabelMobile = document.getElementById("cart-count-label-mobile");

const cartView = document.getElementById("cart-view");
const checkoutView = document.getElementById("checkout-view");

const cartEmptyState = document.getElementById("cart-empty-state");
const cartItemsWrapper = document.getElementById("cart-items-wrapper");
const cartItemsList = document.getElementById("cart-items-list");
const cartTotalItems = document.getElementById("cart-total-items");
const cartTotalAmount = document.getElementById("cart-total-amount");

const orderSummaryList = document.getElementById("order-summary-list");
const orderTotalAmount = document.getElementById("order-total-amount");

const checkoutForm = document.getElementById("checkout-form");
const placeOrderBtn = document.getElementById("place-order-btn");
const placeOrderBtnText = document.getElementById("place-order-btn-text");
const formErrorBanner = document.getElementById("form-error-banner");

const confirmationModal = document.getElementById("confirmation-modal");
const toastEl = document.getElementById("toast");

const menuToggle = document.getElementById("menu-toggle");
const mobileNav = document.getElementById("mobile-nav");

let toastTimer = null;

/* =========================================================================
   5. HELPERS
   ========================================================================= */

/** Format a number as Indian Rupees, e.g. 1899 -> "₹1,899" */
function formatCurrency(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function findProductById(id) {
  return products.find((p) => p.id === id);
}

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Could not read cart from localStorage:", err);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn("Could not save cart to localStorage:", err);
  }
}

function getCartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartGrandTotal() {
  return cart.reduce((sum, item) => {
    const product = findProductById(item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.toggle("toast-error", isError);
  toastEl.hidden = false;
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3800);
}

/* =========================================================================
   6. RENDER PRODUCTS
   ========================================================================= */
function renderProducts() {
  productGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card reveal";
    card.innerHTML = `
      <div class="product-image-wrap">
        <span class="product-code-badge">${product.code}</span>
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.closest('.product-image-wrap').innerHTML = '<span class=\\'product-code-badge\\'>${product.code}</span><div class=\\'img-fallback\\'>${product.name}</div>'"
        />
      </div>
      <div class="product-body">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatCurrency(product.price)}</span>
          <button class="add-to-cart-btn" type="button" data-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  productGrid.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleAddToCart(btn));
  });

  observeReveal();
}

/* =========================================================================
   7. CART OPERATIONS
   ========================================================================= */

function handleAddToCart(btn) {
  const id = Number(btn.dataset.id);
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  updateCartCount();
  renderCart();

  // Visual feedback on the button
  const originalText = btn.textContent;
  btn.textContent = "Added ✓";
  btn.classList.add("is-added");
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove("is-added");
    btn.disabled = false;
  }, 1100);
}

function changeQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart();
  updateCartCount();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  updateCartCount();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const count = getCartItemCount();
  cartCountLabel.textContent = `(${count})`;
  cartCountLabelMobile.textContent = `(${count})`;
  [cartCountLabel, cartCountLabelMobile].forEach((el) => {
    el.classList.remove("bump");
    // Force reflow so the animation can re-trigger
    void el.offsetWidth;
    el.classList.add("bump");
  });
}

/* =========================================================================
   8. RENDER CART
   ========================================================================= */
function renderCart() {
  const isEmpty = cart.length === 0;

  cartEmptyState.hidden = !isEmpty;
  cartItemsWrapper.hidden = isEmpty;

  if (isEmpty) {
    cartItemsList.innerHTML = "";
    return;
  }

  cartItemsList.innerHTML = "";

  cart.forEach((item) => {
    const product = findProductById(item.id);
    if (!product) return;

    const subtotal = product.price * item.quantity;

    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <div class="cart-item-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          onerror="this.parentElement.innerHTML = '<div class=\\'img-fallback\\' style=\\'font-size:0.7rem;\\'>${product.code}</div>'"
        />
      </div>
      <div class="cart-item-info">
        <p class="cart-item-name">${product.name}</p>
        <p class="cart-item-code">Code: ${product.code}</p>
        <p class="cart-item-price">${formatCurrency(product.price)} each</p>
        <div class="qty-control" role="group" aria-label="Quantity for ${product.name}">
          <button class="qty-btn" type="button" data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" type="button" data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-end">
        <span class="cart-item-subtotal">${formatCurrency(subtotal)}</span>
        <button class="remove-btn" type="button" data-id="${product.id}">Remove</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  // Wire up quantity + remove buttons
  cartItemsList.querySelectorAll('[data-action="increase"]').forEach((btn) => {
    btn.addEventListener("click", () => changeQuantity(Number(btn.dataset.id), 1));
  });
  cartItemsList.querySelectorAll('[data-action="decrease"]').forEach((btn) => {
    btn.addEventListener("click", () => changeQuantity(Number(btn.dataset.id), -1));
  });
  cartItemsList.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.id)));
  });

  cartTotalItems.textContent = getCartItemCount();
  cartTotalAmount.textContent = formatCurrency(getCartGrandTotal());
}

/* =========================================================================
   9. CART <-> CHECKOUT VIEW SWITCHING
   ========================================================================= */
function showCartView() {
  cartView.hidden = false;
  checkoutView.hidden = true;
}

function showCheckoutView() {
  if (cart.length === 0) {
    showToast("Your cart is empty. Add something lovely first!", true);
    return;
  }
  renderOrderSummary();
  cartView.hidden = true;
  checkoutView.hidden = false;
  document.getElementById("cart").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderOrderSummary() {
  orderSummaryList.innerHTML = "";

  cart.forEach((item) => {
    const product = findProductById(item.id);
    if (!product) return;
    const subtotal = product.price * item.quantity;

    const li = document.createElement("li");
    li.className = "order-summary-item";
    li.innerHTML = `
      <div>
        <p class="osi-name">${product.name}</p>
        <p class="osi-meta">Code: ${product.code} &middot; Qty: ${item.quantity} &middot; ${formatCurrency(product.price)} each</p>
      </div>
      <span class="osi-subtotal">${formatCurrency(subtotal)}</span>
    `;
    orderSummaryList.appendChild(li);
  });

  orderTotalAmount.textContent = formatCurrency(getCartGrandTotal());
}

/* =========================================================================
   10. FORM VALIDATION
   ========================================================================= */
function validateCheckoutForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }

  const phoneDigits = (data.phone || "").replace(/\D/g, "");
  if (!phoneDigits || phoneDigits.length < 10) {
    errors.phone = "Please enter a valid contact number.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailPattern.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.address || data.address.trim().length < 8) {
    errors.address = "Please enter your full delivery address.";
  }

  return errors;
}

function displayFieldErrors(errors) {
  const fields = ["name", "phone", "email", "address"];
  fields.forEach((field) => {
    const input = document.getElementById(`customer-${field}`);
    const errorEl = document.getElementById(`error-${field}`);
    const group = input.closest(".form-group");
    if (errors[field]) {
      group.classList.add("has-error");
      errorEl.textContent = errors[field];
    } else {
      group.classList.remove("has-error");
      errorEl.textContent = "";
    }
  });
}

/* =========================================================================
   11. BUILD ORDER MESSAGE FOR WEB3FORMS EMAIL
   ========================================================================= */
function buildOrderMessage(customer) {
  const lines = [];

  lines.push("CUSTOMER DETAILS");
  lines.push(`Name: ${customer.name}`);
  lines.push(`Contact: ${customer.phone}`);
  lines.push(`Email: ${customer.email}`);
  lines.push(`Delivery Address: ${customer.address}`);
  lines.push("");
  lines.push("ORDER DETAILS");

  cart.forEach((item) => {
    const product = findProductById(item.id);
    if (!product) return;
    const subtotal = product.price * item.quantity;
    lines.push(`Product: ${product.name}`);
    lines.push(`Code: ${product.code}`);
    lines.push(`Quantity: ${item.quantity}`);
    lines.push(`Price: ${formatCurrency(product.price)}`);
    lines.push(`Subtotal: ${formatCurrency(subtotal)}`);
    lines.push("");
  });

  lines.push(`TOTAL: ${formatCurrency(getCartGrandTotal())}`);

  return lines.join("\n");
}

/* =========================================================================
   12. SUBMIT ORDER VIA WEB3FORMS
   ========================================================================= */
async function handleCheckoutSubmit(event) {
  event.preventDefault();
  formErrorBanner.hidden = true;

  if (cart.length === 0) {
    showToast("Your cart is empty. Add something lovely first!", true);
    return;
  }

  const customer = {
    name: document.getElementById("customer-name").value.trim(),
    phone: document.getElementById("customer-phone").value.trim(),
    email: document.getElementById("customer-email").value.trim(),
    address: document.getElementById("customer-address").value.trim()
  };

  const errors = validateCheckoutForm(customer);
  displayFieldErrors(errors);

  if (Object.keys(errors).length > 0) {
    formErrorBanner.textContent = "Please fix the highlighted fields and try again.";
    formErrorBanner.hidden = false;
    return;
  }

  // Note (see README / section 12 of the brief): this is a static GitHub Pages
  // site with no backend, so the Web3Forms access key below is necessarily
  // visible in the shipped frontend JavaScript. Web3Forms is designed for
  // this: the key only allows submitting forms to your inbox, it cannot be
  // used to read your account or past submissions.
  const payload = {
    access_key: WEB3FORMS_CONFIG.accessKey,
    to: WEB3FORMS_CONFIG.receivingEmail,
    subject: `New Order — The Crochet Queen (${formatCurrency(getCartGrandTotal())})`,
    from_name: "The Crochet Queen — Website",
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    delivery_address: customer.address,
    order_total: formatCurrency(getCartGrandTotal()),
    message: buildOrderMessage(customer)
  };

  setPlacingOrderState(true);

  try {
    const response = await fetch(WEB3FORMS_CONFIG.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));

    if (response.ok && result.success) {
      onOrderSuccess();
    } else {
      onOrderFailure(result.message);
    }
  } catch (err) {
    console.error("Order submission failed:", err);
    onOrderFailure();
  } finally {
    setPlacingOrderState(false);
  }
}

function setPlacingOrderState(isPlacing) {
  placeOrderBtn.disabled = isPlacing;
  placeOrderBtnText.textContent = isPlacing ? "Placing Order..." : "Place Order";
}

function onOrderSuccess() {
  clearCart();
  checkoutForm.reset();
  displayFieldErrors({});
  formErrorBanner.hidden = true;
  showConfirmationModal();
}

function onOrderFailure(customMessage) {
  formErrorBanner.textContent =
    customMessage || "Something went wrong while placing your order. Please try again.";
  formErrorBanner.hidden = false;
  showToast("Something went wrong while placing your order. Please try again.", true);
  // Cart is intentionally NOT cleared so the user can retry.
}

/* =========================================================================
   13. CONFIRMATION MODAL
   ========================================================================= */
function showConfirmationModal() {
  confirmationModal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("go-home-btn").focus();
}

function hideConfirmationModal() {
  confirmationModal.hidden = true;
  document.body.style.overflow = "";
}

/* =========================================================================
   14. SCROLL REVEAL ANIMATION
   ========================================================================= */
function observeReveal() {
  const items = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => observer.observe(el));
}

/* =========================================================================
   15. MOBILE NAVIGATION
   ========================================================================= */
function toggleMobileNav() {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  mobileNav.hidden = isOpen;
}

function closeMobileNav() {
  menuToggle.setAttribute("aria-expanded", "false");
  mobileNav.hidden = true;
}

/* =========================================================================
   16. EVENT WIRING
   ========================================================================= */
function initEventListeners() {
  document.getElementById("go-to-checkout-btn").addEventListener("click", showCheckoutView);
  document.getElementById("back-to-cart-btn").addEventListener("click", showCartView);

  checkoutForm.addEventListener("submit", handleCheckoutSubmit);

  document.getElementById("continue-shopping-btn").addEventListener("click", () => {
    hideConfirmationModal();
    showCartView();
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("go-home-btn").addEventListener("click", () => {
    hideConfirmationModal();
    showCartView();
    document.getElementById("home").scrollIntoView({ behavior: "smooth" });
  });

  // Close modal on backdrop click (but not when clicking the modal card itself)
  confirmationModal.addEventListener("click", (e) => {
    if (e.target === confirmationModal) {
      hideConfirmationModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !confirmationModal.hidden) {
      hideConfirmationModal();
    }
  });

  menuToggle.addEventListener("click", toggleMobileNav);
  mobileNav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  // "Shop Collection" hero button already uses a normal anchor link with
  // native smooth scrolling (see html { scroll-behavior: smooth } in CSS).
}

/* =========================================================================
   17. INIT
   ========================================================================= */
function init() {
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
  updateCartCount();
  showCartView();
  initEventListeners();
}

document.addEventListener("DOMContentLoaded", init);
