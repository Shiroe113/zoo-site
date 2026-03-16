// ===================== STATE =====================
let PRODUCTS = [];
let cart = JSON.parse(localStorage.getItem("zm_cart") || "[]");
let activeCategory = "all";
let searchQuery = "";

// ===================== INIT =====================
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  bindCategories();

  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "<p style='text-align:center;padding:40px;color:#888'>Завантаження товарів...</p>";

  fetch("products.json")
    .then(r => {
      if (!r.ok) throw new Error();
      return r.json();
    })
    .then(data => {
      PRODUCTS = data;
      renderProducts();
    })
    .catch(() => {
      grid.innerHTML = "<p style='text-align:center;padding:40px;color:#e53935'>Не вдалося завантажити products.json</p>";
    });
});

// ===================== CATEGORIES =====================
function bindCategories() {
  document.querySelectorAll(".cat-card").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cat-card").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.cat;
      searchQuery = "";
      document.getElementById("searchInput").value = "";
      renderProducts();
    });
  });
}

// ===================== SEARCH =====================
function handleSearch() {
  searchQuery = document.getElementById("searchInput").value.trim().toLowerCase();
  if (searchQuery) {
    activeCategory = "all";
    document.querySelectorAll(".cat-card").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-cat="all"]').classList.add("active");
  }
  renderProducts();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").addEventListener("keydown", e => {
    if (e.key === "Enter") handleSearch();
  });
});

// ===================== RENDER PRODUCTS =====================
function renderProducts() {
  const sort = document.getElementById("sortSelect").value;
  let list = PRODUCTS.filter(p => {
    const catMatch = activeCategory === "all" || p.cat === activeCategory;
    const searchMatch = !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.desc.toLowerCase().includes(searchQuery);
    return catMatch && searchMatch;
  });

  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "uk"));

  const grid = document.getElementById("productsGrid");
  const empty = document.getElementById("catalogEmpty");

  if (list.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  grid.innerHTML = list.map(p => productCardHTML(p)).join("");
}

function productCardHTML(p) {
  const catLabels = { dogs: "Собаки", cats: "Кішки", birds: "Птахи", fish: "Рибки", rodents: "Гризуни" };
  const outOfStock = p.inStock === false;
  return `
    <div class="product-card${outOfStock ? " product-card--unavailable" : ""}" onclick="openModal(${p.id})">
      <div class="product-card__img-wrap">
        ${p.badge && !outOfStock ? `<span class="product-card__badge">${p.badge}</span>` : ""}
        ${outOfStock ? `<span class="product-card__badge product-card__badge--out">Немає в наявності</span>` : ""}
        ${p.image
          ? `<img src="images/${p.image}" alt="${p.name}" class="product-card__img"/>`
          : `<span>${p.emoji || "📦"}</span>`
        }
      </div>
      <div class="product-card__body">
        <span class="product-card__cat">${catLabels[p.cat]}</span>
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__desc">${p.desc}</div>
        <div class="product-card__footer">
          <div>
            <span class="product-card__price">${p.price.toLocaleString("uk")} ₴</span>
            ${p.oldPrice ? `<span class="product-card__old-price">${p.oldPrice.toLocaleString("uk")} ₴</span>` : ""}
          </div>
          ${outOfStock
            ? `<button class="product-card__add product-card__add--disabled" disabled>Немає</button>`
            : `<button class="product-card__add" onclick="event.stopPropagation(); addToCart(${p.id})">До кошика</button>`
          }
        </div>
      </div>
    </div>
  `;
}

// ===================== MODAL =====================
function openModal(id) {
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return;
  const catLabels = { dogs: "Собаки", cats: "Кішки", birds: "Птахи", fish: "Рибки", rodents: "Гризуни" };
  const outOfStock = p.inStock === false;

  document.getElementById("modalCat").textContent = catLabels[p.cat] || "";
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalDesc").textContent = p.desc;
  document.getElementById("modalImg").innerHTML = p.image
    ? `<img src="images/${p.image}" alt="${p.name}"/>`
    : `<span>${p.emoji || "📦"}</span>`;
  document.getElementById("modalPrices").innerHTML = `
    <span class="product-card__price">${p.price.toLocaleString("uk")} ₴</span>
    ${p.oldPrice ? `<span class="product-card__old-price">${p.oldPrice.toLocaleString("uk")} ₴</span>` : ""}
  `;
  const btn = document.getElementById("modalBtn");
  if (outOfStock) {
    btn.textContent = "Немає в наявності";
    btn.disabled = true;
    btn.classList.add("btn--disabled");
    btn.onclick = null;
  } else {
    btn.textContent = "До кошика";
    btn.disabled = false;
    btn.classList.remove("btn--disabled");
    btn.onclick = () => { addToCart(p.id); closeModal(); };
  }

  document.getElementById("modalOverlay").classList.add("open");
  document.getElementById("productModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  document.getElementById("productModal").classList.remove("open");
  document.body.style.overflow = "";
}

// ===================== CART =====================
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} додано до кошика`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("zm_cart", JSON.stringify(cart));
}

function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById("cartCount").textContent = count;

  const itemsEl = document.getElementById("cartItems");
  const footerEl = document.getElementById("cartFooter");
  const emptyEl = document.getElementById("cartEmpty");

  if (cart.length === 0) {
    itemsEl.innerHTML = "";
    footerEl.style.display = "none";
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  footerEl.style.display = "flex";

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span class="cart-item__emoji">${item.emoji}</span>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">${(item.price * item.qty).toLocaleString("uk")} ₴</div>
      </div>
      <div class="cart-item__qty">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, +1)">+</button>
      </div>
    </div>
  `).join("");

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById("cartTotal").textContent = total.toLocaleString("uk") + " ₴";
}

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
}

function checkout() {
  if (cart.length === 0) return;
  showToast("Замовлення оформлено! Дякуємо за покупку 🎉");
  cart = [];
  saveCart();
  renderCart();
  toggleCart();
}

// ===================== CONTACT FORM =====================
function submitForm(e) {
  e.preventDefault();
  showToast("Повідомлення відправлено! Ми зв'яжемося з вами незабаром.");
  e.target.reset();
}

// ===================== TOAST =====================
let toastTimer;
function showToast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}
