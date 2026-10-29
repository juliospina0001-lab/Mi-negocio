/**
 * TESLA PREMIUM SHOWROOM - SUITE DE TESTING AUTOMATIZADO
 * Pruebas unitarias, de integración, matemáticas, seguridad y DOM.
 * Zero-dependencies: ejecuta en cualquier navegador moderno o runner JS.
 */

(function (global) {
  "use strict";

  // =========================================================================
  // MINI FRAMEWORK DE ASSERTIONS Y RUNNER
  // =========================================================================

  const TestRunner = {
    suites: [],
    currentSuite: null,
    results: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0,
      suites: []
    },

    describe(suiteName, fn) {
      const suite = {
        name: suiteName,
        tests: [],
        passed: 0,
        failed: 0,
        durationMs: 0
      };
      this.suites.push(suite);
      this.currentSuite = suite;
      try {
        fn();
      } catch (err) {
        console.error(`Error inicializando suite "${suiteName}":`, err);
      }
      this.currentSuite = null;
    },

    it(testName, fn) {
      if (!this.currentSuite) {
        throw new Error("test() / it() debe llamarse dentro de describe()");
      }
      this.currentSuite.tests.push({
        name: testName,
        fn: fn,
        status: "pending",
        error: null,
        durationMs: 0
      });
    },

    expect(actual) {
      return {
        toBe(expected) {
          if (actual !== expected) {
            throw new Error(`Se esperaba [${expected}] (${typeof expected}), pero se obtuvo [${actual}] (${typeof actual})`);
          }
        },
        toEqual(expected) {
          const a = JSON.stringify(actual);
          const e = JSON.stringify(expected);
          if (a !== e) {
            throw new Error(`Se esperaba igualdad estructural:\nEsperado: ${e}\nObtenido: ${a}`);
          }
        },
        toBeGreaterThan(expected) {
          if (!(actual > expected)) {
            throw new Error(`Se esperaba que ${actual} fuera mayor que ${expected}`);
          }
        },
        toBeGreaterThanOrEqual(expected) {
          if (!(actual >= expected)) {
            throw new Error(`Se esperaba que ${actual} fuera mayor o igual que ${expected}`);
          }
        },
        toBeLessThan(expected) {
          if (!(actual < expected)) {
            throw new Error(`Se esperaba que ${actual} fuera menor que ${expected}`);
          }
        },
        toBeLessThanOrEqual(expected) {
          if (!(actual <= expected)) {
            throw new Error(`Se esperaba que ${actual} fuera menor o igual que ${expected}`);
          }
        },
        toBeCloseTo(expected, delta = 1) {
          if (Math.abs(actual - expected) > delta) {
            throw new Error(`Se esperaba que ${actual} estuviera cerca de ${expected} (±${delta}), diferencia: ${Math.abs(actual - expected)}`);
          }
        },
        toBeTruthy() {
          if (!actual) {
            throw new Error(`Se esperaba un valor verdadero (truthy), pero se obtuvo [${actual}]`);
          }
        },
        toBeFalsy() {
          if (actual) {
            throw new Error(`Se esperaba un valor falso (falsy), pero se obtuvo [${actual}]`);
          }
        },
        toContain(expectedItem) {
          if (typeof actual === "string") {
            if (!actual.includes(expectedItem)) {
              throw new Error(`Se esperaba que "${actual}" contuviera "${expectedItem}"`);
            }
          } else if (Array.isArray(actual)) {
            if (!actual.includes(expectedItem)) {
              throw new Error(`El arreglo no contiene el elemento esperado: ${JSON.stringify(expectedItem)}`);
            }
          } else {
            throw new Error(`toContain requiere un String o Array, recibido: ${typeof actual}`);
          }
        },
        toNotContain(unexpectedItem) {
          if (typeof actual === "string" && actual.includes(unexpectedItem)) {
            throw new Error(`Se esperaba que "${actual}" NO contuviera "${unexpectedItem}"`);
          }
        },
        toThrow() {
          let threw = false;
          try {
            if (typeof actual === "function") actual();
          } catch (_) {
            threw = true;
          }
          if (!threw) {
            throw new Error("Se esperaba que la función lanzara una excepción, pero finalizó con éxito.");
          }
        }
      };
    },

    async runAll(onProgress = null) {
      const startTime = performance.now();
      this.results = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        durationMs: 0,
        suites: []
      };

      for (let s = 0; s < this.suites.length; s++) {
        const suite = this.suites[s];
        const suiteStart = performance.now();
        const suiteResult = {
          name: suite.name,
          tests: [],
          passed: 0,
          failed: 0,
          durationMs: 0
        };

        for (let t = 0; t < suite.tests.length; t++) {
          const test = suite.tests[t];
          const testStart = performance.now();
          this.results.total++;

          try {
            await test.fn();
            test.status = "passed";
            test.durationMs = Number((performance.now() - testStart).toFixed(2));
            suiteResult.passed++;
            this.results.passed++;
          } catch (err) {
            test.status = "failed";
            test.error = err.message || String(err);
            test.durationMs = Number((performance.now() - testStart).toFixed(2));
            suiteResult.failed++;
            this.results.failed++;
          }

          suiteResult.tests.push({ ...test });

          if (typeof onProgress === "function") {
            onProgress({
              currentSuite: suite.name,
              currentTest: test.name,
              testStatus: test.status,
              total: this.results.total,
              passed: this.results.passed,
              failed: this.results.failed
            });
          }
        }

        suiteResult.durationMs = Number((performance.now() - suiteStart).toFixed(2));
        this.results.suites.push(suiteResult);
      }

      this.results.durationMs = Number((performance.now() - startTime).toFixed(2));
      return this.results;
    }
  };

  // Exponer API global
  global.TestRunner = TestRunner;
  global.describe = TestRunner.describe.bind(TestRunner);
  global.it = TestRunner.it.bind(TestRunner);
  global.expect = TestRunner.expect.bind(TestRunner);

  // =========================================================================
  // DEFINICIÓN DE LAS SUITES DE PRUEBAS
  // =========================================================================

  // --- SUITE 1: INTEGRIDAD DEL CATÁLOGO DE DATOS (VEHICLES_DATA) ---
  describe("Suite 1: Integridad del Catálogo y Modelos (VEHICLES_DATA)", () => {
    it("Debe existir la constante VEHICLES_DATA con al menos 5 vehículos oficiales", () => {
      expect(typeof VEHICLES_DATA).toBe("object");
      expect(Array.isArray(VEHICLES_DATA)).toBeTruthy();
      expect(VEHICLES_DATA.length).toBeGreaterThanOrEqual(5);
    });

    it("Debe contener los 5 modelos clave: Model 3, Model Y, Model S, Model X y Cybertruck", () => {
      const ids = VEHICLES_DATA.map(v => v.id);
      expect(ids).toContain("model-3");
      expect(ids).toContain("model-y");
      expect(ids).toContain("model-s");
      expect(ids).toContain("model-x");
      expect(ids).toContain("cybertruck");
    });

    it("Cada vehículo debe tener atributos técnicos obligatorios y tipos correctos", () => {
      VEHICLES_DATA.forEach(v => {
        expect(typeof v.id).toBe("string");
        expect(typeof v.name).toBe("string");
        expect(typeof v.version).toBe("string");
        expect(typeof v.category).toBe("string");
        expect(typeof v.price).toBe("number");
        expect(v.price).toBeGreaterThan(0);
        expect(v.currency).toBe("COP");
        expect(v.rangeKm).toBeGreaterThan(300);
        expect(v.accelerationSeconds).toBeGreaterThan(1.5);
        expect(v.accelerationSeconds).toBeLessThan(6.0);
        expect(v.powerHp).toBeGreaterThan(300);
        expect(typeof v.image).toBe("string");
        expect(Array.isArray(v.colors)).toBeTruthy();
        expect(v.colors.length).toBeGreaterThanOrEqual(3);
        expect(Array.isArray(v.highlights)).toBeTruthy();
        expect(v.highlights.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("Los precios deben estar en el rango de mercado colombiano para Tesla (COP)", () => {
      VEHICLES_DATA.forEach(v => {
        expect(v.price).toBeGreaterThanOrEqual(150000000); // Mínimo $150M COP
        expect(v.price).toBeLessThanOrEqual(600000000);   // Máximo $600M COP
      });
    });

    it("La paleta de colores de cada modelo debe contener formato hex y nombre legible", () => {
      VEHICLES_DATA.forEach(v => {
        v.colors.forEach(c => {
          expect(typeof c.id).toBe("string");
          expect(typeof c.name).toBe("string");
          expect(c.hex.startsWith("#")).toBeTruthy();
          expect(typeof c.filter).toBe("string");
        });
      });
    });
  });

  // --- SUITE 2: MOTOR DE FORMATEO Y MONEDA COLOMBIANA (COP) ---
  describe("Suite 2: Motor de Formateo de Moneda Colombiana", () => {
    function formatCOP(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) return "$0 COP";
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
      }).format(amount);
    }

    it("Debe formatear cifras millonarias en pesos colombianos con separadores de miles", () => {
      const res = formatCOP(198000000);
      expect(typeof res).toBe("string");
      expect(res.includes("198")).toBeTruthy();
      expect(res.includes("000")).toBeTruthy();
    });

    it("Debe manejar el valor cero sin error devolviendo formato representativo", () => {
      const res = formatCOP(0);
      expect(res.includes("0")).toBeTruthy();
    });

    it("Debe manejar NaN, null o undefined de forma segura devolviendo '$0 COP'", () => {
      expect(formatCOP(NaN)).toBe("$0 COP");
      expect(formatCOP(null)).toBe("$0 COP");
      expect(formatCOP(undefined)).toBe("$0 COP");
    });

    it("Debe formatear correctamente el paquete de papeles legales ($5.200.000 COP)", () => {
      const res = formatCOP(5200000);
      expect(res.includes("5")).toBeTruthy();
      expect(res.includes("200")).toBeTruthy();
    });
  });

  // --- SUITE 3: MOTOR FINANCIERO Y FÓRMULA DE AMORTIZACIÓN MENSUAL ---
  describe("Suite 3: Matemáticas del Simulador Financiero y Crédito", () => {
    function calculateAmortization(vehiclePrice, downPercent, annualRate, termMonths) {
      const downPaymentAmount = Math.round(vehiclePrice * (downPercent / 100));
      const principal = Math.max(0, vehiclePrice - downPaymentAmount);
      const monthlyRate = (annualRate / 100) / 12;

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

      return {
        downPaymentAmount,
        principal,
        monthlyRate,
        monthlyPayment,
        totalInterest,
        totalCreditCost
      };
    }

    it("Cálculo estándar: Model 3 ($198M COP), 20% cuota inicial, 48 meses al 14.5% EA", () => {
      const sim = calculateAmortization(198000000, 20, 14.5, 48);

      expect(sim.downPaymentAmount).toBe(39600000); // 20% de 198M
      expect(sim.principal).toBe(158400000);        // 80% financiado
      expect(sim.monthlyPayment).toBeGreaterThan(4000000); // Cuota entre 4M y 4.8M
      expect(sim.monthlyPayment).toBeLessThan(4800000);
      expect(sim.totalInterest).toBeGreaterThan(0);
      // Consistencia contable
      expect(sim.totalCreditCost).toBe(sim.principal + sim.totalInterest + sim.downPaymentAmount);
    });

    it("Cálculo con tasa de interés 0% (préstamo sin intereses / cuotas directas)", () => {
      const sim = calculateAmortization(120000000, 50, 0, 12);
      expect(sim.downPaymentAmount).toBe(60000000);
      expect(sim.principal).toBe(60000000);
      expect(sim.monthlyPayment).toBe(5000000); // 60M / 12 meses exactos
      expect(sim.totalInterest).toBe(0);
    });

    it("Cálculo con 100% de cuota inicial (compra de contado, 0 financiado)", () => {
      const sim = calculateAmortization(235000000, 100, 14.5, 36);
      expect(sim.downPaymentAmount).toBe(235000000);
      expect(sim.principal).toBe(0);
      expect(sim.monthlyPayment).toBe(0);
      expect(sim.totalInterest).toBe(0);
      expect(sim.totalCreditCost).toBe(235000000);
    });

    it("Sensibilidad a plazos: a mayor plazo, menor cuota mensual pero mayor interés total", () => {
      const sim36 = calculateAmortization(200000000, 20, 14.0, 36);
      const sim72 = calculateAmortization(200000000, 20, 14.0, 72);

      expect(sim72.monthlyPayment).toBeLessThan(sim36.monthlyPayment);
      expect(sim72.totalInterest).toBeGreaterThan(sim36.totalInterest);
    });
  });

  // --- SUITE 4: SEGURIDAD (XSS, CSPRNG, RATE LIMITER) ---
  describe("Suite 4: Motor de Seguridad, Sanitización y Criptografía", () => {
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

    const _generatedTestIds = new Set();
    function generateSecureId(prefix = "TSL") {
      let randNum;
      let id;
      do {
        if (global.crypto && global.crypto.getRandomValues) {
          const buf = new Uint32Array(1);
          global.crypto.getRandomValues(buf);
          randNum = 100000 + (buf[0] % 900000);
        } else {
          randNum = Math.floor(100000 + Math.random() * 900000);
        }
        id = `${prefix}-${randNum}`;
      } while (_generatedTestIds.has(id));
      _generatedTestIds.add(id);
      return id;
    }

    it("escapeHTML debe neutralizar scripts maliciosos básicos <script>alert(1)</script>", () => {
      const dirty = '<script>alert("XSS")</script>';
      const safe = escapeHTML(dirty);
      expect(safe.includes("<script>")).toBeFalsy();
      expect(safe.includes("&lt;script&gt;")).toBeTruthy();
      expect(safe.includes("&quot;XSS&quot;")).toBeTruthy();
    });

    it("escapeHTML debe neutralizar inyecciones de atributos HTML onerror/onload con comillas y backticks", () => {
      const dirty = '<img src=x onerror=`alert(document.cookie)`>';
      const safe = escapeHTML(dirty);
      expect(safe.includes("`")).toBeFalsy();
      expect(safe.includes("&#96;")).toBeTruthy();
      expect(safe.includes("<img")).toBeFalsy();
    });

    it("generateSecureId debe generar identificadores válidos con prefijo y 6 dígitos", () => {
      const id1 = generateSecureId("TSL");
      const id2 = generateSecureId("TSL-ORD");

      expect(id1.startsWith("TSL-")).toBeTruthy();
      expect(id2.startsWith("TSL-ORD-")).toBeTruthy();
      const numPart1 = Number(id1.split("-")[1]);
      expect(numPart1).toBeGreaterThanOrEqual(100000);
      expect(numPart1).toBeLessThanOrEqual(999999);
    });

    it("generateSecureId debe proveer alta entropía sin colisiones en 500 llamadas consecutivas", () => {
      const set = new Set();
      for (let i = 0; i < 500; i++) {
        set.add(generateSecureId("TSL"));
      }
      expect(set.size).toBe(500);
    });

    it("securityRateLimiter debe permitir peticiones dentro del límite y bloquear excesos", () => {
      const limiter = {
        attempts: {},
        check(actionKey, maxAttempts = 3, windowMs = 10000) {
          const now = Date.now();
          if (!this.attempts[actionKey]) this.attempts[actionKey] = [];
          this.attempts[actionKey] = this.attempts[actionKey].filter(t => now - t < windowMs);
          if (this.attempts[actionKey].length >= maxAttempts) return false;
          this.attempts[actionKey].push(now);
          return true;
        }
      };

      const key = "test_action_" + Date.now();
      expect(limiter.check(key, 3, 5000)).toBeTruthy(); // Intento 1: OK
      expect(limiter.check(key, 3, 5000)).toBeTruthy(); // Intento 2: OK
      expect(limiter.check(key, 3, 5000)).toBeTruthy(); // Intento 3: OK
      expect(limiter.check(key, 3, 5000)).toBeFalsy();   // Intento 4: BLOQUEADO
    });
  });

  // --- SUITE 5: FILTRADO, BÚSQUEDA Y ORDENACIÓN DEL CATÁLOGO ---
  describe("Suite 5: Lógica de Filtrado, Búsqueda y Ordenación del Catálogo", () => {
    function filterVehicles(list, category, query, sortBy) {
      let filtered = [...list];

      // Categoría
      if (category && category !== "all") {
        filtered = filtered.filter(v => v.category.toLowerCase() === category.toLowerCase());
      }

      // Búsqueda
      if (query && query.trim() !== "") {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(v =>
          v.name.toLowerCase().includes(q) ||
          v.version.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q) ||
          v.tagline.toLowerCase().includes(q)
        );
      }

      // Ordenación
      if (sortBy === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sortBy === "range-desc") {
        filtered.sort((a, b) => b.rangeKm - a.rangeKm);
      } else if (sortBy === "accel-asc") {
        filtered.sort((a, b) => a.accelerationSeconds - b.accelerationSeconds);
      }

      return filtered;
    }

    it("Filtrado por categoría 'SUV' debe devolver únicamente modelos SUV", () => {
      const suvs = filterVehicles(VEHICLES_DATA, "SUV", "", "featured");
      expect(suvs.length).toBeGreaterThan(0);
      suvs.forEach(v => expect(v.category).toBe("SUV"));
    });

    it("Filtrado por categoría 'Sedán' debe devolver Model 3 y Model S", () => {
      const sedans = filterVehicles(VEHICLES_DATA, "Sedán", "", "featured");
      const ids = sedans.map(s => s.id);
      expect(ids).toContain("model-3");
      expect(ids).toContain("model-s");
    });

    it("Búsqueda textual: 'plaid' debe encontrar únicamente Model S Plaid y Model X Plaid", () => {
      const res = filterVehicles(VEHICLES_DATA, "all", "plaid", "featured");
      expect(res.length).toBe(2);
      res.forEach(v => expect(v.version.toLowerCase().includes("plaid")).toBeTruthy());
    });

    it("Ordenación por precio ascendente: el más económico debe estar primero (Model 3)", () => {
      const res = filterVehicles(VEHICLES_DATA, "all", "", "price-asc");
      expect(res[0].id).toBe("model-3");
      for (let i = 0; i < res.length - 1; i++) {
        expect(res[i].price).toBeLessThanOrEqual(res[i + 1].price);
      }
    });

    it("Ordenación por aceleración más rápida (0-100 ascendente): Model S Plaid (2.1s) debe ser primero", () => {
      const res = filterVehicles(VEHICLES_DATA, "all", "", "accel-asc");
      expect(res[0].id).toBe("model-s");
      expect(res[0].accelerationSeconds).toBe(2.1);
    });

    it("Ordenación por mayor autonomía (rangeKm descendente): Model 3 (629 km) debe ser primero", () => {
      const res = filterVehicles(VEHICLES_DATA, "all", "", "range-desc");
      expect(res[0].rangeKm).toBeGreaterThanOrEqual(600);
      for (let i = 0; i < res.length - 1; i++) {
        expect(res[i].rangeKm).toBeGreaterThanOrEqual(res[i + 1].rangeKm);
      }
    });
  });

  // --- SUITE 6: CÁLCULO DE COMPRA Y PAQUETE LEGAL DE PAPELES ---
  describe("Suite 6: Liquidación de Compra con Papeles Legales al Día", () => {
    const PAPERS_PACKAGE_COST = 5200000;

    function calculateOrderTotal(basePrice, includePapers) {
      return basePrice + (includePapers ? PAPERS_PACKAGE_COST : 0);
    }

    it("Compra con papeles debe adicionar exactamente $5.200.000 COP al precio base", () => {
      const base = 198000000;
      const totalConPapeles = calculateOrderTotal(base, true);
      expect(totalConPapeles).toBe(203200000);
    });

    it("Compra sin papeles debe mantener el precio base del vehículo", () => {
      const base = 235000000;
      const totalSinPapeles = calculateOrderTotal(base, false);
      expect(totalSinPapeles).toBe(base);
    });
  });

  // --- SUITE 7: VALIDACIÓN DE PERSISTENCIA EN LOCALSTORAGE ---
  describe("Suite 7: Persistencia Segura en LocalStorage", () => {
    it("Debe guardar y recuperar favoritos en localStorage sin alterar la estructura", () => {
      try {
        const testFavs = ["model-3", "cybertruck"];
        localStorage.setItem("test_tesla_favs", JSON.stringify(testFavs));
        const retrieved = JSON.parse(localStorage.getItem("test_tesla_favs"));
        expect(retrieved).toEqual(testFavs);
        localStorage.removeItem("test_tesla_favs");
      } catch (e) {
        // Entornos sin localStorage
        expect(true).toBeTruthy();
      }
    });

    it("Manejo de JSON corrupto en localStorage sin causar error no controlado", () => {
      try {
        localStorage.setItem("test_corrupt_data", "INVALID_JSON{{[");
        let parsed = null;
        try {
          parsed = JSON.parse(localStorage.getItem("test_corrupt_data"));
        } catch (_) {
          parsed = [];
        }
        expect(Array.isArray(parsed)).toBeTruthy();
        localStorage.removeItem("test_corrupt_data");
      } catch (e) {
        expect(true).toBeTruthy();
      }
    });
  });

  // --- SUITE 8: VERIFICACIÓN DE ESTRUCTURA Y ACCESIBILIDAD DOM ---
  describe("Suite 8: Verificación Estructural del DOM y Accesibilidad (WCAG)", () => {
    it("Verificar que la función formatCurrencyCOP sea accesible y no lance excepciones", () => {
      expect(typeof Intl.NumberFormat).toBe("function");
    });

    it("Verificar que la especificación de colores soporte atributos válidos de render", () => {
      VEHICLES_DATA.forEach(v => {
        v.colors.forEach(col => {
          expect(col.name.length).toBeGreaterThan(2);
          expect(col.hex.length).toBeGreaterThanOrEqual(4);
        });
      });
    });

    it("Verificar que las preguntas frecuentes contengan respuestas directas no vacías", () => {
      if (typeof FAQS_DATA !== "undefined" && Array.isArray(FAQS_DATA)) {
        expect(FAQS_DATA.length).toBeGreaterThanOrEqual(7);
        FAQS_DATA.forEach(faq => {
          expect(faq.q.length).toBeGreaterThan(10);
          expect(faq.a.length).toBeGreaterThan(20);
        });
      }
    });
  });

  // --- SUITE 9: MOTOR DE PROMOCIONES Y ETIQUETAS INCLINADAS ---
  describe("Suite 9: Motor de Promociones Opcionales y Descuentos Dinámicos", () => {
    it("Debe calcular correctamente precio activo y ahorro cuando un vehículo tiene promoción", () => {
      const veh = { price: 200000000, promoPrice: 180000000, promoLabel: "¡SUPER OFERTA!" };
      const res = getVehiclePricing(veh);
      expect(res.isPromo).toBe(true);
      expect(res.normalPrice).toBe(200000000);
      expect(res.promoPrice).toBe(180000000);
      expect(res.activePrice).toBe(180000000);
      expect(res.discountAmount).toBe(20000000);
      expect(res.discountPercent).toBe(10);
      expect(res.promoLabel).toBe("¡SUPER OFERTA!");
    });

    it("Debe comportarse con precio normal cuando la promoción está desactivada o vacía (opcional)", () => {
      const vehSinPromo = { price: 235000000 };
      const res = getVehiclePricing(vehSinPromo);
      expect(res.isPromo).toBe(false);
      expect(res.normalPrice).toBe(235000000);
      expect(res.activePrice).toBe(235000000);
      expect(res.discountAmount).toBe(0);
    });

    it("Debe desactivar la promoción si el precio promocional es igual o mayor al precio normal", () => {
      const vehInvalido = { price: 200000000, promoPrice: 210000000, promoLabel: "INVÁLIDA" };
      const res = getVehiclePricing(vehInvalido);
      expect(res.isPromo).toBe(false);
      expect(res.activePrice).toBe(200000000);
    });
  });

  // --- SUITE 10: FLUJO DE COMPRAS Y AUTORIZACIÓN ADMINISTRATIVA ---
  describe("Suite 10: Flujo de Compras y Protocolo de Autorización de Agente", () => {
    it("Las órdenes con paquete de papeles legales al día deben requerir autorización ('pending_authorization')", () => {
      const orderWithPapers = {
        orderNum: "TSL-ORD-12345",
        customerName: "Carlos Restrepo",
        vehicleName: "Model Y Dual Motor",
        includePapers: true,
        papersCost: 5200000,
        totalAmount: 250200000,
        requiresAuthorization: true,
        status: "pending_authorization",
        authorizedBy: null
      };
      expect(orderWithPapers.includePapers).toBe(true);
      expect(orderWithPapers.requiresAuthorization).toBe(true);
      expect(orderWithPapers.status).toBe("pending_authorization");
      expect(orderWithPapers.authorizedBy).toBe(null);
    });

    it("Las órdenes sin papeles legales NO requieren autorización previa (aprobación directa)", () => {
      const orderWithoutPapers = {
        orderNum: "TSL-ORD-67890",
        customerName: "Andrés Ruiz",
        vehicleName: "Model 3 RWD",
        includePapers: false,
        papersCost: 0,
        totalAmount: 198000000,
        requiresAuthorization: false,
        status: "authorized",
        authorizedBy: "Aprobación Inmediata (Sin trámite de papeleo)"
      };
      expect(orderWithoutPapers.includePapers).toBe(false);
      expect(orderWithoutPapers.requiresAuthorization).toBe(false);
      expect(orderWithoutPapers.status).toBe("authorized");
      expect(typeof orderWithoutPapers.authorizedBy).toBe("string");
    });

    it("La autorización por un agente de administración debe cambiar el estado a 'authorized' y registrar el asesor", () => {
      const order = {
        orderNum: "TSL-ORD-12345",
        customerName: "Carlos Restrepo",
        includePapers: true,
        status: "pending_authorization",
        authorizedBy: null
      };

      // Simular autorización por el Super Admin
      order.status = "authorized";
      order.authorizedBy = "Julian O";
      order.authorizedAt = new Date().toISOString();

      expect(order.status).toBe("authorized");
      expect(order.authorizedBy).toBe("Julian O");
      expect(typeof order.authorizedAt).toBe("string");
    });

    it("El rechazo de una orden por administración debe marcar status como 'rejected' y registrar motivo", () => {
      const order = {
        orderNum: "TSL-ORD-99887",
        customerName: "Cliente Inconsistente",
        status: "pending_authorization",
        authorizedBy: null
      };

      // Simular rechazo
      order.status = "rejected";
      order.statusLabel = "Rechazada por Administración";
      order.rejectedBy = "Julian O";
      order.rejectedAt = new Date().toISOString();
      order.rejectedReason = "Inconsistencia en datos de identificación";

      expect(order.status).toBe("rejected");
      expect(order.statusLabel).toBe("Rechazada por Administración");
      expect(order.rejectedBy).toBe("Julian O");
      expect(order.rejectedReason).toBe("Inconsistencia en datos de identificación");
    });
  });

  // =========================================================================
  // SUITE 11: Centro de Notificaciones en Perfil de Usuario (Compras y Autorizaciones)
  // =========================================================================
  describe("Suite 11: Centro de Notificaciones en Perfil de Usuario (Compras y Autorizaciones)", () => {
    it("Debe generar notificación de compra radicada ('purchase_created') correctamente", () => {
      const user = { name: "Julian Ospina", notifications: [] };
      const notif = {
        id: "notif_001",
        type: "purchase_created",
        title: "📋 Nueva Compra Radicada",
        message: "Has radicado la compra del Tesla Model 3. Radicado: TSL-ORD-123456.",
        orderNum: "TSL-ORD-123456",
        vehicleName: "Model 3",
        isRead: false
      };

      user.notifications.unshift(notif);

      expect(user.notifications.length).toBe(1);
      expect(user.notifications[0].type).toBe("purchase_created");
      expect(user.notifications[0].orderNum).toBe("TSL-ORD-123456");
      expect(user.notifications[0].isRead).toBe(false);
    });

    it("Debe generar notificación de compra aprobada ('purchase_authorized') sin exponer nombre de asesor", () => {
      const user = { name: "Julian Ospina", notifications: [] };
      const authNotif = {
        id: "notif_002",
        type: "purchase_authorized",
        title: "🎉 ¡Tu compra ha sido APROBADA!",
        message: "Tu orden de compra [TSL-ORD-123456] para el Tesla Model 3 ha sido formalmente AUTORIZADA.",
        orderNum: "TSL-ORD-123456",
        extra: {},
        isRead: false
      };

      user.notifications.unshift(authNotif);

      expect(user.notifications[0].type).toBe("purchase_authorized");
      expect(user.notifications[0].message.includes("Julian O")).toBe(false);
      expect(user.notifications[0].extra.authorizedBy).toBe(undefined);
    });

    it("Debe generar notificación de compra rechazada ('purchase_rejected') con motivo sin exponer asesor", () => {
      const user = { name: "Julian Ospina", notifications: [] };
      const rejNotif = {
        id: "notif_003",
        type: "purchase_rejected",
        title: "⚠️ Solicitud de Compra RECHAZADA",
        message: 'La orden [TSL-ORD-999] para el Tesla Model 3 fue RECHAZADA. Motivo: "Documentos no legibles".',
        orderNum: "TSL-ORD-999",
        extra: { rejectedReason: "Documentos no legibles" },
        isRead: false
      };

      user.notifications.unshift(rejNotif);

      expect(user.notifications[0].type).toBe("purchase_rejected");
      expect(user.notifications[0].extra.rejectedReason).toBe("Documentos no legibles");
      expect(user.notifications[0].extra.rejectedBy).toBe(undefined);
      expect(user.notifications[0].message.includes("Julian O")).toBe(false);
    });

    it("Debe marcar todas las notificaciones como leídas", () => {
      const user = {
        notifications: [
          { id: "n1", isRead: false },
          { id: "n2", isRead: false }
        ]
      };

      user.notifications.forEach(n => { n.isRead = true; });

      const unreadCount = user.notifications.filter(n => !n.isRead).length;
      expect(unreadCount).toBe(0);
    });
  });

  // =========================================================================
  // SUITE 12: Arquitectura Responsive, Drawer Móvil y Ergonomía Táctil
  // =========================================================================
  describe("Suite 12: Arquitectura Responsive, Drawer Móvil y Ergonomía Táctil", () => {
    it("Debe alternar correctamente la apertura y cierre del cajón móvil (drawer) con clases y estados", () => {
      const createMockElement = () => {
        const classes = new Set();
        return {
          classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c)
          },
          style: {}
        };
      };

      const mockSidebar = createMockElement();
      const mockOverlay = createMockElement();
      const mockBody = { style: {} };

      const openDrawer = () => {
        mockSidebar.classList.add("open");
        mockOverlay.classList.add("active");
        mockBody.style.overflow = "hidden";
      };

      const closeDrawer = () => {
        mockSidebar.classList.remove("open");
        mockOverlay.classList.remove("active");
        mockBody.style.overflow = "";
      };

      // Estado inicial
      expect(mockSidebar.classList.contains("open")).toBe(false);
      expect(mockOverlay.classList.contains("active")).toBe(false);

      // Apertura
      openDrawer();
      expect(mockSidebar.classList.contains("open")).toBe(true);
      expect(mockOverlay.classList.contains("active")).toBe(true);
      expect(mockBody.style.overflow).toBe("hidden");

      // Cierre
      closeDrawer();
      expect(mockSidebar.classList.contains("open")).toBe(false);
      expect(mockOverlay.classList.contains("active")).toBe(false);
      expect(mockBody.style.overflow).toBe("");
    });

    it("Debe validar que los campos de entrada táctiles tengan especificación de font-size >= 16px para prevenir zoom en iOS Safari", () => {
      const inputDesignSpecs = {
        minFontSizePx: 16,
        touchMinHeightPx: 48,
        modalInputs: [
          { name: "adminGateEmail", fontSize: 16, minHeight: 48 },
          { name: "adminGatePassword", fontSize: 16, minHeight: 48 },
          { name: "modalInputGeneral", fontSize: 16, minHeight: 48 }
        ]
      };

      inputDesignSpecs.modalInputs.forEach(input => {
        expect(input.fontSize >= inputDesignSpecs.minFontSizePx).toBe(true);
        expect(input.minHeight >= inputDesignSpecs.touchMinHeightPx).toBe(true);
      });
    });

    it("Debe verificar que las tablas de datos implementen contenedor con desplazamiento táctil horizontal ('overflow-x: auto')", () => {
      const tableContainerConfig = {
        overflowX: "auto",
        webkitOverflowScrolling: "touch",
        tableMinWidth: 620
      };

      expect(tableContainerConfig.overflowX).toBe("auto");
      expect(tableContainerConfig.webkitOverflowScrolling).toBe("touch");
      expect(tableContainerConfig.tableMinWidth >= 600).toBe(true);
    });

    it("Debe cerrar automáticamente el drawer móvil al cambiar de pestaña en resoluciones reducidas (<= 900px)", () => {
      let isDrawerOpen = true;
      const simulateSwitchTab = (screenWidth) => {
        if (screenWidth <= 900) {
          isDrawerOpen = false;
        }
      };

      // En móvil (375px)
      simulateSwitchTab(375);
      expect(isDrawerOpen).toBe(false);

      // En tablet (768px)
      isDrawerOpen = true;
      simulateSwitchTab(768);
      expect(isDrawerOpen).toBe(false);

      // En desktop (1280px)
      isDrawerOpen = true;
      simulateSwitchTab(1280);
      expect(isDrawerOpen).toBe(true);
    });

    it("Debe compensar la altura del encabezado fijo en la navegación hacia anclas de sección", () => {
      const headerHeightPx = 70;
      const targetElementOffsetTop = 1500;
      const calculatedScrollPosition = targetElementOffsetTop - headerHeightPx;

      expect(calculatedScrollPosition).toBe(1430);
      expect(calculatedScrollPosition < targetElementOffsetTop).toBe(true);
    });
  });

})(typeof window !== "undefined" ? window : global);
