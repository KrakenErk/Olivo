// Localizamos el contenedor de la cuenta regresiva.
const contador = document.querySelector("#contador");

// Solo ejecutamos el código si esta página tiene un contador.
if (contador) {
    const dias = document.querySelector("#dias");
    const horas = document.querySelector("#horas");
    const minutos = document.querySelector("#minutos");
    const segundos = document.querySelector("#segundos");
    const mensaje = document.querySelector("#mensaje-contador");

    // Leemos la fecha escrita en data-fecha y la convertimos
    // en un número expresado en milisegundos.
    const fechaEvento = new Date(contador.dataset.fecha).getTime();

    // Estas equivalencias facilitan los cálculos.
    const unSegundo = 1000;
    const unMinuto = unSegundo * 60;
    const unaHora = unMinuto * 60;
    const unDia = unaHora * 24;

    let intervalo;

    // Convierte, por ejemplo, 7 en "07".
    function dosDigitos(numero) {
        return String(numero).padStart(2, "0");
    }

    function actualizarContador() {
        const ahora = Date.now();
        const tiempoRestante = fechaEvento - ahora;

        // Al llegar a la fecha evitamos mostrar números negativos.
        if (tiempoRestante <= 0) {
            contador.hidden = true;

            mensaje.textContent =
                "La cuenta regresiva ha terminado. ¡Gracias por acompañarnos!";

            clearInterval(intervalo);
            return;
        }

        const diasRestantes = Math.floor(tiempoRestante / unDia);

        const horasRestantes = Math.floor(
            (tiempoRestante % unDia) / unaHora
        );

        const minutosRestantes = Math.floor(
            (tiempoRestante % unaHora) / unMinuto
        );

        const segundosRestantes = Math.floor(
            (tiempoRestante % unMinuto) / unSegundo
        );

        dias.textContent = dosDigitos(diasRestantes);
        horas.textContent = dosDigitos(horasRestantes);
        minutos.textContent = dosDigitos(minutosRestantes);
        segundos.textContent = dosDigitos(segundosRestantes);

        contador.hidden = false;
    }

    // Si la fecha está mal escrita, conservamos el texto del HTML.
    if (Number.isNaN(fechaEvento)) {
        console.error("Revisa la fecha del atributo data-fecha.");
    } else {
        // Programamos las actualizaciones y calculamos la primera
        // inmediatamente, sin esperar un segundo.
        intervalo = setInterval(actualizarContador, unSegundo);
        actualizarContador();
    }
}

