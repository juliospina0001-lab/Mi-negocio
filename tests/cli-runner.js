/**
 * TESLA PREMIUM SHOWROOM - CLI TEST RUNNER
 * Ejecuta la suite de pruebas desde la terminal o pipeline de CI/CD.
 */

const fs = require("fs");
const path = require("path");

// Polyfill de performance.now si es requerido
if (typeof performance === "undefined") {
  global.performance = { now: () => Date.now() };
}

// Polyfill de crypto si es requerido en Node
if (typeof crypto === "undefined" || !global.crypto) {
  try {
    const nodeCrypto = require("crypto");
    global.crypto = nodeCrypto.webcrypto || nodeCrypto;
  } catch (e) {}
}

// 1. Cargar datos del catálogo (js/data.js)
const dataPath = path.join(__dirname, "../js/data.js");
const dataCode = fs.readFileSync(dataPath, "utf-8");
eval(dataCode);
if (typeof VEHICLES_DATA !== "undefined") {
  global.VEHICLES_DATA = VEHICLES_DATA;
}
if (typeof getVehiclePricing !== "undefined") {
  global.getVehiclePricing = getVehiclePricing;
}

// 2. Cargar suite de pruebas (tests/test-suite.js)
const suitePath = path.join(__dirname, "test-suite.js");
const suiteCode = fs.readFileSync(suitePath, "utf-8");
eval(suiteCode);

// 3. Ejecutar todas las pruebas
TestRunner.runAll().then((res) => {
  console.log("\n=======================================================");
  console.log("   TESLA PREMIUM SHOWROOM - REPORTE DE CALIDAD (QA)   ");
  console.log("=======================================================");
  console.log(` TOTAL TESTS : ${res.total}`);
  console.log(` APROBADOS   : ${res.passed}`);
  console.log(` FALLIDOS    : ${res.failed}`);
  console.log(` TIEMPO      : ${res.durationMs} ms`);
  console.log("=======================================================\n");

  res.suites.forEach((s) => {
    const suiteStatus = s.failed === 0 ? "✓" : "✗";
    console.log(`\n[${suiteStatus}] ${s.name} (${s.passed}/${s.tests.length} aprobados)`);
    s.tests.forEach((t) => {
      const mark = t.status === "passed" ? "   ✓" : "   ✗";
      console.log(`${mark} ${t.name} (${t.durationMs} ms)`);
      if (t.error) {
        console.log(`       >> ERROR: ${t.error}`);
      }
    });
  });

  console.log("\n-------------------------------------------------------");
  if (res.failed === 0) {
    console.log("  >>> RESULTADO: TODAS LAS PRUEBAS PASARON EXITOSAMENTE (100%) <<<");
    process.exit(0);
  } else {
    console.log(`  >>> RESULTADO: ${res.failed} PRUEBAS FALLARON <<<`);
    process.exit(1);
  }
}).catch((err) => {
  console.error("Fallo de ejecución:", err);
  process.exit(1);
});
