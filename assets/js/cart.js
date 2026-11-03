// =================================
// CART STORAGE
// =================================

const CART_KEY = "clearviewCart";

// Normalizes ids to numbers and drops zero/invalid entries on every read,
// so legacy string-id data (e.g. {"id":"6"}) can't break the cart page.
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: Number(item.id),
        quantity: Number(item.quantity) || 0,
      }))
      .filter((item) => Number.isFinite(item.id) && item.quantity > 0);
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// =================================
// CART MUTATIONS
// =================================

function addToCart(productId) {
  const id = Number(productId);
  if (!Number.isFinite(id)) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart(cart);
  showCartNotification("Product added to your cart!");
}

// =================================
// CART BADGE
// =================================

function updateCartCount() {
  const cartCountElement = document.getElementById("cartCount");
  if (!cartCountElement) return;

  const totalItems = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCountElement.textContent = totalItems;
}

// =================================
// NOTIFICATION
// =================================

function showCartNotification(message) {
  let notification = document.getElementById("cartNotification");

  if (!notification) {
    notification = document.createElement("div");
    notification.id = "cartNotification";
    document.body.appendChild(notification);
  }

  notification.textContent = message;
  notification.classList.add("show");

  clearTimeout(window.notificationTimeout);
  window.notificationTimeout = setTimeout(() => {
    notification.classList.remove("show");
  }, 2500);
}

// =================================
// CART PAGE
// =================================

function formatCartPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

function displayCart() {
  const cartContainer = document.getElementById("cartContainer");
  if (!cartContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <h2>Your cart is empty</h2>
        <p>You haven't added any eyewear yet.</p>
        <a href="shop.html" class="btn btn-primary">Explore Collection</a>
      </div>
    `;
    return;
  }

  let cartHTML = "";
  let total = 0;

  cart.forEach((item) => {
    // getCart() already coerces ids, so strict === works.
    const product = products.find((p) => p.id === item.id);
    if (!product) return;

    const subtotal = product.price * item.quantity;
    total += subtotal;

    cartHTML += `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div class="cart-item-details">
          <h3>${product.name}</h3>
          <p>${formatCartPrice(product.price)}</p>
          <div class="quantity-controls">
            <button class="quantity-btn" data-id="${product.id}" data-action="decrease">−</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" data-id="${product.id}" data-action="increase">+</button>
          </div>
        </div>
        <div class="cart-item-price">
          <strong>${formatCartPrice(subtotal)}</strong>
          <button class="remove-item" data-id="${product.id}">Remove</button>
        </div>
      </div>
    `;
  });

  cartContainer.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">${cartHTML}</div>
      <div class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <strong>${formatCartPrice(total)}</strong>
        </div>
        <div class="summary-row">
          <span>Delivery</span>
          <span>To be confirmed</span>
        </div>
        <div class="summary-total">
          <span>Total</span>
          <strong>${formatCartPrice(total)}</strong>
        </div>
        <button class="btn btn-primary checkout-btn">Proceed to Checkout</button>
        <a href="shop.html" class="continue-shopping">Continue Shopping</a>
      </div>
    </div>
  `;
}
// WhatsApp Checkout
function checkoutViaWhatsApp() {
  const cart = getCart();

  // Prevent checkout if cart is empty
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  // ClearView Opticals WhatsApp number
  const businessNumber = "2348065726333";

  let total = 0;

  let message = "Hello ClearView Opticals! I would like to place an order.\n\n";

  message += "*ORDER DETAILS*\n";
  message += "--------------------------\n";

  cart.forEach((item, index) => {
    const product = products.find((product) => product.id === item.id);

    if (!product) return;

    const subtotal = product.price * item.quantity;

    total += subtotal;

    message += `${index + 1}. ${product.name}\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ${formatCartPrice(product.price)}\n`;
    message += `   Subtotal: ${formatCartPrice(subtotal)}\n\n`;
  });

  message += "--------------------------\n";
  message += `*ORDER TOTAL: ${formatCartPrice(total)}*\n\n`;

  message +=
    "Please confirm product availability and provide delivery information.\n\n";

  message += "Thank you!";

  // Encode message for WhatsApp
  const encodedMessage = encodeURIComponent(message);

  // Create WhatsApp link
  const whatsappURL = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

  // Open WhatsApp
  window.open(whatsappURL, "_blank");
}
// =================================
// CART PAGE LISTENERS
// =================================

const cartContainer = document.getElementById("cartContainer");

if (cartContainer) {
  cartContainer.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    const productId = Number(button.dataset.id);
    if (!Number.isFinite(productId)) return;

    if (button.classList.contains("quantity-btn")) {
      const action = button.dataset.action;
      const cart = getCart();
      const item = cart.find((i) => i.id === productId);
      if (!item) return;

      if (action === "increase") item.quantity++;
      if (action === "decrease") item.quantity--;

      const updatedCart = cart.filter((i) => i.quantity > 0);
      saveCart(updatedCart);
      displayCart();
      return;
    }

    if (button.classList.contains("remove-item")) {
      const updatedCart = getCart().filter((i) => i.id !== productId);
      saveCart(updatedCart);
      displayCart();
    }
  });
}
// Checkout button event listener
if (cartContainer) {
  cartContainer.addEventListener("click", function (event) {
    if (event.target.closest(".checkout-btn")) {
      checkoutViaWhatsApp();
    }
  });
}
// =================================
// INIT
// =================================

displayCart();
updateCartCount();
