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
if (localStorage.getItem("pedidoEnviado") === "true") {
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

    if (tipoEntrega && tipoEntrega.value === "domicilio") total += 5000;

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
        const precio = parseInt(item.dataset.precio) || 0;

        let linea = `• ${nombreProducto} ×${cantidad}`;

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

      let mensaje = "📦 *NUEVO PEDIDO*\n\n";

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
if (efectivo && efectivo.trim()) mensaje += "💵 Con cuánto paga: " + efectivo + "\n\n";

if (totalFormatted) mensaje += "💰 *Total:* " + totalFormatted;

      try {

const numero = "573015513793"; // número del restaurante

const url = "https://api.whatsapp.com/send?phone=" + numero + "&text=" + encodeURIComponent(mensaje);

// guardar que el pedido fue enviado
localStorage.setItem("pedidoEnviado", "true");

// abrir WhatsApp
window.open(url, "_blank");

// redirigir a página de agradecimiento
setTimeout(() => {
  window.location.href = "gracias.html";
}, 1000);

} catch (error) {

console.error("Error generando el pedido:", error);

enviando = false;

if (botonEnviar) {
botonEnviar.disabled = false;
botonEnviar.innerText = "Enviar pedido";
}

alert("Error generando el pedido. Intenta nuevamente.");
}
    });
  }

})