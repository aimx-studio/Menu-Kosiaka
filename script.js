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

  if (!cantidad) return;

  if (checkbox.checked) {
    cantidad.disabled = false;
    if (Number(cantidad.value) === 0) cantidad.value = 1;
    if (descripcion) descripcion.style.display = "block";
  } else {
    cantidad.disabled = true;
    cantidad.value = 0;
    if (descripcion) descripcion.style.display = "none";
  }

  calcularTotal();
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

      const itemDiv = cb.closest(".item");
      const cantidadInput = itemDiv?.querySelector(".cantidad");
      if (!cantidadInput) return;

      // 🔥 NUEVO: usar data-precio si existe
      let precio = parseInt(cb.dataset.precio);

      // fallback por si algún producto no tiene data-precio
      if (!precio) {
        const precioSpan = itemDiv?.querySelector("span");
        let precioText = precioSpan?.innerText || "";
        precio = parseInt(precioText.replace(/\$|,/g, '').replace(/\./g,'')) || 0;
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
      const telefono = document.getElementById("telefono")?.value;
      const direccion = direccionInput?.value;
      const metodoEntrega = tipoEntrega?.value;
      const mesa = mesaInput?.value;
      const metodoPago = tipoPago?.value;
      const efectivo = efectivoInput?.value;
      const total = totalHiddenInput?.value;
      const especificaciones = document.getElementById("especificaciones")?.value;

      // 🔥 PLATOS MEJORADO
      let platos = "";
      document.querySelectorAll(".check-plato:checked").forEach(item => {
        const itemDiv = item.closest(".item");
        if (!itemDiv) return;

        const cantidadInput = itemDiv.querySelector(".cantidad");
        if (!cantidadInput) return;

        const cantidad = Number(cantidadInput.value);
        const nombreProducto = item.dataset.nombre || item.name || "Producto";
        const itemDiv2 = item.closest(".item");
const spanPrecio = itemDiv2?.querySelector("span");
const precioTextoRaw = spanPrecio?.innerText || spanPrecio?.textContent || "";
const precio = parseInt(precioTextoRaw.replace(/\$|\./g, '').replace(/,/g, '')) || 0;

        const precioTexto = precio ? " — $" + precio.toLocaleString("es-CO") : "";
let linea = `• ${cantidad} × ${nombreProducto}${precioTexto}`;

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
let mensaje = "📦 *NUEVO PEDIDO*\n\n";
if (horaMsg) mensaje += "🕐 *Hora:* " + horaMsg + "\n\n";
if (nombre) mensaje += "👤 *Nombre:* " + nombre + "\n\n";
if (telefono) mensaje += "📞 *Número:* " + telefono + "\n\n";

if (platos.trim()) {
  mensaje += "🍽️ *Platos:*\n" + platos + "\n";
}

if (adicionales.trim()) {
  mensaje += "➕ Adicionales:\n" + adicionales + "\n";
}

if (extra && extra.trim()) {
  mensaje += "📝 *Extras:*\n" + extra + "\n\n";
}

if (metodoEntrega) {
  let metodoTexto = metodoEntrega;
  if (metodoEntrega === "local") metodoTexto = "Recoger en el local";
  if (metodoEntrega === "domicilio") metodoTexto = "Domicilio";
  if (metodoEntrega === "comer") metodoTexto = "Comer en el local";

  mensaje += "📦 *Entrega:* " + metodoTexto + "\n";

  if (mesa) {
    mensaje += "🪑 Mesa: " + mesa + "\n";
  }

  mensaje += "\n";
}

if (metodoEntrega === "domicilio" && direccion && direccion.trim()) {
  mensaje += "📍 *Dirección:* " + direccion + "\n\n";
}

if (metodoPago) mensaje += "💳 *Forma de Pago:* " + metodoPago + "\n\n";
if (efectivo && efectivo.trim()) {
  const pagoNum = parseInt(efectivo.replace(/\D/g, ''));
  const totalNum = Number(total) || 0;
  const devuelta = pagoNum - totalNum;
  mensaje += "💵 *Paga con:* $" + pagoNum.toLocaleString("es-CO") + "\n\n";
  if (devuelta >= 0) mensaje += "↩️ *Devuelta:* $" + devuelta.toLocaleString("es-CO") + "\n\n";
}

if (totalFormatted) mensaje += "\n💰 *Total:* " + totalFormatted;

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
const SUPABASE_URL = "https://hotryxyvbdbizfivgfft.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvdHJ5eHl2YmRiaXpmaXZnZmZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDk1MDMsImV4cCI6MjA5MjM4NTUwM30.e_8rXHLVKl8gGH7r65LzCbXpLVygnHJf3lSvYXqosfw";
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