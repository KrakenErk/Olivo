(() => {
    const portada = document.querySelector(".olivo-portada");
    const apertura = document.querySelector("#apertura-invitacion");

    if (!portada) {
        return;
    }

    const preferencia = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const espacioSvg = "http://www.w3.org/2000/svg";

    let capaHojas = null;
    let invitacionAbierta = false;

    function crearHojas() {
        if (capaHojas || preferencia.matches || !invitacionAbierta) {
            return;
        }

        capaHojas = document.createElement("div");
        capaHojas.className = "olivo-lluvia";
        capaHojas.setAttribute("aria-hidden", "true");

        // Distribuimos las hojas principalmente cerca de los bordes.
        const posiciones = [6, 68, 28, 91, 46, 16, 80, 37, 58];

        posiciones.forEach(function (posicion, indice) {
            const hoja = document.createElement("div");

            hoja.className = "olivo-hoja-cayendo";

            hoja.style.setProperty("--hoja-x", `${posicion}%`);
            hoja.style.setProperty("--hoja-ancho", `${12 + indice % 3 * 4}px`);
            hoja.style.setProperty("--hoja-duracion", "36s");
            hoja.style.setProperty("--hoja-retraso", `${-indice * 4}s`);
            hoja.style.setProperty(
                "--hoja-desvio",
                indice % 2 === 0 ? "24px" : "-24px"
            );
            hoja.style.setProperty("--hoja-giro", `${indice * 47}deg`);

            const dibujo = document.createElementNS(espacioSvg, "svg");

            dibujo.setAttribute("viewBox", "0 0 40 100");
            dibujo.setAttribute("focusable", "false");

            const cuerpo = document.createElementNS(espacioSvg, "path");

            cuerpo.setAttribute(
                "d",
                "M20 96 C3 77 1 43 21 4 C37 30 40 68 20 96 Z"
            );
            cuerpo.setAttribute("class", "olivo-hoja-flotante-cuerpo");

            const nervadura = document.createElementNS(espacioSvg, "path");

            nervadura.setAttribute(
                "d",
                "M20 94 C21 69 23 35 21 8"
            );
            nervadura.setAttribute("class", "olivo-hoja-flotante-nervadura");

            dibujo.append(cuerpo, nervadura);
            hoja.append(dibujo);
            capaHojas.append(hoja);
        });

        document.body.append(capaHojas);
        actualizarVisibilidad();
    }

    function actualizarVisibilidad() {
        if (capaHojas) {
            capaHojas.classList.toggle(
                "pagina-no-visible",
                document.hidden
            );
        }
    }

    function actualizarPreferencia() {
        if (preferencia.matches) {
            if (capaHojas) {
                capaHojas.remove();
                capaHojas = null;
            }

            return;
        }

        crearHojas();
    }

    function iniciarAmbiente() {
        invitacionAbierta = true;
        portada.classList.add("entrada-iniciada");
        crearHojas();
    }

    preferencia.addEventListener("change", actualizarPreferencia);

    document.addEventListener(
        "visibilitychange",
        actualizarVisibilidad
    );

    if (apertura && apertura.open) {
        apertura.addEventListener("close", iniciarAmbiente, {
            once: true,
        });
    } else {
        iniciarAmbiente();
    }
})();