const productsContainer = document.getElementById("products");
const cartButton = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartOverlay = document.getElementById("cart-overlay");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const whatsappBtn = document.getElementById("whatsapp-btn");
const closeCart = document.getElementById("close-cart");
const clearCart = document.getElementById("clear-cart");
const toast = document.getElementById("toast");
const menuBtn = document.getElementById("menu-btn");
const navMenu = document.getElementById("nav-menu");

let cart = [];

const mobileCartBar = document.createElement("button");
mobileCartBar.className = "mobile-cart-bar";
mobileCartBar.textContent = "🛒 Ver pedido (0) • Bs 0";
document.body.appendChild(mobileCartBar);

function isMobile(){
  return window.innerWidth <= 768;
}

function getQuantity(productId){
  const item = cart.find(product => product.id === productId);
  return item ? item.quantity : 0;
}

function calculateTotals(){
  let totalItems = 0;
  let totalPrice = 0;

  cart.forEach(item => {
    totalItems += item.quantity;
    totalPrice += item.quantity * item.price;
  });

  return { totalItems, totalPrice };
}

function createProductHTML(product){
  const quantity = getQuantity(product.id);

  return `
    <div class="product-card" data-product-id="${product.id}">
      ${quantity > 0 ? `<div class="added-badge">${quantity}</div>` : ""}

      <img src="${product.image}" alt="${product.name}" class="product-image">

      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="price">Bs ${product.price}</p>
      </div>

      ${
        quantity === 0
        ? `<button onclick="addToCart(${product.id})">Agregar</button>`
        : `
          <div class="product-counter">
            <button onclick="decreaseQuantity(${product.id})">-</button>
            <span>${quantity} agregado(s)</span>
            <button onclick="increaseQuantity(${product.id})">+</button>
          </div>
        `
      }
    </div>
  `;
}

function renderProducts(){
  productsContainer.innerHTML = products
    .map(product => createProductHTML(product))
    .join("");
}

function updateProductCard(productId){
  const product = products.find(item => item.id === productId);
  const card = productsContainer.querySelector(
    `.product-card[data-product-id="${productId}"]`
  );

  if(!product || !card) return;

  const quantity = getQuantity(productId);
  const oldBadge = card.querySelector(".added-badge");

  if(quantity > 0){
    if(oldBadge){
      oldBadge.textContent = quantity;
    }else{
      const badge = document.createElement("div");
      badge.className = "added-badge";
      badge.textContent = quantity;
      card.insertAdjacentElement("afterbegin", badge);
    }
  }else{
    if(oldBadge) oldBadge.remove();
  }

  const oldButton = card.querySelector(":scope > button");
  const oldCounter = card.querySelector(".product-counter");

  if(quantity === 0){
    if(oldCounter){
      oldCounter.outerHTML = `<button onclick="addToCart(${product.id})">Agregar</button>`;
    }
  }else{
    const counterHTML = `
      <div class="product-counter">
        <button onclick="decreaseQuantity(${product.id})">-</button>
        <span>${quantity} agregado(s)</span>
        <button onclick="increaseQuantity(${product.id})">+</button>
      </div>
    `;

    if(oldCounter){
      oldCounter.outerHTML = counterHTML;
    }else if(oldButton){
      oldButton.outerHTML = counterHTML;
    }
  }
}

function createCartItemHTML(item){
  return `
    <div class="cart-item" data-cart-id="${item.id}">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image">

      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <p><span class="cart-item-qty">${item.quantity}</span> x Bs ${item.price}</p>
        <b class="cart-item-subtotal">Bs ${item.price * item.quantity}</b>
      </div>

      <div class="cart-actions">
        <button onclick="decreaseQuantity(${item.id})">-</button>
        <button onclick="increaseQuantity(${item.id})">+</button>
        <button onclick="removeItem(${item.id})">🗑</button>
      </div>
    </div>
  `;
}

function renderCart(){
  cartItems.innerHTML = "";

  if(cart.length === 0){
    cartItems.innerHTML = "<p>Tu pedido está vacío.</p>";
    return;
  }

  cart.forEach(item => {
    cartItems.innerHTML += createCartItemHTML(item);
  });
}

function updateCartItem(productId){
  if(cartModal.style.display !== "block") return;

  const item = cart.find(product => product.id === productId);
  const row = cartItems.querySelector(`[data-cart-id="${productId}"]`);

  if(!item){
    if(row) row.remove();

    if(cart.length === 0){
      cartItems.innerHTML = "<p>Tu pedido está vacío.</p>";
    }

    return;
  }

  if(!row){
    if(cartItems.textContent.includes("Tu pedido está vacío")){
      cartItems.innerHTML = "";
    }

    cartItems.insertAdjacentHTML("beforeend", createCartItemHTML(item));
    return;
  }

  const qty = row.querySelector(".cart-item-qty");
  const subtotal = row.querySelector(".cart-item-subtotal");

  if(qty) qty.textContent = item.quantity;
  if(subtotal) subtotal.textContent = `Bs ${item.price * item.quantity}`;
}

function updateCartSummary(){
  const { totalItems, totalPrice } = calculateTotals();

  const cartCount = cartButton.querySelector(".cart-count");
  if(cartCount) cartCount.textContent = totalItems;

  cartTotal.textContent = `Total productos: Bs ${totalPrice}`;
  mobileCartBar.textContent = `🛒 Ver pedido (${totalItems}) • Bs ${totalPrice}`;

  if(totalItems === 0 || cartModal.style.display === "block" || !isMobile()){
    mobileCartBar.style.setProperty("display", "none", "important");
  }else{
    mobileCartBar.style.setProperty("display", "flex", "important");
  }

  whatsappBtn.disabled = cart.length === 0;
}

function addToCart(productId){
  const product = products.find(item => item.id === productId);
  const existingProduct = cart.find(item => item.id === productId);

  if(!product) return;

  if(existingProduct){
    existingProduct.quantity++;
  }else{
    cart.push({
      ...product,
      quantity:1
    });
  }

  updateCartSummary();
  updateProductCard(productId);
  updateCartItem(productId);
  showToast("✅ Producto agregado");
}

function increaseQuantity(productId){
  const item = cart.find(product => product.id === productId);

  if(item) item.quantity++;

  updateCartSummary();
  updateProductCard(productId);
  updateCartItem(productId);
}

function decreaseQuantity(productId){
  const item = cart.find(product => product.id === productId);

  if(item){
    item.quantity--;

    if(item.quantity <= 0){
      cart = cart.filter(product => product.id !== productId);
    }
  }

  updateCartSummary();
  updateProductCard(productId);
  updateCartItem(productId);
}

function removeItem(productId){
  cart = cart.filter(product => product.id !== productId);

  updateCartSummary();
  updateProductCard(productId);
  updateCartItem(productId);
}

function openCart(){
  cartModal.style.display = "block";
  cartOverlay.style.display = "block";
  mobileCartBar.style.setProperty("display", "none", "important");
  renderCart();
  updateCartSummary();
}

function closeCartModal(){
  cartModal.style.display = "none";
  cartOverlay.style.display = "none";
  updateCartSummary();
}

function showToast(message){
  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

cartButton.addEventListener("click", openCart);
mobileCartBar.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartModal);
cartOverlay.addEventListener("click", closeCartModal);

clearCart.addEventListener("click", () => {
  const productIds = cart.map(item => item.id);

  cart = [];

  updateCartSummary();
  renderCart();

  productIds.forEach(productId => {
    updateProductCard(productId);
  });

  showToast("🗑 Carrito vacío");
});

menuBtn.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

navMenu.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });
});

window.addEventListener("resize", updateCartSummary);

whatsappBtn.addEventListener("click", () => {
  if(cart.length === 0){
    alert("Tu pedido está vacío");
    return;
  }

  let message = "Hola Sabor de Casa 👋%0A%0A";
  message += "Quiero realizar el siguiente pedido:%0A%0A";

  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    message += `${item.quantity}x ${item.name} - Bs ${subtotal}%0A`;
  });

  message += `%0A💰 Total productos: Bs ${total}%0A%0A`;
  message += "Quedo atento(a) al código QR para realizar el pago.%0A%0A";
  message += "🚚 Después de verificar el pago, agradeceré que me envíen el enlace de seguimiento del conductor de InDrive o Yango.%0A";
  message += "Entiendo que el costo del envío se cancela por separado directamente al conductor.";

  window.open(
    "https://wa.me/59175125413?text=" + message,
    "_blank"
  );

  const productIds = cart.map(item => item.id);

  cart = [];

  updateCartSummary();
  renderCart();

  productIds.forEach(productId => {
    updateProductCard(productId);
  });

  closeCartModal();
  showToast("✅ Gracias por tu pedido");
});

renderProducts();
updateCartSummary();
