// ===================== Mostrar/ocultar secciones =====================
function toggleSeccion(id) {
  const seccion = document.getElementById(id);
  if (!seccion) return;
  seccion.style.display = (seccion.style.display === "none") ? "block" : "none";
}

// ====== Activar/desactivar cantidad============
function toggleCantidad(checkbox) {
  const item = checkbox.closest('.item');
  if (!item) return;

  const cantidad = item.querySelector('.cantidad');
  const descripcion = item.querySelector('.descripcion');
  const lecheritaWrapper = item.querySelector('.lecherita-wrapper');

  if (!cantidad) return;

  if (checkbox.checked) {
    cantidad.disabled = false;
    if (Number(cantidad.value) === 0) cantidad.value = 1;
    if (descripcion) descripcion.style.display = "block";
    if (lecheritaWrapper) lecheritaWrapper.style.display = "block";
  } else {
    cantidad.disabled = true;
    cantidad.value = 0;
    if (descripcion) descripcion.style.display = "none";
    if (lecheritaWrapper) lecheritaWrapper.style.display = "none";
    const lecheritaCb = item.querySelector('.lecherita-item');
    if (lecheritaCb) lecheritaCb.checked = false;
  }

  calcularTotal();
}

// ====== Donación: mostrar/ocultar campo de nombre ======
function toggleDonacionNombre(checkbox) {
  const item = checkbox.closest('.item');
  if (!item) return;
  const wrapper = item.querySelector('.donacion-nombre-wrapper');
  if (!wrapper) return;
  wrapper.style.display = checkbox.checked ? "block" : "none";
  if (!checkbox.checked) {
    const input = wrapper.querySelector('input');
    if (input) input.value = "";
  }
}

// ====== Pizzas: mostrar/ocultar selector de tamaño ======
function togglePizzaTamano(checkbox) {
  const item = checkbox.closest('.item');
  if (!item) return;
  const wrapper = item.querySelector('.tamano-pizza-wrapper');
  const select = item.querySelector('.tamano-pizza');
  const span = item.querySelector('.precio-pizza');
  if (!wrapper) return;

  if (checkbox.checked) {
    wrapper.style.display = "block";
    if (select) actualizarPrecioPizza(select);
    if (checkbox.dataset.mitadMitad === "true") {
      const cantidadInput = item.querySelector(".cantidad");
      if (cantidadInput) actualizarPestanasMitad(cantidadInput);
    }
  } else {
    wrapper.style.display = "none";
    if (span) span.innerText = "Variable";
    if (select) select.selectedIndex = 0;
    if (checkbox.dataset.mitadMitad === "true") {
      const botonesDiv = item.querySelector(".pestanas-mitad-botones");
      const contenidoDiv = item.querySelector(".pestanas-mitad-contenido");
      if (botonesDiv) botonesDiv.innerHTML = "";
      if (contenidoDiv) contenidoDiv.innerHTML = "";
    }
  }
}

// ====== Pizzas: actualizar precio visible según tamaño elegido ======
function actualizarPrecioPizza(select) {
  const item = select.closest('.item');
  if (!item) return;
  const span = item.querySelector('.precio-pizza');
  const precio = parseInt(select.selectedOptions[0]?.dataset.precio) || 0;
  if (span) span.innerText = "$" + precio.toLocaleString("es-CO");
  calcularTotal();
}

const SABORES_PIZZA = [
  "Napolitana","Peperoni","Hawaiiana","Pollo con Champiñones","Carnes",
  "Ranchera","Mexicana","Vegetales","Paisa","Queso y Tocineta",
  "Pollo BBQ","Teriyaki"
];

const SABORES_PROMOCION = [
  "Napolitana","Peperoni","Hawaiiana","Ranchera","Vegetales","Paisa"
];

function opcionesPromo(seleccionado) {
  return SABORES_PROMOCION.map(s =>
    `<option value="${s}" ${s === seleccionado ? "selected" : ""}>${s}</option>`
  ).join("");
}

function togglePromoSabores(checkbox) {
  const item = checkbox.closest('.item');
  if (!item) return;
  const wrapper = item.querySelector('.promo-sabores-wrapper');
  const sel1 = item.querySelector('.promo-sabor-1');
  const sel2 = item.querySelector('.promo-sabor-2');
  if (!wrapper) return;

  if (checkbox.checked) {
    wrapper.style.display = "block";
    if (sel1 && !sel1.innerHTML) sel1.innerHTML = opcionesPromo(SABORES_PROMOCION[0]);
    if (sel2 && !sel2.innerHTML) sel2.innerHTML = opcionesPromo(SABORES_PROMOCION[1]);
  } else {
    wrapper.style.display = "none";
  }
}

function opcionesSabores(seleccionado) {
  return SABORES_PIZZA.map(s =>
    `<option value="${s}" ${s === seleccionado ? "selected" : ""}>${s}</option>`
  ).join("");
}

const PRECIOS_TAMANO_MITAD = { Personal: 23000, Media: 35000, Grande: 45000 };

function opcionesTamano(seleccionado) {
  return Object.keys(PRECIOS_TAMANO_MITAD).map(t =>
    `<option value="${t}" ${t === seleccionado ? "selected" : ""}>${t} — $${PRECIOS_TAMANO_MITAD[t].toLocaleString("es-CO")}</option>`
  ).join("");
}

function generarPestanaMitad(index, sabor1, sabor2, tamano, lecherita) {
  return `
    <div class="pestana-mitad-panel ${index === 0 ? 'activa' : ''}" data-index="${index}">
      <label style="font-size:14px; font-weight:bold; display:block;">Pizza ${index + 1} — Tamaño</label>
      <select class="tamano-mitad" onchange="calcularTotal()">${opcionesTamano(tamano)}</select>
      <label style="font-size:14px; font-weight:bold; display:block; margin-top:6px;">Pizza ${index + 1} — Sabor 1</label>
      <select class="sabor-mitad-1">${opcionesSabores(sabor1)}</select>
      <label style="font-size:14px; font-weight:bold; display:block; margin-top:6px;">Pizza ${index + 1} — Sabor 2</label>
      <select class="sabor-mitad-2">${opcionesSabores(sabor2)}</select>
      <label style="font-size:14px; display:flex; align-items:center; gap:6px; margin-top:6px;">
        <input type="checkbox" class="lecherita-mitad" ${lecherita ? "checked" : ""}> 🥛 ¿Lecherita en esta pizza?
      </label>
    </div>
  `;
}

function actualizarPestanasMitad(cantidadInput) {
  const item = cantidadInput.closest(".item");
  if (!item) return;
  const checkbox = item.querySelector('.check-plato[data-mitad-mitad="true"]');
  if (!checkbox) return;

  const botonesDiv = item.querySelector(".pestanas-mitad-botones");
  const contenidoDiv = item.querySelector(".pestanas-mitad-contenido");
  if (!botonesDiv || !contenidoDiv) return;

  const cantidad = Math.max(0, Number(cantidadInput.value) || 0);

  const previos = Array.from(contenidoDiv.querySelectorAll(".pestana-mitad-panel")).map(p => ({
    sabor1: p.querySelector(".sabor-mitad-1")?.value,
    sabor2: p.querySelector(".sabor-mitad-2")?.value,
    tamano: p.querySelector(".tamano-mitad")?.value,
    lecherita: p.querySelector(".lecherita-mitad")?.checked
  }));

  botonesDiv.innerHTML = "";
  contenidoDiv.innerHTML = "";

  if (!checkbox.checked || cantidad < 1) return;

  for (let i = 0; i < cantidad; i++) {
    const prev = previos[i];
    const sabor1 = prev?.sabor1 || SABORES_PIZZA[0];
    const sabor2 = prev?.sabor2 || SABORES_PIZZA[1];
    const tamano = prev?.tamano || "Personal";
    const lecherita = prev?.lecherita || false;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerText = "Pizza " + (i + 1);
    if (i === 0) btn.classList.add("activa");
    btn.onclick = () => mostrarPestanaMitad(item, i);
    botonesDiv.appendChild(btn);

    contenidoDiv.insertAdjacentHTML("beforeend", generarPestanaMitad(i, sabor1, sabor2, tamano, lecherita));
  }
  calcularTotal();
}

function mostrarPestanaMitad(item, index) {
  item.querySelectorAll(".pestanas-mitad-botones button").forEach((b, i) => {
    b.classList.toggle("activa", i === index);
  });
  item.querySelectorAll(".pestana-mitad-panel").forEach(p => {
    p.classList.toggle("activa", Number(p.dataset.index) === index);
  });
}

// ===================== DOM READY =====================
document.addEventListener("DOMContentLoaded", () => {

  // 🔹 Si el pedido ya fue enviado, ir a la página de gracias
if (sessionStorage.getItem("pedidoEnviado") === "true") {
  sessionStorage.removeItem("pedidoEnviado");
  window.location.href = "gracias.html";
}

  const tipoEntrega = document.getElementById("tipoEntrega");
  const direccionField = document.getElementById("direccionField");
  const direccionInput = document.getElementById("direccion");
  const costoDomicilioP = document.getElementById("costoDomicilio");

  const mesaField = document.getElementById("mesaField");
  const mesaInput = document.getElementById("numeroMesa");

  const tipoPago = document.getElementById("tipoPago");
  const efectivoField = document.getElementById("efectivoField");
  const efectivoInput = document.getElementById("efectivoCliente");

  const confirmCheckbox = document.getElementById("confirmPedido");
  const pedidoForm = document.getElementById("pedidoForm");

  const totalSpan = document.getElementById("total");
  const totalHiddenInput = document.getElementById("totalPedido");

  const checkboxes = document.querySelectorAll(".check-plato");

  const SUPABASE_URL = "https://hotryxyvbdbizfivgfft.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdHJ5eHl2YmRiaXpmaXZnZmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDk1MDMsImV4cCI6MjA5MjM4NTUwM30.e_8rXHLVKl8gGH7r65LzCbXpLVygnHJf3lSvYXqosfw";

  // ===================== Autocompletar dirección por teléfono =====================
const telefonoInput = document.getElementById("telefono");
const avisoDir = document.createElement("p");
avisoDir.id = "avisoDireccion";
avisoDir.style.cssText = "color:#e67e22; font-size:0.9em; margin-top:4px; display:none;";
avisoDir.innerHTML = "📍 Usamos tu última dirección. ¿Es correcta o deseas modificarla?";

// Insertar aviso debajo del campo dirección
if (direccionInput) {
  direccionInput.parentNode.insertBefore(avisoDir, direccionInput.nextSibling);
}

async function buscarDireccionAnterior() {
  const tel = telefonoInput?.value?.trim();
  if (!tel || tipoEntrega?.value !== "domicilio") return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/pedidos?Telefono=eq.${encodeURIComponent(tel)}&Entrega=eq.Domicilio&select=Direccion,Fecha&order=Fecha.desc&limit=1`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );
    const data = await res.json();
    if (data.length > 0 && data[0].Direccion) {
      direccionInput.value = data[0].Direccion;
      avisoDir.style.display = "block";
    } else {
      avisoDir.style.display = "none";
    }
  } catch (err) {
    console.warn("No se pudo buscar dirección anterior:", err);
  }
}

// Buscar cuando cambia a domicilio
if (tipoEntrega) {
  tipoEntrega.addEventListener("change", () => {
    if (tipoEntrega.value === "domicilio") {
      buscarDireccionAnterior();
    } else {
      avisoDir.style.display = "none";
    }
  });
}

// También buscar si ya eligió domicilio y luego escribe el teléfono
if (telefonoInput) {
  telefonoInput.addEventListener("blur", buscarDireccionAnterior);
}

  // ===================== Insertar checkbox de lecherita en cada pizza =====================
  document.querySelectorAll('.check-plato').forEach(cb => {
    const esPizza = cb.name && cb.name.startsWith("Pizza ");
    const esPromo = cb.name === "Promocion Pizzas";
    if (!esPizza && !esPromo) return;
    if (cb.dataset.mitadMitad === "true" || esPromo) return;

    const item = cb.closest('.item');
    if (!item || item.querySelector('.lecherita-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'lecherita-wrapper';
    wrapper.style.display = 'none';
    wrapper.style.marginTop = '4px';
    wrapper.innerHTML = `
      <label style="font-size:14px; display:flex; align-items:center; gap:6px;">
        <input type="checkbox" class="lecherita-item"> 🥛 ¿Deseas lecherita? (Gratis)
      </label>
    `;

    const descripcion = item.querySelector('.descripcion');
    if (descripcion) {
      descripcion.insertAdjacentElement('afterend', wrapper);
    } else {
      item.appendChild(wrapper);
    }
  });

  // ===================== Inicializar checkboxes =====================
  checkboxes.forEach(cb => {
    const cantidadInput = cb.closest(".item")?.querySelector(".cantidad");
    if (cantidadInput) cantidadInput.disabled = !cb.checked;
    cb.addEventListener("change", () => toggleCantidad(cb));
    if (cantidadInput) {
      cantidadInput.addEventListener("input", () => {
  if (cb.checked && cantidadInput.value !== "" && Number(cantidadInput.value) < 1) {
    cantidadInput.value = 1;
  }
  calcularTotal();
});

      cantidadInput.addEventListener("blur", () => {
  if (cb.checked && (cantidadInput.value === "" || Number(cantidadInput.value) < 1)) {
    cantidadInput.value = 1;
    calcularTotal();
  }
});
    }
  });

  // ===================== Tipo de entrega =====================
  if (tipoEntrega) {
    tipoEntrega.addEventListener("change", () => {

      if (tipoEntrega.value === "domicilio") {
        direccionField.style.display = "block";
        direccionInput.required = true;
        costoDomicilioP.style.display = "block";

        mesaField.style.display = "none";
        mesaInput.required = false;
        mesaInput.value = "";

      } else if (tipoEntrega.value === "comer") {

        mesaField.style.display = "block";
        mesaInput.required = true;

        direccionField.style.display = "none";
        direccionInput.required = false;
        direccionInput.value = "";

        costoDomicilioP.style.display = "none";

      } else {

        direccionField.style.display = "none";
        direccionInput.required = false;
        direccionInput.value = "";

        mesaField.style.display = "none";
        mesaInput.required = false;
        mesaInput.value = "";

        costoDomicilioP.style.display = "none";
      }

      calcularTotal();
    });
  }

  // ===================== Tipo de pago =====================
  if (tipoPago) {
    tipoPago.addEventListener("change", function () {
      const valor = this.value;

      efectivoField.style.display = "none";

      const infoPago = document.getElementById("infoPago");
      const infoNequi = document.getElementById("infoNequi");
      const infoBanco = document.getElementById("infoBanco");
      const infoLlave = document.getElementById("infoLlave");

      if (infoPago) infoPago.style.display = "none";
      if (infoNequi) infoNequi.style.display = "none";
      if (infoBanco) infoBanco.style.display = "none";
      if (infoLlave) infoLlave.style.display = "none";

      if (valor === "Efectivo") efectivoField.style.display = "block";
      if (valor === "Nequi") { infoPago.style.display = "block"; infoNequi.style.display = "block"; }
      if (valor === "Bancolombia") { infoPago.style.display = "block"; infoBanco.style.display = "block"; }
      if (valor === "llave para otros bancos") { infoPago.style.display = "block"; infoLlave.style.display = "block"; }
    });
  }

  // ===================== Calcular total (MEJORADO) =====================
  function calcularTotal() {
    let total = 0;

    checkboxes.forEach(cb => {
      if (!cb.checked) return;
      if (cb.dataset.donacion === "true") return;

      const itemDiv = cb.closest(".item");
      const cantidadInput = itemDiv?.querySelector(".cantidad");
      if (!cantidadInput) return;

      const selectTamano = itemDiv?.querySelector(".tamano-pizza");
      const panelesMitad = itemDiv?.querySelectorAll(".tamano-mitad");
      let precio;

      if (panelesMitad && panelesMitad.length > 0) {
        let sumaMitad = 0;
        panelesMitad.forEach(sel => {
          sumaMitad += PRECIOS_TAMANO_MITAD[sel.value] || 0;
        });
        total += sumaMitad;
        return;
      } else if (selectTamano) {
        precio = parseInt(selectTamano.selectedOptions[0]?.dataset.precio) || 0;
      } else {
        precio = parseInt(cb.dataset.precio);

        if (!precio) {
          const precioSpan = itemDiv?.querySelector("span");
          let precioText = precioSpan?.innerText || "";
          precio = parseInt(precioText.replace(/\$|,/g, '').replace(/\./g,'')) || 0;
        }
      }

      total += precio * Number(cantidadInput.value);
    });

    if (tipoEntrega && tipoEntrega.value === "domicilio") total += 5500;

    if (totalSpan) totalSpan.innerText = "$" + total.toLocaleString("es-CO");
    if (totalHiddenInput) totalHiddenInput.value = total;
  }

  window.calcularTotal = calcularTotal;

  // ===================== ENVÍO A MAKE (MEJORADO) =====================
  if (pedidoForm) {

    let enviando = false;
    let ultimoEnvio = 0;

    pedidoForm.addEventListener("submit", async function(e) {

      if (!confirmCheckbox || !confirmCheckbox.checked) {
        e.preventDefault();
        alert("Debes confirmar que tu pedido está correcto antes de enviar.");
        return;
      }

      const mitadCheckbox = document.querySelector('.check-plato[data-mitad-mitad="true"]');
      if (mitadCheckbox && mitadCheckbox.checked) {
        const itemMitad = mitadCheckbox.closest(".item");
        const paneles = itemMitad.querySelectorAll(".pestana-mitad-panel");
        for (const panel of paneles) {
          const s1 = panel.querySelector(".sabor-mitad-1");
          const s2 = panel.querySelector(".sabor-mitad-2");
          if (s1 && s2 && s1.value === s2.value) {
            e.preventDefault();
            alert("En cada pizza Mitad y Mitad debes elegir dos sabores distintos.");
            return;
          }
        }
      }

      const promoCheckbox = document.querySelector('.check-plato[data-promo="true"]');
      if (promoCheckbox && promoCheckbox.checked) {
        const itemPromo = promoCheckbox.closest(".item");
        const p1 = itemPromo.querySelector(".promo-sabor-1");
        const p2 = itemPromo.querySelector(".promo-sabor-2");
        if (p1 && p2 && p1.value === p2.value) {
          e.preventDefault();
          alert("En la promoción debes elegir dos sabores distintos para cada pizza.");
          return;
        }
      }

      e.preventDefault();
      const ahora = Date.now();

      // Bloqueo por doble envío rápido (5 segundos)
     if (ahora - ultimoEnvio < 5000) return;

      // Si ya se está enviando, no permitir otro envío
      if (enviando) return;

       ultimoEnvio = ahora;
       enviando = true;
       pedidoForm.style.pointerEvents = "none";

       const botonEnviar = pedidoForm.querySelector("button[type='submit']");
      if (botonEnviar) {
      botonEnviar.disabled = true;
      botonEnviar.innerText = "Enviando...";
      }

      const nombre = document.getElementById("nombre")?.value;
      const usuarioWhatsapp = document.getElementById("usuarioWhatsapp")?.value;
      const telefono = document.getElementById("telefono")?.value;
      const direccion = direccionInput?.value;
      const metodoEntrega = tipoEntrega?.value;
      const mesa = mesaInput?.value;
      const metodoPago = tipoPago?.value;
      const efectivo = efectivoInput?.value;
      const total = totalHiddenInput?.value;
      const especificaciones = document.getElementById("especificaciones")?.value;

      // ===== Número de pedido diario (se reinicia cada día) =====
      const hoyFecha = new Date();
      const diaHoy = hoyFecha.getDate();
      const mesHoy = hoyFecha.getMonth() + 1;
      const anioHoy = hoyFecha.getFullYear();
      const fechaHoyStr = `${diaHoy}/${mesHoy}/${anioHoy}`;

      let numeroPedido = "K1";
      try {
        const resConteo = await fetch(
          `${SUPABASE_URL}/rest/v1/pedidos?select=id&Fecha=like.${encodeURIComponent(fechaHoyStr)}*`,
          {
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${SUPABASE_KEY}`
            }
          }
        );
        const dataConteo = await resConteo.json();
        const totalHoy = Array.isArray(dataConteo) ? dataConteo.length : 0;
        numeroPedido = "K" + (totalHoy + 1);
      } catch (err) {
        console.warn("No se pudo calcular el número de pedido:", err);
      }

      // 🔥 PLATOS MEJORADO
      let platos = "";
      document.querySelectorAll(".check-plato:checked").forEach(item => {
        if (item.dataset.donacion === "true") return;

        const itemDiv = item.closest(".item");
        if (!itemDiv) return;

        const cantidadInput = itemDiv.querySelector(".cantidad");
        if (!cantidadInput) return;

        const cantidad = Number(cantidadInput.value);
        let nombreProducto = item.dataset.nombre || item.name || "Producto";
        let precio;

        let lineaExtra = "";

        const selectTamano = itemDiv.querySelector(".tamano-pizza");
        const paneles = itemDiv.querySelectorAll(".pestana-mitad-panel");
        const promoSabor1 = itemDiv.querySelector(".promo-sabor-1");
        const promoSabor2 = itemDiv.querySelector(".promo-sabor-2");

        if (paneles.length > 0) {
          precio = 0;
          paneles.forEach((panel, idx) => {
            const tam = panel.querySelector(".tamano-mitad")?.value || "";
            const s1 = panel.querySelector(".sabor-mitad-1")?.value || "";
            const s2 = panel.querySelector(".sabor-mitad-2")?.value || "";
            const lech = panel.querySelector(".lecherita-mitad")?.checked;
            precio += PRECIOS_TAMANO_MITAD[tam] || 0;
            lineaExtra += `   ${idx + 1}) ${s1} / ${s2} - (${tam})${lech ? " 🥛 Lecherita: Sí" : ""}\n`;
          });
        } else if (promoSabor1 && promoSabor2) {
          precio = parseInt(item.dataset.precio) || 0;
          const lechP1 = itemDiv.querySelector(".lecherita-promo-1")?.checked;
          const lechP2 = itemDiv.querySelector(".lecherita-promo-2")?.checked;
          lineaExtra += `   1) ${promoSabor1.value}${lechP1 ? " 🥛 Lecherita: Sí" : ""}\n`;
          lineaExtra += `   2) ${promoSabor2.value}${lechP2 ? " 🥛 Lecherita: Sí" : ""}\n`;
        } else if (selectTamano) {
          precio = parseInt(selectTamano.selectedOptions[0]?.dataset.precio) || 0;
          nombreProducto += ` (${selectTamano.value})`;
        } else {
          const spanPrecio = itemDiv.querySelector("span");
          const precioTextoRaw = spanPrecio?.innerText || spanPrecio?.textContent || "";
          precio = parseInt(precioTextoRaw.replace(/\$|\./g, '').replace(/,/g, '')) || 0;
        }

        const lecheritaItem = itemDiv.querySelector('.lecherita-item')?.checked;
        if (lecheritaItem) nombreProducto += " (Lecherita: Sí)";

        const precioTexto = precio ? " — $" + precio.toLocaleString("es-CO") : "";
let linea = `• ${cantidad} × ${nombreProducto}${precioTexto}`;
if (lineaExtra) linea += "\n" + lineaExtra.trimEnd();

        platos += linea + "\n";
      });

      let adicionales = "";
      document.querySelectorAll(".opciones-extra input:checked").forEach(extra => {
        adicionales += "• " + extra.value + "\n";
      });

      let extra = especificaciones || "";

      const totalFormatted = total 
        ? Number(total).toLocaleString("es-CO", { 
            style: "currency", 
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }) 
        : "";

      const ahoraMensaje = new Date();
const horaMsg = ahoraMensaje.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true });
      let mensaje = "";
mensaje += "🔖 *" + numeroPedido + "*\n";
if (horaMsg) mensaje += "🕐 *Hora:* " + horaMsg + "\n\n";

if (metodoEntrega) {
  let metodoTexto = metodoEntrega;
  if (metodoEntrega === "local") metodoTexto = "Recoger en el local";
  if (metodoEntrega === "domicilio") metodoTexto = "Domicilio";
  if (metodoEntrega === "comer") metodoTexto = "Comer en el local";
  mensaje += "📦 *Entrega:* " + metodoTexto + "\n";
  if (mesa) mensaje += "🪑 *Mesa:* " + mesa + "\n";
}

if (metodoEntrega === "domicilio" && direccion && direccion.trim()) {
  mensaje += "📍 *Dirección:* " + direccion + "\n";
}

mensaje += "\n";
if (telefono) mensaje += "📞 *Número:* " + telefono + "\n";
if (nombre) mensaje += "👤 *Nombre:* " + nombre + "\n";
if (usuarioWhatsapp && usuarioWhatsapp.trim()) mensaje += "📱 *Usuario WhatsApp:* " + usuarioWhatsapp.trim() + "\n";
mensaje += "\n";

if (platos.trim()) mensaje += "🍽️ *Platos:*\n" + platos + "\n";
if (adicionales.trim()) mensaje += "➕ *Adicionales:*\n" + adicionales + "\n";



if (totalFormatted) mensaje += "💰 *Total:* " + totalFormatted + "\n\n";

if (metodoPago) mensaje += "💳 *Forma de Pago:* " + metodoPago + "\n";
if (efectivo && efectivo.trim()) {
  const pagoNum = parseInt(efectivo.replace(/\D/g, ''));
  const totalNum = Number(total) || 0;
  const devuelta = pagoNum - totalNum;
  mensaje += "💵 *Paga con:* $" + pagoNum.toLocaleString("es-CO") + "\n";
  if (devuelta >= 0) mensaje += "↩️ *Devuelta:* $" + devuelta.toLocaleString("es-CO") + "\n";
}

const donacionCheckbox = document.querySelector('.check-plato[data-donacion="true"]');
if (donacionCheckbox && donacionCheckbox.checked) {
  const donacionItem = donacionCheckbox.closest(".item");
  const donacionCantidad = Number(donacionItem?.querySelector(".cantidad")?.value) || 0;
  const donacionMonto = donacionCantidad * 2000;
  const donacionNombre = document.getElementById("donacionNombre")?.value?.trim();
  mensaje += "\n🎗️ *Donación a nombre de:* " + (donacionNombre || "Anónimo") + " — $" + donacionMonto.toLocaleString("es-CO") + "\n";
}

if (extra && extra.trim()) mensaje += "\n\n-----------------------------\n📝 *Extras:*\n" + extra + "\n-----------------------------\n";

  try {

  const datosPedido = {
    nombre:        nombre         || "",
    telefono:      telefono       || "",
    platos:        platos.trim()  || "",
    metodoEntrega: metodoEntrega  || "",
    direccion:     direccion      || "",
    metodoPago:    metodoPago     || "",
    total:         Number(total)  || 0
  };

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwNdzFT9_gcHzUbuVpwvZTKGFiyaNQd1jiV9crhx-ECjbYZyS91YcTC0Aq0tSE0EGQ4Pg/exec";

// Enviar a Sheets SIN esperar respuesta (respaldo)
fetch(APPS_SCRIPT_URL, {
  method: "POST",
  body: JSON.stringify(datosPedido),
  headers: { "Content-Type": "text/plain;charset=utf-8" }
});

// Enviar a Supabase (principal)

const ahora2 = new Date();
const dia   = ahora2.getDate();
const mes   = ahora2.getMonth() + 1;
const anio  = ahora2.getFullYear();
const horas = String(ahora2.getHours()).padStart(2,'0');
const mins  = String(ahora2.getMinutes()).padStart(2,'0');
const segs  = String(ahora2.getSeconds()).padStart(2,'0');
const fechaStr = `${dia}/${mes}/${anio} ${horas}:${mins}:${segs}`;

fetch(`${SUPABASE_URL}/rest/v1/pedidos`, {
  method: "POST",
  headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  body: JSON.stringify({
    Fecha:     fechaStr,
    Nombre:    nombre      || "",
    Telefono:  telefono    || "",
    Platos:    platos.trim()|| "",
    Entrega: metodoEntrega === "domicilio" ? "Domicilio" : metodoEntrega === "comer" ? "Comer en el local" : "Recoger en el local",
    Direccion: direccion   || "",
    Pago:      metodoPago  || "",
    Total:     "$" + Number(total).toLocaleString("es-CO"),
    Extras:    especificaciones || "",
    Efectivo:  efectivo && efectivo.trim() ? "$" + parseInt(efectivo.replace(/\D/g,'')).toLocaleString("es-CO") : "",
  })
})
.then(res => res.json())
.then(data => {
  const id = data?.[0]?.id;
  if (id) {
   
  }
  sessionStorage.setItem("pedidoEnviado", "true");
  window.location.href = "https://wa.me/573015513793?text=" + encodeURIComponent(mensaje);
})
.catch(() => {
  sessionStorage.setItem("pedidoEnviado", "true");
  window.location.href = "https://wa.me/573015513793?text=" + encodeURIComponent(mensaje);
});

} catch (error) {

  console.error("Error al enviar el pedido:", error);

  enviando = false;
  pedidoForm.style.pointerEvents = "auto";

  if (botonEnviar) {
    botonEnviar.disabled = false;
    botonEnviar.innerText = "📲 Enviar Pedido";
  }

  alert("❌ Error al enviar el pedido. Revisa tu conexión e intenta de nuevo.");
}

    });
  }

}) 