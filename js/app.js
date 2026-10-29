/**
 * TESLA PREMIUM SHOWROOM - LÓGICA DE APLICACIÓN FRONTEND
 * Cumplimiento total de especificaciones técnicas: F-01 a F-12
 * Vanilla JavaScript (ES6+), sin librerías externas.
 */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // =========================================================================
  // ESTADO GLOBAL DE LA APLICACIÓN (SINCRONIZADO CON CONSOLA ADMIN)
  // =========================================================================
  const STORAGE_KEY_VEHICLES = "tesla_showroom_vehicles_catalog";
  const STORAGE_KEY_LEADS = "tesla_showroom_leads";
  const STORAGE_KEY_PURCHASES = "tesla_showroom_purchases";
  const SYNC_CHANNEL_NAME = "tesla_sync_channel";

  function loadInitialVehicles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VEHICLES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(v => {
            const original = (typeof VEHICLES_DATA !== "undefined" && VEHICLES_DATA.find(o => o.id === v.id)) || {};
            return {
              ...original,
              ...v,
              promoPrice: Number(v.promoPrice ?? v.promo_price ?? original.promoPrice ?? 0),
              promoLabel: (v.promoLabel ?? v.promo_label ?? original.promoLabel ?? "").trim()
            };
          });
        }
      }
    } catch (e) {}
    return (typeof VEHICLES_DATA !== "undefined" && Array.isArray(VEHICLES_DATA)) ? [...VEHICLES_DATA] : [];
  }

  const initialVehiclesList = loadInitialVehicles();

  const state = {
    vehicles: initialVehiclesList,
    filteredVehicles: [...initialVehiclesList],
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
    pendingPurchaseVehicleId: null,
    // Simulador
    simulator: {
      vehicleId: "model-3",
      vehiclePrice: 198000000,
      downPaymentPercent: 20, // 20%
      termMonths: 48,
      annualInterestRate: 14.5, // Tasa EA anual orientativa en Colombia (aprox 1.13% mensual)
      monthlyIncome: 15000000 // Ingreso mensual sugerido para cálculo de presupuesto
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
    navMobileAccountBtn: document.getElementById("navMobileAccountBtn"),
    mobileAccountBtnText: document.getElementById("mobileAccountBtnText"),
    favCountBadge: document.getElementById("favBadgeCount"),
    favTriggerBtn: document.getElementById("favTriggerBtn"),

    // Cuenta & Login Unificado
    accountMenuContainer: document.getElementById("accountMenuContainer"),
    accountTriggerBtn: document.getElementById("accountTriggerBtn"),
    accountBtnText: document.getElementById("accountBtnText"),
    accountStatusDot: document.getElementById("accountStatusDot"),
    userDropdownMenu: document.getElementById("userDropdownMenu"),
    dropdownAvatarCircle: document.getElementById("dropdownAvatarCircle"),
    dropdownUserName: document.getElementById("dropdownUserName"),
    dropdownUserEmail: document.getElementById("dropdownUserEmail"),
    dropdownFavCount: document.getElementById("dropdownFavCount"),
    dropdownFavsBtn: document.getElementById("dropdownFavsBtn"),
    dropdownOpenFullProfileBtn: document.getElementById("dropdownOpenFullProfileBtn"),
    dropdownOpenOrdersBtn: document.getElementById("dropdownOpenOrdersBtn"),
    logoutBtn: document.getElementById("logoutBtn"),

    // Modal de Cuenta Completa
    loginModal: document.getElementById("loginModal"),
    accountModalDialog: document.getElementById("accountModalDialog"),
    authGuestView: document.getElementById("authGuestView"),
    authDashboardView: document.getElementById("authDashboardView"),
    closeLoginModalBtn: document.getElementById("closeLoginModalBtn"),

    // Vistas de Invitado
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
    forgotPwdBtn: document.getElementById("forgotPwdBtn"),
    forgotPwdBox: document.getElementById("forgotPwdBox"),
    recoveryEmailInput: document.getElementById("recoveryEmailInput"),
    sendRecoveryBtn: document.getElementById("sendRecoveryBtn"),
    regStrengthIndicator: document.getElementById("regStrengthIndicator"),

    // Vistas del Dashboard de Cuenta
    dashAvatarCircle: document.getElementById("dashAvatarCircle"),
    dashUserName: document.getElementById("dashUserName"),
    dashUserRole: document.getElementById("dashUserRole"),
    dashUserEmail: document.getElementById("dashUserEmail"),
    dashUserCity: document.getElementById("dashUserCity"),
    dashQuickLogoutBtn: document.getElementById("dashQuickLogoutBtn"),
    dashKpiFavsCount: document.getElementById("dashKpiFavsCount"),
    dashKpiOrdersCount: document.getElementById("dashKpiOrdersCount"),
    dashKpiPreferredModel: document.getElementById("dashKpiPreferredModel"),
    dashOrdersTabBadge: document.getElementById("dashOrdersTabBadge"),
    tabDashProfileBtn: document.getElementById("tabDashProfileBtn"),
    tabDashNotificationsBtn: document.getElementById("tabDashNotificationsBtn"),
    tabDashOrdersBtn: document.getElementById("tabDashOrdersBtn"),
    tabDashFavsBtn: document.getElementById("tabDashFavsBtn"),
    tabDashTestDriveBtn: document.getElementById("tabDashTestDriveBtn"),
    tabDashSecurityBtn: document.getElementById("tabDashSecurityBtn"),
    dashProfilePanel: document.getElementById("dashProfilePanel"),
    dashNotificationsPanel: document.getElementById("dashNotificationsPanel"),
    dashOrdersPanel: document.getElementById("dashOrdersPanel"),
    dashFavsPanel: document.getElementById("dashFavsPanel"),
    dashTestDrivePanel: document.getElementById("dashTestDrivePanel"),
    dashSecurityPanel: document.getElementById("dashSecurityPanel"),
    dashNotificationsBadge: document.getElementById("dashNotificationsBadge"),
    dashTabNotifDot: document.getElementById("dashTabNotifDot"),
    dashKpiNotifsCard: document.getElementById("dashKpiNotifsCard"),
    dashKpiNotificationsCount: document.getElementById("dashKpiNotificationsCount"),
    dashKpiPulseDot: document.getElementById("dashKpiPulseDot"),
    dashNotificationsListContainer: document.getElementById("dashNotificationsListContainer"),
    btnMarkAllNotifsRead: document.getElementById("btnMarkAllNotifsRead"),
    btnClearAllNotifs: document.getElementById("btnClearAllNotifs"),
    notifsUnreadPill: document.getElementById("notifsUnreadPill"),
    headerNotifBtn: document.getElementById("headerNotifBtn"),
    headerNotifBadge: document.getElementById("headerNotifBadge"),
    dropdownOpenNotifsBtn: document.getElementById("dropdownOpenNotifsBtn"),
    dropdownNotifDot: document.getElementById("dropdownNotifDot"),
    dropdownNotifBadge: document.getElementById("dropdownNotifBadge"),
    dashEditProfileForm: document.getElementById("dashEditProfileForm"),
    dashEditName: document.getElementById("dashEditName"),
    dashEditEmail: document.getElementById("dashEditEmail"),
    dashEditPhone: document.getElementById("dashEditPhone"),
    dashEditCity: document.getElementById("dashEditCity"),
    dashEditPreferredModel: document.getElementById("dashEditPreferredModel"),
    saveProfileBtn: document.getElementById("saveProfileBtn"),
    dashOrdersListContainer: document.getElementById("dashOrdersListContainer"),
    dashFavsListContainer: document.getElementById("dashFavsListContainer"),
    dashLogoutFullBtn: document.getElementById("dashLogoutFullBtn"),
    dashChangePasswordForm: document.getElementById("dashChangePasswordForm"),

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

    // Botón Header de WhatsApp
    headerWhatsappBtn: document.getElementById("headerWhatsappBtn"),

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

    // Simulador y Presupuesto
    simGuestLockState: document.getElementById("simGuestLockState"),
    simAuthenticatedContent: document.getElementById("simAuthenticatedContent"),
    simUnlockRegisterBtn: document.getElementById("simUnlockRegisterBtn"),
    simUnlockLoginBtn: document.getElementById("simUnlockLoginBtn"),
    simVehicleSelect: document.getElementById("simVehicleSelect"),
    simPriceInput: document.getElementById("simPriceInput"),
    simDownPercentRange: document.getElementById("simDownPercentRange"),
    simDownPercentLabel: document.getElementById("simDownPercentLabel"),
    simDownAmountLabel: document.getElementById("simDownAmountLabel"),
    simTermSelect: document.getElementById("simTermSelect"),
    simTermBadge: document.getElementById("simTermBadge"),
    simResultTermText: document.getElementById("simResultTermText"),
    simInterestRange: document.getElementById("simInterestRange"),
    simInterestLabel: document.getElementById("simInterestLabel"),
    simTermsContainer: document.getElementById("simTermsContainer"),
    simMonthlyPayment: document.getElementById("simMonthlyPayment"),
    simFinancedAmount: document.getElementById("simFinancedAmount"),
    simTotalInterest: document.getElementById("simTotalInterest"),
    simTotalCredit: document.getElementById("simTotalCredit"),
    simIncomeInput: document.getElementById("simIncomeInput"),
    simBudgetHealthIndicator: document.getElementById("simBudgetHealthIndicator"),
    simIncomeRatioVal: document.getElementById("simIncomeRatioVal"),
    simTargetPaymentInput: document.getElementById("simTargetPaymentInput"),
    simAutoFitBtn: document.getElementById("simAutoFitBtn"),
    simAutoFitResult: document.getElementById("simAutoFitResult"),
    simApplyBtn: document.getElementById("simApplyBtn"),
    navLinkFinancing: document.getElementById("navLinkFinancing"),

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

  // Notificación tipo Toast (desactivada en botones generales, solo activa para confirmación de solicitudes)
  function showToast(message, type = "info", isSubmission = false) {
    if (!isSubmission) return;
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
    }, 4500);
  }

  // Sanitizador robusto contra inyecciones XSS, backtick y entity evasion
  function escapeHTML(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/`/g, "&#96;")
      .replace(/\//g, "&#x2F;");
  }

  let _secureIdCounter = 0;
  // Generador criptográficamente seguro de radicados y órdenes (CSPRNG)
  function generateSecureId(prefix = "TSL") {
    _secureIdCounter = (_secureIdCounter + 1) % 900000;
    if (window.crypto && window.crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      window.crypto.getRandomValues(buf);
      const randNum = 100000 + ((buf[0] + _secureIdCounter) % 900000);
      return `${prefix}-${randNum}`;
    }
    return `${prefix}-${100000 + ((Math.floor(Math.random() * 900000) + _secureIdCounter) % 900000)}`;
  }

  // Rate Limiter preventivo contra abusos, flood y ataques de fuerza bruta en formularios
  const securityRateLimiter = {
    attempts: {},
    check(actionKey, maxAttempts = 5, windowMs = 30000) {
      const now = Date.now();
      if (!this.attempts[actionKey]) {
        this.attempts[actionKey] = [];
      }
      this.attempts[actionKey] = this.attempts[actionKey].filter(t => now - t < windowMs);
      if (this.attempts[actionKey].length >= maxAttempts) {
        return false;
      }
      this.attempts[actionKey].push(now);
      return true;
    }
  };

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

  // Modo oscuro permanente en la plataforma de showroom
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem("tesla_theme");
    }
    document.documentElement.removeAttribute("data-theme");
  } catch (e) {}

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

    // Si el usuario intentaba comprar un vehículo antes de identificarse, continuar compra automáticamente
    if (user && state.pendingPurchaseVehicleId) {
      const vIdToBuy = state.pendingPurchaseVehicleId;
      state.pendingPurchaseVehicleId = null;
      setTimeout(() => {
        closeLoginModal();
        openPurchaseModal(vIdToBuy);
      }, 350);
    }
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
    const pricing = (typeof getVehiclePricing === "function") 
      ? getVehiclePricing(vehicle) 
      : { isPromo: false, normalPrice: vehicle.price, promoPrice: 0, activePrice: vehicle.price, discountPercent: 0, discountAmount: 0, promoLabel: "" };

    const promoRibbonHTML = pricing.isPromo ? `
      <div class="card-corner-ribbon-wrap" aria-label="Promoción especial: ${escapeHTML(pricing.promoLabel)}">
        <div class="card-corner-ribbon">
          <span class="ribbon-sparkle">★</span>
          <span class="ribbon-text">${escapeHTML(pricing.promoLabel)}</span>
        </div>
      </div>
    ` : "";

    return `
      <article class="vehicle-card ${pricing.isPromo ? 'has-promo' : ''}" data-vehicle-id="${escapeHTML(vehicle.id)}">
        ${promoRibbonHTML}
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

          <div class="card-price-row ${pricing.isPromo ? 'is-promo-price' : ''}">
            ${pricing.isPromo ? `
              <div class="promo-price-block">
                <div class="promo-price-header">
                  <span class="card-price-label-promo">⚡ Precio Promocional</span>
                  <span class="promo-discount-badge">-${pricing.discountPercent}% OFF</span>
                </div>
                <div class="promo-price-main">
                  <span class="card-price-value promo-highlight">${formatCurrencyCOP(pricing.promoPrice)}</span>
                  <span class="card-price-original">
                    <span class="price-strike-label">Antes:</span>
                    <del>${formatCurrencyCOP(pricing.normalPrice)}</del>
                  </span>
                </div>
                <div class="promo-saving-callout">
                  Ahorras <strong>${formatCurrencyCOP(pricing.discountAmount)}</strong> con papeles al día
                </div>
              </div>
            ` : `
              <div>
                <span class="card-price-label">Precio Demostrativo Sugerido</span>
                <span class="card-price-value">${formatCurrencyCOP(vehicle.price)}</span>
              </div>
            `}
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
          <!-- Vista de Carrocería con Shader de Pintura Real (sin teñir la foto completa) -->
          <div class="config-preview-img-wrap" style="position: relative; overflow: hidden; border-radius: var(--radius-md); background: #0a0a0c;">
            <img id="modalVehicleImage" src="${escapeHTML(vehicle.image)}" alt="${escapeHTML(vehicle.name)}" style="width: 100%; display: block; transition: all 0.25s ease;">
            <!-- Capas de pintura realista y reflejo especular sobre la carrocería -->
            <div id="modalCarPaintOverlay" style="position: absolute; inset: 0; pointer-events: none; mix-blend-mode: multiply; opacity: 0; transition: opacity 0.25s ease, background-color 0.25s ease;"></div>
            <div id="modalCarSpecularOverlay" style="position: absolute; inset: 0; pointer-events: none; mix-blend-mode: color; opacity: 0; transition: opacity 0.25s ease, background-color 0.25s ease;"></div>
          </div>
          <div style="margin-bottom: var(--space-16); margin-top: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="font-size: 0.8125rem; color: var(--color-silver);">
                Pintura de Carrocería: <strong id="modalColorName" style="color: var(--color-silver-light, #fff); font-weight: 700;">${escapeHTML(currentColor ? currentColor.name : 'Blanco Perla')}</strong>
              </div>
              <label style="font-size: 0.78rem; color: var(--color-accent-red); cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; background: rgba(232, 33, 39, 0.1); border: 1px solid rgba(232, 33, 39, 0.3); padding: 4px 10px; border-radius: 6px; user-select: none;">
                <span>🎨 Color que desees</span>
                <input type="color" id="modalCustomColorPicker" value="${currentColor && currentColor.hex ? currentColor.hex : '#e82127'}" style="position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none;">
              </label>
            </div>
            <div class="color-swatch-list">
              ${(vehicle.colors || []).map((c, idx) => `
                <button type="button" 
                  class="swatch-btn ${currentColor && currentColor.id === c.id ? 'active' : ''}" 
                  style="background-color: ${c.hex};" 
                  data-color-id="${c.id}" 
                  data-color-name="${c.name}"
                  data-color-hex="${c.hex}"
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

          <div style="margin-top: var(--space-24); padding-top: var(--space-20); border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            ${(() => {
              const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(vehicle) : { isPromo: false };
              if (pricing.isPromo) {
                return `
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 0.72rem; color: #ff3b30; font-weight: 700; text-transform: uppercase;">⚡ Promoción Especial</span>
                      <span class="promo-discount-badge">-${pricing.discountPercent}% OFF</span>
                      <span style="font-size: 0.72rem; color: #fbbf24; font-weight: 600;">🔥 ${escapeHTML(pricing.promoLabel)}</span>
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 10px; margin-top: 2px;">
                      <span style="font-size: 1.85rem; font-weight: 800; color: #10b981;">${formatCurrencyCOP(pricing.promoPrice)}</span>
                      <del style="font-size: 1rem; color: #9ca3af;">${formatCurrencyCOP(pricing.normalPrice)}</del>
                    </div>
                    <div style="font-size: 0.75rem; color: #34d399; margin-top: 2px;">Ahorras ${formatCurrencyCOP(pricing.discountAmount)} con entrega de papeles al día</div>
                  </div>
                `;
              }
              return `
                <div>
                  <span style="font-size: 0.75rem; color: var(--color-silver); display: block;">Valor demostrativo orientativo</span>
                  <span style="font-size: 1.625rem; font-weight: 700; color: var(--color-white);">${formatCurrencyCOP(vehicle.price)}</span>
                </div>
              `;
            })()}
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

    // Sistema de acabado de pintura realista en carrocería (sin alterar fondos)
    const paintOverlay = document.getElementById("modalCarPaintOverlay");
    const specOverlay = document.getElementById("modalCarSpecularOverlay");
    const modalImg = document.getElementById("modalVehicleImage");
    const colorLabel = document.getElementById("modalColorName");

    function applyCarPaint(hex, name) {
      if (colorLabel && name) colorLabel.textContent = name;
      if (!paintOverlay || !modalImg) return;

      const cleanHex = (hex || "").toLowerCase();
      // Blanco Perla / Original
      if (!cleanHex || cleanHex === "#e8e9eb" || cleanHex === "#ffffff") {
        paintOverlay.style.opacity = "0";
        if (specOverlay) specOverlay.style.opacity = "0";
        modalImg.style.filter = "none";
        return;
      }

      // Negro Sólido
      if (cleanHex === "#111112" || cleanHex === "#000000" || cleanHex === "#08080a") {
        paintOverlay.style.backgroundColor = "#09090b";
        paintOverlay.style.opacity = "0.92";
        if (specOverlay) specOverlay.style.opacity = "0";
        modalImg.style.filter = "contrast(1.2) brightness(0.88)";
        return;
      }

      // Gris Sigilo
      if (cleanHex === "#4b4e53" || cleanHex === "#4b4f54") {
        paintOverlay.style.backgroundColor = "#373a3f";
        paintOverlay.style.opacity = "0.78";
        if (specOverlay) specOverlay.style.opacity = "0";
        modalImg.style.filter = "contrast(1.1) brightness(0.95)";
        return;
      }

      // Colores de alta gama y personalizados (Rojo, Azul, o elección del usuario)
      paintOverlay.style.backgroundColor = hex;
      paintOverlay.style.opacity = "0.8";
      if (specOverlay) {
        specOverlay.style.backgroundColor = hex;
        specOverlay.style.opacity = "0.85";
      }
      modalImg.style.filter = "contrast(1.08) brightness(1.02)";
    }

    // Inicializar pintura según el color predeterminado
    if (currentColor) {
      applyCarPaint(currentColor.hex, currentColor.name);
    }

    elements.vehicleModalContent.querySelectorAll(".swatch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        elements.vehicleModalContent.querySelectorAll(".swatch-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const colorName = btn.dataset.colorName;
        const colorHex = btn.dataset.colorHex;
        applyCarPaint(colorHex, colorName);
      });
    });

    const customColorInput = document.getElementById("modalCustomColorPicker");
    if (customColorInput) {
      customColorInput.addEventListener("input", (e) => {
        const customHex = e.target.value;
        elements.vehicleModalContent.querySelectorAll(".swatch-btn").forEach(b => b.classList.remove("active"));
        applyCarPaint(customHex, `Tono Personalizado (${customHex.toUpperCase()})`);
      });
    }

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
      const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(v) : { activePrice: v.price, isPromo: false };
      totalSum += pricing.activePrice;
      return `
        <div class="drawer-fav-item">
          <img src="${escapeHTML(v.image)}" alt="${escapeHTML(v.name)}" class="drawer-fav-thumb">
          <div class="drawer-fav-info">
            <h4 class="drawer-fav-name">${escapeHTML(v.name)}</h4>
            <div class="drawer-fav-price">
              ${pricing.isPromo ? `<span style="color: #10b981; font-weight: 700;">${formatCurrencyCOP(pricing.promoPrice)}</span> <del style="color: #9ca3af; font-size: 0.8em; margin-left: 4px;">${formatCurrencyCOP(pricing.normalPrice)}</del>` : formatCurrencyCOP(v.price)}
            </div>
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

    // Actualizar UI estándar
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

    // Sincronizar Plazo Extendible en Cuotas
    if (elements.simTermSelect && Number(elements.simTermSelect.value) !== termMonths) {
      elements.simTermSelect.value = termMonths;
    }
    if (elements.simTermBadge) {
      const years = (termMonths / 12).toFixed(termMonths % 12 === 0 ? 0 : 1);
      elements.simTermBadge.textContent = `${termMonths} cuotas (${years} ${termMonths === 12 ? 'año' : 'años'})`;
    }
    if (elements.simResultTermText) {
      elements.simResultTermText.textContent = `${termMonths} cuotas`;
    }

    if (elements.simTermsContainer) {
      elements.simTermsContainer.querySelectorAll(".term-btn").forEach(btn => {
        if (Number(btn.dataset.term) === termMonths) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    // MÓDULO DE AJUSTE A TU PRESUPUESTO & INGRESOS
    const monthlyIncome = (elements.simIncomeInput ? Number(elements.simIncomeInput.value) : state.simulator.monthlyIncome) || 15000000;
    state.simulator.monthlyIncome = monthlyIncome;
    const ratio = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;

    if (elements.simIncomeRatioVal) {
      elements.simIncomeRatioVal.textContent = `${ratio.toFixed(1)}% de tus ingresos`;
    }

    if (elements.simBudgetHealthIndicator) {
      if (ratio <= 30) {
        if (elements.simIncomeRatioVal) elements.simIncomeRatioVal.style.color = '#10b981';
        elements.simBudgetHealthIndicator.innerHTML = `
          <div class="budget-pill pill-healthy">
            <strong>✅ Presupuesto Óptimo:</strong> La cuota mensual estimada representa el <strong>${ratio.toFixed(1)}%</strong> de tus ingresos (recomendado bancario ≤ 30%). Tienes un perfil ideal para aprobación crediticia inmediata sin codeudor.
          </div>
        `;
      } else if (ratio <= 45) {
        if (elements.simIncomeRatioVal) elements.simIncomeRatioVal.style.color = '#f59e0b';
        elements.simBudgetHealthIndicator.innerHTML = `
          <div class="budget-pill pill-moderate">
            <strong>⚠️ Presupuesto Moderado:</strong> La cuota representa el <strong>${ratio.toFixed(1)}%</strong> de tus ingresos. Para mayor holgura financiera, te sugerimos seleccionar un plazo extendido (72 u 84 cuotas) o aportar un 5% a 10% adicional de cuota inicial.
          </div>
        `;
      } else {
        if (elements.simIncomeRatioVal) elements.simIncomeRatioVal.style.color = '#ef4444';
        elements.simBudgetHealthIndicator.innerHTML = `
          <div class="budget-pill pill-high">
            <strong>ℹ️ Cuota Elevada para tu Ingreso:</strong> La cuota representa el <strong>${ratio.toFixed(1)}%</strong> de tus ingresos mensuales (supera el 45% sugerido). Te sugerimos un plazo extendido (72 u 84 cuotas) o explorar otro modelo Tesla de nuestro catálogo para mantener tus finanzas saludables.
          </div>
        `;
      }
    }
  }

  function prefillSimulator(vehicleId) {
    const vehicle = state.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(vehicle) : { activePrice: vehicle.price };

    state.simulator.vehicleId = vehicle.id;
    state.simulator.vehiclePrice = pricing.activePrice;

    if (elements.simVehicleSelect) {
      elements.simVehicleSelect.value = vehicle.id;
    }
    if (elements.simPriceInput) {
      elements.simPriceInput.value = pricing.activePrice;
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
      elements.simVehicleSelect.innerHTML = state.vehicles.map(v => {
        const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(v) : { activePrice: v.price, isPromo: false };
        return `
          <option value="${escapeHTML(v.id)}" ${v.id === state.simulator.vehicleId ? 'selected' : ''}>
            ${escapeHTML(v.name)} — ${formatCurrencyCOP(pricing.activePrice)}${pricing.isPromo ? ` (🔥 ${escapeHTML(pricing.promoLabel)})` : ''}
          </option>
        `;
      }).join("");

      elements.simVehicleSelect.addEventListener("change", (e) => {
        const selVehicle = state.vehicles.find(v => v.id === e.target.value);
        if (selVehicle) {
          const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(selVehicle) : { activePrice: selVehicle.price };
          state.simulator.vehicleId = selVehicle.id;
          state.simulator.vehiclePrice = pricing.activePrice;
          if (elements.simPriceInput) elements.simPriceInput.value = pricing.activePrice;
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

    // Selector extendible desplegable de cuotas
    if (elements.simTermSelect) {
      elements.simTermSelect.addEventListener("change", (e) => {
        state.simulator.termMonths = Number(e.target.value);
        updateSimulatorCalculations();
      });
    }

    // Botones rápidos de cuotas
    if (elements.simTermsContainer) {
      elements.simTermsContainer.querySelectorAll(".term-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          state.simulator.termMonths = Number(btn.dataset.term);
          updateSimulatorCalculations();
        });
      });
    }

    // Ajuste por Ingresos Mensuales
    if (elements.simIncomeInput) {
      elements.simIncomeInput.addEventListener("input", (e) => {
        state.simulator.monthlyIncome = Number(e.target.value) || 0;
        updateSimulatorCalculations();
      });
    }

    // Botones de Desbloqueo en Estado Guest
    if (elements.simUnlockRegisterBtn) {
      elements.simUnlockRegisterBtn.addEventListener("click", () => {
        openLoginModal("register");
      });
    }
    if (elements.simUnlockLoginBtn) {
      elements.simUnlockLoginBtn.addEventListener("click", () => {
        openLoginModal("login");
      });
    }

    // Calculadora Inversa: Ajustar auto a la cuota mensual disponible
    if (elements.simAutoFitBtn && elements.simTargetPaymentInput) {
      elements.simAutoFitBtn.addEventListener("click", () => {
        const targetMonthly = Number(elements.simTargetPaymentInput.value);
        if (!targetMonthly || targetMonthly < 500000) {
          showToast("Ingresa un monto de cuota mensual válido (ej: 3.500.000 COP)", "warning");
          return;
        }

        const term = state.simulator.termMonths || 48;
        const annualRate = state.simulator.annualInterestRate || 14.5;
        const mRate = annualRate > 0 ? (Math.pow(1 + annualRate / 100, 1 / 12) - 1) : 0;
        let principalMax = 0;
        if (mRate === 0) {
          principalMax = targetMonthly * term;
        } else {
          const factor = Math.pow(1 + mRate, term);
          principalMax = Math.round(targetMonthly * ((factor - 1) / (mRate * factor)));
        }
        const downPct = state.simulator.downPaymentPercent || 20;
        const maxVehiclePrice = Math.round(principalMax / (1 - downPct / 100));

        const viableVehicles = state.vehicles.filter(v => v.price <= maxVehiclePrice * 1.08);
        const resBox = elements.simAutoFitResult;
        if (resBox) {
          resBox.style.display = "block";
          if (viableVehicles.length > 0) {
            const best = viableVehicles[viableVehicles.length - 1];
            resBox.innerHTML = `
              <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; padding: 10px; color: #ffffff; margin-top: 8px;">
                <div style="font-weight: 700; color: #10b981; margin-bottom: 4px;">🎯 Modelo Recomendado: ${escapeHTML(best.name)}</div>
                <div style="font-size: 0.8rem; color: var(--color-silver-light); margin-bottom: 8px;">
                  Con una cuota de <strong>${formatCurrencyCOP(targetMonthly)}/mes</strong> a ${term} cuotas, tu presupuesto alcanza para vehículos de hasta <strong>${formatCurrencyCOP(maxVehiclePrice)}</strong>.
                </div>
                <button type="button" class="btn btn-primary btn-sm" id="btnApplyAutoFitModel" style="padding: 5px 12px; font-size: 0.75rem;">
                  Cargar ${escapeHTML(best.name)} en el Simulador
                </button>
              </div>
            `;
            const btnApply = document.getElementById("btnApplyAutoFitModel");
            if (btnApply) {
              btnApply.addEventListener("click", () => {
                prefillSimulator(best.id);
              });
            }
          } else {
            resBox.innerHTML = `
              <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; padding: 10px; color: #ffffff; margin-top: 8px; font-size: 0.8rem;">
                Para una cuota de ${formatCurrencyCOP(targetMonthly)}, te sugerimos seleccionar un plazo extendido de <strong>72 u 84 cuotas</strong> o aportar una cuota inicial más alta.
              </div>
            `;
          }
        }
      });
    }

    // Enlace del Menú Superior: Navegación guiada
    if (elements.navLinkFinancing) {
      elements.navLinkFinancing.addEventListener("click", (e) => {
        if (!state.currentUser) {
          showToast("Crea tu cuenta o inicia sesión para usar el simulador de cuotas y crédito.", "info");
        }
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
      { 
        label: "Precio Sugerido", 
        valA: (() => {
          const pA = (typeof getVehiclePricing === "function") ? getVehiclePricing(vA) : { isPromo: false };
          return pA.isPromo 
            ? `<span style="color: #10b981; font-weight: 700;">${formatCurrencyCOP(pA.promoPrice)}</span> <del style="color: #9ca3af; font-size: 0.85em; margin-left: 4px;">${formatCurrencyCOP(pA.normalPrice)}</del> <span class="promo-discount-badge" style="margin-left: 4px;">-${pA.discountPercent}%</span>`
            : `<strong>${formatCurrencyCOP(vA.price)}</strong>`;
        })(), 
        valB: (() => {
          const pB = (typeof getVehiclePricing === "function") ? getVehiclePricing(vB) : { isPromo: false };
          return pB.isPromo 
            ? `<span style="color: #10b981; font-weight: 700;">${formatCurrencyCOP(pB.promoPrice)}</span> <del style="color: #9ca3af; font-size: 0.85em; margin-left: 4px;">${formatCurrencyCOP(pB.normalPrice)}</del> <span class="promo-discount-badge" style="margin-left: 4px;">-${pB.discountPercent}%</span>`
            : `<strong>${formatCurrencyCOP(vB.price)}</strong>`;
        })() 
      },
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

      // Defensa contra bots automáticos (Honeypot)
      const hpField = form.querySelector("#hpSecurityCheck");
      if (hpField && hpField.value) {
        console.warn("Intento de envío automatizado detectado y neutralizado por Honeypot.");
        return;
      }

      // Rate Limiter: Permite envíos sucesivos de prueba (hasta 10 cada 30 segundos)
      if (!securityRateLimiter.check("contact_submit", 10, 30000)) {
        showToast("Por seguridad, espera unos segundos antes de enviar otra solicitud.", "warning");
        return;
      }

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

      // Generación oficial de radicado para experiencia de manejo
      const radicadoNum = `RAD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const selectedModelObj = state.vehicles.find(v => v.id === modelSelect.value);
      const modelName = selectedModelObj ? selectedModelObj.name : "Tesla";
      const requestTypeVal = form.querySelector("#requestTypeSelect")?.value || "test-drive";
      const requestTypeLabels = {
        "test-drive": "Prueba de Manejo",
        "quote": "Cotización de Compra",
        "financing": "Asesoría Financiera",
        "corporate": "Flota Corporativa"
      };
      const requestTypeLabel = requestTypeLabels[requestTypeVal] || "Experiencia de Manejo";
      const clientCityVal = form.querySelector("#clientCity")?.value || "bogota";
      const clientCityLabels = {
        "bogota": "Bogotá D.C. — Zona Rosa",
        "medellin": "Medellín — El Poblado",
        "cali": "Cali — Ciudad Jardín",
        "barranquilla": "Barranquilla — Zona Norte",
        "otra": "Atención Virtual"
      };
      const clientCityLabel = clientCityLabels[clientCityVal] || "Bogotá D.C.";
      const clientCommentsVal = form.querySelector("#clientComments")?.value.trim() || "Solicitud de experiencia de manejo";

      const newLead = {
        id: radicadoNum,
        radicado: radicadoNum,
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        vehicle_name: modelName,
        vehicle_id: modelSelect.value,
        request_type: requestTypeLabel,
        city: clientCityLabel,
        comments: clientCommentsVal,
        status: "pending",
        source: "Agenda tu Experiencia de Manejo",
        created_at: new Date().toISOString()
      };

      // 1. Guardar de inmediato en localStorage (garantía total de persistencia)
      try {
        let currentLeads = [];
        const storedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
        if (storedLeads) {
          const parsed = JSON.parse(storedLeads);
          if (Array.isArray(parsed)) currentLeads = parsed;
        }
        currentLeads.unshift(newLead);
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(currentLeads));
      } catch (err) {
        console.warn("Error guardando lead en localStorage:", err);
      }

      // 2. Transmisión en tiempo real a la plataforma del administrador (BroadcastChannel)
      try {
        if (typeof BroadcastChannel !== "undefined") {
          const syncChan = new BroadcastChannel(SYNC_CHANNEL_NAME);
          syncChan.postMessage({ type: "NEW_LEAD", lead: newLead });
          syncChan.close();
        }
      } catch (err) {}

      // 3. Envío al servidor backend / PostgreSQL si está activo
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      }).catch(err => console.info("Registro de lead en servidor:", err));

      // 4. Mostrar confirmación en pantalla con número de radicado y datos presentes
      if (elements.formStatusAlert) {
        elements.formStatusAlert.style.display = "block";
        elements.formStatusAlert.innerHTML = `
          <!-- Indicador y casilla de verificación para visualizar el registro cerrado posteriormente -->
          <div id="solicitudClosedIndicator_${radicadoNum}" style="display: none; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: var(--radius-md); padding: 14px 18px; margin-top: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></span>
              <span style="font-size: 0.88rem; color: var(--color-silver-light, #fff); font-weight: 600;">
                Solicitud activa [Radicado: <span style="color: #e82127; font-weight: 700;">${radicadoNum}</span>] — Registro cerrado
              </span>
            </div>
            <label style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; font-size: 0.85rem; color: var(--color-silver-light, #e4e4e7); background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); padding: 7px 14px; border-radius: 6px; transition: all 0.2s;">
              <input type="checkbox" id="chkToggleClosedRecord_${radicadoNum}" style="accent-color: #10b981; width: 16px; height: 16px; cursor: pointer;">
              <span>Visualizar registro cerrado</span>
            </label>
          </div>

          <!-- Ventana de confirmación principal -->
          <div id="solicitudConfirmCard_${radicadoNum}" style="background: rgba(16, 185, 129, 0.08); border: 1px solid #10b981; border-radius: var(--radius-md); padding: 22px; margin-top: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.4);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; border-bottom: 1px solid rgba(16, 185, 129, 0.25); padding-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="width: 32px; height: 32px; border-radius: 50%; background: #10b981; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-weight: 700;">✓</span>
                <div>
                  <h4 style="color: #10b981; font-size: 1.15rem; font-weight: 700; margin: 0;">¡Tu Solicitud ha sido Enviada con Éxito!</h4>
                  <span style="font-size: 0.88rem; color: var(--color-silver-light, #a1a1aa); font-weight: 600; display: block; margin-top: 2px;">Un especialista oficial de Tesla Colombia revisará tu radicado y se comunicará contigo a la brevedad</span>
                </div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.72rem; color: var(--color-silver, #a1a1aa); display: block; text-transform: uppercase;">Número de Radicado</span>
                <span style="font-size: 1.15rem; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; background: rgba(232, 33, 39, 0.2); border: 1px solid #e82127; padding: 4px 10px; border-radius: 6px; display: inline-block;">${radicadoNum}</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 0.85rem; color: var(--color-silver-light, #d1d5db); margin-bottom: 14px;">
              <div><strong style="color: var(--color-silver-light, #fff);">Cliente:</strong> ${escapeHTML(newLead.name)}</div>
              <div><strong style="color: var(--color-silver-light, #fff);">Teléfono:</strong> ${escapeHTML(newLead.phone)}</div>
              <div><strong style="color: var(--color-silver-light, #fff);">Correo:</strong> ${escapeHTML(newLead.email)}</div>
              <div><strong style="color: var(--color-silver-light, #fff);">Modelo de Interés:</strong> <span style="color: #e82127; font-weight: 700;">${escapeHTML(newLead.vehicle_name)}</span></div>
              <div><strong style="color: var(--color-silver-light, #fff);">Tipo de Solicitud:</strong> ${escapeHTML(newLead.request_type)}</div>
              <div><strong style="color: var(--color-silver-light, #fff);">Sede Asignada:</strong> ${escapeHTML(newLead.city)}</div>
            </div>

            <div style="font-size: 0.82rem; color: var(--color-silver-light, #d1d5db); background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px 14px; margin-bottom: 10px;">
              <strong>Detalle de tu solicitud:</strong> "${escapeHTML(newLead.comments)}"
            </div>

            <p style="font-size: 0.78rem; color: var(--color-silver, #9ca3af); margin: 0 0 16px 0;">
              Guarda tu número de radicado <strong>${radicadoNum}</strong>. Un asesor oficial se comunicará contigo al teléfono suministrado para confirmar día y hora de tu prueba.
            </p>

            <!-- Alerta advirtiendo sobre eliminación con confirmación adicional -->
            <div id="deleteWarningAlert_${radicadoNum}" style="display: none; background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 1.3rem; line-height: 1;">⚠️</span>
                <div style="flex: 1;">
                  <div style="color: #f87171; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">Alerta de Supresión</div>
                  <p style="color: #fca5a5; font-size: 0.88rem; margin: 0 0 12px 0; font-weight: 600;">
                    Si elimina esta solicitud, no será respondida en el tiempo establecido.
                  </p>
                  <p style="font-size: 0.8rem; color: #fecaca; margin: 0 0 14px 0;">
                    Esta acción suprimirá definitivamente el registro del centro administrativo. ¿Deseas proceder?
                  </p>
                  <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <button type="button" id="btnConfirmDelete_${radicadoNum}" class="btn" style="background: #ef4444; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
                      Confirmar supresión definitiva
                    </button>
                    <button type="button" id="btnCancelDelete_${radicadoNum}" class="btn" style="background: rgba(255, 255, 255, 0.1); color: var(--color-silver-light, #e4e4e7); border: 1px solid rgba(255, 255, 255, 0.25); padding: 8px 16px; border-radius: 6px; font-size: 0.82rem; cursor: pointer;">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Opciones inferiores requeridas: Cerrar ventana y Eliminar solicitud -->
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; border-top: 1px solid rgba(16, 185, 129, 0.25); padding-top: 14px; flex-wrap: wrap;">
              <button type="button" id="btnDeleteSolicitud_${radicadoNum}" class="btn" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Eliminar solicitud
              </button>
              <button type="button" id="btnCloseSolicitud_${radicadoNum}" class="btn" style="background: rgba(255, 255, 255, 0.08); color: var(--color-silver-light, #ffffff); border: 1px solid rgba(255, 255, 255, 0.25); padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Cerrar ventana
              </button>
            </div>
          </div>
        `;

        // Lógica interactiva de las opciones
        const confirmCard = document.getElementById(`solicitudConfirmCard_${radicadoNum}`);
        const closedIndicator = document.getElementById(`solicitudClosedIndicator_${radicadoNum}`);
        const chkToggle = document.getElementById(`chkToggleClosedRecord_${radicadoNum}`);
        const btnClose = document.getElementById(`btnCloseSolicitud_${radicadoNum}`);
        const btnDelete = document.getElementById(`btnDeleteSolicitud_${radicadoNum}`);
        const deleteWarningAlert = document.getElementById(`deleteWarningAlert_${radicadoNum}`);
        const btnConfirmDelete = document.getElementById(`btnConfirmDelete_${radicadoNum}`);
        const btnCancelDelete = document.getElementById(`btnCancelDelete_${radicadoNum}`);

        // 1. Cerrar ventana: deja la solicitud activa y genera/muestra el indicador con casilla de verificación
        if (btnClose) {
          btnClose.addEventListener("click", () => {
            if (confirmCard) confirmCard.style.display = "none";
            if (closedIndicator) closedIndicator.style.display = "flex";
            if (chkToggle) chkToggle.checked = false;
            showToast("Ventana cerrada. La solicitud permanece activa.", "info");
          });
        }

        // Casilla de verificación para visualizar el registro cerrado posteriormente
        if (chkToggle) {
          chkToggle.addEventListener("change", (e) => {
            if (confirmCard) {
              confirmCard.style.display = e.target.checked ? "block" : "none";
            }
          });
        }

        // 2. Eliminar solicitud: despliega la alerta advirtiendo que "Si elimina esta solicitud, no será respondida en el tiempo establecido"
        if (btnDelete) {
          btnDelete.addEventListener("click", () => {
            if (deleteWarningAlert) {
              deleteWarningAlert.style.display = "block";
              deleteWarningAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          });
        }

        if (btnCancelDelete) {
          btnCancelDelete.addEventListener("click", () => {
            if (deleteWarningAlert) deleteWarningAlert.style.display = "none";
          });
        }

        // Confirmación adicional para proceder con la supresión definitiva del registro
        if (btnConfirmDelete) {
          btnConfirmDelete.addEventListener("click", () => {
            // Eliminar de localStorage
            try {
              const storedLeads = localStorage.getItem(STORAGE_KEY_LEADS);
              if (storedLeads) {
                const parsed = JSON.parse(storedLeads);
                if (Array.isArray(parsed)) {
                  const filtered = parsed.filter(l => l.id !== radicadoNum && l.radicado !== radicadoNum);
                  localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(filtered));
                }
              }
            } catch (err) {
              console.warn("Error eliminando lead en localStorage:", err);
            }

            // Sincronizar con el canal en tiempo real
            try {
              if (typeof BroadcastChannel !== "undefined") {
                const syncChan = new BroadcastChannel(SYNC_CHANNEL_NAME);
                syncChan.postMessage({ type: "DELETE_LEAD", leadId: radicadoNum });
                syncChan.close();
              }
            } catch (err) {}

            // Eliminar en backend si está activo
            fetch(`/api/leads/${radicadoNum}`, { method: 'DELETE' }).catch(() => {});

            // Retirar la confirmación e indicador
            if (confirmCard) confirmCard.remove();
            if (closedIndicator) closedIndicator.remove();

            // Mensaje informativo final
            elements.formStatusAlert.innerHTML = `
              <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: var(--radius-md); padding: 16px 20px; color: #fca5a5; font-size: 0.88rem; margin-top: 20px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.25rem;">🗑️</span>
                <div>
                  <strong>Solicitud eliminada:</strong> El registro con radicado <strong>${radicadoNum}</strong> ha sido suprimido definitivamente y no será respondido en el centro administrativo.
                </div>
              </div>
            `;

            showToast(`Solicitud ${radicadoNum} eliminada definitivamente.`, "info");
            if (typeof window.refreshRadicadosQuickList === "function") {
              window.refreshRadicadosQuickList();
            }
          });
        }

        elements.formStatusAlert.scrollIntoView({ behavior: "smooth" });
      }

      showToast(`Tu solicitud ha sido enviada con éxito. Radicado oficial: ${radicadoNum}`, "success", true);
      form.reset();
      if (typeof window.refreshRadicadosQuickList === "function") {
        window.refreshRadicadosQuickList();
      }
    });

    // Inicializar panel de consulta y gestión de radicados
    initRadicadoLookup();
  }

  // =========================================================================
  // CONSULTA Y GESTIÓN DE RADICADOS (BÚSQUEDA, VISUALIZACIÓN Y ELIMINACIÓN)
  // =========================================================================
  function initRadicadoLookup() {
    const inputSearch = document.getElementById("inputRadicadoSearch");
    const btnSearch = document.getElementById("btnSearchRadicado");
    const quickList = document.getElementById("radicadosQuickList");
    const chipsContainer = document.getElementById("radicadosChipsContainer");
    const searchResult = document.getElementById("radicadoSearchResult");

    if (!inputSearch || !btnSearch || !searchResult) return;

    function getLocalLeads() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_LEADS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {}
      return [];
    }

    function renderQuickChips() {
      const leads = getLocalLeads();
      if (!quickList || !chipsContainer) return;

      if (leads.length === 0) {
        quickList.style.display = "none";
        chipsContainer.innerHTML = "";
        return;
      }

      quickList.style.display = "block";
      chipsContainer.innerHTML = leads.map(l => {
        const radId = l.id || l.radicado;
        return `
          <button type="button" class="radicado-chip-btn" data-radicado="${escapeHTML(radId)}" style="background: rgba(232, 33, 39, 0.12); color: #f87171; border: 1px solid rgba(232, 33, 39, 0.35); padding: 5px 11px; border-radius: 6px; font-family: monospace; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;">
            <span style="opacity: 0.7;">#</span>${escapeHTML(radId)}
          </button>
        `;
      }).join("");

      chipsContainer.querySelectorAll(".radicado-chip-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const targetRad = btn.getAttribute("data-radicado");
          inputSearch.value = targetRad;
          performSearch(targetRad);
        });
      });
    }

    function performSearch(query) {
      const cleanQuery = (query || inputSearch.value || "").trim().toUpperCase();
      if (!cleanQuery) {
        showToast("Ingresa un número de radicado para buscar.", "warning");
        inputSearch.focus();
        return;
      }

      const leads = getLocalLeads();
      const found = leads.find(l => {
        const id = String(l.id || l.radicado || "").toUpperCase();
        return id === cleanQuery || id.includes(cleanQuery);
      });

      searchResult.style.display = "block";

      if (!found) {
        searchResult.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 14px 16px; color: #fca5a5; font-size: 0.85rem;">
            <div style="font-weight: 700; margin-bottom: 4px;">No se encontró la solicitud</div>
            No existe un registro activo con el radicado <strong>"${escapeHTML(cleanQuery)}"</strong>. Verifica el número o radica una nueva solicitud en el formulario contiguo.
          </div>
        `;
        return;
      }

      const radNum = found.id || found.radicado;
      const dateFormatted = found.created_at ? new Date(found.created_at).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Fecha reciente";

      searchResult.innerHTML = `
        <div id="lookupCard_${radNum}" style="background: rgba(16, 185, 129, 0.08); border: 1px solid #10b981; border-radius: 8px; padding: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid rgba(16, 185, 129, 0.2); padding-bottom: 10px;">
            <div>
              <span style="font-size: 0.7rem; color: var(--color-silver, #a1a1aa); text-transform: uppercase; display: block;">Radicado Encontrado</span>
              <strong style="font-size: 1.05rem; color: #fff; font-family: monospace; letter-spacing: 0.04em;">${escapeHTML(radNum)}</strong>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #10b981; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 20px; font-weight: 600;">
                <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981;"></span>
                En Centro Administrativo
              </span>
            </div>
          </div>

          <!-- Datos Principales -->
          <div style="font-size: 0.82rem; color: var(--color-silver-light, #d1d5db); display: grid; grid-template-columns: 1fr; gap: 6px; margin-bottom: 12px;">
            <div><strong style="color: var(--color-silver-light, #fff);">Cliente:</strong> ${escapeHTML(found.name || 'Sin nombre')}</div>
            <div><strong style="color: var(--color-silver-light, #fff);">Vehículo:</strong> <span style="color: #e82127; font-weight: 700;">${escapeHTML(found.vehicle_name || 'Tesla')}</span></div>
            <div><strong style="color: var(--color-silver-light, #fff);">Tipo:</strong> ${escapeHTML(found.request_type || 'Experiencia de Manejo')}</div>
            <div><strong style="color: var(--color-silver-light, #fff);">Sede:</strong> ${escapeHTML(found.city || 'Bogotá D.C.')}</div>
            <div><strong style="color: var(--color-silver, #9ca3af);">Fecha:</strong> ${escapeHTML(dateFormatted)}</div>
          </div>

          <!-- Detalles Extendidos (Mirar Solicitud) -->
          <div id="lookupExtendedDetails_${radNum}" style="display: none; font-size: 0.8rem; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px; margin-bottom: 12px; color: var(--color-silver-light, #e4e4e7);">
            <div style="margin-bottom: 4px;"><strong>Teléfono:</strong> ${escapeHTML(found.phone || 'No registrado')}</div>
            <div style="margin-bottom: 4px;"><strong>Correo:</strong> ${escapeHTML(found.email || 'No registrado')}</div>
            <div><strong>Comentarios del cliente:</strong> "${escapeHTML(found.comments || 'Sin comentarios')}"</div>
          </div>

          <!-- Alerta de Advertencia de Eliminación con Confirmación Adicional -->
          <div id="lookupDeleteWarning_${radNum}" style="display: none; background: rgba(239, 68, 68, 0.12); border: 1px solid #ef4444; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px;">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="font-size: 1.2rem; line-height: 1;">⚠️</span>
              <div style="flex: 1;">
                <div style="color: #f87171; font-weight: 700; font-size: 0.88rem; margin-bottom: 3px;">Advertencia de Eliminación</div>
                <p style="color: #fca5a5; font-size: 0.82rem; margin: 0 0 10px 0; font-weight: 600;">
                  Si elimina esta solicitud, no será respondida en el tiempo establecido.
                </p>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <button type="button" id="btnLookupConfirmDelete_${radNum}" class="btn" style="background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 5px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                    Confirmar supresión definitiva
                  </button>
                  <button type="button" id="btnLookupCancelDelete_${radNum}" class="btn" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 5px; font-size: 0.78rem; cursor: pointer;">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Opciones: Mirar (Ver Detalles) y Eliminar Solicitud -->
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; border-top: 1px solid rgba(16, 185, 129, 0.2); padding-top: 10px; flex-wrap: wrap;">
            <button type="button" id="btnLookupDelete_${radNum}" class="btn" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              Eliminar solicitud
            </button>
            <button type="button" id="btnLookupToggleDetails_${radNum}" class="btn" style="background: rgba(255, 255, 255, 0.08); color: var(--color-silver-light, #fff); border: 1px solid rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              <span id="btnLookupDetailsText_${radNum}">Mirar detalles</span>
            </button>
          </div>
        </div>
      `;

      // Handlers para mirar detalles y eliminar
      const extDetails = document.getElementById(`lookupExtendedDetails_${radNum}`);
      const btnToggleDetails = document.getElementById(`btnLookupToggleDetails_${radNum}`);
      const btnToggleText = document.getElementById(`btnLookupDetailsText_${radNum}`);
      const btnDelete = document.getElementById(`btnLookupDelete_${radNum}`);
      const deleteWarning = document.getElementById(`lookupDeleteWarning_${radNum}`);
      const btnConfirmDelete = document.getElementById(`btnLookupConfirmDelete_${radNum}`);
      const btnCancelDelete = document.getElementById(`btnLookupCancelDelete_${radNum}`);

      if (btnToggleDetails && extDetails) {
        btnToggleDetails.addEventListener("click", () => {
          const isOpen = extDetails.style.display === "block";
          extDetails.style.display = isOpen ? "none" : "block";
          if (btnToggleText) {
            btnToggleText.textContent = isOpen ? "Mirar detalles" : "Ocultar detalles";
          }
        });
      }

      if (btnDelete && deleteWarning) {
        btnDelete.addEventListener("click", () => {
          deleteWarning.style.display = "block";
        });
      }

      if (btnCancelDelete && deleteWarning) {
        btnCancelDelete.addEventListener("click", () => {
          deleteWarning.style.display = "none";
        });
      }

      if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener("click", () => {
          // 1. Eliminar de localStorage
          try {
            const stored = localStorage.getItem(STORAGE_KEY_LEADS);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) {
                const filtered = parsed.filter(l => l.id !== radNum && l.radicado !== radNum);
                localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(filtered));
              }
            }
          } catch (e) {}

          // 2. Notificar por BroadcastChannel
          try {
            if (typeof BroadcastChannel !== "undefined") {
              const syncChan = new BroadcastChannel(SYNC_CHANNEL_NAME);
              syncChan.postMessage({ type: "DELETE_LEAD", leadId: radNum });
              syncChan.close();
            }
          } catch (e) {}

          // 3. Backend
          fetch(`/api/leads/${radNum}`, { method: 'DELETE' }).catch(() => {});

          // 4. Actualizar interfaz
          searchResult.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 8px; padding: 14px 16px; color: #fca5a5; font-size: 0.85rem; display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.15rem;">🗑️</span>
              <div>
                <strong>Solicitud eliminada:</strong> El radicado <strong>${escapeHTML(radNum)}</strong> ha sido suprimido definitivamente del centro administrativo.
              </div>
            </div>
          `;

          // Limpiar ventana principal si correspondía a esta solicitud
          const mainConfirmCard = document.getElementById(`solicitudConfirmCard_${radNum}`);
          const mainClosedIndicator = document.getElementById(`solicitudClosedIndicator_${radNum}`);
          if (mainConfirmCard) mainConfirmCard.remove();
          if (mainClosedIndicator) mainClosedIndicator.remove();

          renderQuickChips();
          showToast(`Solicitud ${radNum} eliminada definitivamente.`, "info");
        });
      }
    }

    btnSearch.addEventListener("click", () => performSearch());
    inputSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch();
      }
    });

    renderQuickChips();
    window.refreshRadicadosQuickList = renderQuickChips;
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
          <span class="faq-question">${escapeHTML(faq.q)}</span>
          <svg class="faq-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div class="faq-body">
          <p class="faq-answer">${escapeHTML(faq.a)}</p>
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
  // CONTROL DE NAVEGACIÓN Y MENÚ MÓVIL (OFF-CANVAS DRAWER)
  // =========================================================================

  function openNavDrawer() {
    if (!elements.mainNavList) return;
    const navDrawerOverlay = document.getElementById("navDrawerOverlay");
    elements.mainNavList.classList.add("is-open");
    if (elements.header) elements.header.classList.add("drawer-open");
    if (navDrawerOverlay) {
      navDrawerOverlay.classList.add("is-visible");
      navDrawerOverlay.setAttribute("aria-hidden", "false");
    }
    if (elements.navToggle) {
      elements.navToggle.setAttribute("aria-expanded", "true");
      elements.navToggle.classList.add("is-active");
    }
    document.body.classList.add("nav-drawer-active");
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }

  function closeNavDrawer() {
    if (!elements.mainNavList) return;
    const navDrawerOverlay = document.getElementById("navDrawerOverlay");
    elements.mainNavList.classList.remove("is-open");
    if (elements.header) elements.header.classList.remove("drawer-open");
    if (navDrawerOverlay) {
      navDrawerOverlay.classList.remove("is-visible");
      navDrawerOverlay.setAttribute("aria-hidden", "true");
    }
    if (elements.navToggle) {
      elements.navToggle.setAttribute("aria-expanded", "false");
      elements.navToggle.classList.remove("is-active");
    }
    document.body.classList.remove("nav-drawer-active");
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }

  function initNavigation() {
    // Scroll header background
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        elements.header.classList.add("scrolled");
      } else {
        elements.header.classList.remove("scrolled");
      }
    });

    const navDrawerOverlay = document.getElementById("navDrawerOverlay");
    const drawerCloseBtn = document.getElementById("drawerCloseBtn");

    if (elements.navToggle && elements.mainNavList) {
      elements.navToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = elements.mainNavList.classList.contains("is-open");
        isOpen ? closeNavDrawer() : openNavDrawer();
      });
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNavDrawer();
      });
    }

    // Cerrar drawer al hacer clic en overlay
    if (navDrawerOverlay) {
      navDrawerOverlay.addEventListener("click", (e) => {
        e.stopPropagation();
        closeNavDrawer();
      });
    }

    // Cerrar drawer con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && elements.mainNavList && elements.mainNavList.classList.contains("is-open")) {
        closeNavDrawer();
      }
    });

    // Gestión interactiva de enlaces de navegación (anclas a secciones con scroll suave y compensación de header)
    const anchorNavLinks = elements.mainNavList.querySelectorAll("a[href^='#']");
    anchorNavLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        anchorNavLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
        closeNavDrawer();

        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            requestAnimationFrame(() => {
              const headerHeight = elements.header ? elements.header.offsetHeight : 64;
              const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
              window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: "smooth"
              });
              if (history.pushState) {
                history.pushState(null, null, href);
              } else {
                location.hash = href;
              }
            });
          }
        }
      });
    });

    // ScrollSpy: Sincroniza automáticamente la función seleccionada al desplazarse
    const trackedSections = [
      { id: "inicio", href: "#inicio" },
      { id: "catalogo", href: "#catalogo" },
      { id: "experiencia", href: "#experiencia" },
      { id: "financiacion", href: "#financiacion" },
      { id: "comparador", href: "#comparador" },
      { id: "contacto", href: "#contacto" },
      { id: "faqs", href: "#faqs" }
    ];

    window.addEventListener("scroll", () => {
      const scrollPos = window.scrollY + 180;
      for (let i = trackedSections.length - 1; i >= 0; i--) {
        const sec = document.getElementById(trackedSections[i].id);
        if (sec && scrollPos >= sec.offsetTop) {
          const targetHref = trackedSections[i].href;
          anchorNavLinks.forEach(l => {
            if (l.getAttribute("href") === targetHref) {
              l.classList.add("active");
            } else {
              l.classList.remove("active");
            }
          });
          break;
        }
      }
    }, { passive: true });


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

    // Actualizar botón único de cuenta en el header
    if (elements.accountTriggerBtn) {
      if (isLogged) {
        elements.accountTriggerBtn.classList.add("is-logged-in");
        const firstName = user.name.trim().split(" ")[0] || "Usuario";
        if (elements.accountBtnText) elements.accountBtnText.textContent = `Mi Cuenta (${firstName})`;
        if (elements.accountStatusDot) elements.accountStatusDot.style.display = "inline-block";
        elements.accountTriggerBtn.setAttribute("aria-label", `Mi Cuenta de ${user.name}`);
        elements.accountTriggerBtn.setAttribute("title", `Mi Cuenta (${user.name})`);
      } else {
        elements.accountTriggerBtn.classList.remove("is-logged-in");
        if (elements.accountBtnText) elements.accountBtnText.textContent = "Mi Cuenta";
        if (elements.accountStatusDot) elements.accountStatusDot.style.display = "none";
        elements.accountTriggerBtn.setAttribute("aria-label", "Abrir Mi Cuenta (Iniciar sesión o Registrarse)");
        elements.accountTriggerBtn.setAttribute("title", "Abrir Mi Cuenta Tesla");
        closeUserDropdown();
      }
    }

    // Actualizar botón móvil si existe
    if (elements.mobileAccountBtnText) {
      if (isLogged) {
        const firstName = user.name.trim().split(" ")[0] || "Usuario";
        elements.mobileAccountBtnText.textContent = `Mi Cuenta (${firstName})`;
      } else {
        elements.mobileAccountBtnText.textContent = "Mi Cuenta / Iniciar Sesión";
      }
    }

    const navMobileRegisterItem = document.getElementById("navMobileRegisterItem");
    if (navMobileRegisterItem) {
      navMobileRegisterItem.style.display = isLogged ? "none" : "";
    }

    // Compatibilidad si hubiera enlace en el menú
    if (elements.navLoginLink) {
      if (isLogged) {
        const firstName = user.name.trim().split(" ")[0] || "Usuario";
        elements.navLoginLink.textContent = `Cuenta (${firstName})`;
      } else {
        elements.navLoginLink.textContent = "Cuenta";
      }
    }

    // Dropdown rápido
    if (user) {
      const initials = user.name.trim().split(" ").map(n => n.charAt(0)).slice(0, 2).join("").toUpperCase() || "U";
      if (elements.dropdownAvatarCircle) elements.dropdownAvatarCircle.textContent = initials;
      if (elements.dropdownUserName) elements.dropdownUserName.textContent = user.name;
      if (elements.dropdownUserEmail) elements.dropdownUserEmail.textContent = user.email;
    }
    if (elements.dropdownFavCount) {
      elements.dropdownFavCount.textContent = state.favorites.length;
    }

    // Sincronizar visibilidad del Simulador de Financiación y Crédito
    const simGuestLock = elements.simGuestLockState || document.getElementById("simGuestLockState");
    const simAuthContent = elements.simAuthenticatedContent || document.getElementById("simAuthenticatedContent");

    if (simGuestLock && simAuthContent) {
      if (isLogged) {
        simGuestLock.style.display = "none";
        simAuthContent.style.display = "block";
        updateSimulatorCalculations();
      } else {
        simGuestLock.style.display = "block";
        simAuthContent.style.display = "none";
      }
    }

    // Si el modal está abierto actualmente y hay usuario, sincronizar dashboard
    if (isLogged && elements.loginModal && elements.loginModal.classList.contains("is-visible")) {
      renderAccountDashboard();
    }
  }

  function openLoginModal(authTab = "login", defaultDashTab = "profile") {
    if (!elements.loginModal) return;
    const isLogged = !!state.currentUser;

    if (isLogged) {
      // Mostrar Vista Completa de Dashboard de Cliente
      if (elements.authGuestView) elements.authGuestView.style.display = "none";
      if (elements.authDashboardView) elements.authDashboardView.style.display = "block";
      if (elements.accountModalDialog) elements.accountModalDialog.classList.add("is-dashboard");
      renderAccountDashboard();
      switchDashboardTab(defaultDashTab);
    } else {
      // Mostrar Vista de Invitado (Login / Registro)
      if (elements.authGuestView) elements.authGuestView.style.display = "block";
      if (elements.authDashboardView) elements.authDashboardView.style.display = "none";
      if (elements.accountModalDialog) elements.accountModalDialog.classList.remove("is-dashboard");
      switchAuthTab(authTab);
    }

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
    if (elements.forgotPwdBox) {
      elements.forgotPwdBox.style.display = "none";
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

  function switchDashboardTab(tabName) {
    const tabs = [
      { id: "profile", btn: elements.tabDashProfileBtn, panel: elements.dashProfilePanel },
      { id: "notifications", btn: elements.tabDashNotificationsBtn, panel: elements.dashNotificationsPanel },
      { id: "orders", btn: elements.tabDashOrdersBtn, panel: elements.dashOrdersPanel },
      { id: "favs", btn: elements.tabDashFavsBtn, panel: elements.dashFavsPanel },
      { id: "testdrive", btn: elements.tabDashTestDriveBtn, panel: elements.dashTestDrivePanel },
      { id: "security", btn: elements.tabDashSecurityBtn, panel: elements.dashSecurityPanel }
    ];

    tabs.forEach(t => {
      if (!t.btn || !t.panel) return;
      if (t.id === tabName) {
        t.btn.classList.add("active");
        t.btn.setAttribute("aria-selected", "true");
        t.panel.style.display = "block";
      } else {
        t.btn.classList.remove("active");
        t.btn.setAttribute("aria-selected", "false");
        t.panel.style.display = "none";
      }
    });
  }

  function renderAccountDashboard() {
    const user = state.currentUser;
    if (!user) return;

    // Iniciales
    const initials = user.name.trim().split(" ").map(n => n.charAt(0)).slice(0, 2).join("").toUpperCase() || "U";
    if (elements.dashAvatarCircle) elements.dashAvatarCircle.textContent = initials;
    if (elements.dashUserName) elements.dashUserName.textContent = user.name;
    if (elements.dashUserRole) elements.dashUserRole.textContent = user.role || "Cliente VIP Tesla";
    if (elements.dashUserEmail) elements.dashUserEmail.textContent = user.email;
    if (elements.dashUserCity) elements.dashUserCity.textContent = user.city || "Colombia";

    // KPIs
    if (elements.dashKpiFavsCount) elements.dashKpiFavsCount.textContent = state.favorites.length;
    const orders = user.orders || [];
    if (elements.dashKpiOrdersCount) elements.dashKpiOrdersCount.textContent = orders.length;
    if (elements.dashOrdersTabBadge) elements.dashOrdersTabBadge.textContent = orders.length;

    const preferredModelObj = state.vehicles.find(v => v.id === (user.preferredModel || "model-3"));
    if (elements.dashKpiPreferredModel) {
      elements.dashKpiPreferredModel.textContent = preferredModelObj ? preferredModelObj.name : "Model 3";
    }

    // Llenar formulario de edición de datos
    if (elements.dashEditName) elements.dashEditName.value = user.name || "";
    if (elements.dashEditEmail) elements.dashEditEmail.value = user.email || "";
    if (elements.dashEditPhone) elements.dashEditPhone.value = user.phone || "";
    if (elements.dashEditCity) elements.dashEditCity.value = user.city || "Bogotá D.C.";
    if (elements.dashEditPreferredModel) elements.dashEditPreferredModel.value = user.preferredModel || "model-3";

    // Renderizar pestaña de Órdenes y Radicados
    if (elements.dashOrdersListContainer) {
      if (orders.length === 0) {
        elements.dashOrdersListContainer.innerHTML = `
          <div class="account-empty-state">
            <div class="account-empty-icon">📋</div>
            <h4 style="color: var(--color-white); font-size: 1.05rem; margin-bottom: 6px;">No tienes órdenes o reservas activas</h4>
            <p style="font-size: 0.8125rem; color: var(--color-silver); margin-bottom: 16px;">
              Configura tu vehículo soñado con o sin paquete de papeles legales al día desde nuestro catálogo.
            </p>
            <a href="#catalogo" class="btn btn-primary btn-sm" onclick="closeLoginModal();">Explorar Catálogo y Reservar</a>
          </div>
        `;
      } else {
        elements.dashOrdersListContainer.innerHTML = orders.map(ord => {
          const isAuth = ord.status === "authorized";
          const isRejected = ord.status === "rejected";
          let statusBadgeHTML = "";

          if (isAuth) {
            statusBadgeHTML = `<span class="account-order-status" style="background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-weight: 700;">✅ Compra Autorizada</span>`;
          } else if (isRejected) {
            statusBadgeHTML = `<span class="account-order-status" style="background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-weight: 700;">❌ Compra Rechazada${ord.rejectedReason ? `: ${escapeHTML(ord.rejectedReason)}` : ''}</span>`;
          } else {
            statusBadgeHTML = `<span class="account-order-status" style="background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.4); color: #fbbf24; font-weight: 700;">⏳ En Espera de Autorización de la Administración</span>`;
          }

          return `
            <div class="account-order-card">
              <img src="${ord.vehicleImage || 'assets/images/model-3.jpg'}" alt="${escapeHTML(ord.vehicleName)}" class="account-order-img">
              <div>
                <div class="account-order-title">${escapeHTML(ord.vehicleName)} <span style="font-size: 0.8rem; font-weight: 400; color: var(--color-silver);">(${escapeHTML(ord.vehicleVersion || '')})</span></div>
                <div class="account-order-meta">
                  Radicado: <strong style="color: var(--color-white); font-family: monospace;">${escapeHTML(ord.orderNum)}</strong> • Fecha: ${escapeHTML(ord.date)}<br>
                  Paquete de Papeles: <strong style="color: ${ord.includePapers ? '#10b981' : 'var(--color-silver)'};">${ord.includePapers ? 'Incluido (Al Día)' : 'No incluido'}</strong>
                </div>
                ${statusBadgeHTML}
              </div>
              <div class="account-order-price-wrap">
                <span class="account-order-price">${formatCurrencyCOP(ord.totalAmount)}</span>
                <a href="https://wa.me/573105550199?text=Hola,%20quisiera%20consultar%20la%20autorizaci%C3%B3n%20de%20mi%20orden%20${encodeURIComponent(ord.orderNum)}%20para%20el%20veh%C3%ADculo%20${encodeURIComponent(ord.vehicleName)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="margin-top: 6px; padding: 5px 10px; font-size: 0.75rem;">
                  Consultar Radicado
                </a>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // Renderizar pestaña de Favoritos
    if (elements.dashFavsListContainer) {
      const favVehicles = state.vehicles.filter(v => state.favorites.includes(v.id));
      if (favVehicles.length === 0) {
        elements.dashFavsListContainer.innerHTML = `
          <div class="account-empty-state">
            <div class="account-empty-icon">🤍</div>
            <h4 style="color: var(--color-white); font-size: 1.05rem; margin-bottom: 6px;">No tienes vehículos guardados</h4>
            <p style="font-size: 0.8125rem; color: var(--color-silver); margin-bottom: 16px;">
              Haz clic en el corazón de cualquier Tesla del catálogo para guardarlo y compararlo aquí.
            </p>
            <a href="#catalogo" class="btn btn-primary btn-sm" onclick="closeLoginModal();">Ver Modelos Disponibles</a>
          </div>
        `;
      } else {
        elements.dashFavsListContainer.innerHTML = favVehicles.map(veh => `
          <div class="account-order-card">
            <img src="${veh.image}" alt="${escapeHTML(veh.name)}" class="account-order-img">
            <div>
              <div class="account-order-title">${escapeHTML(veh.name)} — ${escapeHTML(veh.version)}</div>
              <div class="account-order-meta">
                Autonomía: <strong style="color: var(--color-white);">${veh.range} km</strong> • Aceleración: <strong style="color: var(--color-white);">${veh.acceleration}s</strong>
              </div>
              <span class="status-indicator-pill" style="margin-top: 6px; display: inline-block;">En Showroom</span>
            </div>
            <div class="account-order-price-wrap">
              <span class="account-order-price">${formatCurrencyCOP(veh.price)}</span>
              <div style="display: flex; gap: 6px; margin-top: 6px;">
                <button type="button" class="btn btn-primary btn-sm" style="padding: 5px 10px; font-size: 0.75rem;" onclick="closeLoginModal(); openPurchaseModal('${escapeHTML(veh.id)}');">
                  Comprar
                </button>
                <button type="button" class="btn btn-secondary btn-sm" style="padding: 5px 10px; font-size: 0.75rem; color: var(--color-silver);" onclick="toggleFavorite('${escapeHTML(veh.id)}'); renderAccountDashboard();">
                  Quitar
                </button>
              </div>
            </div>
          </div>
        `).join("");
      }
    }

    // Renderizar pestaña de Notificaciones
    renderNotificationsUI();
  }

  // =========================================================================
  // GESTOR DEL CENTRO DE NOTIFICACIONES (COMPRAS, APROBACIONES Y RECHAZOS)
  // =========================================================================

  function addUserNotification(notifData) {
    if (!state.currentUser) return;
    state.currentUser.notifications = state.currentUser.notifications || [];

    // Prevenir duplicados del mismo tipo para la misma orden
    if (notifData.orderNum && notifData.type) {
      const exists = state.currentUser.notifications.some(n => n.orderNum === notifData.orderNum && n.type === notifData.type);
      if (exists) return;
    }

    const newNotif = {
      id: notifData.id || ("notif_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 5)),
      type: notifData.type || "info",
      title: notifData.title || "Notificación",
      message: notifData.message || "",
      orderNum: notifData.orderNum || null,
      vehicleName: notifData.vehicleName || "",
      amount: notifData.amount || 0,
      isRead: false,
      date: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      timestamp: new Date().toISOString(),
      extra: notifData.extra || {}
    };

    state.currentUser.notifications.unshift(newNotif);
    saveAuthUser(state.currentUser);
    renderNotificationsUI();
  }

  function markNotificationAsRead(notifId) {
    if (!state.currentUser || !Array.isArray(state.currentUser.notifications)) return;
    const notif = state.currentUser.notifications.find(n => n.id === notifId);
    if (notif) {
      notif.isRead = true;
      saveAuthUser(state.currentUser);
      renderNotificationsUI();
    }
  }

  function markAllNotificationsAsRead() {
    if (!state.currentUser || !Array.isArray(state.currentUser.notifications)) return;
    state.currentUser.notifications.forEach(n => { n.isRead = true; });
    saveAuthUser(state.currentUser);
    renderNotificationsUI();
    showToast("Todas las notificaciones han sido marcadas como leídas.", "success");
  }

  function deleteNotification(notifId) {
    if (!state.currentUser || !Array.isArray(state.currentUser.notifications)) return;
    const idx = state.currentUser.notifications.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      state.currentUser.notifications.splice(idx, 1);
      saveAuthUser(state.currentUser);
      renderNotificationsUI();
    }
  }

  function clearAllNotifications() {
    if (!state.currentUser || !Array.isArray(state.currentUser.notifications)) return;
    if (state.currentUser.notifications.length === 0) return;
    if (!confirm("¿Deseas eliminar todas las notificaciones de tu historial?")) return;
    state.currentUser.notifications = [];
    saveAuthUser(state.currentUser);
    renderNotificationsUI();
    showToast("Historial de notificaciones vaciado.", "info");
  }

  function renderNotificationsUI() {
    const user = state.currentUser;
    if (!user) {
      if (elements.headerNotifBtn) elements.headerNotifBtn.style.display = "none";
      return;
    }

    const notifs = user.notifications || [];
    const unreadCount = notifs.filter(n => !n.isRead).length;

    // Actualizar insignias de notificación en la UI
    const updateBadgeElement = (badgeEl, dotEl, count) => {
      if (badgeEl) {
        if (count > 0) {
          badgeEl.textContent = count > 99 ? "99+" : count;
          badgeEl.style.display = "inline-flex";
        } else {
          badgeEl.style.display = "none";
        }
      }
      if (dotEl) {
        dotEl.style.display = count > 0 ? "inline-block" : "none";
      }
    };

    updateBadgeElement(elements.dashNotificationsBadge, elements.dashTabNotifDot, unreadCount);
    updateBadgeElement(elements.dropdownNotifBadge, elements.dropdownNotifDot, unreadCount);
    updateBadgeElement(elements.headerNotifBadge, null, unreadCount);

    if (elements.headerNotifBtn) {
      elements.headerNotifBtn.style.display = "inline-flex";
    }

    if (elements.dashKpiNotificationsCount) {
      elements.dashKpiNotificationsCount.textContent = notifs.length;
    }
    if (elements.dashKpiPulseDot) {
      elements.dashKpiPulseDot.style.display = unreadCount > 0 ? "inline-block" : "none";
    }
    if (elements.notifsUnreadPill) {
      if (unreadCount > 0) {
        elements.notifsUnreadPill.textContent = `${unreadCount} Nuevas`;
        elements.notifsUnreadPill.style.display = "inline-block";
      } else {
        elements.notifsUnreadPill.style.display = "none";
      }
    }

    // Renderizar contenedor de lista
    if (elements.dashNotificationsListContainer) {
      if (notifs.length === 0) {
        elements.dashNotificationsListContainer.innerHTML = `
          <div class="account-empty-state">
            <div class="account-empty-icon">🔔</div>
            <h4 style="color: var(--color-white); font-size: 1.05rem; margin-bottom: 6px;">No tienes notificaciones por el momento</h4>
            <p style="font-size: 0.8125rem; color: var(--color-silver); margin-bottom: 16px;">
              Aquí recibirás avisos en tiempo real sobre tus radicados de compra, autorizaciones y novedades de administración.
            </p>
            <button type="button" class="btn btn-secondary btn-sm" onclick="switchDashboardTab('orders');">Ver Mis Reservas</button>
          </div>
        `;
      } else {
        elements.dashNotificationsListContainer.innerHTML = notifs.map(n => {
          let cardTypeClass = "notif-info";
          let iconHtml = "ℹ️";
          let badgeStatusText = "INFORMACIÓN";

          if (n.type === "purchase_authorized") {
            cardTypeClass = "notif-authorized";
            iconHtml = "✓";
            badgeStatusText = "Aprobada";
          } else if (n.type === "purchase_rejected") {
            cardTypeClass = "notif-rejected";
            iconHtml = "✕";
            badgeStatusText = "Rechazada";
          } else if (n.type === "purchase_created") {
            cardTypeClass = "notif-created";
            iconHtml = "📋";
            badgeStatusText = "Radicada";
          }

          let extraBoxHtml = "";
          if (n.type === "purchase_rejected" && n.extra && n.extra.rejectedReason) {
            extraBoxHtml = `
              <div class="notif-meta-box box-danger">
                <strong>Motivo del Rechazo:</strong> ${escapeHTML(n.extra.rejectedReason)}
              </div>
            `;
          } else if (n.type === "purchase_authorized") {
            extraBoxHtml = `
              <div class="notif-meta-box box-success">
                <span>Tu orden se encuentra formalmente aprobada para alistamiento y entrega en showroom.</span>
              </div>
            `;
          }

          let orderActionBtn = "";
          if (n.orderNum) {
            orderActionBtn = `
              <button type="button" class="btn btn-secondary btn-sm" onclick="switchDashboardTab('orders');">
                Ver Orden (${escapeHTML(n.orderNum)})
              </button>
            `;
          }

          return `
            <article class="notif-card ${cardTypeClass} ${n.isRead ? '' : 'is-unread'}">
              <div class="notif-icon-circle">
                ${iconHtml}
              </div>
              <div class="notif-content">
                <div class="notif-top-row">
                  <div class="notif-title-wrap">
                    <h4 class="notif-title">${escapeHTML(n.title)}</h4>
                    <span class="notif-badge-status">${badgeStatusText}</span>
                    ${!n.isRead ? '<span class="status-indicator-dot" style="width: 7px; height: 7px; background: #ff4d4f; border-radius: 50%; display: inline-block;" title="No leída"></span>' : ''}
                  </div>
                  <time class="notif-time">${escapeHTML(n.date || '')}</time>
                </div>
                <p class="notif-body-text">${escapeHTML(n.message)}</p>
                ${extraBoxHtml}
                <div class="notif-footer-actions">
                  ${orderActionBtn}
                  ${!n.isRead ? `
                    <button type="button" class="btn btn-secondary btn-sm" onclick="markNotificationAsRead('${escapeHTML(n.id)}');">
                      Marcar Leída
                    </button>
                  ` : ''}
                  <button type="button" class="btn-notif-delete" onclick="deleteNotification('${escapeHTML(n.id)}');" title="Eliminar notificación">
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join("");
      }
    }
  }

  // Exportar funciones para handlers inline en HTML dinámico
  window.markNotificationAsRead = markNotificationAsRead;
  window.deleteNotification = deleteNotification;
  window.switchDashboardTab = switchDashboardTab;

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

    // Trigger de botón ÚNICO "Mi Cuenta" en header
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

    // Botón Móvil de Cuenta en el menú lateral
    if (elements.navMobileAccountBtn) {
      elements.navMobileAccountBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNavDrawer();
        setTimeout(() => {
          openLoginModal(state.currentUser ? "login" : "login", "profile");
        }, 120);
      });
    }

    // Botón Móvil directo "Crear Cuenta Nueva"
    const navMobileRegisterBtn = document.getElementById("navMobileRegisterBtn");
    if (navMobileRegisterBtn) {
      navMobileRegisterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeNavDrawer();
        setTimeout(() => {
          openLoginModal("register");
        }, 120);
      });
    }

    // Enlace en menú de navegación (si existe)
    if (elements.navLoginLink) {
      elements.navLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        openLoginModal(state.currentUser ? "login" : "login", "profile");
      });
    }

    // Cerrar dropdown al hacer click fuera
    document.addEventListener("click", (e) => {
      if (elements.accountMenuContainer && !elements.accountMenuContainer.contains(e.target)) {
        closeUserDropdown();
      }
    });

    // Botones del dropdown rápido
    if (elements.dropdownOpenFullProfileBtn) {
      elements.dropdownOpenFullProfileBtn.addEventListener("click", () => {
        closeUserDropdown();
        openLoginModal("login", "profile");
      });
    }

    if (elements.dropdownOpenNotifsBtn) {
      elements.dropdownOpenNotifsBtn.addEventListener("click", () => {
        closeUserDropdown();
        openLoginModal("login", "notifications");
      });
    }

    if (elements.headerNotifBtn) {
      elements.headerNotifBtn.addEventListener("click", () => {
        openLoginModal("login", "notifications");
      });
    }

    if (elements.dropdownOpenOrdersBtn) {
      elements.dropdownOpenOrdersBtn.addEventListener("click", () => {
        closeUserDropdown();
        openLoginModal("login", "orders");
      });
    }

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

    // Modal de Cuenta: Cerrar
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

    // Selector de pestañas de Invitado
    if (elements.tabLoginBtn) {
      elements.tabLoginBtn.addEventListener("click", () => switchAuthTab("login"));
    }
    if (elements.tabRegisterBtn) {
      elements.tabRegisterBtn.addEventListener("click", () => switchAuthTab("register"));
    }

    // Pestañas del Dashboard de Cuenta
    if (elements.tabDashProfileBtn) {
      elements.tabDashProfileBtn.addEventListener("click", () => switchDashboardTab("profile"));
    }
    if (elements.tabDashNotificationsBtn) {
      elements.tabDashNotificationsBtn.addEventListener("click", () => switchDashboardTab("notifications"));
    }
    if (elements.dashKpiNotifsCard) {
      elements.dashKpiNotifsCard.addEventListener("click", () => switchDashboardTab("notifications"));
    }
    if (elements.tabDashOrdersBtn) {
      elements.tabDashOrdersBtn.addEventListener("click", () => switchDashboardTab("orders"));
    }
    if (elements.tabDashFavsBtn) {
      elements.tabDashFavsBtn.addEventListener("click", () => switchDashboardTab("favs"));
    }
    if (elements.tabDashTestDriveBtn) {
      elements.tabDashTestDriveBtn.addEventListener("click", () => switchDashboardTab("testdrive"));
    }
    if (elements.tabDashSecurityBtn) {
      elements.tabDashSecurityBtn.addEventListener("click", () => switchDashboardTab("security"));
    }

    // Acciones de Notificaciones (Marcar todas y Limpiar)
    if (elements.btnMarkAllNotifsRead) {
      elements.btnMarkAllNotifsRead.addEventListener("click", markAllNotificationsAsRead);
    }
    if (elements.btnClearAllNotifs) {
      elements.btnClearAllNotifs.addEventListener("click", clearAllNotifications);
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

    // Indicador de fortaleza de contraseña en registro
    if (elements.regPassword && elements.regStrengthIndicator) {
      elements.regPassword.addEventListener("input", (e) => {
        const val = e.target.value;
        const ind = elements.regStrengthIndicator;
        ind.className = "strength-indicator";
        if (val.length === 0) {
          ind.style.width = "0%";
        } else if (val.length < 6) {
          ind.classList.add("strength-weak");
        } else if (val.length < 10 || !/[0-9]/.test(val) || !/[A-Z]/.test(val)) {
          ind.classList.add("strength-medium");
        } else {
          ind.classList.add("strength-strong");
        }
      });
    }

    // Desplegable de Olvidé mi Contraseña
    if (elements.forgotPwdBtn && elements.forgotPwdBox) {
      elements.forgotPwdBtn.addEventListener("click", () => {
        const isShown = elements.forgotPwdBox.style.display === "block";
        elements.forgotPwdBox.style.display = isShown ? "none" : "block";
      });
    }
    if (elements.sendRecoveryBtn && elements.recoveryEmailInput) {
      elements.sendRecoveryBtn.addEventListener("click", () => {
        const email = elements.recoveryEmailInput.value.trim();
        if (!email || !email.includes("@")) {
          showToast("Introduce un correo válido para recuperar tu clave.", "warning");
          return;
        }
        showToast(`Enlace de recuperación referencial enviado a ${email}`, "success");
        if (elements.forgotPwdBox) elements.forgotPwdBox.style.display = "none";
        elements.recoveryEmailInput.value = "";
      });
    }

    // Acceso Rápido Demostrativo VIP
    if (elements.demoQuickLoginBtn) {
      elements.demoQuickLoginBtn.addEventListener("click", () => {
        const demoUser = {
          name: "Julian Ospina",
          email: "julian.ospina@tesla-vip.co",
          phone: "+57 310 987 6543",
          city: "Bogotá D.C.",
          preferredModel: "model-3",
          role: "Cliente VIP Tesla",
          orders: [
            {
              orderNum: "TSL-ORD-742918",
              date: "24/10/2026",
              vehicleId: "model-3",
              vehicleName: "Tesla Model 3 Gran Autonomía",
              vehicleVersion: "Dual Motor AWD",
              vehicleImage: "assets/model-3.jpg",
              includePapers: true,
              totalAmount: 203200000,
              status: "authorized",
              statusLabel: "Autorizada por Asesor de Administración",
              authorizedBy: "Julian O (Super Admin)"
            }
          ],
          notifications: [
            {
              id: "notif_demo_01",
              type: "purchase_authorized",
              title: "🎉 ¡Tu compra ha sido APROBADA!",
              message: "Tu orden de compra [TSL-ORD-742918] para el vehículo Tesla Model 3 Gran Autonomía ha sido AUTORIZADA formalmente. Paquete de matrícula y SOAT legalizados al día.",
              orderNum: "TSL-ORD-742918",
              vehicleName: "Tesla Model 3 Gran Autonomía",
              amount: 203200000,
              date: "Hoy, 2:15 p. m.",
              timestamp: new Date().toISOString(),
              isRead: false,
              extra: {}
            },
            {
              id: "notif_demo_02",
              type: "purchase_created",
              title: "📋 Radicado de Compra Exitoso",
              message: "Has radicado la solicitud de reserva para el Tesla Model 3. El radicado TSL-ORD-742918 fue enviado a mesa de control administrativo.",
              orderNum: "TSL-ORD-742918",
              vehicleName: "Tesla Model 3 Gran Autonomía",
              amount: 203200000,
              date: "Ayer, 4:30 p. m.",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              isRead: true,
              extra: { papers: true }
            }
          ]
        };
        saveAuthUser(demoUser);
        openLoginModal("login", "profile");
        showToast(`¡Bienvenido de nuevo, ${demoUser.name}! (Acceso VIP Activo)`, "success");
      });
    }

    // Envío del Formulario de Inicio de Sesión
    if (elements.authLoginForm) {
      elements.authLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Rate Limiting anti-fuerza bruta: máximo 5 intentos en 30 segundos
        if (!securityRateLimiter.check("auth_login_attempt", 5, 30000)) {
          showToast("Límite de intentos de acceso alcanzado. Espera 30 segundos por seguridad.", "warning");
          return;
        }

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

        const cleanEmail = emailInput.value.trim().toLowerCase();
        let userProfile = null;
        try {
          const registered = JSON.parse(localStorage.getItem("tesla_registered_users") || "[]");
          userProfile = registered.find(u => (u.email || "").toLowerCase() === cleanEmail);
        } catch (e) {}

        const userNameFromEmail = emailInput.value.split("@")[0].replace(/[._-]/g, " ");
        const formattedName = userNameFromEmail.charAt(0).toUpperCase() + userNameFromEmail.slice(1);

        const authenticatedUser = userProfile ? { ...userProfile } : {
          name: formattedName || "Cliente Tesla",
          email: cleanEmail,
          phone: "+57 300 000 0000",
          city: "Bogotá D.C.",
          preferredModel: "model-3",
          role: "Cliente Registrado",
          orders: []
        };

        saveAuthUser(authenticatedUser);
        openLoginModal("login", "profile");
        elements.authLoginForm.reset();
        showToast(`¡Bienvenido de nuevo, ${authenticatedUser.name}!`, "success");
      });
    }

    // Envío del Formulario de Registro
    if (elements.authRegisterForm) {
      elements.authRegisterForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Rate Limiting anti-fuerza bruta en registros
        if (!securityRateLimiter.check("auth_register_attempt", 5, 30000)) {
          showToast("Demasiadas solicitudes de registro. Espera unos segundos por seguridad.", "warning");
          return;
        }

        const nameInput = document.getElementById("regName");
        const emailInput = document.getElementById("regEmail");
        const phoneInput = document.getElementById("regPhone");
        const citySelect = document.getElementById("regCity");
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

        const cleanEmail = emailInput.value.trim().toLowerCase();
        const pwd = passInput.value.trim();
        const newUser = {
          name: nameInput.value.trim(),
          email: cleanEmail,
          password: pwd,
          phone: phoneInput ? phoneInput.value.trim() : "",
          city: citySelect ? citySelect.value : "Bogotá D.C.",
          preferredModel: modelSelect ? modelSelect.value : "model-3",
          role: "Nuevo Propietario VIP",
          orders: []
        };

        // Guardar de forma persistente en lista de usuarios registrados
        try {
          const registered = JSON.parse(localStorage.getItem("tesla_registered_users") || "[]");
          const existingIdx = registered.findIndex(u => (u.email || "").toLowerCase() === cleanEmail);
          if (existingIdx >= 0) {
            registered[existingIdx] = { ...registered[existingIdx], ...newUser };
          } else {
            registered.push(newUser);
          }
          localStorage.setItem("tesla_registered_users", JSON.stringify(registered));

          // Si el usuario es Julian Ospina o admin, sincronizar inmediatamente con la plataforma de administración
          if (cleanEmail === "juli123@gmail.com" || cleanEmail.includes("julian") || cleanEmail.includes("admin")) {
            const adminAccs = JSON.parse(localStorage.getItem("tesla_admin_accounts") || "[]");
            const aIdx = adminAccs.findIndex(a => (a.email || "").toLowerCase() === cleanEmail);
            if (aIdx >= 0) {
              adminAccs[aIdx].password = pwd;
              adminAccs[aIdx].name = newUser.name;
            } else {
              adminAccs.push({
                id: "admin_" + Date.now(),
                name: newUser.name,
                email: cleanEmail,
                password: pwd,
                role: "Super Administrador",
                createdAt: new Date().toISOString()
              });
            }
            localStorage.setItem("tesla_admin_accounts", JSON.stringify(adminAccs));
          }
        } catch (e) {}

        saveAuthUser(newUser);
        closeLoginModal();
        elements.authRegisterForm.reset();
        showToast(`¡Cuenta creada con éxito! Bienvenido, ${newUser.name}. Se ha desbloqueado el Simulador de Financiación y Crédito.`, "success");
        
        // Desplazar suavemente al simulador de crédito recién desbloqueado
        const simSection = document.getElementById("financiacion");
        if (simSection) {
          setTimeout(() => {
            simSection.scrollIntoView({ behavior: "smooth" });
          }, 350);
        }
      });
    }

    // Guardar cambios en el formulario de edición de perfil
    if (elements.dashEditProfileForm) {
      elements.dashEditProfileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!state.currentUser) return;
        const newName = elements.dashEditName.value.trim();
        if (!newName || newName.length < 3) {
          showToast("Por favor ingresa un nombre válido.", "warning");
          return;
        }

        state.currentUser.name = newName;
        state.currentUser.phone = elements.dashEditPhone ? elements.dashEditPhone.value.trim() : "";
        state.currentUser.city = elements.dashEditCity ? elements.dashEditCity.value : "Bogotá D.C.";
        state.currentUser.preferredModel = elements.dashEditPreferredModel ? elements.dashEditPreferredModel.value : "model-3";

        saveAuthUser(state.currentUser);
        showToast("¡Datos de perfil actualizados exitosamente!", "success");
      });
    }

    // Cerrar sesión desde el Dashboard
    if (elements.dashQuickLogoutBtn) {
      elements.dashQuickLogoutBtn.addEventListener("click", () => {
        closeLoginModal();
        saveAuthUser(null);
        showToast("Has cerrado tu sesión.", "info");
      });
    }
    if (elements.dashLogoutFullBtn) {
      elements.dashLogoutFullBtn.addEventListener("click", () => {
        closeLoginModal();
        saveAuthUser(null);
        showToast("Has cerrado tu sesión.", "info");
      });
    }

    // Cambio de contraseña en seguridad
    if (elements.dashChangePasswordForm) {
      elements.dashChangePasswordForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const pwdInput = document.getElementById("dashNewPassword");
        if (!pwdInput || pwdInput.value.length < 6) {
          showToast("La contraseña debe tener al menos 6 caracteres.", "warning");
          return;
        }
        pwdInput.value = "";
        showToast("Contraseña demostrativa actualizada correctamente.", "success");
      });
    }
  }

  // =========================================================================
  // VENTANA DE COMPRA Y RESERVA CON PAPELES AL DÍA
  // =========================================================================

  function openPurchaseModal(vehicleId) {
    const vId = vehicleId || state.selectedVehicleForPurchase || (state.vehicles[0] ? state.vehicles[0].id : "model-3");
    state.selectedVehicleForPurchase = vId;

    // VALIDACIÓN OBLIGATORIA: Para comprar o reservar se debe crear cuenta o iniciar sesión
    if (!state.currentUser) {
      state.pendingPurchaseVehicleId = vId;
      showToast("🔒 Para comprar o cotizar un vehículo Tesla es obligatorio iniciar sesión o crear tu cuenta.", "warning");
      openLoginModal("login");

      const authSub = document.querySelector(".auth-subtitle");
      if (authSub) {
        authSub.innerHTML = `<span style="color: #e82127; font-weight: 700;">🔒 Obligatorio para Comprar:</span> Inicia sesión o crea tu cuenta para formalizar la reserva con papeles al día de tu Tesla.`;
      }
      return;
    }

    if (!elements.purchaseModal) return;

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
    const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(vehicle) : { activePrice: vehicle.price, isPromo: false };
    const activePrice = pricing.activePrice;

    if (elements.purchaseVehicleImg) {
      elements.purchaseVehicleImg.src = vehicle.image;
      elements.purchaseVehicleImg.alt = vehicle.name;
    }
    if (elements.purchaseCarVersion) {
      elements.purchaseCarVersion.textContent = `${vehicle.name} — ${vehicle.version}`;
    }
    if (elements.purchaseBasePrice) {
      if (pricing.isPromo) {
        elements.purchaseBasePrice.innerHTML = `<span style="color: #10b981; font-weight: 700;">${formatCurrencyCOP(pricing.promoPrice)}</span> <del style="color: #9ca3af; font-size: 0.85em; margin-left: 6px;">${formatCurrencyCOP(pricing.normalPrice)}</del> <span class="promo-discount-badge" style="margin-left: 6px;">-${pricing.discountPercent}% OFF</span>`;
      } else {
        elements.purchaseBasePrice.textContent = formatCurrencyCOP(vehicle.price);
      }
    }
    if (elements.summarySubtotalPrice) {
      elements.summarySubtotalPrice.textContent = formatCurrencyCOP(activePrice);
    }

    const includePapers = state.includePapersInPurchase;
    const papersCost = includePapers ? state.papersPackageCost : 0;
    const totalAmount = activePrice + papersCost;

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

        if (!state.currentUser) {
          showToast("Debes iniciar sesión o registrar tu cuenta para completar la compra.", "warning");
          closePurchaseModal();
          openLoginModal("login");
          return;
        }

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
        const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(vehicle) : { activePrice: vehicle.price, isPromo: false };
        const activePrice = pricing.activePrice;
        const includePapers = state.includePapersInPurchase;
        const papersCost = includePapers ? state.papersPackageCost : 0;
        const totalAmount = activePrice + papersCost;
        const orderNum = generateSecureId("TSL-ORD");

        const needsAuthorization = Boolean(includePapers);
        const orderStatus = needsAuthorization ? "pending_authorization" : "authorized";
        const orderStatusLabel = needsAuthorization
          ? "En Espera de Autorización (Papeleo al Día)"
          : "Aprobada Directa — Sin Papeleo (No Requiere Autorización)";

        if (elements.purchaseStatusAlert) {
          elements.purchaseStatusAlert.style.display = "block";
          if (needsAuthorization) {
            elements.purchaseStatusAlert.innerHTML = `
              <div style="background-color: rgba(245, 158, 11, 0.12); border: 1.5px solid #fbbf24; border-radius: var(--radius-md); padding: var(--space-20);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 10px #fbbf24;"></span>
                  <h4 style="color: #fbbf24; font-size: 1.15rem; font-weight: 800;">⏳ ¡Solicitud Radicada — En Espera de Autorización de Papeleo!</h4>
                </div>
                <p style="font-size: 0.88rem; color: var(--color-silver-light); margin-bottom: 10px;">
                  Radicado comercial: <strong style="color: var(--color-white); font-family: monospace; font-size: 1rem;">${orderNum}</strong> para <strong>${escapeHTML(nameInp.value)}</strong>.
                </p>
                <div style="background: rgba(0, 0, 0, 0.45); border-left: 3.5px solid #fbbf24; padding: 12px 16px; border-radius: 6px; margin-bottom: 14px; font-size: 0.84rem; color: #fef3c7; line-height: 1.55;">
                  <strong>⚠️ AVISO DE AUTORIZACIÓN:</strong> Has solicitado incluir el <strong>Paquete de Papeles Legales al Día (SOAT, Matrícula, Impuesto)</strong>. Para diligenciar los formularios legales y coordinar la entrega con los documentos listos, <strong>debes esperar la autorización de uno de los agentes de la administración</strong>. Puedes dar seguimiento en tiempo real desde tu perfil.
                </div>
                <div style="font-size: 0.82rem; color: var(--color-silver); margin-bottom: 12px; line-height: 1.6;">
                  🚗 Vehículo: <strong>Tesla ${escapeHTML(vehicle.name)}</strong> (${formatCurrencyCOP(activePrice)}${pricing.isPromo ? ` — 🔥 Promoción: ${escapeHTML(pricing.promoLabel)}` : ''})<br>
                  📋 Paquete de Papeles Legales: <strong style="color: #10b981;">✅ Incluido (+$5.200.000 COP — Requiere tramitación de formularios)</strong><br>
                  💵 Liquidación Total: <strong style="color: #10b981; font-size: 1.1rem; font-weight: 800;">${formatCurrencyCOP(totalAmount)}</strong>
                </div>
                <p style="font-size: 0.78rem; color: #a1a1aa; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 10px;">
                  <em>Plataforma Administrador:</em> Tu orden ya se encuentra registrada en la consola administrativa con el auto de fondo. Uno de nuestros agentes evaluará los formularios y autorizará el inicio del trámite.
                </p>
              </div>
            `;
          } else {
            elements.purchaseStatusAlert.innerHTML = `
              <div style="background-color: rgba(16, 185, 129, 0.12); border: 1.5px solid #10b981; border-radius: var(--radius-md); padding: var(--space-20);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981;"></span>
                  <h4 style="color: #10b981; font-size: 1.15rem; font-weight: 800;">✅ ¡Compra Confirmada Directamente!</h4>
                </div>
                <p style="font-size: 0.88rem; color: var(--color-silver-light); margin-bottom: 10px;">
                  Radicado comercial: <strong style="color: var(--color-white); font-family: monospace; font-size: 1rem;">${orderNum}</strong> para <strong>${escapeHTML(nameInp.value)}</strong>.
                </p>
                <div style="background: rgba(0, 0, 0, 0.45); border-left: 3.5px solid #10b981; padding: 12px 16px; border-radius: 6px; margin-bottom: 14px; font-size: 0.84rem; color: #d1fae5; line-height: 1.55;">
                  <strong>⚡ COMPRA DIRECTA:</strong> Al adquirir el vehículo sin paquete de papeles legales al día, <strong>tu orden NO requiere autorización administrativa de formularios</strong>. Tu compra está aprobada para facturación y entrega directa.
                </div>
                <div style="font-size: 0.82rem; color: var(--color-silver); margin-bottom: 12px; line-height: 1.6;">
                  🚗 Vehículo: <strong>Tesla ${escapeHTML(vehicle.name)}</strong> (${formatCurrencyCOP(activePrice)}${pricing.isPromo ? ` — 🔥 Promoción: ${escapeHTML(pricing.promoLabel)}` : ''})<br>
                  📋 Paquete de Papeles Legales: <strong style="color: var(--color-silver);">⚪ No incluido (Compra directa neta)</strong><br>
                  💵 Liquidación Total: <strong style="color: #10b981; font-size: 1.1rem; font-weight: 800;">${formatCurrencyCOP(totalAmount)}</strong>
                </div>
                <p style="font-size: 0.78rem; color: #a1a1aa; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 10px;">
                  <em>Plataforma Administrador:</em> Registrada en la consola con auto de fondo como orden de entrega directa.
                </p>
              </div>
            `;
          }
          elements.purchaseStatusAlert.scrollIntoView({ behavior: "smooth" });
        }

        // Estructura completa de la orden de compra
        const newOrder = {
          orderNum: orderNum,
          date: new Date().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }),
          customerName: nameInp.value.trim(),
          customerDoc: docInp.value.trim(),
          customerPhone: phoneInp.value.trim(),
          customerEmail: emailInp.value.trim(),
          customerCity: elements.buyerCity ? elements.buyerCity.value : "Colombia",
          vehicleId: vehicle.id,
          vehicleName: vehicle.name,
          vehicleVersion: vehicle.version,
          vehicleImage: vehicle.image,
          basePrice: activePrice,
          isPromo: Boolean(pricing.isPromo),
          promoLabel: pricing.promoLabel || "",
          includePapers: includePapers,
          papersCost: papersCost,
          totalAmount: totalAmount,
          requiresAuthorization: needsAuthorization,
          status: orderStatus,
          statusLabel: orderStatusLabel,
          authorizedBy: needsAuthorization ? null : "Aprobación Inmediata (Sin trámite de papeleo)",
          authorizedAt: needsAuthorization ? null : new Date().toISOString()
        };

        // 1. Guardar en la lista centralizada de compras para la consola administrativa
        try {
          const rawPurchases = localStorage.getItem(STORAGE_KEY_PURCHASES);
          const purchasesList = rawPurchases ? JSON.parse(rawPurchases) : [];
          purchasesList.unshift(newOrder);
          localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(purchasesList));
        } catch (e) {}

        // 2. Transmitir en tiempo real a la consola de administración
        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
            bc.postMessage({ type: "NEW_PURCHASE_ORDER", order: newOrder });
            bc.close();
          }
        } catch (e) {}

        // 3. Persistir en la cuenta del usuario actual si está autenticado
        if (state.currentUser) {
          state.currentUser.orders = state.currentUser.orders || [];
          state.currentUser.orders.unshift(newOrder);
          addUserNotification({
            type: "purchase_created",
            title: "📋 Nueva Compra Radicada",
            message: `Has radicado exitosamente la compra del Tesla ${vehicle.name} (${vehicle.version}). Radicado: ${orderNum}. ${needsAuthorization ? 'En espera de revisión y autorización administrativa para papeleo legal al día.' : 'Aprobación directa sin trámites adicionales.'}`,
            orderNum: orderNum,
            vehicleName: vehicle.name,
            amount: totalAmount,
            extra: { includePapers: includePapers }
          });
          saveAuthUser(state.currentUser);
        }

        // 4. Enviar al backend si está disponible
        fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrder)
        }).catch(() => null);

        showToast(`Tu orden ${orderNum} ha sido radicada. Está en espera de autorización administrativa.`, "warning", true);
      });
    }

    // Botón de Enviar Orden a WhatsApp
    if (elements.sendOrderWhatsAppBtn) {
      elements.sendOrderWhatsAppBtn.addEventListener("click", () => {
        const vehicle = state.vehicles.find(v => v.id === state.selectedVehicleForPurchase) || state.vehicles[0];
        const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(vehicle) : { activePrice: vehicle.price, isPromo: false };
        const activePrice = pricing.activePrice;
        const includePapers = state.includePapersInPurchase;
        const papersCost = includePapers ? state.papersPackageCost : 0;
        const totalAmount = activePrice + papersCost;
        const buyerName = elements.buyerName && elements.buyerName.value ? elements.buyerName.value.trim() : (state.currentUser ? state.currentUser.name : "Cliente Interesado");
        const buyerCity = elements.buyerCity ? elements.buyerCity.value : "Colombia";

        const text = `Hola, deseo cotizar y comprar el siguiente vehículo:%0A%0A` +
          `🚗 *Modelo:* Tesla ${vehicle.name} (${vehicle.version})%0A` +
          `💰 *Precio Base:* ${formatCurrencyCOP(activePrice)}${pricing.isPromo ? ` (🔥 Promoción: ${pricing.promoLabel})` : ''}%0A` +
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
  // SINCRONIZACIÓN AUTOMÁTICA CON EL BACKEND Y CONSOLA ADMIN
  // =========================================================================

  function applyCatalogData(list, persistLocally = true) {
    if (!Array.isArray(list) || list.length === 0) return;

    // Enlazar datos del backend o admin preservando swatches y colores
    state.vehicles = list.map(v => {
      const original = (typeof VEHICLES_DATA !== "undefined" && VEHICLES_DATA.find(o => o.id === v.id)) || {};
      return {
        ...original,
        ...v,
        id: String(v.id),
        name: v.name,
        version: v.version || original.version || "",
        category: v.category || original.category || "Sedán",
        badge: v.badge || original.badge || "",
        price: Number(v.price ?? original.price ?? 0),
        promoPrice: Number(v.promoPrice ?? v.promo_price ?? original.promoPrice ?? 0),
        promo_price: Number(v.promoPrice ?? v.promo_price ?? original.promoPrice ?? 0),
        promoLabel: (v.promoLabel ?? v.promo_label ?? original.promoLabel ?? "").trim(),
        promo_label: (v.promoLabel ?? v.promo_label ?? original.promoLabel ?? "").trim(),
        rangeKm: Number(v.rangeKm ?? v.range_km ?? original.rangeKm ?? 500),
        accelerationSeconds: Number(v.accelerationSeconds ?? v.acceleration_seconds ?? original.accelerationSeconds ?? 3.5),
        topSpeedKm: Number(v.topSpeedKm ?? v.top_speed_kmh ?? original.topSpeedKm ?? 220),
        powerHp: Number(v.powerHp ?? v.power_hp ?? original.powerHp ?? 450),
        cargoVolume: v.cargoVolume || v.cargo_volume || original.cargoVolume || "600 L",
        chargingTime: v.chargingTime || v.charging_time || original.chargingTime || "Hasta 250 km en 15 min",
        availability: v.availability || original.availability || "Disponible para entrega",
        image: v.image || original.image || "assets/images/model-3.jpg",
        description: v.description || original.description || "",
        colors: (Array.isArray(v.colors) && v.colors.length > 0) ? v.colors : (original.colors || [
          { id: "pearl-white", name: "Blanco Perla Multicapa", hex: "#E8E9EB", filter: "none" },
          { id: "solid-black", name: "Negro Sólido", hex: "#111112", filter: "brightness(0.7) contrast(1.2)" },
          { id: "ultra-red", name: "Rojo Ultra Multicapa", hex: "#A81017", filter: "sepia(0.5) hue-rotate(320deg) saturate(2)" }
        ]),
        featured: v.featured !== undefined ? Boolean(v.featured) : (original.featured !== undefined ? original.featured : true)
      };
    });

    state.filteredVehicles = [...state.vehicles];

    if (persistLocally) {
      try {
        localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(state.vehicles));
      } catch (e) {}
    }

    // Actualizar vistas del showroom en tiempo real
    renderFeaturedVehicles();
    renderCatalog();
    initSimulator();
    renderVehicleComparator();

    // Actualizar select del formulario comercial
    if (elements.formModelSelect) {
      const currentVal = elements.formModelSelect.value;
      elements.formModelSelect.innerHTML = `
        <option value="">Selecciona un modelo de interés...</option>
        ${state.vehicles.map(v => `
          <option value="${escapeHTML(v.id)}" ${v.id === currentVal ? 'selected' : ''}>${escapeHTML(v.name)} — (${escapeHTML(v.category)})</option>
        `).join("")}
      `;
    }

    // Actualizar select del simulador
    if (elements.simVehicleSelect) {
      const currentSimVal = elements.simVehicleSelect.value;
      elements.simVehicleSelect.innerHTML = state.vehicles.map(v => `
        <option value="${escapeHTML(v.id)}" ${v.id === currentSimVal ? 'selected' : ''}>
          ${escapeHTML(v.name)} — ${formatCurrencyCOP(v.price)}
        </option>
      `).join("");
    }

    // Actualizar modal de compra si está en pantalla
    if (typeof updatePurchaseModalView === "function") {
      updatePurchaseModalView();
    }
  }

  async function syncVehiclesFromBackend() {
    try {
      const response = await fetch("/api/vehicles").catch(() => null);
      if (response && response.ok) {
        const apiVehicles = await response.json();
        if (Array.isArray(apiVehicles) && apiVehicles.length > 0) {
          applyCatalogData(apiVehicles, true);
          return;
        }
      }
    } catch (error) {
      console.info("Showroom funcionando con catálogo local:", error);
    }

    // Si la API no está disponible, asegurar lectura desde localStorage
    const localData = loadInitialVehicles();
    if (localData && localData.length > 0) {
      applyCatalogData(localData, false);
    }
  }

  // =========================================================================
  // INICIALIZACIÓN COMPLETA
  // =========================================================================

  function init() {
    updateFavoritesBadge();
    initNavigation();
    initAuth();
    initPurchaseModal();
    renderFeaturedVehicles();
    initCatalogEvents();
    renderCatalog();
    initSimulator();
    renderVehicleComparator();
    initContactForm();
    initFAQs();

    // Sincronizar catálogo con las modificaciones hechas en la consola administrativa
    syncVehiclesFromBackend();

    // Sintonizar canal de difusión en tiempo real desde la consola admin (instantáneo)
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        syncChannel.onmessage = (event) => {
          if (event.data && event.data.type === "CATALOG_UPDATED" && Array.isArray(event.data.vehicles)) {
            applyCatalogData(event.data.vehicles, true);
          }
          if (event.data && event.data.type === "PURCHASE_AUTHORIZED") {
            const { orderId, authorizedBy, order } = event.data;
            if (state.currentUser && Array.isArray(state.currentUser.orders)) {
              const myOrder = state.currentUser.orders.find(o => o.orderNum === orderId);
              if (myOrder) {
                myOrder.status = "authorized";
                myOrder.statusLabel = "Autorizada por Asesor de Administración";
                myOrder.authorizedBy = authorizedBy || (order && order.authorizedBy) || "Administración";
                myOrder.authorizedAt = new Date().toISOString();
                delete myOrder.rejectedBy;
                delete myOrder.rejectedReason;
                delete myOrder.rejectedAt;

                addUserNotification({
                  type: "purchase_authorized",
                  title: "🎉 ¡Tu compra ha sido APROBADA!",
                  message: `Tu orden de compra [${orderId}] para el Tesla ${myOrder.vehicleName} ha sido formalmente AUTORIZADA. El vehículo ya está en preparación para entrega.`,
                  orderNum: orderId,
                  vehicleName: myOrder.vehicleName,
                  amount: myOrder.totalAmount,
                  extra: {}
                });

                saveAuthUser(state.currentUser);
                renderAccountDashboard();
                showToast(`🎉 ¡Tu orden [${orderId}] ha sido AUTORIZADA!`, "success", true);
              }
            }
          }

          if (event.data && event.data.type === "PURCHASE_REJECTED") {
            const { orderId, rejectedBy, rejectedReason, order } = event.data;
            if (state.currentUser && Array.isArray(state.currentUser.orders)) {
              const myOrder = state.currentUser.orders.find(o => o.orderNum === orderId);
              if (myOrder) {
                myOrder.status = "rejected";
                myOrder.statusLabel = "Rechazada por Administración";
                myOrder.rejectedBy = rejectedBy || (order && order.rejectedBy) || "Administración";
                myOrder.rejectedReason = rejectedReason || (order && order.rejectedReason) || "No cumple con los requisitos administrativos";
                myOrder.rejectedAt = new Date().toISOString();

                addUserNotification({
                  type: "purchase_rejected",
                  title: "⚠️ Solicitud de Compra RECHAZADA",
                  message: `La orden [${orderId}] para el Tesla ${myOrder.vehicleName} fue RECHAZADA. Motivo: "${myOrder.rejectedReason}".`,
                  orderNum: orderId,
                  vehicleName: myOrder.vehicleName,
                  amount: myOrder.totalAmount,
                  extra: { rejectedReason: myOrder.rejectedReason }
                });

                saveAuthUser(state.currentUser);
                renderAccountDashboard();
                showToast(`⚠️ Tu orden [${orderId}] fue rechazada. Revisa tus notificaciones.`, "danger", true);
              }
            }
          }
        };
      }
    } catch (e) {}

    // Sincronizar estado de compras y generar notificaciones si cambiaron en background
    function syncUserPurchasesFromGlobal() {
      if (!state.currentUser || !Array.isArray(state.currentUser.orders)) return;
      try {
        const rawPurchases = localStorage.getItem(STORAGE_KEY_PURCHASES);
        if (!rawPurchases) return;
        const globalPurchases = JSON.parse(rawPurchases);
        if (!Array.isArray(globalPurchases)) return;

        let changed = false;
        state.currentUser.orders.forEach(userOrder => {
          const globalMatch = globalPurchases.find(p => p.orderNum === userOrder.orderNum);
          if (globalMatch && globalMatch.status !== userOrder.status) {
            userOrder.status = globalMatch.status;
            userOrder.statusLabel = globalMatch.statusLabel;
            userOrder.authorizedBy = globalMatch.authorizedBy;
            userOrder.rejectedBy = globalMatch.rejectedBy;
            userOrder.rejectedReason = globalMatch.rejectedReason;
            changed = true;

            if (globalMatch.status === "authorized") {
              addUserNotification({
                type: "purchase_authorized",
                title: "🎉 ¡Tu compra ha sido APROBADA!",
                message: `Tu orden de compra [${userOrder.orderNum}] para el Tesla ${userOrder.vehicleName} ha sido formalmente autorizada.`,
                orderNum: userOrder.orderNum,
                vehicleName: userOrder.vehicleName,
                amount: userOrder.totalAmount,
                extra: {}
              });
            } else if (globalMatch.status === "rejected") {
              addUserNotification({
                type: "purchase_rejected",
                title: "⚠️ Solicitud de Compra RECHAZADA",
                message: `La orden [${userOrder.orderNum}] para el Tesla ${userOrder.vehicleName} fue rechazada. Motivo: "${globalMatch.rejectedReason || 'No cumple requisitos'}".`,
                orderNum: userOrder.orderNum,
                vehicleName: userOrder.vehicleName,
                amount: userOrder.totalAmount,
                extra: { rejectedReason: globalMatch.rejectedReason }
              });
            }
          }
        });

        if (changed) {
          saveAuthUser(state.currentUser);
          renderAccountDashboard();
        }
      } catch (err) {}
    }

    // Sintonizar cambios de localStorage entre diferentes pestañas o ventanas
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY_VEHICLES && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated) && updated.length > 0) {
            applyCatalogData(updated, false);
          }
        } catch (err) {}
      }
      if (e.key === STORAGE_KEY_PURCHASES) {
        syncUserPurchasesFromGlobal();
      }
    });

    window.addEventListener("tesla_catalog_updated", (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        applyCatalogData(e.detail, true);
      }
    });

    // Cada vez que el usuario regrese a la pestaña del showroom, verificar actualización
    window.addEventListener("focus", () => {
      syncVehiclesFromBackend();
      syncUserPurchasesFromGlobal();
    });
  }

  init();
});

