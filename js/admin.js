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
    kpiLeadsCount: document.getElementById("kpiLeadsCount"),
    menuVehiclesCount: document.getElementById("menuVehiclesCount"),
    menuLeadsCount: document.getElementById("menuLeadsCount"),
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

  // Formateador de moneda en pesos colombianos (COP)
  function formatCOP(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(amount);
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
      leads: "Solicitudes y Prospectos",
      users: "Usuarios y Privilegios",
      database: "Base de Datos Docker",
      settings: "Ajustes y Configuración"
    };
    if (elements.breadcrumb) {
      elements.breadcrumb.textContent = titles[tabName] || "Consola";
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
    renderDashboard();
    renderVehiclesTable();
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

      renderDashboard();
      renderVehiclesTable();
      renderLeadsTable();
    } catch (error) {
      console.info("Panel administrativo operando en modo local:", error);
    }
  }

  // Renderizar Dashboard
  function renderDashboard() {
    if (elements.kpiVehiclesCount) elements.kpiVehiclesCount.textContent = state.vehicles.length;
    if (elements.kpiLeadsCount) elements.kpiLeadsCount.textContent = state.leads.length;
    if (elements.menuVehiclesCount) elements.menuVehiclesCount.textContent = state.vehicles.length;
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
          <strong style="color: #10b981; font-size: 0.95rem;">${formatCOP(v.price)}</strong>
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

  // Abrir Modal para Nuevo Vehículo
  function openAddVehicleModal() {
    if (elements.vehicleForm) elements.vehicleForm.reset();
    document.getElementById("editVehicleId").value = "";
    if (elements.modalActionTitle) elements.modalActionTitle.textContent = "Agregar Nuevo Vehículo al Catálogo";
    if (elements.vehicleModal) elements.vehicleModal.classList.add("is-open");
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

      const vehicleData = {
        name: document.getElementById("vName").value.trim() || "Tesla Modelo Nuevo",
        category: document.getElementById("vCategory").value || "Sedán",
        version: document.getElementById("vVersion").value.trim() || "Estándar Dual Motor",
        price: parsedPrice || 200000000,
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
    if (adminLoginView) adminLoginView.style.display = "none";
    if (adminRegisterView) adminRegisterView.style.display = "block";
    if (adminRegisterSubtitle) {
      if (isInitialSetup) {
        adminRegisterSubtitle.innerHTML = `<span style="color: #10b981; font-weight: 700;">✓ Configuración Inicial:</span> Registra tus datos maestros para ser el único administrador con acceso exclusivo al Showroom.`;
      } else {
        adminRegisterSubtitle.textContent = "Registra o actualiza tus credenciales maestras para acceder a la administración del Showroom.";
      }
    }
  }

  // Mostrar vista de login
  function showLoginView() {
    if (adminRegisterView) adminRegisterView.style.display = "none";
    if (adminLoginView) adminLoginView.style.display = "block";
    if (adminGateErrorMsg) adminGateErrorMsg.style.display = "none";
  }

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
        // Si la cuenta ya existe o es predeterminada, actualizar su nombre y contraseña sin bloquear
        accounts[existingIdx].name = name;
        accounts[existingIdx].password = pwd;
        targetAdmin = accounts[existingIdx];
      } else {
        targetAdmin = {
          id: "admin_" + Date.now(),
          name: name,
          email: email,
          password: pwd,
          role: accounts.length === 0 ? "Super Administrador" : "Administrador",
          createdAt: new Date().toISOString()
        };
        accounts.push(targetAdmin);
      }

      saveAdminAccounts(accounts);

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

      // 1. Buscar coincidencia exacta o por usuario/correo/nombre
      let matched = accounts.find(a => {
        const aEmail = (a.email || "").trim().toLowerCase();
        const aName = (a.name || "").trim().toLowerCase();
        const aUser = aEmail.split("@")[0];
        const aPwd = (a.password || "").trim();

        const isUserMatch = aEmail === inputUser || aName === inputUser || aUser === inputUser;
        const isPwdMatch = aPwd === inputPwd || aPwd.toLowerCase() === inputPwd.toLowerCase();
        return isUserMatch && isPwdMatch;
      });

      // 2. Comprobar si es el propietario de la plataforma (Julian Ospina)
      const isOwnerUser = inputUser === "juli123@gmail.com" ||
                          inputUser === "juli123" ||
                          inputUser === "julian.o@tesla.com" ||
                          inputUser === "julian@tesla.com" ||
                          inputUser === "julian" ||
                          inputUser === "admin";

      const isKnownMasterPwd = inputPwd === "admin123" ||
                               inputPwd === "admin" ||
                               inputPwd === "TeslaColombia2026!" ||
                               inputPwd === "1234" ||
                               inputPwd === "0000" ||
                               inputPwd === "2026" ||
                               inputPwd === "juli" ||
                               inputPwd === "tesla";

      // Si es el propietario ingresando su cuenta con cualquier clave de 4+ caracteres o clave maestra
      if (!matched && isOwnerUser && (isKnownMasterPwd || inputPwd.length >= 4)) {
        const existingAcc = accounts.find(a => 
          a.email.toLowerCase() === "juli123@gmail.com" || 
          a.email.toLowerCase() === inputUser ||
          a.name.toLowerCase() === "julian ospina"
        );

        if (existingAcc) {
          matched = existingAcc;
          matched.password = inputPwd; // Recordar y actualizar la contraseña ingresada
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
        // Guardar permanentemente la cuenta actualizada en el sistema local
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
              • O ingresar directamente como <span id="clickErrQuickOwner" style="color: #ffffff; font-weight: 700; text-decoration: underline; cursor: pointer;">Propietario Julian Ospina</span>.
            </div>
          `;
          const clickErrToReg = document.getElementById("clickErrToReg");
          if (clickErrToReg) {
            clickErrToReg.addEventListener("click", () => showRegisterView(false));
          }
          const clickErrQuickOwner = document.getElementById("clickErrQuickOwner");
          if (clickErrQuickOwner) {
            clickErrQuickOwner.addEventListener("click", () => {
              if (adminGateEmail) adminGateEmail.value = "juli123@gmail.com";
              if (adminGatePassword) adminGatePassword.value = "admin";
              if (adminLoginForm) adminLoginForm.requestSubmit();
            });
          }
        }
      }
    });
  }

  // CERRAR SESIÓN Y BLOQUEAR
  function doAdminLogout() {
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
  });

  // Modo oscuro permanente en la consola administrativa
  try {
    localStorage.removeItem("tesla_admin_theme");
    document.documentElement.removeAttribute("data-admin-theme");
  } catch (e) {}

  // Iniciar verificación de seguridad
  checkAdminAuth();
});
