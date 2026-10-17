/**
 * TESLA PREMIUM SHOWROOM - LÓGICA DE APLICACIÓN FRONTEND
 * Cumplimiento total de especificaciones técnicas: F-01 a F-12
 * Vanilla JavaScript (ES6+), sin librerías externas.
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // =========================================================================
  // ESTADO GLOBAL DE LA APLICACIÓN
  // =========================================================================
  const state = {
    vehicles: VEHICLES_DATA || [],
    filteredVehicles: [...(VEHICLES_DATA || [])],
    favorites: loadFavorites(),
    currentUser: loadAuthUser(),
    activeCategory: "all",
    searchQuery: "",
    sortBy: "featured",
    selectedVehicleForModal: null,
    selectedColorForModal: null,
    // Comparador
    compareModelA: "model-3",
    compareModelB: "model-y",
    // Compra con papeles
    papersPackageCost: 5200000,
    selectedVehicleForPurchase: "model-3",
    includePapersInPurchase: true,
    // Modo de Tema (oscuro / claro)
    theme: loadTheme(),
    // Simulador
    simulator: {
      vehicleId: "model-3",
      vehiclePrice: 198000000,
      downPaymentPercent: 20, // 20%
      termMonths: 48,
      annualInterestRate: 14.5 // Tasa EA anual orientativa en Colombia (aprox 1.13% mensual)
    }
  };

  // =========================================================================
  // REFERENCIAS DOM PRINCIPALES
  // =========================================================================
  const elements = {
    // Header & Nav
    header: document.getElementById("siteHeader"),
    navToggle: document.getElementById("mobileToggle"),
    mainNavList: document.getElementById("mainNavList"),
    navLoginLink: document.getElementById("navLoginLink"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    favCountBadge: document.getElementById("favBadgeCount"),
    favTriggerBtn: document.getElementById("favTriggerBtn"),

    // Cuenta & Login
    accountMenuContainer: document.getElementById("accountMenuContainer"),
    accountTriggerBtn: document.getElementById("accountTriggerBtn"),
    accountBtnText: document.getElementById("accountBtnText"),
    userDropdownMenu: document.getElementById("userDropdownMenu"),
    dropdownUserName: document.getElementById("dropdownUserName"),
    dropdownUserEmail: document.getElementById("dropdownUserEmail"),
    dropdownFavCount: document.getElementById("dropdownFavCount"),
    dropdownFavsBtn: document.getElementById("dropdownFavsBtn"),
    logoutBtn: document.getElementById("logoutBtn"),

    // Modal de Login
    loginModal: document.getElementById("loginModal"),
    closeLoginModalBtn: document.getElementById("closeLoginModalBtn"),
    tabLoginBtn: document.getElementById("tabLoginBtn"),
    tabRegisterBtn: document.getElementById("tabRegisterBtn"),
    loginTabPanel: document.getElementById("loginTabPanel"),
    registerTabPanel: document.getElementById("registerTabPanel"),
    authLoginForm: document.getElementById("authLoginForm"),
    authRegisterForm: document.getElementById("authRegisterForm"),
    demoQuickLoginBtn: document.getElementById("demoQuickLoginBtn"),
    toggleLoginPwdBtn: document.getElementById("toggleLoginPwdBtn"),
    toggleRegPwdBtn: document.getElementById("toggleRegPwdBtn"),
    loginPassword: document.getElementById("loginPassword"),
    regPassword: document.getElementById("regPassword"),

    // Modal de Compra y Papeles
    purchaseModal: document.getElementById("purchaseModal"),
    closePurchaseModalBtn: document.getElementById("closePurchaseModalBtn"),
    purchaseModelSelect: document.getElementById("purchaseModelSelect"),
    purchaseVehicleImg: document.getElementById("purchaseVehicleImg"),
    purchaseCarVersion: document.getElementById("purchaseCarVersion"),
    purchaseBasePrice: document.getElementById("purchaseBasePrice"),
    includePapersCheck: document.getElementById("includePapersCheck"),
    papersPackageBox: document.getElementById("papersPackageBox"),
    summarySubtotalPrice: document.getElementById("summarySubtotalPrice"),
    summaryPapersCost: document.getElementById("summaryPapersCost"),
    summaryTotalPrice: document.getElementById("summaryTotalPrice"),
    purchaseOrderForm: document.getElementById("purchaseOrderForm"),
    buyerName: document.getElementById("buyerName"),
    buyerIdDoc: document.getElementById("buyerIdDoc"),
    buyerPhone: document.getElementById("buyerPhone"),
    buyerEmail: document.getElementById("buyerEmail"),
    buyerCity: document.getElementById("buyerCity"),
    buyerNotes: document.getElementById("buyerNotes"),
    paymentMethod: document.getElementById("paymentMethod"),
    sendOrderWhatsAppBtn: document.getElementById("sendOrderWhatsAppBtn"),
    purchaseStatusAlert: document.getElementById("purchaseStatusAlert"),

    // Widget Flotante de WhatsApp
    whatsappFloatWidget: document.getElementById("whatsappFloatWidget"),
    whatsappBubbleBtn: document.getElementById("whatsappBubbleBtn"),
    whatsappPopover: document.getElementById("whatsappPopover"),
    closeWaPopoverBtn: document.getElementById("closeWaPopoverBtn"),
    startWaChatBtn: document.getElementById("startWaChatBtn"),

    // Grids
    featuredGrid: document.getElementById("featuredGrid"),
    catalogGrid: document.getElementById("catalogGrid"),
    catalogResultsCount: document.getElementById("catalogResultsCount"),

    // Controles de Catálogo
    searchInput: document.getElementById("catalogSearchInput"),
    sortSelect: document.getElementById("catalogSortSelect"),
    categoryPillsContainer: document.getElementById("categoryPillsContainer"),

    // Modal de Detalle
    vehicleModal: document.getElementById("vehicleDetailModal"),
    vehicleModalContent: document.getElementById("vehicleModalBody"),
    closeModalBtn: document.getElementById("closeModalBtn"),

    // Drawer de Favoritos
    favDrawer: document.getElementById("favoritesDrawer"),
    favDrawerCloseBtn: document.getElementById("closeFavDrawerBtn"),
    favDrawerList: document.getElementById("favDrawerList"),
    favDrawerTotal: document.getElementById("favDrawerTotal"),

    // Simulador
    simVehicleSelect: document.getElementById("simVehicleSelect"),
    simPriceInput: document.getElementById("simPriceInput"),
    simDownPercentRange: document.getElementById("simDownPercentRange"),
    simDownPercentLabel: document.getElementById("simDownPercentLabel"),
    simDownAmountLabel: document.getElementById("simDownAmountLabel"),
    simInterestRange: document.getElementById("simInterestRange"),
    simInterestLabel: document.getElementById("simInterestLabel"),
    simTermsContainer: document.getElementById("simTermsContainer"),
    simMonthlyPayment: document.getElementById("simMonthlyPayment"),
    simFinancedAmount: document.getElementById("simFinancedAmount"),
    simTotalInterest: document.getElementById("simTotalInterest"),
    simTotalCredit: document.getElementById("simTotalCredit"),
    simApplyBtn: document.getElementById("simApplyBtn"),

    // Comparador
    compareSelectA: document.getElementById("compareSelectA"),
    compareSelectB: document.getElementById("compareSelectB"),
    compareTableBody: document.getElementById("compareTableBody"),

    // Formulario de Contacto
    contactForm: document.getElementById("commercialContactForm"),
    formModelSelect: document.getElementById("formModelSelect"),
    formStatusAlert: document.getElementById("formStatusAlert"),

    // Modales informativos / Toasts
    toastContainer: document.getElementById("toastContainer")
  };

  // =========================================================================
  // UTILIDADES
  // =========================================================================

  // Formato de moneda colombiana (COP)
  function formatCurrencyCOP(amount) {
    if (isNaN(amount) || amount === null) return "$0 COP";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Notificación tipo Toast
  function showToast(message, type = "info") {
    if (!elements.toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === "success" 
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' 
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
      </svg>
      <span>${escapeHTML(message)}</span>
    `;
    elements.toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Sanitizador simple de texto para seguridad contra inyecciones
  function escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================================
  // GESTIÓN DE FAVORITOS (LOCALSTORAGE SEGURO)
  // =========================================================================

  function isLocalStorageAvailable() {
    try {
      const test = "__test_storage__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadFavorites() {
    if (!isLocalStorageAvailable()) return [];
    try {
      const stored = localStorage.getItem("tesla_premium_favs");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn("No se pudo leer favoritos de localStorage:", e);
      return [];
    }
  }

  function saveFavorites(favs) {
    state.favorites = favs;
    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem("tesla_premium_favs", JSON.stringify(favs));
      } catch (e) {
        console.warn("No se pudo guardar en localStorage:", e);
      }
    }
    updateFavoritesBadge();
    renderFavoritesDrawer();
    updateFavoriteButtonsUI();
    if (elements.dropdownFavCount) {
      elements.dropdownFavCount.textContent = state.favorites.length;
    }
  }

  function loadTheme() {
    if (!isLocalStorageAvailable()) return "dark";
    return localStorage.getItem("tesla_theme") || "dark";
  }

  function applyTheme(theme) {
    state.theme = theme;
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    if (isLocalStorageAvailable()) {
      localStorage.setItem("tesla_theme", theme);
    }
  }

  function toggleTheme() {
    const nextTheme = state.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    showToast(nextTheme === "light" ? "Modo Claro activado" : "Modo Oscuro activado", "info");
  }

  function loadAuthUser() {
    if (!isLocalStorageAvailable()) return null;
    try {
      const stored = localStorage.getItem("tesla_auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.warn("No se pudo leer usuario de localStorage:", e);
      return null;
    }
  }

  function saveAuthUser(user) {
    state.currentUser = user;
    if (isLocalStorageAvailable()) {
      try {
        if (user) {
          localStorage.setItem("tesla_auth_user", JSON.stringify(user));
        } else {
          localStorage.removeItem("tesla_auth_user");
        }
      } catch (e) {
        console.warn("No se pudo guardar usuario en localStorage:", e);
      }
    }
    updateAuthUI();
  }

  function toggleFavorite(vehicleId) {
    const exists = state.favorites.includes(vehicleId);
    let updated;
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    const vehicleName = vehicle ? vehicle.name : "Vehículo";

    if (exists) {
      updated = state.favorites.filter(id => id !== vehicleId);
      showToast(`${vehicleName} eliminado de tus favoritos`, "info");
    } else {
      updated = [...state.favorites, vehicleId];
      showToast(`${vehicleName} guardado en tus favoritos`, "success");
    }
    saveFavorites(updated);
  }

  function updateFavoritesBadge() {
    if (!elements.favCountBadge) return;
    const count = state.favorites.length;
    elements.favCountBadge.textContent = count;
    elements.favCountBadge.style.display = count > 0 ? "flex" : "none";
  }

  function updateFavoriteButtonsUI() {
    document.querySelectorAll(".card-fav-btn").forEach(btn => {
      const id = btn.dataset.vehicleId;
      if (state.favorites.includes(id)) {
        btn.classList.add("is-active");
        btn.setAttribute("aria-label", "Quitar de favoritos");
        btn.setAttribute("title", "Quitar de favoritos");
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      } else {
        btn.classList.remove("is-active");
        btn.setAttribute("aria-label", "Añadir a favoritos");
        btn.setAttribute("title", "Añadir a favoritos");
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      }
    });
  }

  // =========================================================================
  // RENDERIZADO DE TARJETAS DE VEHÍCULOS (HTML SEMÁNTICO)
  // =========================================================================

  function createVehicleCardHTML(vehicle) {
    const isFav = state.favorites.includes(vehicle.id);
    return `
      <article class="vehicle-card" data-vehicle-id="${escapeHTML(vehicle.id)}">
        <div class="card-image-wrap">
          <img src="${escapeHTML(vehicle.image)}" alt="${escapeHTML(vehicle.name)} ${escapeHTML(vehicle.category)}" loading="lazy">
          <span class="card-badge">${escapeHTML(vehicle.badge || vehicle.category)}</span>
          <button type="button" class="card-fav-btn ${isFav ? 'is-active' : ''}" data-vehicle-id="${escapeHTML(vehicle.id)}" aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
        <div class="card-content">
          <div class="card-header-info">
            <h3 class="card-title">${escapeHTML(vehicle.name)}</h3>
            <span class="card-category">${escapeHTML(vehicle.category)}</span>
          </div>
          <p class="card-version">${escapeHTML(vehicle.version)}</p>

          <div class="card-specs-row">
            <div class="spec-mini">
              <span class="spec-mini-val">${vehicle.accelerationSeconds}s</span>
              <span class="spec-mini-lbl">0-100 km/h</span>
            </div>
            <div class="spec-mini">
              <span class="spec-mini-val">${vehicle.rangeKm} km</span>
              <span class="spec-mini-lbl">Autonomía</span>
            </div>
            <div class="spec-mini">
              <span class="spec-mini-val">${vehicle.topSpeedKm} km/h</span>
              <span class="spec-mini-lbl">Vel. Máx</span>
            </div>
          </div>

          <div class="card-price-row">
            <div>
              <span class="card-price-label">Precio Demostrativo Sugerido</span>
              <span class="card-price-value">${formatCurrencyCOP(vehicle.price)}</span>
            </div>
          </div>

          <div class="card-actions">
            <button type="button" class="btn btn-secondary btn-sm js-view-details" data-vehicle-id="${escapeHTML(vehicle.id)}">
              Ficha y Color
            </button>
            <button type="button" class="btn btn-primary btn-sm js-buy-vehicle" data-vehicle-id="${escapeHTML(vehicle.id)}">
              Comprar / Reservar
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFeaturedVehicles() {
    if (!elements.featuredGrid) return;
    const featured = state.vehicles.filter(v => v.featured);
    elements.featuredGrid.innerHTML = featured.map(createVehicleCardHTML).join("");
    bindCardEvents(elements.featuredGrid);
  }

  function renderCatalog() {
    if (!elements.catalogGrid) return;
    let list = [...state.vehicles];

    // 1. Filtro por Categoría
    if (state.activeCategory !== "all") {
      list = list.filter(v => v.category.toLowerCase() === state.activeCategory.toLowerCase());
    }

    // 2. Filtro por Búsqueda
    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      list = list.filter(v => 
        v.name.toLowerCase().includes(q) ||
        v.version.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.tagline.toLowerCase().includes(q)
      );
    }

    // 3. Ordenación
    if (state.sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (state.sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (state.sortBy === "range-desc") {
      list.sort((a, b) => b.rangeKm - a.rangeKm);
    } else if (state.sortBy === "accel-asc") {
      list.sort((a, b) => a.accelerationSeconds - b.accelerationSeconds);
    } else {
      // featured
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    state.filteredVehicles = list;

    if (elements.catalogResultsCount) {
      elements.catalogResultsCount.textContent = list.length;
    }

    if (list.length === 0) {
      elements.catalogGrid.innerHTML = `
        <div class="catalog-empty">
          <svg class="catalog-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No se encontraron vehículos</h3>
          <p class="section-subtitle center-block">Intenta ajustar los términos de búsqueda o cambiar el filtro de categoría.</p>
          <button type="button" class="btn btn-secondary btn-sm" id="resetCatalogFiltersBtn">Restablecer filtros</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetCatalogFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          state.searchQuery = "";
          state.activeCategory = "all";
          if (elements.searchInput) elements.searchInput.value = "";
          updateCategoryPillsUI();
          renderCatalog();
        });
      }
      return;
    }

    elements.catalogGrid.innerHTML = list.map(createVehicleCardHTML).join("");
    bindCardEvents(elements.catalogGrid);
  }

  function bindCardEvents(container) {
    // Botones de favoritos en tarjetas
    container.querySelectorAll(".card-fav-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.vehicleId;
        toggleFavorite(id);
      });
    });

    // Ver detalles
    container.querySelectorAll(".js-view-details").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.vehicleId;
        openVehicleModal(id);
      });
    });

    // Comprar / Reservar directamente con papeles
    container.querySelectorAll(".js-buy-vehicle").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.vehicleId;
        openPurchaseModal(id);
      });
    });
  }

  function updateCategoryPillsUI() {
    if (!elements.categoryPillsContainer) return;
    elements.categoryPillsContainer.querySelectorAll(".pill-btn").forEach(pill => {
      if (pill.dataset.category === state.activeCategory) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  // =========================================================================
  // MODAL DE DETALLE Y CONFIGURADOR VISUAL (F-05, F-09)
  // =========================================================================

  function openVehicleModal(vehicleId) {
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    state.selectedVehicleForModal = vehicle;
    state.selectedColorForModal = vehicle.colors && vehicle.colors.length > 0 ? vehicle.colors[0] : null;

    renderVehicleModalContent(vehicle);
    elements.vehicleModal.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closeVehicleModal() {
    if (!elements.vehicleModal) return;
    elements.vehicleModal.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  function renderVehicleModalContent(vehicle) {
    if (!elements.vehicleModalContent) return;

    const currentColor = state.selectedColorForModal || (vehicle.colors && vehicle.colors[0]);

    elements.vehicleModalContent.innerHTML = `
      <div class="configurator-view">
        <div class="config-preview-container">
          <div class="config-preview-img-wrap">
            <img id="modalVehicleImage" src="${escapeHTML(vehicle.image)}" alt="${escapeHTML(vehicle.name)}" style="filter: ${currentColor ? currentColor.filter : 'none'};">
          </div>
          <div style="margin-bottom: var(--space-16);">
            <div style="font-size: 0.8125rem; color: var(--color-silver); margin-bottom: 6px;">
              Acabado de Pintura: <strong id="modalColorName" style="color: var(--color-white);">${escapeHTML(currentColor ? currentColor.name : 'Estándar')}</strong>
            </div>
            <div class="color-swatch-list">
              ${(vehicle.colors || []).map((c, idx) => `
                <button type="button" 
                  class="swatch-btn ${currentColor && currentColor.id === c.id ? 'active' : ''}" 
                  style="background-color: ${c.hex};" 
                  data-color-id="${c.id}" 
                  data-color-name="${c.name}"
                  data-color-filter="${c.filter}"
                  title="${c.name}"
                  aria-label="Seleccionar color ${c.name}">
                </button>
              `).join("")}
            </div>
          </div>

          <div style="background-color: var(--color-obsidian); padding: var(--space-16); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--color-silver); margin-bottom: 4px;">Disponibilidad Estimada</div>
            <div style="font-size: 0.875rem; color: #10b981; font-weight: 600;">${escapeHTML(vehicle.availability)}</div>
          </div>
        </div>

        <div class="config-details-container">
          <span class="section-tag">${escapeHTML(vehicle.category)} · ${escapeHTML(vehicle.badge)}</span>
          <h2 style="font-size: 2rem; margin-bottom: 4px;">${escapeHTML(vehicle.name)}</h2>
          <p style="color: var(--color-silver); font-size: 1rem; margin-bottom: var(--space-16);">${escapeHTML(vehicle.version)}</p>
          <p style="font-size: 0.9375rem; color: var(--color-silver-light); line-height: 1.6; margin-bottom: var(--space-20);">${escapeHTML(vehicle.description)}</p>

          <div class="spec-pills-grid">
            <div>
              <div style="font-size: 1.25rem; font-weight: 700;">${vehicle.rangeKm} km</div>
              <div style="font-size: 0.6875rem; color: var(--color-silver); text-transform: uppercase;">Autonomía WLTP</div>
            </div>
            <div>
              <div style="font-size: 1.25rem; font-weight: 700;">${vehicle.accelerationSeconds}s</div>
              <div style="font-size: 0.6875rem; color: var(--color-silver); text-transform: uppercase;">0-100 km/h</div>
            </div>
            <div>
              <div style="font-size: 1.25rem; font-weight: 700;">${vehicle.topSpeedKm} km/h</div>
              <div style="font-size: 0.6875rem; color: var(--color-silver); text-transform: uppercase;">Vel. Máxima</div>
            </div>
          </div>

          <h4 style="font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-silver); margin-bottom: var(--space-8);">Aspectos Destacados</h4>
          <ul class="highlight-list">
            ${(vehicle.highlights || []).map(h => `
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>${escapeHTML(h)}</span>
              </li>
            `).join("")}
          </ul>

          <div style="margin-top: var(--space-24); padding-top: var(--space-20); border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.75rem; color: var(--color-silver); display: block;">Valor demostrativo orientativo</span>
              <span style="font-size: 1.625rem; font-weight: 700; color: var(--color-white);">${formatCurrencyCOP(vehicle.price)}</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); margin-top: var(--space-20);">
            <button type="button" class="btn btn-secondary" id="modalSimulateBtn" data-vehicle-id="${escapeHTML(vehicle.id)}">
              Simular Cuotas
            </button>
            <button type="button" class="btn btn-primary" id="modalPurchaseBtn" data-vehicle-id="${escapeHTML(vehicle.id)}" style="background-color: #10b981; border-color: #10b981;">
              Comprar con Papeles
            </button>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="modalContactBtn" data-vehicle-id="${escapeHTML(vehicle.id)}" style="width: 100%; margin-top: 8px;">
            Solicitar Prueba de Manejo
          </button>
        </div>
      </div>
    `;

    // Asignar eventos de los swatches de color
    const modalImg = document.getElementById("modalVehicleImage");
    const colorLabel = document.getElementById("modalColorName");
    elements.vehicleModalContent.querySelectorAll(".swatch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        elements.vehicleModalContent.querySelectorAll(".swatch-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const colorName = btn.dataset.colorName;
        const colorFilter = btn.dataset.colorFilter;
        if (modalImg) modalImg.style.filter = colorFilter;
        if (colorLabel) colorLabel.textContent = colorName;
      });
    });

    // Botones de acción dentro del modal
    const simBtn = document.getElementById("modalSimulateBtn");
    if (simBtn) {
      simBtn.addEventListener("click", () => {
        closeVehicleModal();
        prefillSimulator(vehicle.id);
      });
    }

    const purchaseBtn = document.getElementById("modalPurchaseBtn");
    if (purchaseBtn) {
      purchaseBtn.addEventListener("click", () => {
        closeVehicleModal();
        openPurchaseModal(vehicle.id);
      });
    }

    const contactBtn = document.getElementById("modalContactBtn");
    if (contactBtn) {
      contactBtn.addEventListener("click", () => {
        closeVehicleModal();
        scrollToContactAndSelect(vehicle.id);
      });
    }
  }

  // =========================================================================
  // DRAWER DE FAVORITOS (F-08)
  // =========================================================================

  function openFavoritesDrawer() {
    if (!elements.favDrawer) return;
    renderFavoritesDrawer();
    elements.favDrawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeFavoritesDrawer() {
    if (!elements.favDrawer) return;
    elements.favDrawer.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function renderFavoritesDrawer() {
    if (!elements.favDrawerList) return;
    const favVehicles = state.vehicles.filter(v => state.favorites.includes(v.id));

    if (favVehicles.length === 0) {
      elements.favDrawerList.innerHTML = `
        <div class="drawer-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: var(--color-silver);">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <p>No tienes vehículos en tus favoritos.</p>
          <p style="font-size: 0.8125rem; color: var(--color-silver); margin-top: 6px;">Explora el catálogo y presiona el ícono del corazón para guardar tus modelos predilectos.</p>
        </div>
      `;
      if (elements.favDrawerTotal) elements.favDrawerTotal.textContent = "$0 COP";
      return;
    }

    let totalSum = 0;
    elements.favDrawerList.innerHTML = favVehicles.map(v => {
      totalSum += v.price;
      return `
        <div class="drawer-fav-item">
          <img src="${escapeHTML(v.image)}" alt="${escapeHTML(v.name)}" class="drawer-fav-thumb">
          <div class="drawer-fav-info">
            <h4 class="drawer-fav-name">${escapeHTML(v.name)}</h4>
            <div class="drawer-fav-price">${formatCurrencyCOP(v.price)}</div>
            <div class="drawer-fav-actions">
              <button type="button" class="btn btn-secondary btn-sm js-fav-view-detail" data-vehicle-id="${escapeHTML(v.id)}" style="padding: 4px 10px; font-size: 0.75rem;">Ver</button>
              <button type="button" class="drawer-fav-remove js-fav-remove-item" data-vehicle-id="${escapeHTML(v.id)}">Eliminar</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (elements.favDrawerTotal) {
      elements.favDrawerTotal.textContent = formatCurrencyCOP(totalSum);
    }

    // Eventos dentro del drawer
    elements.favDrawerList.querySelectorAll(".js-fav-remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        toggleFavorite(btn.dataset.vehicleId);
      });
    });

    elements.favDrawerList.querySelectorAll(".js-fav-view-detail").forEach(btn => {
      btn.addEventListener("click", () => {
        closeFavoritesDrawer();
        openVehicleModal(btn.dataset.vehicleId);
      });
    });
  }

  // =========================================================================
  // SIMULADOR DE FINANCIACIÓN (F-10, SECCIÓN 7)
  // Fórmula: C = P * [ i*(1+i)^n / ((1+i)^n - 1) ]
  // Si i = 0 => C = P / n
  // =========================================================================

  function updateSimulatorCalculations() {
    const vehiclePrice = Number(state.simulator.vehiclePrice) || 0;
    const downPercent = Number(state.simulator.downPaymentPercent) || 0;
    const termMonths = Number(state.simulator.termMonths) || 48;
    const annualRate = Number(state.simulator.annualInterestRate) || 0;

    // Cuota inicial en COP
    const downPaymentAmount = Math.round((vehiclePrice * downPercent) / 100);
    // Principal o capital a financiar (P)
    const principal = Math.max(0, vehiclePrice - downPaymentAmount);

    // Tasa mensual efectiva: i = (1 + EA)^(1/12) - 1 o aproximación nominal mensual
    const monthlyRate = annualRate > 0 ? (Math.pow(1 + annualRate / 100, 1 / 12) - 1) : 0;

    let monthlyPayment = 0;
    let totalInterest = 0;

    if (principal > 0 && termMonths > 0) {
      if (monthlyRate === 0) {
        monthlyPayment = Math.round(principal / termMonths);
        totalInterest = 0;
      } else {
        const factor = Math.pow(1 + monthlyRate, termMonths);
        monthlyPayment = Math.round(principal * ((monthlyRate * factor) / (factor - 1)));
        totalInterest = Math.max(0, Math.round((monthlyPayment * termMonths) - principal));
      }
    }

    const totalCreditCost = principal + totalInterest + downPaymentAmount;

    // Actualizar UI
    if (elements.simDownPercentLabel) {
      elements.simDownPercentLabel.textContent = `${downPercent}%`;
    }
    if (elements.simDownAmountLabel) {
      elements.simDownAmountLabel.textContent = formatCurrencyCOP(downPaymentAmount);
    }
    if (elements.simInterestLabel) {
      elements.simInterestLabel.textContent = `${annualRate.toFixed(1)}% EA (${(monthlyRate * 100).toFixed(2)}% m.v.)`;
    }
    if (elements.simMonthlyPayment) {
      elements.simMonthlyPayment.textContent = formatCurrencyCOP(monthlyPayment);
    }
    if (elements.simFinancedAmount) {
      elements.simFinancedAmount.textContent = formatCurrencyCOP(principal);
    }
    if (elements.simTotalInterest) {
      elements.simTotalInterest.textContent = formatCurrencyCOP(totalInterest);
    }
    if (elements.simTotalCredit) {
      elements.simTotalCredit.textContent = formatCurrencyCOP(totalCreditCost);
    }
  }

  function prefillSimulator(vehicleId) {
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    state.simulator.vehicleId = vehicle.id;
    state.simulator.vehiclePrice = vehicle.price;

    if (elements.simVehicleSelect) {
      elements.simVehicleSelect.value = vehicle.id;
    }
    if (elements.simPriceInput) {
      elements.simPriceInput.value = vehicle.price;
    }

    updateSimulatorCalculations();

    const simSection = document.getElementById("financiacion");
    if (simSection) {
      simSection.scrollIntoView({ behavior: "smooth" });
    }
    showToast(`Simulador configurado para ${vehicle.name}`, "info");
  }

  function initSimulator() {
    // Llenar selector de vehículos
    if (elements.simVehicleSelect) {
      elements.simVehicleSelect.innerHTML = state.vehicles.map(v => `
        <option value="${escapeHTML(v.id)}" ${v.id === state.simulator.vehicleId ? 'selected' : ''}>
          ${escapeHTML(v.name)} — ${formatCurrencyCOP(v.price)}
        </option>
      `).join("");

      elements.simVehicleSelect.addEventListener("change", (e) => {
        const selVehicle = state.vehicles.find(v => v.id === e.target.value);
        if (selVehicle) {
          state.simulator.vehicleId = selVehicle.id;
          state.simulator.vehiclePrice = selVehicle.price;
          if (elements.simPriceInput) elements.simPriceInput.value = selVehicle.price;
          updateSimulatorCalculations();
        }
      });
    }

    if (elements.simPriceInput) {
      elements.simPriceInput.value = state.simulator.vehiclePrice;
      elements.simPriceInput.addEventListener("input", (e) => {
        state.simulator.vehiclePrice = Number(e.target.value) || 0;
        updateSimulatorCalculations();
      });
    }

    if (elements.simDownPercentRange) {
      elements.simDownPercentRange.addEventListener("input", (e) => {
        state.simulator.downPaymentPercent = Number(e.target.value);
        updateSimulatorCalculations();
      });
    }

    if (elements.simInterestRange) {
      elements.simInterestRange.addEventListener("input", (e) => {
        state.simulator.annualInterestRate = Number(e.target.value);
        updateSimulatorCalculations();
      });
    }

    if (elements.simTermsContainer) {
      elements.simTermsContainer.querySelectorAll(".term-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          elements.simTermsContainer.querySelectorAll(".term-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          state.simulator.termMonths = Number(btn.dataset.term);
          updateSimulatorCalculations();
        });
      });
    }

    if (elements.simApplyBtn) {
      elements.simApplyBtn.addEventListener("click", () => {
        const vehicle = state.vehicles.find(v => v.id === state.simulator.vehicleId);
        const name = vehicle ? vehicle.name : "Vehículo";
        scrollToContactAndSelect(state.simulator.vehicleId, `Interés en plan financiado a ${state.simulator.termMonths} meses.`);
      });
    }

    updateSimulatorCalculations();
  }

  // =========================================================================
  // COMPARADOR DE MODELOS (F-11 / P2)
  // =========================================================================

  function renderVehicleComparator() {
    if (!elements.compareTableBody || !elements.compareSelectA || !elements.compareSelectB) return;

    // Rellenar selectores si están vacíos
    if (elements.compareSelectA.options.length === 0) {
      elements.compareSelectA.innerHTML = state.vehicles.map(v => `
        <option value="${escapeHTML(v.id)}" ${v.id === state.compareModelA ? 'selected' : ''}>${escapeHTML(v.name)}</option>
      `).join("");
      elements.compareSelectB.innerHTML = state.vehicles.map(v => `
        <option value="${escapeHTML(v.id)}" ${v.id === state.compareModelB ? 'selected' : ''}>${escapeHTML(v.name)}</option>
      `).join("");

      elements.compareSelectA.addEventListener("change", (e) => {
        state.compareModelA = e.target.value;
        renderVehicleComparator();
      });
      elements.compareSelectB.addEventListener("change", (e) => {
        state.compareModelB = e.target.value;
        renderVehicleComparator();
      });
    }

    const vA = state.vehicles.find(v => v.id === state.compareModelA) || state.vehicles[0];
    const vB = state.vehicles.find(v => v.id === state.compareModelB) || state.vehicles[1];

    const rows = [
      { label: "Imagen", valA: `<img src="${vA.image}" alt="${vA.name}" style="height: 100px; object-fit: cover; border-radius: 4px; margin: 0 auto;">`, valB: `<img src="${vB.image}" alt="${vB.name}" style="height: 100px; object-fit: cover; border-radius: 4px; margin: 0 auto;">` },
      { label: "Categoría", valA: vA.category, valB: vB.category },
      { label: "Versión", valA: vA.version, valB: vB.version },
      { label: "Precio Sugerido", valA: `<strong>${formatCurrencyCOP(vA.price)}</strong>`, valB: `<strong>${formatCurrencyCOP(vB.price)}</strong>` },
      { label: "Aceleración 0-100 km/h", valA: `${vA.accelerationSeconds} seg`, valB: `${vB.accelerationSeconds} seg` },
      { label: "Autonomía WLTP", valA: `${vA.rangeKm} km`, valB: `${vB.rangeKm} km` },
      { label: "Velocidad Máxima", valA: `${vA.topSpeedKm} km/h`, valB: `${vB.topSpeedKm} km/h` },
      { label: "Tracción", valA: vA.drive, valB: vB.drive },
      { label: "Potencia Estimada", valA: `${vA.powerHp} HP`, valB: `${vB.powerHp} HP` },
      { label: "Volumen de Carga", valA: vA.cargoVolume, valB: vB.cargoVolume },
      { label: "Velocidad de Carga", valA: vA.chargingTime, valB: vB.chargingTime }
    ];

    elements.compareTableBody.innerHTML = rows.map(r => `
      <tr>
        <td>${escapeHTML(r.label)}</td>
        <td>${r.valA}</td>
        <td>${r.valB}</td>
      </tr>
    `).join("");
  }

  // =========================================================================
  // FORMULARIO DE CONVERSIÓN Y VALIDACIÓN (F-06)
  // =========================================================================

  function initContactForm() {
    if (!elements.contactForm) return;

    // Rellenar modelos en el formulario
    if (elements.formModelSelect) {
      elements.formModelSelect.innerHTML = `
        <option value="">Selecciona un modelo de interés...</option>
        ${state.vehicles.map(v => `
          <option value="${escapeHTML(v.id)}">${escapeHTML(v.name)} — (${escapeHTML(v.category)})</option>
        `).join("")}
      `;
    }

    // Validación y envío
    elements.contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      let isValid = true;
      const form = elements.contactForm;

      // Campos
      const nameInput = form.querySelector("#clientName");
      const phoneInput = form.querySelector("#clientPhone");
      const emailInput = form.querySelector("#clientEmail");
      const modelSelect = form.querySelector("#formModelSelect");
      const termsCheck = form.querySelector("#termsCheck");

      // Validar Nombre
      if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
        nameInput.classList.add("is-invalid");
        isValid = false;
      } else {
        nameInput.classList.remove("is-invalid");
      }

      // Validar Teléfono (mínimo 7 dígitos)
      const phoneClean = phoneInput.value.replace(/\D/g, "");
      if (phoneClean.length < 7) {
        phoneInput.classList.add("is-invalid");
        isValid = false;
      } else {
        phoneInput.classList.remove("is-invalid");
      }

      // Validar Email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailInput.classList.add("is-invalid");
        isValid = false;
      } else {
        emailInput.classList.remove("is-invalid");
      }

      // Validar Modelo
      if (!modelSelect.value) {
        modelSelect.classList.add("is-invalid");
        isValid = false;
      } else {
        modelSelect.classList.remove("is-invalid");
      }

      // Validar Términos
      if (!termsCheck.checked) {
        isValid = false;
        showToast("Por favor autoriza el tratamiento de datos para continuar.", "info");
      }

      if (!isValid) {
        return;
      }

      // Generación de radicado demostrativo
      const radicadoNum = "TSL-" + Math.floor(100000 + Math.random() * 900000);
      const selectedModelObj = state.vehicles.find(v => v.id === modelSelect.value);
      const modelName = selectedModelObj ? selectedModelObj.name : "Tesla";

      // Mensaje claro demostrativo (sin prometer transacciones reales o conexión de servidor)
      if (elements.formStatusAlert) {
        elements.formStatusAlert.style.display = "block";
        elements.formStatusAlert.innerHTML = `
          <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: var(--radius-md); padding: var(--space-20); margin-top: var(--space-20);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h4 style="color: #10b981; font-size: 1.125rem;">¡Solicitud Registrada Exitosamente!</h4>
            </div>
            <p style="font-size: 0.875rem; color: var(--color-silver-light); margin-bottom: 8px;">
              Estimado(a) <strong>${escapeHTML(nameInput.value)}</strong>, tu solicitud para el <strong>${escapeHTML(modelName)}</strong> ha sido generada localmente en la interfaz con número de radicado referencial: <strong style="color: var(--color-white);">${radicadoNum}</strong>.
            </p>
            <div style="font-size: 0.75rem; color: var(--color-silver); border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px;">
              <em>Aviso técnico de alcance:</em> Este entorno frontend es una exhibición demostrativa. No se han transmitido credenciales ni datos bancarios a ningún servidor externo.
            </div>
          </div>
        `;
        elements.formStatusAlert.scrollIntoView({ behavior: "smooth" });
      }

      showToast("Solicitud generada con éxito (Modo Demostrativo)", "success");
      form.reset();
    });
  }

  function scrollToContactAndSelect(vehicleId, extraComment = "") {
    const contactSection = document.getElementById("contacto");
    if (!contactSection) return;

    if (elements.formModelSelect && vehicleId) {
      elements.formModelSelect.value = vehicleId;
    }

    if (extraComment) {
      const commentField = document.getElementById("clientComments");
      if (commentField) {
        commentField.value = extraComment;
      }
    }

    contactSection.scrollIntoView({ behavior: "smooth" });
  }

  // =========================================================================
  // ACORDEÓN DE PREGUNTAS FRECUENTES (FAQS)
  // =========================================================================

  function initFAQs() {
    const faqContainer = document.getElementById("faqListContainer");
    if (!faqContainer || typeof FAQS_DATA === "undefined") return;

    faqContainer.innerHTML = FAQS_DATA.map((faq, index) => `
      <div class="faq-item ${index === 0 ? 'is-open' : ''}">
        <button type="button" class="faq-btn" aria-expanded="${index === 0}">
          <span>${escapeHTML(faq.q)}</span>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="faq-body">
          <p>${escapeHTML(faq.a)}</p>
        </div>
      </div>
    `).join("");

    faqContainer.querySelectorAll(".faq-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const isOpen = item.classList.contains("is-open");

        // Cerrar otros si se desea acordeón exclusivo
        faqContainer.querySelectorAll(".faq-item").forEach(i => {
          i.classList.remove("is-open");
          i.querySelector(".faq-btn").setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  // =========================================================================
  // CONTROL DE NAVEGACIÓN, MENÚ MÓVIL Y SCROLL (F-01)
  // =========================================================================

  function initNavigation() {
    // Scroll header background
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        elements.header.classList.add("scrolled");
      } else {
        elements.header.classList.remove("scrolled");
      }
    });

    // Menú móvil
    if (elements.navToggle && elements.mainNavList) {
      elements.navToggle.addEventListener("click", () => {
        const isOpen = elements.mainNavList.classList.toggle("is-open");
        elements.navToggle.setAttribute("aria-expanded", isOpen);
      });

      // Cerrar al pulsar un enlace
      elements.mainNavList.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
          elements.mainNavList.classList.remove("is-open");
          if (elements.navToggle) elements.navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    // Trigger de Favoritos
    if (elements.favTriggerBtn) {
      elements.favTriggerBtn.addEventListener("click", openFavoritesDrawer);
    }
    if (elements.favDrawerCloseBtn) {
      elements.favDrawerCloseBtn.addEventListener("click", closeFavoritesDrawer);
    }

    // Cerrar drawer al hacer clic en overlay
    if (elements.favDrawer) {
      elements.favDrawer.addEventListener("click", (e) => {
        if (e.target === elements.favDrawer) {
          closeFavoritesDrawer();
        }
      });
    }

    // Modal de Detalle
    if (elements.closeModalBtn) {
      elements.closeModalBtn.addEventListener("click", closeVehicleModal);
    }
    if (elements.vehicleModal) {
      elements.vehicleModal.addEventListener("click", (e) => {
        if (e.target === elements.vehicleModal) {
          closeVehicleModal();
        }
      });
    }

    // Tecla Escape para modales
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeVehicleModal();
        closeFavoritesDrawer();
        closeLoginModal();
        closePurchaseModal();
      }
    });

    // Botón volver arriba
    const backToTopBtn = document.getElementById("backToTopBtn");
    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  // =========================================================================
  // EVENTOS DEL CATÁLOGO (BÚSQUEDA Y FILTROS F-03, F-04)
  // =========================================================================

  function initCatalogEvents() {
    if (elements.searchInput) {
      elements.searchInput.addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderCatalog();
      });
    }

    if (elements.sortSelect) {
      elements.sortSelect.addEventListener("change", (e) => {
        state.sortBy = e.target.value;
        renderCatalog();
      });
    }

    if (elements.categoryPillsContainer) {
      elements.categoryPillsContainer.querySelectorAll(".pill-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          state.activeCategory = btn.dataset.category;
          updateCategoryPillsUI();
          renderCatalog();
        });
      });
    }
  }

  // =========================================================================
  // SISTEMA DE AUTENTICACIÓN, LOGIN Y PERFIL DE USUARIO
  // =========================================================================

  function updateAuthUI() {
    const user = state.currentUser;
    const isLogged = !!user;

    if (elements.accountTriggerBtn) {
      if (isLogged) {
        elements.accountTriggerBtn.classList.add("is-logged-in");
        const firstName = user.name.trim().split(" ")[0] || "Usuario";
        if (elements.accountBtnText) elements.accountBtnText.textContent = firstName;
        elements.accountTriggerBtn.setAttribute("aria-label", `Menú de cuenta de ${user.name}`);
        elements.accountTriggerBtn.setAttribute("title", `Conectado como ${user.name}`);
      } else {
        elements.accountTriggerBtn.classList.remove("is-logged-in");
        if (elements.accountBtnText) elements.accountBtnText.textContent = "Iniciar Sesión";
        elements.accountTriggerBtn.setAttribute("aria-label", "Iniciar Sesión o crear cuenta");
        elements.accountTriggerBtn.setAttribute("title", "Iniciar Sesión");
        closeUserDropdown();
      }
    }

    if (elements.navLoginLink) {
      if (isLogged) {
        const firstName = user.name.trim().split(" ")[0] || "Usuario";
        elements.navLoginLink.textContent = `Cuenta (${firstName})`;
      } else {
        elements.navLoginLink.textContent = "Cuenta";
      }
    }

    if (elements.dropdownUserName && user) {
      elements.dropdownUserName.textContent = user.name;
    }
    if (elements.dropdownUserEmail && user) {
      elements.dropdownUserEmail.textContent = user.email;
    }
    if (elements.dropdownFavCount) {
      elements.dropdownFavCount.textContent = state.favorites.length;
    }
  }

  function openLoginModal(defaultTab = "login") {
    if (!elements.loginModal) return;
    switchAuthTab(defaultTab);
    elements.loginModal.classList.add("is-visible");
    document.body.style.overflow = "hidden";
    closeUserDropdown();
  }

  function closeLoginModal() {
    if (!elements.loginModal) return;
    elements.loginModal.classList.remove("is-visible");
    document.body.style.overflow = "";

    // Limpiar errores visuales
    if (elements.authLoginForm) {
      elements.authLoginForm.querySelectorAll(".form-control").forEach(inp => inp.classList.remove("is-invalid"));
    }
    if (elements.authRegisterForm) {
      elements.authRegisterForm.querySelectorAll(".form-control").forEach(inp => inp.classList.remove("is-invalid"));
    }
  }

  function switchAuthTab(tab) {
    if (tab === "register") {
      if (elements.tabRegisterBtn) {
        elements.tabRegisterBtn.classList.add("active");
        elements.tabRegisterBtn.setAttribute("aria-selected", "true");
      }
      if (elements.tabLoginBtn) {
        elements.tabLoginBtn.classList.remove("active");
        elements.tabLoginBtn.setAttribute("aria-selected", "false");
      }
      if (elements.registerTabPanel) elements.registerTabPanel.style.display = "block";
      if (elements.loginTabPanel) elements.loginTabPanel.style.display = "none";
    } else {
      if (elements.tabLoginBtn) {
        elements.tabLoginBtn.classList.add("active");
        elements.tabLoginBtn.setAttribute("aria-selected", "true");
      }
      if (elements.tabRegisterBtn) {
        elements.tabRegisterBtn.classList.remove("active");
        elements.tabRegisterBtn.setAttribute("aria-selected", "false");
      }
      if (elements.loginTabPanel) elements.loginTabPanel.style.display = "block";
      if (elements.registerTabPanel) elements.registerTabPanel.style.display = "none";
    }
  }

  function toggleUserDropdown() {
    if (!elements.userDropdownMenu) return;
    const isVisible = elements.userDropdownMenu.style.display === "block";
    if (isVisible) {
      closeUserDropdown();
    } else {
      elements.userDropdownMenu.style.display = "block";
      if (elements.accountTriggerBtn) elements.accountTriggerBtn.setAttribute("aria-expanded", "true");
    }
  }

  function closeUserDropdown() {
    if (elements.userDropdownMenu) {
      elements.userDropdownMenu.style.display = "none";
    }
    if (elements.accountTriggerBtn) {
      elements.accountTriggerBtn.setAttribute("aria-expanded", "false");
    }
  }

  function togglePasswordVisibility(input, btn) {
    if (!input || !btn) return;
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    const eyeOpen = btn.querySelector(".eye-open");
    const eyeClosed = btn.querySelector(".eye-closed");
    if (eyeOpen && eyeClosed) {
      eyeOpen.style.display = isPass ? "none" : "block";
      eyeClosed.style.display = isPass ? "block" : "none";
    }
  }

  function initAuth() {
    // Actualizar estado inicial
    updateAuthUI();

    // Trigger de botón Cuenta en header
    if (elements.accountTriggerBtn) {
      elements.accountTriggerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.currentUser) {
          toggleUserDropdown();
        } else {
          openLoginModal("login");
        }
      });
    }

    // Enlace en menú de navegación
    if (elements.navLoginLink) {
      elements.navLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.currentUser) {
          toggleUserDropdown();
        } else {
          openLoginModal("login");
        }
      });
    }

    // Cerrar dropdown al hacer click fuera
    document.addEventListener("click", (e) => {
      if (elements.accountMenuContainer && !elements.accountMenuContainer.contains(e.target)) {
        closeUserDropdown();
      }
    });

    // Botones dentro del dropdown
    if (elements.dropdownFavsBtn) {
      elements.dropdownFavsBtn.addEventListener("click", () => {
        closeUserDropdown();
        openFavoritesDrawer();
      });
    }

    if (elements.logoutBtn) {
      elements.logoutBtn.addEventListener("click", () => {
        closeUserDropdown();
        saveAuthUser(null);
        showToast("Has cerrado tu sesión exitosamente.", "info");
      });
    }

    // Modal de Login: Cerrar
    if (elements.closeLoginModalBtn) {
      elements.closeLoginModalBtn.addEventListener("click", closeLoginModal);
    }
    if (elements.loginModal) {
      elements.loginModal.addEventListener("click", (e) => {
        if (e.target === elements.loginModal) {
          closeLoginModal();
        }
      });
    }

    // Selector de pestañas
    if (elements.tabLoginBtn) {
      elements.tabLoginBtn.addEventListener("click", () => switchAuthTab("login"));
    }
    if (elements.tabRegisterBtn) {
      elements.tabRegisterBtn.addEventListener("click", () => switchAuthTab("register"));
    }

    // Visibilidad de contraseñas
    if (elements.toggleLoginPwdBtn && elements.loginPassword) {
      elements.toggleLoginPwdBtn.addEventListener("click", () => {
        togglePasswordVisibility(elements.loginPassword, elements.toggleLoginPwdBtn);
      });
    }
    if (elements.toggleRegPwdBtn && elements.regPassword) {
      elements.toggleRegPwdBtn.addEventListener("click", () => {
        togglePasswordVisibility(elements.regPassword, elements.toggleRegPwdBtn);
      });
    }

    // Acceso Rápido Demostrativo
    if (elements.demoQuickLoginBtn) {
      elements.demoQuickLoginBtn.addEventListener("click", () => {
        const demoUser = {
          name: "Julian Ospina",
          email: "julian.ospina@tesla-vip.co",
          preferredModel: "model-3",
          role: "Cliente VIP"
        };
        saveAuthUser(demoUser);
        closeLoginModal();
        showToast(`¡Bienvenido de nuevo, ${demoUser.name}! (Acceso Demo Activo)`, "success");
      });
    }

    // Envío del Formulario de Inicio de Sesión
    if (elements.authLoginForm) {
      elements.authLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("loginEmail");
        const passInput = elements.loginPassword;
        let valid = true;

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value.trim())) {
          emailInput.classList.add("is-invalid");
          valid = false;
        } else {
          emailInput.classList.remove("is-invalid");
        }

        if (!passInput.value || passInput.value.length < 6) {
          passInput.classList.add("is-invalid");
          valid = false;
        } else {
          passInput.classList.remove("is-invalid");
        }

        if (!valid) return;

        const userNameFromEmail = emailInput.value.split("@")[0].replace(/[._-]/g, " ");
        const formattedName = userNameFromEmail.charAt(0).toUpperCase() + userNameFromEmail.slice(1);

        const authenticatedUser = {
          name: formattedName || "Cliente Tesla",
          email: emailInput.value.trim(),
          preferredModel: "model-3",
          role: "Cliente Registrado"
        };

        saveAuthUser(authenticatedUser);
        closeLoginModal();
        elements.authLoginForm.reset();
        showToast(`¡Bienvenido de nuevo, ${authenticatedUser.name}!`, "success");
      });
    }

    // Envío del Formulario de Registro
    if (elements.authRegisterForm) {
      elements.authRegisterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("regName");
        const emailInput = document.getElementById("regEmail");
        const passInput = elements.regPassword;
        const modelSelect = document.getElementById("regPreferredModel");
        let valid = true;

        if (!nameInput.value.trim() || nameInput.value.trim().length < 3) {
          nameInput.classList.add("is-invalid");
          valid = false;
        } else {
          nameInput.classList.remove("is-invalid");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInput.value.trim())) {
          emailInput.classList.add("is-invalid");
          valid = false;
        } else {
          emailInput.classList.remove("is-invalid");
        }

        if (!passInput.value || passInput.value.length < 6) {
          passInput.classList.add("is-invalid");
          valid = false;
        } else {
          passInput.classList.remove("is-invalid");
        }

        if (!valid) return;

        const newUser = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          preferredModel: modelSelect ? modelSelect.value : "model-3",
          role: "Nuevo Propietario"
        };

        saveAuthUser(newUser);
        closeLoginModal();
        elements.authRegisterForm.reset();
        showToast(`¡Cuenta creada con éxito! Bienvenido, ${newUser.name}.`, "success");
      });
    }
  }

  // =========================================================================
  // VENTANA DE COMPRA Y RESERVA CON PAPELES AL DÍA
  // =========================================================================

  function openPurchaseModal(vehicleId) {
    if (!elements.purchaseModal) return;
    const vId = vehicleId || state.selectedVehicleForPurchase || state.vehicles[0].id;
    state.selectedVehicleForPurchase = vId;

    if (elements.purchaseModelSelect) {
      elements.purchaseModelSelect.value = vId;
    }

    // Auto-completar datos si el usuario inició sesión
    if (state.currentUser) {
      if (elements.buyerName && !elements.buyerName.value) elements.buyerName.value = state.currentUser.name;
      if (elements.buyerEmail && !elements.buyerEmail.value) elements.buyerEmail.value = state.currentUser.email;
    }

    updatePurchaseModalView();
    elements.purchaseModal.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }

  function closePurchaseModal() {
    if (!elements.purchaseModal) return;
    elements.purchaseModal.classList.remove("is-visible");
    document.body.style.overflow = "";
    if (elements.purchaseStatusAlert) {
      elements.purchaseStatusAlert.style.display = "none";
    }
  }

  function updatePurchaseModalView() {
    const vehicle = state.vehicles.find(v => v.id === state.selectedVehicleForPurchase) || state.vehicles[0];
    if (!vehicle) return;

    if (elements.purchaseVehicleImg) {
      elements.purchaseVehicleImg.src = vehicle.image;
      elements.purchaseVehicleImg.alt = vehicle.name;
    }
    if (elements.purchaseCarVersion) {
      elements.purchaseCarVersion.textContent = `${vehicle.name} — ${vehicle.version}`;
    }
    if (elements.purchaseBasePrice) {
      elements.purchaseBasePrice.textContent = formatCurrencyCOP(vehicle.price);
    }
    if (elements.summarySubtotalPrice) {
      elements.summarySubtotalPrice.textContent = formatCurrencyCOP(vehicle.price);
    }

    const includePapers = state.includePapersInPurchase;
    const papersCost = includePapers ? state.papersPackageCost : 0;
    const totalAmount = vehicle.price + papersCost;

    if (elements.includePapersCheck) {
      elements.includePapersCheck.checked = includePapers;
    }
    if (elements.papersPackageBox) {
      if (includePapers) {
        elements.papersPackageBox.classList.remove("is-inactive");
      } else {
        elements.papersPackageBox.classList.add("is-inactive");
      }
    }
    if (elements.summaryPapersCost) {
      elements.summaryPapersCost.textContent = includePapers ? `+ ${formatCurrencyCOP(papersCost)}` : "$0 COP (Sin papeles)";
      elements.summaryPapersCost.style.color = includePapers ? "#10b981" : "var(--color-silver)";
    }
    if (elements.summaryTotalPrice) {
      elements.summaryTotalPrice.textContent = formatCurrencyCOP(totalAmount);
    }
  }

  function initPurchaseModal() {
    // Llenar selector de vehículos
    if (elements.purchaseModelSelect) {
      elements.purchaseModelSelect.innerHTML = state.vehicles.map(v => `
        <option value="${escapeHTML(v.id)}" ${v.id === state.selectedVehicleForPurchase ? 'selected' : ''}>
          ${escapeHTML(v.name)} — ${formatCurrencyCOP(v.price)}
        </option>
      `).join("");

      elements.purchaseModelSelect.addEventListener("change", (e) => {
        state.selectedVehicleForPurchase = e.target.value;
        updatePurchaseModalView();
      });
    }

    // Toggle de paquete con papeles
    if (elements.includePapersCheck) {
      elements.includePapersCheck.addEventListener("change", (e) => {
        state.includePapersInPurchase = e.target.checked;
        updatePurchaseModalView();
      });
    }

    // Cerrar modal
    if (elements.closePurchaseModalBtn) {
      elements.closePurchaseModalBtn.addEventListener("click", closePurchaseModal);
    }
    if (elements.purchaseModal) {
      elements.purchaseModal.addEventListener("click", (e) => {
        if (e.target === elements.purchaseModal) {
          closePurchaseModal();
        }
      });
    }

    // Formulario de confirmación de compra
    if (elements.purchaseOrderForm) {
      elements.purchaseOrderForm.addEventListener("submit", (e) => {
        e.preventDefault();

        let valid = true;
        const nameInp = elements.buyerName;
        const docInp = elements.buyerIdDoc;
        const phoneInp = elements.buyerPhone;
        const emailInp = elements.buyerEmail;

        if (!nameInp.value.trim() || nameInp.value.trim().length < 3) {
          nameInp.classList.add("is-invalid");
          valid = false;
        } else {
          nameInp.classList.remove("is-invalid");
        }

        if (!docInp.value.trim() || docInp.value.trim().length < 5) {
          docInp.classList.add("is-invalid");
          valid = false;
        } else {
          docInp.classList.remove("is-invalid");
        }

        const phoneDigits = phoneInp.value.replace(/\D/g, "");
        if (phoneDigits.length < 7) {
          phoneInp.classList.add("is-invalid");
          valid = false;
        } else {
          phoneInp.classList.remove("is-invalid");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailInp.value.trim())) {
          emailInp.classList.add("is-invalid");
          valid = false;
        } else {
          emailInp.classList.remove("is-invalid");
        }

        if (!valid) return;

        const vehicle = state.vehicles.find(v => v.id === state.selectedVehicleForPurchase) || state.vehicles[0];
        const includePapers = state.includePapersInPurchase;
        const papersCost = includePapers ? state.papersPackageCost : 0;
        const totalAmount = vehicle.price + papersCost;
        const orderNum = "TSL-ORD-" + Math.floor(100000 + Math.random() * 900000);

        if (elements.purchaseStatusAlert) {
          elements.purchaseStatusAlert.style.display = "block";
          elements.purchaseStatusAlert.innerHTML = `
            <div style="background-color: rgba(16, 185, 129, 0.12); border: 1px solid #10b981; border-radius: var(--radius-md); padding: var(--space-20);">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h4 style="color: #10b981; font-size: 1.125rem;">¡Orden de Compra Generada!</h4>
              </div>
              <p style="font-size: 0.875rem; color: var(--color-silver-light); margin-bottom: 6px;">
                Radicado comercial: <strong style="color: var(--color-white);">${orderNum}</strong> para <strong>${escapeHTML(nameInp.value)}</strong>.
              </p>
              <div style="font-size: 0.8125rem; color: var(--color-silver); margin-bottom: 10px;">
                Vehículo: <strong>${escapeHTML(vehicle.name)}</strong> (${formatCurrencyCOP(vehicle.price)})<br>
                Paquete de Papeles Legales: <strong style="color: ${includePapers ? '#10b981' : 'var(--color-silver)'};">${includePapers ? 'Incluido (+$5.200.000 COP)' : 'No incluido (Precio base neto)'}</strong><br>
                Liquidación Total: <strong style="color: var(--color-white); font-size: 1rem;">${formatCurrencyCOP(totalAmount)}</strong>
              </div>
              <p style="font-size: 0.75rem; color: var(--color-silver); border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 8px;">
                <em>Aviso:</em> Reserva demostrativa registrada en la plataforma frontend. Puedes confirmar los detalles de entrega directamente con un asesor por WhatsApp.
              </p>
            </div>
          `;
          elements.purchaseStatusAlert.scrollIntoView({ behavior: "smooth" });
        }

        showToast(`Orden ${orderNum} registrada con éxito`, "success");
      });
    }

    // Botón de Enviar Orden a WhatsApp
    if (elements.sendOrderWhatsAppBtn) {
      elements.sendOrderWhatsAppBtn.addEventListener("click", () => {
        const vehicle = state.vehicles.find(v => v.id === state.selectedVehicleForPurchase) || state.vehicles[0];
        const includePapers = state.includePapersInPurchase;
        const papersCost = includePapers ? state.papersPackageCost : 0;
        const totalAmount = vehicle.price + papersCost;
        const buyerName = elements.buyerName && elements.buyerName.value ? elements.buyerName.value.trim() : (state.currentUser ? state.currentUser.name : "Cliente Interesado");
        const buyerCity = elements.buyerCity ? elements.buyerCity.value : "Colombia";

        const text = `Hola, deseo cotizar y comprar el siguiente vehículo:%0A%0A` +
          `🚗 *Modelo:* Tesla ${vehicle.name} (${vehicle.version})%0A` +
          `💰 *Precio Base:* ${formatCurrencyCOP(vehicle.price)}%0A` +
          `📋 *Incluye Papeles al Día (Matrícula, SOAT, Impuesto):* ${includePapers ? 'SÍ (+ $5.200.000 COP)' : 'NO (Sin papeles)'}%0A` +
          `💵 *VALOR TOTAL:* ${formatCurrencyCOP(totalAmount)}%0A` +
          `👤 *Titular:* ${buyerName}%0A` +
          `📍 *Ciudad de Entrega:* ${buyerCity}%0A%0A` +
          `Quedo atento a las instrucciones para formalizar la reserva.`;

        window.open(`https://wa.me/573105550199?text=${text}`, "_blank", "noopener,noreferrer");
      });
    }
  }

  // =========================================================================
  // WIDGET FLOTANTE Y CHAT DE WHATSAPP
  // =========================================================================

  function initWhatsAppWidget() {
    if (elements.whatsappBubbleBtn) {
      elements.whatsappBubbleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!elements.whatsappPopover) return;
        const isVisible = elements.whatsappPopover.style.display === "block";
        elements.whatsappPopover.style.display = isVisible ? "none" : "block";
      });
    }

    if (elements.closeWaPopoverBtn && elements.whatsappPopover) {
      elements.closeWaPopoverBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        elements.whatsappPopover.style.display = "none";
      });
    }

    // Cerrar popover al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (elements.whatsappFloatWidget && !elements.whatsappFloatWidget.contains(e.target)) {
        if (elements.whatsappPopover) elements.whatsappPopover.style.display = "none";
      }
    });

    // Chips de opciones rápidas dentro de WhatsApp
    if (elements.whatsappPopover) {
      elements.whatsappPopover.querySelectorAll(".wa-chip-btn").forEach(chip => {
        chip.addEventListener("click", () => {
          const msg = encodeURIComponent(chip.dataset.msg || "Hola, deseo información sobre los vehículos Tesla");
          window.open(`https://wa.me/573105550199?text=${msg}`, "_blank", "noopener,noreferrer");
          elements.whatsappPopover.style.display = "none";
        });
      });
    }
  }

  // =========================================================================
  // INICIALIZACIÓN COMPLETA
  // =========================================================================

  function init() {
    applyTheme(state.theme);
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener("click", toggleTheme);
    }
    updateFavoritesBadge();
    initNavigation();
    initAuth();
    initPurchaseModal();
    initWhatsAppWidget();
    renderFeaturedVehicles();
    initCatalogEvents();
    renderCatalog();
    initSimulator();
    renderVehicleComparator();
    initContactForm();
    initFAQs();
  }

  init();
});
