// =================================
// PRODUCT DISPLAY
// =================================

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const filterButtons = document.querySelectorAll(".filter-btn");

// =================================
// FORMAT PRICE
// =================================

function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

// =================================
// DISPLAY PRODUCTS
// =================================

function displayProducts(productList) {
  if (!productGrid) return;

  productGrid.innerHTML = "";

  if (productCount) {
    productCount.textContent = `${productList.length} Products`;
  }

  if (productList.length === 0) {
    productGrid.innerHTML = "<p>No products found.</p>";
    return;
  }

  // getCart comes from cart.js (loaded before this file).
  const cart = typeof getCart === "function" ? getCart() : [];

  productList.forEach(function (product) {
    const productCard = document.createElement("article");
    productCard.classList.add("product-card");

    const cartItem = cart.find(
      (item) => String(item.id) === String(product.id),
    );
    const quantity = cartItem ? cartItem.quantity : 0;
    const inCart = quantity > 0;

    productCard.innerHTML = `
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

          <span class="product-price">${formatPrice(product.price)}</span>

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

    productGrid.appendChild(productCard);
  });
}

// =================================
// PRODUCT FILTERING
// =================================

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedCategory = button.dataset.category;

    filterButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });
    button.classList.add("active");

    if (selectedCategory === "All") {
      displayProducts(products);
    } else {
      displayProducts(
        products.filter((product) => product.category === selectedCategory),
      );
    }
  });
});

// =================================
// QUANTITY CHANGE (uses cart.js functions)
// =================================

function changeQuantity(id, delta) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return;

  let cart = getCart(); // from cart.js
  const item = cart.find((i) => i.id === numericId);

  if (!item) {
    if (delta > 0 && typeof addToCart === "function") {
      addToCart(numericId); // from cart.js
    }
    return;
  }

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.id !== numericId);
  }

  saveCart(cart); // from cart.js
}

// =================================
// UPDATE ONE CARD IN PLACE (no re-render, no image bounce)
// =================================

function updateCard(id) {
  const numericId = Number(id);
  const cart = getCart(); // from cart.js
  const item = cart.find((i) => i.id === numericId);
  const quantity = item ? item.quantity : 0;

  const control = productGrid.querySelector(
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

// =================================
// CLICK HANDLER (delegated)
// =================================

productGrid.addEventListener("click", function (e) {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;
  if (!id) return;

  if (btn.classList.contains("add-cart-btn")) {
    if (typeof addToCart === "function") addToCart(Number(id));
  } else if (btn.classList.contains("qty-btn")) {
    const delta = btn.classList.contains("increase") ? 1 : -1;
    changeQuantity(id, delta);
  } else {
    return;
  }

  updateCard(id);
});

// =================================
// INITIAL DISPLAY
// =================================

displayProducts(products);
