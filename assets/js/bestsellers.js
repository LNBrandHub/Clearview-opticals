// =================================
// BEST SELLERS (homepage)
// =================================

const bestsellersGrid = document.getElementById("bestsellersGrid");

// Manually curated best sellers, in display order.
// Swap these IDs with whichever products you actually sell most.
const BESTSELLER_IDS = [2, 6, 8];

// --- Alternative: auto-pick the 3 highest-priced products ---
// const BESTSELLER_IDS = [...products]
//   .sort((a, b) => b.price - a.price)
//   .slice(0, 3)
//   .map((p) => p.id);

if (bestsellersGrid) {
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

  const bestsellers = BESTSELLER_IDS.map((id) =>
    products.find((p) => p.id === id),
  ).filter(Boolean);

  bestsellers.forEach((product) => {
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

    bestsellersGrid.appendChild(card);
  });

  // Delegated click handler
  bestsellersGrid.addEventListener("click", function (e) {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) return;

    if (btn.classList.contains("add-cart-btn")) {
      if (typeof addToCart === "function") addToCart(Number(id));
    } else if (btn.classList.contains("qty-btn")) {
      const delta = btn.classList.contains("increase") ? 1 : -1;
      changeBestsellerQuantity(id, delta);
    } else {
      return;
    }

    updateBestsellerCard(id);
  });

  function changeBestsellerQuantity(id, delta) {
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

  function updateBestsellerCard(id) {
    const numericId = Number(id);
    const currentCart = getCart();
    const item = currentCart.find((i) => i.id === numericId);
    const quantity = item ? item.quantity : 0;

    const control = bestsellersGrid.querySelector(
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
