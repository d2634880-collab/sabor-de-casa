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

function renderProducts(){
  productsContainer.innerHTML = "";

  products.forEach(product => {
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    productsContainer.innerHTML += `
      <div class="product-card">
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
  });
}

function addToCart(productId){
  const product = products.find(item => item.id === productId);
  const existingProduct = cart.find(item => item.id === productId);

  if(existingProduct){
    existingProduct.quantity++;
  }else{
    cart.push({
      ...product,
      quantity:1
    });
  }

  showToast("✅ Producto agregado");
  updateCart();
}

function updateCart(){
  let totalItems = 0;
  let totalPrice = 0;

  cartItems.innerHTML = "";

  if(cart.length === 0){
    cartItems.innerHTML = "<p>Tu pedido está vacío.</p>";
  }

  cart.forEach(item => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;

    cartItems.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <p>${item.quantity} x Bs ${item.price}</p>
          <strong>Bs ${item.price * item.quantity}</strong>
        </div>

        <div class="cart-actions">
          <button onclick="decreaseQuantity(${item.id})">-</button>
          <button onclick="increaseQuantity(${item.id})">+</button>
          <button onclick="removeItem(${item.id})">🗑</button>
        </div>
      </div>
    `;
  });

  const cartCount = cartButton.querySelector(".cart-count");
  cartCount.textContent = totalItems;

  cartTotal.textContent = `Total productos: Bs ${totalPrice}`;
  mobileCartBar.textContent = `🛒 Ver pedido (${totalItems}) • Bs ${totalPrice}`;

  if(totalItems === 0 || cartModal.style.display === "block"){
    mobileCartBar.style.display = "none";
  }else{
    mobileCartBar.style.display = "flex";
  }

  whatsappBtn.disabled = cart.length === 0;
  renderProducts();
}

function increaseQuantity(productId){
  const item = cart.find(product => product.id === productId);
  if(item) item.quantity++;
  updateCart();
}

function decreaseQuantity(productId){
  const item = cart.find(product => product.id === productId);

  if(item){
    item.quantity--;

    if(item.quantity <= 0){
      cart = cart.filter(product => product.id !== productId);
    }
  }

  updateCart();
}

function removeItem(productId){
  cart = cart.filter(product => product.id !== productId);
  updateCart();
}

function openCart(){
  cartModal.style.display = "block";
  cartOverlay.style.display = "block";
  mobileCartBar.style.display = "none";
}

function closeCartModal(){
  cartModal.style.display = "none";
  cartOverlay.style.display = "none";
  updateCart();
}

function showToast(message){
  toast.textContent = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

cartButton.addEventListener("click", openCart);
mobileCartBar.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartModal);
cartOverlay.addEventListener("click", closeCartModal);

clearCart.addEventListener("click", () => {
  cart = [];
  updateCart();
  showToast("🗑 Carrito vacío");
});

menuBtn.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

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

  cart = [];
  updateCart();
  closeCartModal();
  showToast("✅ Gracias por tu pedido");
});

updateCart();
