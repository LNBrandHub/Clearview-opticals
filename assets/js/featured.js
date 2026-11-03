// =================================
// FEATURED PRODUCTS (homepage)
// =================================

const featuredGrid = document.getElementById("featuredGrid");

// Choose which product IDs to feature, in display order.
// Change these IDs to feature different frames.
// Randomly pick 3 products each visit
const FEATURED_IDS = [...products]
  .sort(() => Math.random() - 0.5)
  .slice(0, 3)
  .map((p) => p.id);

if (featuredGrid) {
  // formatPrice may exist from shop.js; define a fallback
  const priceFormatter =
    typeof formatPrice === "function"
      ? formatPrice
      : (price) =>
          new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
          }).format(price);

  const cart = typeof getCart === "function" ? getCart() : [];

  const featuredProducts = FEATURED_IDS.map((id) =>
    products.find((p) => p.id === id),
  ).filter(Boolean);

  featuredProducts.forEach((product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const inCart = quantity > 0;

    const card = document.createElement("article");
    card.classList.add("product-card");

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}"
             alt="${product.name}"
             width="600"
             height="600"
             loading="lazy">
      </div>

      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>

        <div class="product-bottom">
          <span class="product-price">${priceFormatter(product.price)}</span>

          <div class="quantity-controls"
               data-id="${product.id}"
               style="display: ${inCart ? "inline-flex" : "none"};">
            <button class="qty-btn decrease" data-id="${product.id}">−</button>
            <span class="qty-value">${quantity}</span>
            <button class="qty-btn increase" data-id="${product.id}">+</button>
          </div>

          <button class="add-cart-btn"
                  data-id="${product.id}"
                  style="display: ${inCart ? "none" : "inline-block"};">
            Add to Cart
          </button>
        </div>
      </div>
    `;

    featuredGrid.appendChild(card);
  });

  // Click handling (same behavior as shop.js)
  featuredGrid.addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains("add-cart-btn")) {
      if (typeof addToCart === "function") addToCart(Number(id));
    } else if (btn.classList.contains("qty-btn")) {
      const delta = btn.classList.contains("increase") ? 1 : -1;
      changeQuantityLocal(id, delta);
    } else {
      return;
    }

    updateFeaturedCard(id);
  });

  function changeQuantityLocal(id, delta) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    let currentCart = getCart();
    const item = currentCart.find((i) => i.id === numericId);

    if (!item) {
      if (delta > 0) addToCart(numericId);
      return;
    }

    item.quantity += delta;
    if (item.quantity <= 0) {
      currentCart = currentCart.filter((i) => i.id !== numericId);
    }
    saveCart(currentCart);
  }

  function updateFeaturedCard(id) {
    const numericId = Number(id);
    const currentCart = getCart();
    const item = currentCart.find((i) => i.id === numericId);
    const quantity = item ? item.quantity : 0;

    const control = featuredGrid.querySelector(
      `.quantity-controls[data-id="${id}"], .add-cart-btn[data-id="${id}"]`,
    );
    if (!control) return;

    const card = control.closest(".product-card");
    if (!card) return;

    const qtyControls = card.querySelector(".quantity-controls");
    const qtyValue = card.querySelector(".qty-value");
    const addBtn = card.querySelector(".add-cart-btn");

    qtyValue.textContent = quantity;
    qtyControls.style.display = quantity > 0 ? "inline-flex" : "none";
    addBtn.style.display = quantity > 0 ? "none" : "inline-block";
  }
}
