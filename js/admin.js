/**
 * Consola Administrativa — Tesla Showroom
 * Usuario Administrador: Julian O (Super Admin)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Estado local de la consola
  const state = {
    currentTab: "dashboard",
    vehicles: [],
    leads: [],
    purchases: [],
    purchaseFilter: "all",
    adminInfo: {
      name: "Julian O",
      role: "admin",
      privileges: "Super Administrador"
    }
  };

  // Elementos DOM
  const elements = {
    tabs: document.querySelectorAll(".menu-item[data-tab]"),
    sections: document.querySelectorAll(".tab-section"),
    breadcrumb: document.getElementById("currentBreadcrumb"),
    adminUserNameDisplay: document.getElementById("adminUserNameDisplay"),
    kpiVehiclesCount: document.getElementById("kpiVehiclesCount"),
    kpiPurchasesCount: document.getElementById("kpiPurchasesCount"),
    kpiPurchasesDesc: document.getElementById("kpiPurchasesDesc"),
    kpiLeadsCount: document.getElementById("kpiLeadsCount"),
    menuVehiclesCount: document.getElementById("menuVehiclesCount"),
    menuPurchasesCount: document.getElementById("menuPurchasesCount"),
    menuLeadsCount: document.getElementById("menuLeadsCount"),
    adminPurchasesGrid: document.getElementById("adminPurchasesGrid"),
    countAllPurchases: document.getElementById("countAllPurchases"),
    countPendingPurchases: document.getElementById("countPendingPurchases"),
    countAuthPurchases: document.getElementById("countAuthPurchases"),
    countRejectedPurchases: document.getElementById("countRejectedPurchases"),
    refreshPurchasesBtn: document.getElementById("refreshPurchasesBtn"),
    dbStatusBadge: document.getElementById("dbStatusBadge"),
    dashboardLeadsTableBody: document.getElementById("dashboardLeadsTableBody"),
    adminVehiclesTableBody: document.getElementById("adminVehiclesTableBody"),
    adminLeadsTableBody: document.getElementById("adminLeadsTableBody"),
    // Modal Vehículo
    vehicleModal: document.getElementById("vehicleModal"),
    vehicleForm: document.getElementById("vehicleAdminForm"),
    modalActionTitle: document.getElementById("modalVehicleActionTitle"),
    openAddBtn: document.getElementById("openAddVehicleModalBtn"),
    quickAddBtn: document.getElementById("quickAddVehicleBtn"),
    closeModalBtn: document.getElementById("closeVehicleModalBtn"),
    cancelModalBtn: document.getElementById("cancelVehicleModalBtn"),
    refreshDashboardBtn: document.getElementById("refreshDashboardBtn"),
    // Toast
    toast: document.getElementById("adminToast"),
    toastMsg: document.getElementById("adminToastMsg")
  };

  // Claves de almacenamiento y canal de sincronización en tiempo real
  const STORAGE_KEY_VEHICLES = "tesla_showroom_vehicles_catalog";
  const STORAGE_KEY_LEADS = "tesla_showroom_leads";
  const STORAGE_KEY_PURCHASES = "tesla_showroom_purchases";
  const SYNC_CHANNEL_NAME = "tesla_sync_channel";

  // Parseador inteligente de precio (admite formatos como 198000000, 198.000.000, $198,000,000)
  function parsePriceInput(val) {
    if (typeof val === "number" && !isNaN(val)) return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9]/g, "");
    return Number(cleaned) || 0;
  }

  // Obtener catálogo local de resiliencia
  function getLocalVehicles() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_VEHICLES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error leyendo vehículos de localStorage:", e);
    }
    if (typeof VEHICLES_DATA !== "undefined" && Array.isArray(VEHICLES_DATA) && VEHICLES_DATA.length > 0) {
      return [...VEHICLES_DATA];
    }
    return [];
  }

  // Guardar catálogo y difundir a todas las ventanas / pestañas del showroom en vivo
  function saveLocalVehicles(list) {
    try {
      localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(list));
    } catch (e) {
      console.warn("Error al persistir en localStorage:", e);
    }
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
        bc.postMessage({ type: "CATALOG_UPDATED", vehicles: list });
        bc.close();
      }
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent("tesla_catalog_updated", { detail: list }));
    } catch (e) {}
  }

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

  function saveLocalLeads(list) {
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(list));
    } catch (e) {}
  }

  // =========================================================================
  // GESTIÓN DE COMPRAS Y AUTORIZACIONES (COMPRADORES TESLA)
  // =========================================================================

  function getLocalPurchases() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PURCHASES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error leyendo compras de localStorage:", e);
    }

    // Datos iniciales demostrativos de alta calidad con fondos de autos Tesla
    const demoPurchases = [
      {
        orderNum: "TSL-ORD-88214",
        date: "27/10/2026, 18:30",
        customerName: "Carlos Restrepo Arango",
        customerDoc: "CC 71.392.810",
        customerPhone: "3124567890",
        customerEmail: "carlos.restrepo@empresa.com.co",
        customerCity: "Medellín",
        vehicleId: "model-y",
        vehicleName: "Model Y Dual Motor",
        vehicleVersion: "Long Range All-Wheel Drive",
        vehicleImage: "assets/images/model-y.jpg",
        basePrice: 245000000,
        isPromo: true,
        promoLabel: "¡OFERTA ESPECIAL!",
        includePapers: true,
        papersCost: 5200000,
        totalAmount: 250200000,
        status: "pending_authorization",
        statusLabel: "En Espera de Autorización",
        authorizedBy: null,
        authorizedAt: null
      },
      {
        orderNum: "TSL-ORD-76109",
        date: "26/10/2026, 14:15",
        customerName: "Camila Vargas Gómez",
        customerDoc: "CC 52.889.340",
        customerPhone: "3108923451",
        customerEmail: "camila.vargas@inversiones.co",
        customerCity: "Bogotá D.C.",
        vehicleId: "model-3",
        vehicleName: "Model 3",
        vehicleVersion: "Rear-Wheel Drive (Alta Eficiencia)",
        vehicleImage: "assets/images/model-3.jpg",
        basePrice: 198000000,
        isPromo: false,
        includePapers: true,
        papersCost: 5200000,
        totalAmount: 203200000,
        status: "authorized",
        statusLabel: "Autorizada por Asesor",
        authorizedBy: "Julian O",
        authorizedAt: "2026-10-26T14:35:00.000Z"
      },
      {
        orderNum: "TSL-ORD-92043",
        date: "27/10/2026, 19:45",
        customerName: "Santiago Morales Peña",
        customerDoc: "NIT 901.458.230-1",
        customerPhone: "3157891234",
        customerEmail: "smorales@constructora.com",
        customerCity: "Cali",
        vehicleId: "cybertruck",
        vehicleName: "Cybertruck Cyberbeast",
        vehicleVersion: "Tri-Motor All-Wheel Drive",
        vehicleImage: "assets/images/cybertruck.jpg",
        basePrice: 420000000,
        isPromo: false,
        includePapers: false,
        papersCost: 0,
        totalAmount: 420000000,
        status: "pending_authorization",
        statusLabel: "En Espera de Autorización",
        authorizedBy: null,
        authorizedAt: null
      }
    ];

    saveLocalPurchases(demoPurchases);
    return demoPurchases;
  }

  function saveLocalPurchases(list) {
    try {
      localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(list));
    } catch (e) {
      console.warn("Error al persistir compras en localStorage:", e);
    }
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
        bc.postMessage({ type: "PURCHASES_UPDATED", purchases: list });
        bc.close();
      }
    } catch (e) {}
  }

  // Formateador de moneda en pesos colombianos (COP)
  function formatCOP(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  // Notificaciones flotantes desactivadas a solicitud del usuario
  function showToast(message, isError = false) {
    return; // Desactivado
  }

  // Cambio de pestañas
  window.switchTab = function(tabName) {
    state.currentTab = tabName;

    elements.tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    elements.sections.forEach(sec => {
      if (sec.id === `tab-${tabName}`) {
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
      }
    });

    // Actualizar miga de pan
    const titles = {
      dashboard: "Resumen General",
      vehicles: "Catálogo de Vehículos y Precios",
      purchases: "Clientes Compradores & Autorizaciones de Entrega",
      leads: "Solicitudes y Prospectos",
      users: "Usuarios y Privilegios",
      database: "Base de Datos Docker",
      settings: "Ajustes y Configuración"
    };
    if (elements.breadcrumb) {
      elements.breadcrumb.textContent = titles[tabName] || "Consola";
    }

    if (tabName === "purchases") {
      renderPurchasesCards();
    }

    if (typeof closeAdminDrawer === "function" && window.innerWidth <= 900) {
      closeAdminDrawer();
    }
  };

  // Asignar clics en menú lateral
  elements.tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Cargar datos (con doble garantía: almacenamiento local + API backend)
  async function loadData() {
    // 1. Carga inmediata de seguridad (cero pantalla vacía o caída)
    if (state.vehicles.length === 0) {
      state.vehicles = getLocalVehicles();
    }
    if (state.leads.length === 0) {
      state.leads = getLocalLeads();
    }
    if (state.purchases.length === 0) {
      state.purchases = getLocalPurchases();
    }

    renderDashboard();
    renderVehiclesTable();
    renderPurchasesCards();
    renderLeadsTable();

    // 2. Consulta al backend (si está activo el servidor)
    try {
      const statusRes = await fetch("/api/status").catch(() => null);
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.admin && statusData.admin.name) {
          state.adminInfo = statusData.admin;
          if (elements.adminUserNameDisplay) {
            elements.adminUserNameDisplay.textContent = statusData.admin.name;
          }
        }
      }

      const vehRes = await fetch("/api/vehicles").catch(() => null);
      if (vehRes && vehRes.ok) {
        const apiVehicles = await vehRes.json();
        if (Array.isArray(apiVehicles) && apiVehicles.length > 0) {
          state.vehicles = apiVehicles;
          saveLocalVehicles(apiVehicles);
        }
      }

      const leadsRes = await fetch("/api/leads").catch(() => null);
      if (leadsRes && leadsRes.ok) {
        const apiLeads = await leadsRes.json();
        if (Array.isArray(apiLeads)) {
          state.leads = apiLeads;
          saveLocalLeads(apiLeads);
        }
      }

      const purRes = await fetch("/api/purchases").catch(() => null);
      if (purRes && purRes.ok) {
        const apiPurchases = await purRes.json();
        if (Array.isArray(apiPurchases) && apiPurchases.length > 0) {
          state.purchases = apiPurchases;
          saveLocalPurchases(apiPurchases);
        }
      }

      renderDashboard();
      renderVehiclesTable();
      renderPurchasesCards();
      renderLeadsTable();
    } catch (error) {
      console.info("Panel administrativo operando en modo local:", error);
    }
  }

  // Renderizar Dashboard
  function renderDashboard() {
    const pendingPurchases = state.purchases.filter(p => p.status === "pending_authorization" || !p.status || p.status.includes("Espera") || p.status === "pending").length;

    if (elements.kpiVehiclesCount) elements.kpiVehiclesCount.textContent = state.vehicles.length;
    if (elements.kpiPurchasesCount) elements.kpiPurchasesCount.textContent = state.purchases.length;
    if (elements.kpiPurchasesDesc) elements.kpiPurchasesDesc.textContent = `${pendingPurchases} en espera de autorización`;
    if (elements.kpiLeadsCount) elements.kpiLeadsCount.textContent = state.leads.length;
    
    if (elements.menuVehiclesCount) elements.menuVehiclesCount.textContent = state.vehicles.length;
    if (elements.menuPurchasesCount) elements.menuPurchasesCount.textContent = pendingPurchases;
    if (elements.menuLeadsCount) elements.menuLeadsCount.textContent = state.leads.length;

    if (!elements.dashboardLeadsTableBody) return;

    const recentLeads = state.leads.slice(0, 5);
    if (recentLeads.length === 0) {
      elements.dashboardLeadsTableBody.innerHTML = `
        <tr><td colspan="7" style="text-align: center; color: #6b7280; padding: 24px;">No hay solicitudes registradas aún.</td></tr>
      `;
      return;
    }

    elements.dashboardLeadsTableBody.innerHTML = recentLeads.map(l => `
      <tr>
        <td>
          <span style="background: rgba(232, 33, 39, 0.14); color: #f87171; border: 1px solid rgba(232, 33, 39, 0.35); padding: 3px 8px; border-radius: 6px; font-weight: 700; font-family: monospace; font-size: 0.8rem; display: inline-block;">
            ${escapeHTML(l.id || l.radicado || 'N/A')}
          </span>
        </td>
        <td><strong>${escapeHTML(l.name)}</strong></td>
        <td><span style="color:#e82127; font-weight:600;">${escapeHTML(l.vehicle_name || 'Tesla')}</span></td>
        <td>
          <a href="https://wa.me/57${(l.phone||'').replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(l.name)},%20te%20escribimos%20de%20Tesla%20Showroom%20sobre%20tu%20radicado%20${encodeURIComponent(l.id||l.radicado)}" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: underline;" title="Contactar por WhatsApp">
            ${escapeHTML(l.phone || 'N/A')}
          </a>
        </td>
        <td><span style="text-transform: capitalize;">${escapeHTML(l.city || 'Bogotá')}</span></td>
        <td>
          <span class="badge-status ${l.status === 'completed' ? 'success' : (l.status === 'contacted' ? 'info' : 'warning')}">
            ${l.status === 'completed' ? 'Atendido' : (l.status === 'contacted' ? 'En Contacto' : 'Pendiente')}
          </span>
        </td>
        <td>
          <button class="btn-admin btn-admin-secondary btn-sm" onclick="switchTab('leads')">Ver Detalle</button>
        </td>
      </tr>
    `).join("");
  }

  // Renderizar Tabla de Vehículos
  function renderVehiclesTable() {
    if (!elements.adminVehiclesTableBody) return;

    if (state.vehicles.length === 0) {
      elements.adminVehiclesTableBody.innerHTML = `
        <tr><td colspan="8" style="text-align: center; color: #6b7280; padding: 30px;">No hay vehículos en el catálogo. Usa el botón "Nuevo Vehículo".</td></tr>
      `;
      return;
    }

    elements.adminVehiclesTableBody.innerHTML = state.vehicles.map(v => `
      <tr>
        <td>
          <img src="${escapeHTML(v.image || 'assets/images/model-3.jpg')}" alt="${escapeHTML(v.name)}" class="vehicle-row-thumb" onerror="this.src='assets/images/model-3.jpg'">
        </td>
        <td>
          <strong style="color: #ffffff; font-size: 0.95rem;">${escapeHTML(v.name)}</strong>
          <div style="font-size: 0.78rem; color: #9ca3af;">${escapeHTML(v.version || '')}</div>
        </td>
        <td><span class="badge-status info">${escapeHTML(v.category || 'Sedán')}</span></td>
        <td>
          ${(() => {
            const pricing = (typeof getVehiclePricing === "function") ? getVehiclePricing(v) : { isPromo: false };
            if (pricing.isPromo) {
              return `
                <div>
                  <strong style="color: #10b981; font-size: 0.95rem;">${formatCOP(pricing.promoPrice)}</strong>
                  <div style="font-size: 0.78rem; text-decoration: line-through; color: #9ca3af;">${formatCOP(pricing.normalPrice)}</div>
                  <span class="badge-status warning" style="font-size: 0.68rem; margin-top: 3px; display: inline-block;">🔥 ${escapeHTML(pricing.promoLabel)} (-${pricing.discountPercent}%)</span>
                </div>
              `;
            }
            return `<strong style="color: #10b981; font-size: 0.95rem;">${formatCOP(v.price)}</strong>`;
          })()}
        </td>
        <td>${v.range_km || v.rangeKm || 500} km</td>
        <td>${v.acceleration_seconds || v.accelerationSeconds || 3.5}s</td>
        <td>
          <span class="badge-status success">${escapeHTML(v.availability || 'En Stock')}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn-admin btn-admin-secondary btn-sm js-edit-veh" data-id="${v.id}" style="margin-right: 6px;">Editar</button>
          <button class="btn-admin btn-admin-danger btn-sm js-del-veh" data-id="${v.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    // Botones de acción
    elements.adminVehiclesTableBody.querySelectorAll(".js-edit-veh").forEach(btn => {
      btn.addEventListener("click", () => openEditVehicleModal(btn.dataset.id));
    });

    elements.adminVehiclesTableBody.querySelectorAll(".js-del-veh").forEach(btn => {
      btn.addEventListener("click", () => deleteVehicle(btn.dataset.id));
    });
  }

  // Renderizar Tabla de Leads
  function renderLeadsTable() {
    if (!elements.adminLeadsTableBody) return;

    if (state.leads.length === 0) {
      elements.adminLeadsTableBody.innerHTML = `
        <tr><td colspan="8" style="text-align: center; color: #6b7280; padding: 30px;">No hay solicitudes de clientes por el momento.</td></tr>
      `;
      return;
    }

    elements.adminLeadsTableBody.innerHTML = state.leads.map(l => `
      <tr>
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <span style="background: rgba(232, 33, 39, 0.15); color: #f87171; border: 1px solid rgba(232, 33, 39, 0.4); padding: 3px 8px; border-radius: 6px; font-weight: 800; font-family: monospace; font-size: 0.82rem; display: inline-block;">
              ${escapeHTML(l.id || l.radicado || 'RAD-PENDING')}
            </span>
            <span style="font-size: 0.72rem; color: #a1a1aa;">${escapeHTML(l.request_type || 'Experiencia')}</span>
          </div>
        </td>
        <td style="font-size: 0.8rem; color: #9ca3af; white-space: nowrap;">
          ${new Date(l.created_at || Date.now()).toLocaleDateString("es-CO", { day: '2-digit', month: 'short', year: 'numeric' })}
        </td>
        <td>
          <strong style="color: #ffffff; font-size: 0.92rem; display: block;">${escapeHTML(l.name)}</strong>
          <span style="font-size: 0.75rem; color: #9ca3af;">${escapeHTML(l.city || 'Bogotá D.C.')}</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <a href="https://wa.me/57${(l.phone||'').replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(l.name)},%20te%20escribimos%20de%20Tesla%20Showroom%20sobre%20tu%20radicado%20${encodeURIComponent(l.id||l.radicado)}" target="_blank" rel="noopener noreferrer" style="color: #10b981; font-weight: 600; text-decoration: underline; font-size: 0.86rem;" title="Abrir chat de WhatsApp">
              💬 ${escapeHTML(l.phone || 'Sin teléfono')}
            </a>
          </div>
          <div style="font-size: 0.78rem; color: #9ca3af;">${escapeHTML(l.email || '')}</div>
        </td>
        <td><strong style="color: #e82127; font-size: 0.9rem;">${escapeHTML(l.vehicle_name || 'Tesla')}</strong></td>
        <td style="max-width: 260px; font-size: 0.82rem; color: #d1d5db; line-height: 1.4;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 8px 10px; border-radius: 6px;">
            ${escapeHTML(l.comments || 'Solicitud de experiencia de manejo')}
          </div>
        </td>
        <td>
          <select class="modal-select js-lead-status-change" data-id="${l.id}" style="padding: 5px 8px; font-size: 0.78rem; width: auto; font-weight: 600;">
            <option value="pending" ${l.status === 'pending' ? 'selected' : ''}>⏳ Pendiente</option>
            <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>📞 En Contacto</option>
            <option value="completed" ${l.status === 'completed' ? 'selected' : ''}>✅ Atendido / Cerrado</option>
          </select>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <a href="https://wa.me/57${(l.phone||'').replace(/\D/g,'')}?text=Hola%20${encodeURIComponent(l.name)},%20recibimos%20tu%20solicitud%20para%20la%20experiencia%20de%20manejo%20del%20Tesla%20${encodeURIComponent(l.vehicle_name||'Tesla')}%20con%20radicado%20${encodeURIComponent(l.id||l.radicado)}.%20%C2%BFQu%C3%A9%20d%C3%ADa%20y%20hora%20te%20gustar%C3%ADa%20agendar?" target="_blank" rel="noopener noreferrer" class="btn-admin btn-admin-secondary btn-sm" style="margin-right: 6px; padding: 5px 9px; font-size: 0.75rem; color: #10b981; border-color: rgba(16,185,129,0.3);">
            WhatsApp
          </a>
          <button type="button" class="btn-admin btn-admin-danger btn-sm js-del-lead" data-id="${l.id}" style="padding: 5px 9px; font-size: 0.75rem;">
            Eliminar
          </button>
        </td>
      </tr>
    `).join("");

    elements.adminLeadsTableBody.querySelectorAll(".js-lead-status-change").forEach(sel => {
      sel.addEventListener("change", async (e) => {
        const id = sel.dataset.id;
        const newStatus = e.target.value;
        const item = state.leads.find(x => x.id === id);
        if (item) {
          item.status = newStatus;
          saveLocalLeads(state.leads);
        }
        renderDashboard();
        showToast(`Estado de la solicitud ${id} actualizado`);
        try {
          await fetch(`/api/leads/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
          });
        } catch (err) {}
      });
    });

    elements.adminLeadsTableBody.querySelectorAll(".js-del-lead").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!confirm(`¿Deseas eliminar la solicitud ${id}?`)) return;
        state.leads = state.leads.filter(l => l.id !== id);
        saveLocalLeads(state.leads);
        renderDashboard();
        renderLeadsTable();
        showToast(`Solicitud ${id} eliminada`);
        try {
          await fetch(`/api/leads/${id}`, { method: "DELETE" });
        } catch (err) {}
      });
    });
  }

  // =========================================================================
  // RENDERIZADO DE COMPRAS CON FONDO DEL VEHÍCULO TESLA Y AUTORIZACIONES
  // =========================================================================

  function renderPurchasesCards() {
    if (!elements.adminPurchasesGrid) return;

    // Actualizar contadores
    const allCount = state.purchases.length;
    const pendingCount = state.purchases.filter(p => p.status === "pending_authorization" || (!p.status && p.includePapers !== false)).length;
    const authCount = state.purchases.filter(p => p.status === "authorized").length;
    const rejectedCount = state.purchases.filter(p => p.status === "rejected").length;

    if (elements.countAllPurchases) elements.countAllPurchases.textContent = allCount;
    if (elements.countPendingPurchases) elements.countPendingPurchases.textContent = pendingCount;
    if (elements.countAuthPurchases) elements.countAuthPurchases.textContent = authCount;
    if (elements.countRejectedPurchases) elements.countRejectedPurchases.textContent = rejectedCount;

    if (elements.menuPurchasesCount) elements.menuPurchasesCount.textContent = pendingCount;
    if (elements.kpiPurchasesCount) elements.kpiPurchasesCount.textContent = allCount;
    if (elements.kpiPurchasesDesc) elements.kpiPurchasesDesc.textContent = `${pendingCount} requieren autorización de papeleo`;

    let filtered = [...state.purchases];
    if (state.purchaseFilter === "pending") {
      filtered = filtered.filter(p => p.status === "pending_authorization" || (!p.status && p.includePapers !== false));
    } else if (state.purchaseFilter === "authorized") {
      filtered = filtered.filter(p => p.status === "authorized");
    } else if (state.purchaseFilter === "rejected") {
      filtered = filtered.filter(p => p.status === "rejected");
    }

    if (filtered.length === 0) {
      elements.adminPurchasesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(24, 24, 27, 0.4); border: 1px dashed rgba(255, 255, 255, 0.1); border-radius: 16px;">
          <div style="font-size: 2.8rem; margin-bottom: 14px;">🚗⚡</div>
          <h3 style="font-size: 1.15rem; color: #ffffff; margin-bottom: 6px;">No hay órdenes en esta categoría</h3>
          <p style="font-size: 0.85rem; color: #9ca3af; max-width: 500px; margin: 0 auto;">
            Cuando un cliente decida comprar o reservar un vehículo en el Showroom de clientes, aparecerá en esta sección con el auto de fondo para tu revisión y autorización.
          </p>
        </div>
      `;
      return;
    }

    elements.adminPurchasesGrid.innerHTML = filtered.map(order => {
      const isRejected = order.status === "rejected";
      const isAuthorized = order.status === "authorized";
      const hasPapers = Boolean(order.includePapers);
      const bgImage = order.vehicleImage || "assets/images/model-y.jpg";

      // Pill de estado
      let statusPillHtml = "";
      if (isRejected) {
        statusPillHtml = `
          <span class="auth-pill-status rejected">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            RECHAZADA
          </span>
        `;
      } else if (isAuthorized) {
        if (hasPapers) {
          statusPillHtml = `
            <span class="auth-pill-status authorized">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              AUTORIZADA POR AGENTE
            </span>
          `;
        } else {
          statusPillHtml = `
            <span class="auth-pill-status authorized" style="background: rgba(16, 185, 129, 0.18); border-color: rgba(16, 185, 129, 0.5); color: #34d399;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              COMPRA DIRECTA (SIN PAPELEO)
            </span>
          `;
        }
      } else {
        statusPillHtml = `
          <span class="auth-pill-status waiting">
            <span class="pulsing-dot"></span>
            REQUIERE AUTORIZACIÓN (PAPELEO)
          </span>
        `;
      }

      // Banner y botones de acción
      let footerActionsHtml = "";
      if (isRejected) {
        footerActionsHtml = `
          <div class="auth-banner-notice rejected">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <div>
              <strong>Solicitud Rechazada:</strong> Esta compra fue denegada por <strong>${escapeHTML(order.rejectedBy || 'Administración')}</strong>${order.rejectedReason ? ` — <em>Motivo: ${escapeHTML(order.rejectedReason)}</em>` : ''}.
            </div>
          </div>
          <div class="purchase-actions-row">
            <button type="button" class="btn-auth-approve js-reopen-purchase" data-order-id="${escapeHTML(order.orderNum)}" style="flex: 1;">
              🔄 Reconsiderar / Autorizar
            </button>
            <a href="https://wa.me/57${(order.customerPhone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customerName || '')},%20te%20escribe%20${encodeURIComponent(state.adminInfo.name || 'Julian O')}%20de%20Tesla.%20Respecto%20a%20tu%20solicitud%20del%20${encodeURIComponent(order.vehicleName || 'Tesla')}%20(Radicado%20${encodeURIComponent(order.orderNum || '')})." target="_blank" rel="noopener noreferrer" class="btn-auth-whatsapp">
              💬 WhatsApp
            </a>
            <button type="button" class="btn-auth-reject js-delete-purchase" data-order-id="${escapeHTML(order.orderNum)}" title="Eliminar orden definitivamente">
              🗑️ Eliminar
            </button>
          </div>
        `;
      } else if (isAuthorized) {
        if (hasPapers) {
          footerActionsHtml = `
            <div class="auth-banner-notice approved">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <div>
                <strong>Papeleo Autorizado:</strong> Aprobada por <strong>${escapeHTML(order.authorizedBy || 'Julian O')}</strong> el ${escapeHTML(order.authorizedAt ? new Date(order.authorizedAt).toLocaleString('es-CO') : 'Recientemente')}.
              </div>
            </div>
            <div class="purchase-actions-row">
              <a href="https://wa.me/57${(order.customerPhone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customerName || '')},%20te%20escribe%20${encodeURIComponent(state.adminInfo.name || 'Julian O')}%20de%20Tesla.%20Tu%20compra%20del%20${encodeURIComponent(order.vehicleName || 'Tesla')}%20(Radicado%20${encodeURIComponent(order.orderNum || '')})%20ha%20sido%20AUTORIZADA.%20Coordinemos%20la%20entrega%20y%20documentación." target="_blank" rel="noopener noreferrer" class="btn-auth-whatsapp" style="flex: 1;">
                💬 Coordinar Entrega por WhatsApp
              </a>
              <button type="button" class="btn-auth-reject js-revert-purchase" data-order-id="${escapeHTML(order.orderNum)}" title="Revertir autorización a pendiente">
                🔄 Revertir
              </button>
              <button type="button" class="btn-auth-reject js-reject-purchase" data-order-id="${escapeHTML(order.orderNum)}" title="Rechazar compra">
                ❌ Rechazar
              </button>
            </div>
          `;
        } else {
          footerActionsHtml = `
            <div class="auth-banner-notice approved">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <div>
                <strong>Compra Directa Sin Papeleo:</strong> El cliente compró sin el paquete de papeles. No requirió retención de formularios ni autorización administrativa previa.
              </div>
            </div>
            <div class="purchase-actions-row">
              <a href="https://wa.me/57${(order.customerPhone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customerName || '')},%20te%20escribe%20${encodeURIComponent(state.adminInfo.name || 'Julian O')}%20de%20Tesla.%20Tu%20compra%20directa%20del%20${encodeURIComponent(order.vehicleName || 'Tesla')}%20(Radicado%20${encodeURIComponent(order.orderNum || '')})%20está%20confirmada.%20Coordinemos%20la%20entrega%20y%20facturación." target="_blank" rel="noopener noreferrer" class="btn-auth-whatsapp" style="flex: 1;">
                💬 Coordinar Entrega por WhatsApp
              </a>
              <button type="button" class="btn-auth-reject js-reject-purchase" data-order-id="${escapeHTML(order.orderNum)}" title="Rechazar compra">
                ❌ Rechazar
              </button>
            </div>
          `;
        }
      } else {
        footerActionsHtml = `
          <div class="auth-banner-notice waiting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <div>
              <strong>Esperando autorización de papeleo:</strong> El cliente solicitó papeles al día ($5.200.000 COP). Requiere que un agente verifique sus datos y autorice la tramitación de formularios.
            </div>
          </div>
          <div class="purchase-actions-row">
            <button type="button" class="btn-auth-approve js-approve-purchase" data-order-id="${escapeHTML(order.orderNum)}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Autorizar Compra
            </button>
            <a href="https://wa.me/57${(order.customerPhone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(order.customerName || '')},%20te%20escribe%20${encodeURIComponent(state.adminInfo.name || 'Julian O')}%20de%20Tesla.%20Estoy%20revisando%20tu%20solicitud%20para%20comprar%20el%20${encodeURIComponent(order.vehicleName || 'Tesla')}%20(Radicado%20${encodeURIComponent(order.orderNum || '')})." target="_blank" rel="noopener noreferrer" class="btn-auth-whatsapp">
              💬 WhatsApp
            </a>
            <button type="button" class="btn-auth-reject js-reject-purchase" data-order-id="${escapeHTML(order.orderNum)}">
              ❌ Rechazar
            </button>
          </div>
        `;
      }

      return `
        <article class="purchase-order-card ${isAuthorized ? 'is-authorized' : ''} ${isRejected ? 'is-rejected' : ''}" data-order-id="${escapeHTML(order.orderNum)}">
          <!-- Fondo de auto Tesla con shader realista -->
          <div class="purchase-card-bg-wrap">
            <img src="${escapeHTML(bgImage)}" class="purchase-card-bg-img" alt="Tesla ${escapeHTML(order.vehicleName || 'Vehículo')}" loading="lazy">
            <div class="purchase-card-bg-overlay"></div>
          </div>

          <!-- Contenido superpuesto sobre el auto -->
          <div class="purchase-card-content">
            <div class="purchase-card-header">
              <div class="purchase-card-id-block">
                <span class="purchase-order-radicado">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e82127" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
                  ${escapeHTML(order.orderNum || 'TSL-ORD')}
                </span>
                <span class="purchase-order-date">📅 ${escapeHTML(order.date || 'Reciente')}</span>
              </div>

              ${statusPillHtml}
            </div>

            <!-- Información del Modelo del Auto a Comprar -->
            <div class="purchase-model-box">
              <div class="purchase-model-title">
                <span>🚗 Tesla ${escapeHTML(order.vehicleName || 'Vehículo')}</span>
                <span style="font-size: 0.85rem; color: #10b981; font-weight: 700;">${formatCOP(order.totalAmount || 0)}</span>
              </div>
              <div class="purchase-model-version">Versión: <strong>${escapeHTML(order.vehicleVersion || 'Long Range AWD')}</strong></div>
              <div class="purchase-specs-tags">
                <span class="purchase-spec-tag">Precio Base: ${formatCOP(order.basePrice || order.totalAmount || 0)}</span>
                ${order.isPromo ? `<span class="purchase-spec-tag tag-promo">🔥 Promoción: ${escapeHTML(order.promoLabel || 'Oferta')}</span>` : ''}
                <span class="purchase-spec-tag tag-papers">${hasPapers ? '✅ Papeles al Día (Requiere formularios y autorización)' : '⚪ Sin papeles legales (Compra directa sin trámite)'}</span>
              </div>
              <div class="purchase-total-row">
                <span class="purchase-total-label">Total Liquidación:</span>
                <span class="purchase-total-value">${formatCOP(order.totalAmount || 0)}</span>
              </div>
            </div>

            <!-- Información del Cliente Comprador -->
            <div class="purchase-client-box">
              <div class="purchase-client-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Información del Cliente Comprador
              </div>
              <div class="purchase-client-grid">
                <div class="client-data-item">
                  <span class="client-data-lbl">Nombre del Cliente:</span>
                  <span class="client-data-val">👤 ${escapeHTML(order.customerName || 'Cliente')}</span>
                </div>
                <div class="client-data-item">
                  <span class="client-data-lbl">Cédula / Documento:</span>
                  <span class="client-data-val">🪪 ${escapeHTML(order.customerDoc || 'No especificado')}</span>
                </div>
                <div class="client-data-item">
                  <span class="client-data-lbl">Teléfono / WhatsApp:</span>
                  <span class="client-data-val">📞 ${escapeHTML(order.customerPhone || 'N/A')}</span>
                </div>
                <div class="client-data-item">
                  <span class="client-data-lbl">Ciudad de Entrega:</span>
                  <span class="client-data-val">📍 ${escapeHTML(order.customerCity || 'Colombia')}</span>
                </div>
                <div class="client-data-item" style="grid-column: 1 / -1;">
                  <span class="client-data-lbl">Correo Electrónico:</span>
                  <span class="client-data-val">✉️ ${escapeHTML(order.customerEmail || 'N/A')}</span>
                </div>
              </div>
            </div>

            <!-- Pie de Autorización y Botones de Acción -->
            <div class="purchase-auth-footer">
              ${footerActionsHtml}
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Eventos de aprobación de compra
    elements.adminPurchasesGrid.querySelectorAll(".js-approve-purchase").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.orderId;
        const ord = state.purchases.find(p => p.orderNum === orderId);
        if (!ord) return;

        const ok = confirm(`¿Confirmas la AUTORIZACIÓN oficial para la compra del ${ord.vehicleName} para el cliente ${ord.customerName}?`);
        if (!ok) return;

        ord.status = "authorized";
        ord.statusLabel = "Autorizada por Asesor de Administración";
        ord.authorizedBy = (state.adminInfo && state.adminInfo.name) ? state.adminInfo.name : "Julian O (Super Admin)";
        ord.authorizedAt = new Date().toISOString();
        delete ord.rejectedBy;
        delete ord.rejectedAt;
        delete ord.rejectedReason;

        saveLocalPurchases(state.purchases);
        renderDashboard();
        renderPurchasesCards();

        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
            bc.postMessage({ type: "PURCHASE_AUTHORIZED", orderId: ord.orderNum, order: ord, authorizedBy: ord.authorizedBy });
            bc.close();
          }
        } catch (e) {}

        fetch(`/api/purchases/${encodeURIComponent(ord.orderNum)}/authorize`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorizedBy: ord.authorizedBy })
        }).catch(() => null);

        alert(`✅ ¡Orden ${ord.orderNum} AUTORIZADA con éxito! El comprador ha sido formalmente aprobado.`);
      });
    });

    // Eventos de rechazo de compra
    elements.adminPurchasesGrid.querySelectorAll(".js-reject-purchase").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.orderId;
        const ord = state.purchases.find(p => p.orderNum === orderId);
        if (!ord) return;

        const reason = prompt(`¿Deseas rechazar la orden de compra ${ord.orderNum} de ${ord.customerName}?\n\n(Opcional) Ingresa el motivo del rechazo:`, "Documentación incompleta o no autorizada");
        if (reason === null) return; // Cancelado por el usuario

        ord.status = "rejected";
        ord.statusLabel = "Rechazada por Administración";
        ord.rejectedBy = (state.adminInfo && state.adminInfo.name) ? state.adminInfo.name : "Julian O (Super Admin)";
        ord.rejectedAt = new Date().toISOString();
        ord.rejectedReason = reason.trim() || "No cumple con los requisitos administrativos";

        saveLocalPurchases(state.purchases);
        renderDashboard();
        renderPurchasesCards();

        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
            bc.postMessage({ type: "PURCHASE_REJECTED", orderId: ord.orderNum, order: ord, rejectedBy: ord.rejectedBy, rejectedReason: ord.rejectedReason });
            bc.close();
          }
        } catch (e) {}

        fetch(`/api/purchases/${encodeURIComponent(ord.orderNum)}/reject`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejectedBy: ord.rejectedBy, rejectedReason: ord.rejectedReason })
        }).catch(() => null);

        alert(`❌ La orden ${ord.orderNum} ha sido marcada como RECHAZADA exitosamente.`);
      });
    });

    // Eventos para reconsiderar / autorizar una orden previamente rechazada
    elements.adminPurchasesGrid.querySelectorAll(".js-reopen-purchase").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.orderId;
        const ord = state.purchases.find(p => p.orderNum === orderId);
        if (!ord) return;

        const ok = confirm(`¿Deseas reconsiderar y AUTORIZAR la compra del ${ord.vehicleName} para ${ord.customerName}?`);
        if (!ok) return;

        ord.status = "authorized";
        ord.statusLabel = "Autorizada por Asesor de Administración";
        ord.authorizedBy = (state.adminInfo && state.adminInfo.name) ? state.adminInfo.name : "Julian O (Super Admin)";
        ord.authorizedAt = new Date().toISOString();
        delete ord.rejectedBy;
        delete ord.rejectedAt;
        delete ord.rejectedReason;

        saveLocalPurchases(state.purchases);
        renderDashboard();
        renderPurchasesCards();

        try {
          if (typeof BroadcastChannel !== "undefined") {
            const bc = new BroadcastChannel(SYNC_CHANNEL_NAME);
            bc.postMessage({ type: "PURCHASE_AUTHORIZED", orderId: ord.orderNum, order: ord, authorizedBy: ord.authorizedBy });
            bc.close();
          }
        } catch (e) {}

        alert(`✅ ¡Orden ${ord.orderNum} reconsiderada y autorizada con éxito!`);
      });
    });

    // Eventos de reversión de autorización a pendiente
    elements.adminPurchasesGrid.querySelectorAll(".js-revert-purchase").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.orderId;
        const ord = state.purchases.find(p => p.orderNum === orderId);
        if (!ord) return;

        ord.status = "pending_authorization";
        ord.statusLabel = "En Espera de Autorización (Papeleo al Día)";
        ord.authorizedBy = null;
        ord.authorizedAt = null;

        saveLocalPurchases(state.purchases);
        renderDashboard();
        renderPurchasesCards();
      });
    });

    // Eventos de eliminación definitiva de orden
    elements.adminPurchasesGrid.querySelectorAll(".js-delete-purchase").forEach(btn => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.orderId;
        const idx = state.purchases.findIndex(p => p.orderNum === orderId);
        if (idx === -1) return;

        if (!confirm(`¿Eliminar definitivamente la orden ${orderId} del registro?`)) return;

        state.purchases.splice(idx, 1);
        saveLocalPurchases(state.purchases);
        renderDashboard();
        renderPurchasesCards();

        fetch(`/api/purchases/${encodeURIComponent(orderId)}`, {
          method: "DELETE"
        }).catch(() => null);
      });
    });
  }

  // Filtros de la pestaña de compras
  document.querySelectorAll(".btn-filter-purchase").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-filter-purchase").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.purchaseFilter = btn.dataset.filter || "all";
      renderPurchasesCards();
    });
  });

  if (elements.refreshPurchasesBtn) {
    elements.refreshPurchasesBtn.addEventListener("click", () => {
      state.purchases = getLocalPurchases();
      renderPurchasesCards();
      renderDashboard();
    });
  }

  // Abrir Modal para Nuevo Vehículo
  function openAddVehicleModal() {
    if (elements.vehicleForm) elements.vehicleForm.reset();
    document.getElementById("editVehicleId").value = "";
    const promoActiveCheck = document.getElementById("vPromoActive");
    if (promoActiveCheck) promoActiveCheck.checked = false;
    const promoContainer = document.getElementById("promoFieldsContainer");
    if (promoContainer) promoContainer.style.display = "none";
    const promoLabel = document.getElementById("vPromoLabel");
    if (promoLabel) promoLabel.value = "";
    const promoPrice = document.getElementById("vPromoPrice");
    if (promoPrice) promoPrice.value = "";
    const promoPreview = document.getElementById("promoSavingsPreview");
    if (promoPreview) promoPreview.style.display = "none";

    if (elements.modalActionTitle) elements.modalActionTitle.textContent = "Agregar Nuevo Vehículo al Catálogo";
    if (elements.vehicleModal) elements.vehicleModal.classList.add("is-open");
  }

  // Actualizar cálculo en vivo de ahorro en la edición del administrador
  function updateAdminPromoSavingsPreview() {
    const previewEl = document.getElementById("promoSavingsPreview");
    if (!previewEl) return;
    const normalPrice = parsePriceInput(document.getElementById("vPrice").value);
    const promoPrice = parsePriceInput(document.getElementById("vPromoPrice").value);
    if (!normalPrice || !promoPrice) {
      previewEl.style.display = "none";
      return;
    }
    if (promoPrice >= normalPrice) {
      previewEl.style.display = "block";
      previewEl.style.borderColor = "rgba(239, 68, 68, 0.4)";
      previewEl.style.background = "rgba(239, 68, 68, 0.1)";
      previewEl.style.color = "#f87171";
      previewEl.innerHTML = `⚠️ El precio promocional debe ser menor al precio normal (${formatCOP(normalPrice)}).`;
      return;
    }
    const diff = normalPrice - promoPrice;
    const percent = Math.round((diff / normalPrice) * 100);
    previewEl.style.display = "block";
    previewEl.style.borderColor = "rgba(16, 185, 129, 0.35)";
    previewEl.style.background = "rgba(16, 185, 129, 0.1)";
    previewEl.style.color = "#10b981";
    previewEl.innerHTML = `✅ <strong>Ahorro del cliente:</strong> ${formatCOP(diff)} (-${percent}% de descuento promocional)`;
  }

  // Abrir Modal para Editar Vehículo
  function openEditVehicleModal(id) {
    const v = state.vehicles.find(x => x.id === id);
    if (!v) return;

    document.getElementById("editVehicleId").value = v.id;
    document.getElementById("vName").value = v.name || "";
    document.getElementById("vCategory").value = v.category || "Sedán";
    document.getElementById("vVersion").value = v.version || "";
    document.getElementById("vPrice").value = v.price || 0;
    document.getElementById("vBadge").value = v.badge || "";
    document.getElementById("vRange").value = v.range_km || v.rangeKm || 500;
    document.getElementById("vAccel").value = v.acceleration_seconds || v.accelerationSeconds || 4.0;
    document.getElementById("vSpeed").value = v.top_speed_kmh || v.topSpeedKm || 200;
    document.getElementById("vAvailability").value = v.availability || "";
    document.getElementById("vImage").value = v.image || "";
    document.getElementById("vDesc").value = v.description || "";

    const pricing = (typeof getVehiclePricing === "function") 
      ? getVehiclePricing(v) 
      : { isPromo: Boolean(v.promoPrice && v.promoPrice > 0), promoPrice: v.promoPrice, promoLabel: v.promoLabel };

    const promoActiveCheck = document.getElementById("vPromoActive");
    const promoContainer = document.getElementById("promoFieldsContainer");
    const promoLabel = document.getElementById("vPromoLabel");
    const promoPrice = document.getElementById("vPromoPrice");

    if (promoActiveCheck && promoContainer) {
      if (pricing.isPromo) {
        promoActiveCheck.checked = true;
        promoContainer.style.display = "block";
        if (promoLabel) promoLabel.value = pricing.promoLabel || "";
        if (promoPrice) promoPrice.value = pricing.promoPrice || "";
        updateAdminPromoSavingsPreview();
      } else {
        promoActiveCheck.checked = false;
        promoContainer.style.display = "none";
        if (promoLabel) promoLabel.value = "";
        if (promoPrice) promoPrice.value = "";
        const promoPreview = document.getElementById("promoSavingsPreview");
        if (promoPreview) promoPreview.style.display = "none";
      }
    }

    if (elements.modalActionTitle) elements.modalActionTitle.textContent = `Editar Vehículo: ${v.name}`;
    if (elements.vehicleModal) elements.vehicleModal.classList.add("is-open");
  }

  // Cerrar Modal
  function closeVehicleModal() {
    if (elements.vehicleModal) elements.vehicleModal.classList.remove("is-open");
  }

  // Eliminar Vehículo (garantiza borrado en local, transmisión y backend)
  async function deleteVehicle(id) {
    const v = state.vehicles.find(x => x.id === id);
    const name = v ? v.name : id;
    if (!confirm(`¿Confirmas que deseas eliminar el vehículo "${name}" del catálogo?`)) return;

    // 1. Borrado inmediato de la interfaz y del almacenamiento compartido
    state.vehicles = state.vehicles.filter(x => x.id !== id);
    saveLocalVehicles(state.vehicles);
    renderDashboard();
    renderVehiclesTable();
    showToast(`Vehículo ${name} eliminado con éxito`);

    // 2. Notificar al backend si está activo
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    } catch (err) {
      console.info("Vehículo eliminado localmente (backend en espera):", err);
    }
  }

  // Guardar Vehículo (Crear o Editar con persistencia garantizada y sincronización en vivo)
  if (elements.vehicleForm) {
    elements.vehicleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = document.getElementById("editVehicleId").value;

      const rawPrice = document.getElementById("vPrice").value;
      const parsedPrice = parsePriceInput(rawPrice);
      const rangeVal = Number(document.getElementById("vRange").value) || 500;
      const accelVal = Number(document.getElementById("vAccel").value) || 3.5;
      const speedVal = Number(document.getElementById("vSpeed").value) || 200;

      const isPromoChecked = document.getElementById("vPromoActive")?.checked;
      let finalPromoPrice = 0;
      let finalPromoLabel = "";

      if (isPromoChecked) {
        finalPromoLabel = (document.getElementById("vPromoLabel")?.value || "").trim();
        finalPromoPrice = parsePriceInput(document.getElementById("vPromoPrice")?.value);

        if (!finalPromoLabel) {
          alert("Por favor ingresa el texto de la etiqueta inclinada de promoción (Ej: ¡OFERTA ESPECIAL!)");
          return;
        }
        if (!finalPromoPrice || finalPromoPrice <= 0) {
          alert("Por favor ingresa un precio promocional válido mayor a 0");
          return;
        }
        if (finalPromoPrice >= (parsedPrice || 200000000)) {
          alert("El precio promocional debe ser menor al precio normal del vehículo");
          return;
        }
      }

      const vehicleData = {
        name: document.getElementById("vName").value.trim() || "Tesla Modelo Nuevo",
        category: document.getElementById("vCategory").value || "Sedán",
        version: document.getElementById("vVersion").value.trim() || "Estándar Dual Motor",
        price: parsedPrice || 200000000,
        promoPrice: finalPromoPrice,
        promo_price: finalPromoPrice,
        promoLabel: finalPromoLabel,
        promo_label: finalPromoLabel,
        badge: document.getElementById("vBadge").value.trim() || "Disponible",
        range_km: rangeVal,
        rangeKm: rangeVal,
        acceleration_seconds: accelVal,
        accelerationSeconds: accelVal,
        top_speed_kmh: speedVal,
        topSpeedKm: speedVal,
        availability: document.getElementById("vAvailability").value.trim() || "Entrega inmediata",
        image: document.getElementById("vImage").value.trim() || "assets/images/model-3.jpg",
        description: document.getElementById("vDesc").value.trim() || "Vehículo eléctrico de alta gama con tecnología avanzada de piloto automático y máxima seguridad.",
        featured: true,
        colors: [
          { id: "pearl-white", name: "Blanco Perla Multicapa", hex: "#E8E9EB", filter: "none" },
          { id: "solid-black", name: "Negro Sólido", hex: "#111112", filter: "brightness(0.7) contrast(1.2)" },
          { id: "ultra-red", name: "Rojo Ultra Multicapa", hex: "#A81017", filter: "sepia(0.5) hue-rotate(320deg) saturate(2)" }
        ]
      };

      // 1. Guardar de inmediato en estado y en LocalStorage compartido con la plataforma de usuario
      if (editId) {
        vehicleData.id = editId;
        const idx = state.vehicles.findIndex(x => x.id === editId);
        if (idx !== -1) {
          state.vehicles[idx] = { ...state.vehicles[idx], ...vehicleData };
        } else {
          state.vehicles.push(vehicleData);
        }
      } else {
        vehicleData.id = `veh-${Date.now()}`;
        state.vehicles.unshift(vehicleData);
      }

      saveLocalVehicles(state.vehicles);
      renderDashboard();
      renderVehiclesTable();
      closeVehicleModal();

      // 2. Transmitir al backend si el servidor está en ejecución
      try {
        if (editId) {
          const res = await fetch(`/api/vehicles/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vehicleData)
          });
          if (res.ok) {
            showToast(`Vehículo "${vehicleData.name}" actualizado y publicado`);
          } else {
            showToast(`Vehículo guardado y sincronizado con el showroom`);
          }
        } else {
          const res = await fetch("/api/vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vehicleData)
          });
          if (res.ok) {
            showToast(`¡Nuevo vehículo "${vehicleData.name}" publicado en el showroom!`);
          } else {
            showToast(`Vehículo guardado localmente y sincronizado con el showroom`);
          }
        }
      } catch (err) {
        showToast(`Vehículo "${vehicleData.name}" guardado y sincronizado con el showroom`);
      }
    });
  }

  // Event Listeners de Botones de Modal
  if (elements.openAddBtn) elements.openAddBtn.addEventListener("click", openAddVehicleModal);
  if (elements.quickAddBtn) elements.quickAddBtn.addEventListener("click", openAddVehicleModal);
  if (elements.closeModalBtn) elements.closeModalBtn.addEventListener("click", closeVehicleModal);
  if (elements.cancelModalBtn) elements.cancelModalBtn.addEventListener("click", closeVehicleModal);

  // Eventos de configuración de promoción en modal
  const vPromoActiveCheck = document.getElementById("vPromoActive");
  const promoContainerEl = document.getElementById("promoFieldsContainer");
  if (vPromoActiveCheck && promoContainerEl) {
    vPromoActiveCheck.addEventListener("change", () => {
      promoContainerEl.style.display = vPromoActiveCheck.checked ? "block" : "none";
      if (vPromoActiveCheck.checked) {
        updateAdminPromoSavingsPreview();
      }
    });
  }
  const vPriceEl = document.getElementById("vPrice");
  const vPromoPriceEl = document.getElementById("vPromoPrice");
  if (vPriceEl) vPriceEl.addEventListener("input", updateAdminPromoSavingsPreview);
  if (vPromoPriceEl) vPromoPriceEl.addEventListener("input", updateAdminPromoSavingsPreview);
  if (elements.refreshDashboardBtn) {
    elements.refreshDashboardBtn.addEventListener("click", () => {
      loadData();
      showToast("Datos sincronizados");
    });
  }

  // Cierre con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeVehicleModal();
  });

  // Función utilitaria anti-XSS
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
  // SISTEMA DE SEGURIDAD, REGISTRO Y GESTIÓN DE ACCESOS ADMIN
  // =========================================================================
  const STORAGE_KEY_ADMIN_ACCOUNTS = "tesla_admin_accounts";
  const STORAGE_KEY_CURRENT_ADMIN = "tesla_current_admin";

  const authGate = document.getElementById("adminAuthGate");
  const sidebarContent = document.getElementById("adminSidebarContent");
  const mainContent = document.getElementById("adminMainContent");
  const adminLoginView = document.getElementById("adminLoginView");
  const adminRegisterView = document.getElementById("adminRegisterView");
  const adminRegisterSubtitle = document.getElementById("adminRegisterSubtitle");

  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminGateEmail = document.getElementById("adminGateEmail");
  const adminGatePassword = document.getElementById("adminGatePassword");
  const adminGateErrorMsg = document.getElementById("adminGateErrorMsg");

  const adminRegisterForm = document.getElementById("adminRegisterForm");
  const adminRegName = document.getElementById("adminRegName");
  const adminRegEmail = document.getElementById("adminRegEmail");
  const adminRegPassword = document.getElementById("adminRegPassword");
  const adminRegPasswordConfirm = document.getElementById("adminRegPasswordConfirm");
  const adminRegErrorMsg = document.getElementById("adminRegErrorMsg");

  const btnToggleToRegister = document.getElementById("btnToggleToRegister");
  const btnToggleToLogin = document.getElementById("btnToggleToLogin");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const settingsLogoutBtnLarge = document.getElementById("settingsLogoutBtnLarge");

  // Controladores de navegación móvil en la Consola Administrativa
  const adminSidebarToggle = document.getElementById("adminSidebarToggle");
  const adminSidebarCloseBtn = document.getElementById("adminSidebarCloseBtn");
  const adminSidebarOverlay = document.getElementById("adminSidebarOverlay");

  function openAdminDrawer() {
    if (sidebarContent) {
      sidebarContent.classList.add("open");
    }
    if (adminSidebarOverlay) {
      adminSidebarOverlay.classList.add("active");
    }
    document.body.style.overflow = "hidden";
  }

  function closeAdminDrawer() {
    if (sidebarContent) {
      sidebarContent.classList.remove("open");
    }
    if (adminSidebarOverlay) {
      adminSidebarOverlay.classList.remove("active");
    }
    document.body.style.overflow = "";
  }

  window.openAdminDrawer = openAdminDrawer;
  window.closeAdminDrawer = closeAdminDrawer;

  if (adminSidebarToggle) {
    adminSidebarToggle.addEventListener("click", openAdminDrawer);
  }
  if (adminSidebarCloseBtn) {
    adminSidebarCloseBtn.addEventListener("click", closeAdminDrawer);
  }
  if (adminSidebarOverlay) {
    adminSidebarOverlay.addEventListener("click", closeAdminDrawer);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebarContent && sidebarContent.classList.contains("open")) {
      closeAdminDrawer();
    }
  });

  // Cuentas maestras predeterminadas para garantizar acceso ininterrumpido al propietario
  const DEFAULT_ADMIN_ACCOUNTS = [
    {
      id: "admin_master_julian",
      name: "Julian Ospina",
      email: "juli123@gmail.com",
      password: "admin",
      role: "Super Administrador",
      createdAt: "2026-01-01T00:00:00.000Z"
    },
    {
      id: "admin_master_tesla",
      name: "Julian Ospina",
      email: "julian.o@tesla.com",
      password: "admin",
      role: "Super Administrador",
      createdAt: "2026-01-01T00:00:00.000Z"
    }
  ];

  // Obtener cuentas registradas en el sistema local
  function getAdminAccounts() {
    let accounts = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN_ACCOUNTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          accounts = parsed.map(acc => ({
            ...acc,
            name: (acc.name || "Julian Ospina").trim(),
            email: (acc.email || "juli123@gmail.com").trim().toLowerCase(),
            password: (acc.password || "admin").trim(),
            role: acc.role || "Super Administrador"
          }));
        }
      }
    } catch (e) {
      console.warn("Error leyendo cuentas de admin:", e);
    }

    // Si aún no está la cuenta principal de Julian Ospina (juli123@gmail.com), incorporarla
    const hasJulian = accounts.some(a => a.email.toLowerCase() === "juli123@gmail.com");
    if (!hasJulian) {
      accounts.push({
        id: "admin_master_julian",
        name: "Julian Ospina",
        email: "juli123@gmail.com",
        password: "admin",
        role: "Super Administrador",
        createdAt: new Date().toISOString()
      });
      saveAdminAccounts(accounts);
    }

    // Revisar si existe cuenta sincronizada desde el showroom (index.html)
    try {
      const showroomUser = localStorage.getItem("tesla_auth_user");
      if (showroomUser) {
        const parsedUser = JSON.parse(showroomUser);
        if (parsedUser && parsedUser.email) {
          const sEmail = parsedUser.email.trim().toLowerCase();
          const existing = accounts.find(a => a.email.toLowerCase() === sEmail);
          if (!existing) {
            accounts.push({
              id: "admin_" + Date.now(),
              name: parsedUser.name || "Julian Ospina",
              email: sEmail,
              password: parsedUser.password ? parsedUser.password.trim() : "admin",
              role: "Super Administrador",
              createdAt: new Date().toISOString()
            });
            saveAdminAccounts(accounts);
          }
        }
      }
    } catch (e) {}

    // Revisar usuarios registrados en el Showroom
    try {
      const regRaw = localStorage.getItem("tesla_registered_users");
      if (regRaw) {
        const regList = JSON.parse(regRaw);
        if (Array.isArray(regList)) {
          regList.forEach(u => {
            if (u && u.email) {
              const uEmail = u.email.trim().toLowerCase();
              const existing = accounts.find(a => a.email.toLowerCase() === uEmail);
              if (!existing) {
                accounts.push({
                  id: "admin_reg_" + (u.id || Date.now()),
                  name: u.name || "Julian Ospina",
                  email: uEmail,
                  password: u.password ? u.password.trim() : "admin",
                  role: "Super Administrador",
                  createdAt: u.createdAt || new Date().toISOString()
                });
              } else if (u.password && (!existing.password || existing.password === "admin")) {
                existing.password = u.password.trim();
              }
            }
          });
        }
      }
    } catch (e) {}

    return accounts;
  }

  // Guardar cuentas de administrador
  function saveAdminAccounts(accounts) {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_ACCOUNTS, JSON.stringify(accounts));
      // Copia de seguridad en clave alternativa para máxima persistencia
      localStorage.setItem("tesla_admin_backup_accounts", JSON.stringify(accounts));
    } catch (e) {
      console.warn("Error guardando cuentas de admin:", e);
    }
  }

  // Obtener administrador con sesión activa
  function getCurrentAdmin() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_CURRENT_ADMIN);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    const accounts = getAdminAccounts();
    const julianAcc = accounts.find(a => a.email.toLowerCase() === "juli123@gmail.com");
    if (julianAcc) return julianAcc;
    if (accounts.length > 0) return accounts[0];
    return {
      name: "Julian Ospina",
      email: "juli123@gmail.com",
      role: "Super Administrador"
    };
  }

  // Establecer administrador activo y sincronizar la interfaz
  function setCurrentAdmin(admin) {
    try {
      sessionStorage.setItem(STORAGE_KEY_CURRENT_ADMIN, JSON.stringify(admin));
    } catch (e) {}
    updateAdminProfileUI(admin);
  }

  // Actualizar elementos de perfil en topbar, sidebar y ajustes
  function updateAdminProfileUI(admin) {
    if (!admin) return;
    if (elements.adminUserNameDisplay) {
      elements.adminUserNameDisplay.textContent = admin.name || "Administrador";
    }
    const avatarEl = document.querySelector(".admin-avatar");
    if (avatarEl && admin.name) {
      const words = admin.name.trim().split(/\s+/);
      const initials = words.length > 1
        ? (words[0][0] + words[1][0]).toUpperCase()
        : admin.name.substring(0, 2).toUpperCase();
      avatarEl.textContent = initials || "AD";
    }
    const settingsName = document.getElementById("settingsAdminName");
    if (settingsName) settingsName.textContent = admin.name || "Administrador";
    const settingsEmail = document.getElementById("settingsAdminEmail");
    if (settingsEmail) settingsEmail.textContent = admin.email || "";
    const settingsRole = document.getElementById("settingsAdminRole");
    if (settingsRole) settingsRole.textContent = admin.role || "Super Administrador";
  }

  // Mostrar vista de registro
  function showRegisterView(isInitialSetup = false) {
    const lView = document.getElementById("adminLoginView") || adminLoginView;
    const rView = document.getElementById("adminRegisterView") || adminRegisterView;
    if (lView) lView.style.display = "none";
    if (rView) rView.style.display = "block";
    const sub = document.getElementById("adminRegisterSubtitle") || adminRegisterSubtitle;
    if (sub) {
      if (isInitialSetup) {
        sub.innerHTML = `<span style="color: #10b981; font-weight: 700;">✓ Configuración Inicial:</span> Registra tus datos maestros para ser el único administrador con acceso exclusivo al Showroom.`;
      } else {
        sub.textContent = "Registra o actualiza tus credenciales maestras para acceder a la administración del Showroom.";
      }
    }
  }

  // Mostrar vista de login
  function showLoginView() {
    const lView = document.getElementById("adminLoginView") || adminLoginView;
    const rView = document.getElementById("adminRegisterView") || adminRegisterView;
    if (rView) rView.style.display = "none";
    if (lView) lView.style.display = "block";
    const err = document.getElementById("adminGateErrorMsg") || adminGateErrorMsg;
    if (err) err.style.display = "none";
  }

  window.showRegisterView = showRegisterView;
  window.showLoginView = showLoginView;

  // Alternar vistas
  if (btnToggleToRegister) {
    btnToggleToRegister.addEventListener("click", () => showRegisterView(false));
  }
  if (btnToggleToLogin) {
    btnToggleToLogin.addEventListener("click", showLoginView);
  }

  // Verificación de estado de autenticación
  function checkAdminAuth() {
    const isAuthed = sessionStorage.getItem("tesla_admin_auth") === "true";
    if (isAuthed) {
      if (authGate) authGate.style.display = "none";
      if (sidebarContent) sidebarContent.style.display = "flex";
      if (mainContent) mainContent.style.display = "block";
      const current = getCurrentAdmin();
      updateAdminProfileUI(current);
      loadData();
    } else {
      if (authGate) authGate.style.display = "flex";
      if (sidebarContent) sidebarContent.style.display = "none";
      if (mainContent) mainContent.style.display = "none";

      const accounts = getAdminAccounts();
      if (accounts.length === 0) {
        showRegisterView(true);
      } else {
        showLoginView();
      }
    }
  }

  // PROCESAR REGISTRO DE CUENTA DE ADMINISTRADOR
  if (adminRegisterForm) {
    adminRegisterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = adminRegName ? adminRegName.value.trim() : "";
      const email = adminRegEmail ? adminRegEmail.value.trim().toLowerCase() : "";
      const pwd = adminRegPassword ? adminRegPassword.value.trim() : "";
      const pwdConfirm = adminRegPasswordConfirm ? adminRegPasswordConfirm.value.trim() : "";

      if (!name || !email || !pwd) {
        if (adminRegErrorMsg) {
          adminRegErrorMsg.style.display = "block";
          adminRegErrorMsg.textContent = "Por favor completa todos los campos obligatorios.";
        }
        return;
      }

      if (pwd.length < 4) {
        if (adminRegErrorMsg) {
          adminRegErrorMsg.style.display = "block";
          adminRegErrorMsg.textContent = "La contraseña debe tener un mínimo de 4 caracteres.";
        }
        return;
      }

      if (pwd !== pwdConfirm) {
        if (adminRegErrorMsg) {
          adminRegErrorMsg.style.display = "block";
          adminRegErrorMsg.textContent = "Las contraseñas no coinciden. Por favor verifícalas.";
        }
        return;
      }

      let accounts = getAdminAccounts();
      const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === email);

      let targetAdmin;
      if (existingIdx >= 0) {
        // Actualizar datos de la cuenta existente
        accounts[existingIdx].name = name;
        accounts[existingIdx].password = pwd;
        targetAdmin = accounts[existingIdx];
      } else {
        targetAdmin = {
          id: "admin_" + Date.now(),
          name: name,
          email: email,
          password: pwd,
          role: "Super Administrador",
          createdAt: new Date().toISOString()
        };
        accounts.push(targetAdmin);
      }

      saveAdminAccounts(accounts);

      // Sincronizar también con lista de usuarios del showroom
      try {
        const regRaw = localStorage.getItem("tesla_registered_users");
        const regList = regRaw ? JSON.parse(regRaw) : [];
        const regIdx = regList.findIndex(u => (u.email || "").toLowerCase() === email);
        if (regIdx >= 0) {
          regList[regIdx].name = name;
          regList[regIdx].password = pwd;
        } else {
          regList.push({ id: Date.now(), name, email, password: pwd });
        }
        localStorage.setItem("tesla_registered_users", JSON.stringify(regList));
      } catch (err) {}

      // Autenticar de inmediato en sesión activa
      sessionStorage.setItem("tesla_admin_auth", "true");
      setCurrentAdmin(targetAdmin);

      if (adminRegErrorMsg) adminRegErrorMsg.style.display = "none";
      adminRegisterForm.reset();
      checkAdminAuth();
      showToast(`¡Cuenta de ${targetAdmin.role} guardada con éxito! Bienvenido, ${name}.`);
    });
  }

  // PROCESAR INICIO DE SESIÓN ADMINISTRATIVO
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const rawUser = adminGateEmail ? adminGateEmail.value.trim() : "";
      const inputUser = rawUser.toLowerCase();
      const inputPwd = adminGatePassword ? adminGatePassword.value.trim() : "";
      let accounts = getAdminAccounts();

      if (!inputUser || !inputPwd) {
        if (adminGateErrorMsg) {
          adminGateErrorMsg.style.display = "block";
          adminGateErrorMsg.textContent = "Por favor ingresa tu usuario/correo y contraseña.";
        }
        return;
      }

      // 1. Buscar coincidencia exacta por correo, nombre o usuario (prefijo de email)
      let matched = accounts.find(a => {
        const aEmail = (a.email || "").trim().toLowerCase();
        const aName = (a.name || "").trim().toLowerCase();
        const aUser = aEmail.split("@")[0];
        const aPwd = (a.password || "").trim();

        const isUserMatch = aEmail === inputUser || aName === inputUser || aUser === inputUser;
        const isPwdMatch = aPwd === inputPwd || aPwd.toLowerCase() === inputPwd.toLowerCase();
        return isUserMatch && isPwdMatch;
      });

      // 2. Comprobar si el usuario es el propietario o administrador titular (Julian)
      const isOwnerUser = inputUser === "juli123@gmail.com" ||
                          inputUser === "juli123" ||
                          inputUser === "julian.o@tesla.com" ||
                          inputUser === "julian@tesla.com" ||
                          inputUser === "julian" ||
                          inputUser === "admin" ||
                          inputUser.includes("julian") ||
                          inputUser.includes("juli") ||
                          inputUser.includes("ospina");

      // Si es el propietario con cualquier clave de 3+ caracteres, permitir acceso y actualizar contraseña
      if (!matched && isOwnerUser && inputPwd.length >= 3) {
        const existingAcc = accounts.find(a => 
          a.email.toLowerCase() === "juli123@gmail.com" || 
          a.email.toLowerCase() === inputUser ||
          a.name.toLowerCase() === "julian ospina"
        );

        if (existingAcc) {
          matched = existingAcc;
          matched.password = inputPwd;
        } else {
          matched = {
            id: "admin_master_julian",
            name: "Julian Ospina",
            email: inputUser.includes("@") ? inputUser : "juli123@gmail.com",
            password: inputPwd,
            role: "Super Administrador",
            createdAt: new Date().toISOString()
          };
          accounts.push(matched);
        }
        saveAdminAccounts(accounts);
      }

      // 3. Si el correo coincide con una cuenta registrada y la contraseña tiene al menos 4 caracteres
      if (!matched && inputPwd.length >= 4) {
        const byEmail = accounts.find(a => 
          a.email.toLowerCase() === inputUser || 
          a.email.split("@")[0] === inputUser ||
          a.name.toLowerCase() === inputUser
        );
        if (byEmail) {
          matched = byEmail;
          matched.password = inputPwd; // Actualizar contraseña para que nunca quede bloqueado
          saveAdminAccounts(accounts);
        }
      }

      // 4. Si es una cuenta nueva introducida directamente en el login con credenciales válidas
      if (!matched && inputUser.includes("@") && inputPwd.length >= 4) {
        matched = {
          id: "admin_" + Date.now(),
          name: inputUser.split("@")[0],
          email: inputUser,
          password: inputPwd,
          role: "Super Administrador",
          createdAt: new Date().toISOString()
        };
        accounts.push(matched);
        saveAdminAccounts(accounts);
      }

      if (matched) {
        sessionStorage.setItem("tesla_admin_auth", "true");
        setCurrentAdmin(matched);
        if (adminGateErrorMsg) adminGateErrorMsg.style.display = "none";
        adminLoginForm.reset();
        checkAdminAuth();
        showToast(`Acceso concedido. Bienvenido a la Consola, ${matched.name}.`);
      } else {
        if (adminGateErrorMsg) {
          adminGateErrorMsg.style.display = "block";
          adminGateErrorMsg.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 6px;">Credenciales no reconocidas en esta sesión.</div>
            <div style="font-size: 0.77rem; line-height: 1.4; color: #fecaca;">
              • Puedes <span id="clickErrToReg" style="color: #ffffff; font-weight: 700; text-decoration: underline; cursor: pointer;">Crear o Actualizar tu Cuenta de Administrador aquí</span>.<br>
              • O ingresar directamente con tu cuenta predeterminada: <strong>juli123@gmail.com</strong> (clave: <strong>admin</strong>).
            </div>
          `;
          const clickErrToReg = document.getElementById("clickErrToReg");
          if (clickErrToReg) {
            clickErrToReg.addEventListener("click", () => showRegisterView(false));
          }
        }
      }
    });
  }

  // CERRAR SESIÓN Y BLOQUEAR
  function doAdminLogout() {
    closeAdminDrawer();
    sessionStorage.removeItem("tesla_admin_auth");
    sessionStorage.removeItem(STORAGE_KEY_CURRENT_ADMIN);
    checkAdminAuth();
    showToast("Sesión administrativa cerrada y consola bloqueada.");
  }

  if (adminLogoutBtn) adminLogoutBtn.addEventListener("click", doAdminLogout);
  if (settingsLogoutBtnLarge) settingsLogoutBtnLarge.addEventListener("click", doAdminLogout);

  // AJUSTES: CAMBIAR CONTRASEÑA
  const changePasswordForm = document.getElementById("changePasswordForm");
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPwd = document.getElementById("newAdminPassword").value.trim();
      const confirmPwd = document.getElementById("confirmNewAdminPassword").value.trim();

      if (!newPwd || newPwd.length < 4) {
        showToast("La contraseña debe tener al menos 4 caracteres.", true);
        return;
      }
      if (newPwd !== confirmPwd) {
        showToast("Las contraseñas no coinciden.", true);
        return;
      }

      const current = getCurrentAdmin();
      const accounts = getAdminAccounts();
      const idx = accounts.findIndex(a => a.email.toLowerCase() === current.email.toLowerCase());
      if (idx >= 0) {
        accounts[idx].password = newPwd;
        saveAdminAccounts(accounts);
      } else {
        current.password = newPwd;
        accounts.push(current);
        saveAdminAccounts(accounts);
      }
      showToast("✓ Contraseña administrativa actualizada con éxito.");
      changePasswordForm.reset();
    });
  }

  // AJUSTES: CREAR ADMINISTRADOR ADICIONAL
  const createAdditionalAdminForm = document.getElementById("createAdditionalAdminForm");
  if (createAdditionalAdminForm) {
    createAdditionalAdminForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("addAdminName").value.trim();
      const email = document.getElementById("addAdminEmail").value.trim().toLowerCase();
      const pwd = document.getElementById("addAdminPassword").value.trim();

      if (!name || !email || !pwd) {
        showToast("Completa todos los campos obligatorios.", true);
        return;
      }
      const accounts = getAdminAccounts();
      if (accounts.some(a => a.email.toLowerCase() === email)) {
        showToast("Ya existe un administrador con ese correo.", true);
        return;
      }
      accounts.push({
        id: "admin_" + Date.now(),
        name,
        email,
        password: pwd,
        role: "Administrador",
        createdAt: new Date().toISOString()
      });
      saveAdminAccounts(accounts);
      showToast(`Administrador "${name}" registrado correctamente.`);
      createAdditionalAdminForm.reset();
    });
  }

  // AJUSTES: GUARDAR PREFERENCIAS DEL SHOWROOM
  const saveShowroomSettingsBtn = document.getElementById("saveShowroomSettingsBtn");
  if (saveShowroomSettingsBtn) {
    saveShowroomSettingsBtn.addEventListener("click", () => {
      showToast("Preferencias del Showroom guardadas correctamente.");
    });
  }

  // SINCRONIZACIÓN EN TIEMPO REAL: Recibir solicitudes de experiencia de manejo al instante
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      syncChannel.onmessage = (event) => {
        if (event.data && event.data.type === "NEW_LEAD" && event.data.lead) {
          const newLead = event.data.lead;
          if (!state.leads.some(l => l.id === newLead.id)) {
            state.leads.unshift(newLead);
            saveLocalLeads(state.leads);
            renderDashboard();
            renderLeadsTable();
            showToast(`🔔 ¡Nueva solicitud radicada! [${newLead.id}] de ${newLead.name}`);
          }
        }
        if (event.data && event.data.type === "DELETE_LEAD" && event.data.leadId) {
          state.leads = state.leads.filter(l => l.id !== event.data.leadId && l.radicado !== event.data.leadId);
          saveLocalLeads(state.leads);
          renderDashboard();
          renderLeadsTable();
        }
        if (event.data && event.data.type === "NEW_PURCHASE_ORDER" && event.data.order) {
          const newOrder = event.data.order;
          if (!state.purchases.some(p => p.orderNum === newOrder.orderNum)) {
            state.purchases.unshift(newOrder);
            saveLocalPurchases(state.purchases);
            renderDashboard();
            renderPurchasesCards();
          }
        }
        if (event.data && event.data.type === "PURCHASES_UPDATED" && Array.isArray(event.data.purchases)) {
          state.purchases = event.data.purchases;
          renderDashboard();
          renderPurchasesCards();
        }
      };
    }
  } catch (e) {}

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY_LEADS && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (Array.isArray(updated)) {
          state.leads = updated;
          renderDashboard();
          renderLeadsTable();
        }
      } catch (err) {}
    }
    if (e.key === STORAGE_KEY_PURCHASES && e.newValue) {
      try {
        const updated = JSON.parse(e.newValue);
        if (Array.isArray(updated)) {
          state.purchases = updated;
          renderDashboard();
          renderPurchasesCards();
        }
      } catch (err) {}
    }
  });

  // Modo oscuro permanente en la consola administrativa
  try {
    localStorage.removeItem("tesla_admin_theme");
    document.documentElement.removeAttribute("data-admin-theme");
  } catch (e) {}

  // Iniciar verificación de seguridad
  checkAdminAuth();
});
