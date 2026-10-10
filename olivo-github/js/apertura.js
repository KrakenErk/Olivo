(() => {
    "use strict";

    const apertura = document.querySelector("#apertura-invitacion");
    const botonAbrir = document.querySelector("#abrir-invitacion");
    const portada = document.querySelector(".olivo-portada");
    const nombres = document.querySelector("#nombres");

    document.querySelector("#omitir-apertura")?.remove();

    // ==================================================
    // AJUSTES DURANTE LA APERTURA
    // ==================================================

    if (!document.querySelector("#ajustes-apertura-fluida")) {
        const estilos = document.createElement("style");

        estilos.id = "ajustes-apertura-fluida";

        estilos.textContent = `
            body.olivo-apertura-activa .olivo-lluvia {
                visibility: hidden;
            }

            body.olivo-apertura-activa .olivo-hoja-cayendo,
            body.olivo-apertura-activa .olivo-rama {
                animation-play-state: paused;
            }

            body.olivo-papel #nombres:focus,
            body.olivo-papel #nombres:focus-visible {
                outline: none;
            }

            body.olivo-papel .olivo-apertura.apertura-fluida,
            body.olivo-papel .apertura-fluida .olivo-sobre-carta,
            body.olivo-papel .apertura-fluida .olivo-sobre-solapa,
            body.olivo-papel .apertura-fluida .olivo-sobre-sello {
                transition: none;
            }

            body.olivo-papel .apertura-fluida .olivo-sobre {
                perspective: none;
            }
        `;

        document.head.appendChild(estilos);
    }

    // ==================================================
    // SEPARADOR DESPUÉS DEL CALENDARIO
    // ==================================================

    const agenda = document.querySelector(".olivo-agenda");

    if (
        agenda &&
        !document.querySelector(".olivo-separador-agenda")
    ) {
        const separador = document.createElement("div");

        separador.className =
            "olivo-separador olivo-separador-agenda";

        separador.setAttribute("aria-hidden", "true");

        for (let indice = 0; indice < 3; indice += 1) {
            const parte = document.createElement("span");

            if (indice === 1) {
                parte.className = "olivo-rombo";
            }

            separador.appendChild(parte);
        }

        agenda.insertAdjacentElement("afterend", separador);
    }

    // ==================================================
    // CALENDARIO ACTUAL
    // Se conserva Google hasta decidir la alternativa nativa.
    // ==================================================

    function textoDe(elemento, selector) {
        return (
            elemento?.querySelector(selector)?.textContent || ""
        ).trim().replace(/\s+/g, " ");
    }

    function fechaParaGoogle(fecha) {
        return fecha
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}Z$/, "Z");
    }

    function prepararCalendario() {
        const enlace = document.querySelector(".olivo-calendario");
        const ayuda = document.querySelector("#ayuda-calendario");
        const contador = document.querySelector("#contador");

        if (!enlace) {
            return;
        }

        enlace.removeAttribute("download");
        enlace.removeAttribute("href");

        const fechaTexto = contador?.dataset.fecha || "";
        const tieneZona = /(?:Z|[+-]\d{2}:\d{2})$/i.test(fechaTexto);
        const inicio = new Date(fechaTexto);

        if (!tieneZona || Number.isNaN(inicio.getTime())) {
            enlace.setAttribute("aria-disabled", "true");

            if (ayuda) {
                ayuda.textContent =
                    "La fecha del calendario no está disponible por ahora.";
            }

            return;
        }

        const fin = new Date(inicio.getTime() + 60 * 60 * 1000);

        const pareja = Array.from(
            document.querySelectorAll("#nombres .olivo-nombre")
        ).map((elemento) => elemento.textContent.trim()).join(" y ");

        const lugares = document.querySelectorAll(".olivo-lugar");
        const ceremonia = lugares[0];
        const recepcion = lugares[1];

        function direccionDe(lugar) {
            return [
                textoDe(lugar, ".olivo-lugar-nombre"),
                textoDe(lugar, ".olivo-lugar-direccion"),
                textoDe(lugar, ".olivo-lugar-ciudad")
            ].filter(Boolean).join(", ");
        }

        const descripcion = [
            "Invitación de demostración de Tinta Esencial.",
            "No corresponde a un evento real.",
            "",
            "Ceremonia: " + textoDe(ceremonia, ".olivo-lugar-hora"),
            direccionDe(ceremonia),
            "",
            "Recepción: " + textoDe(recepcion, ".olivo-lugar-hora"),
            direccionDe(recepcion),
            "",
            "Duración de ejemplo del recordatorio: una hora.",
            "Puedes ajustarla antes de guardar."
        ].join("\n");

        const url = new URL(
            "https://calendar.google.com/calendar/r/eventedit"
        );

        url.searchParams.set("action", "TEMPLATE");
        url.searchParams.set(
            "text",
            "Ceremonia de " + (pareja || "nuestra boda") + " · Demostración"
        );
        url.searchParams.set(
            "dates",
            fechaParaGoogle(inicio) + "/" + fechaParaGoogle(fin)
        );
        url.searchParams.set("stz", "America/Mexico_City");
        url.searchParams.set("etz", "America/Mexico_City");
        url.searchParams.set("location", direccionDe(ceremonia));
        url.searchParams.set("details", descripcion);

        enlace.href = url.toString();
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.removeAttribute("aria-disabled");

        enlace.setAttribute(
            "aria-label",
            "Agregar a Google Calendar; abre una nueva pestaña"
        );

        const etiqueta = enlace.querySelector("span");

        if (etiqueta) {
            etiqueta.textContent = "Agregar a Google Calendar";
        }

        if (ayuda) {
            ayuda.textContent =
                "Abre el evento con los datos preparados y pulsa Guardar.";
        }
    }

    prepararCalendario();

    // ==================================================
    // APERTURA LIGERA, SIN GIRO EN 3D
    // ==================================================

    function mostrarPortada() {
        portada?.classList.add("entrada-iniciada");
    }

    function liberarPagina() {
        document.body.classList.remove("olivo-apertura-activa");
        mostrarPortada();
    }

    if (
        !apertura ||
        !botonAbrir ||
        typeof apertura.showModal !== "function"
    ) {
        liberarPagina();
        return;
    }

    const solapa = apertura.querySelector(".olivo-sobre-solapa");
    const carta = apertura.querySelector(".olivo-sobre-carta");
    const sello = apertura.querySelector(".olivo-sobre-sello");

    let abriendo = false;
    const animaciones = new Set();

    function animar(elemento, fotogramas, opciones) {
        const animacion = elemento.animate(fotogramas, {
            fill: "forwards",
            easing: "cubic-bezier(0.25, 0.8, 0.25, 1)",
            ...opciones
        });

        animaciones.add(animacion);
        return animacion.finished;
    }

    function cancelarAnimaciones() {
        for (const animacion of animaciones) {
            animacion.cancel();
        }

        animaciones.clear();
    }

    function cerrarSobre() {
        if (apertura.open) {
            apertura.close();
        } else {
            liberarPagina();
        }
    }

    async function abrirSobre() {
        if (abriendo) {
            return;
        }

        abriendo = true;
        botonAbrir.disabled = true;

        const reducirMovimiento = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        if (
            reducirMovimiento ||
            !solapa ||
            !carta ||
            !sello ||
            typeof apertura.animate !== "function"
        ) {
            cerrarSobre();
            return;
        }

        apertura.classList.add("apertura-fluida");

        try {
            /*
               Todos los movimientos se programan juntos.
               La tarjeta comienza antes de que termine la solapa.
               La apertura completa dura aproximadamente un segundo.
            */
            await Promise.all([
                animar(
                    sello,
                    [
                        { opacity: 1 },
                        { opacity: 0 }
                    ],
                    {
                        duration: 140,
                        easing: "ease-out"
                    }
                ),

                animar(
                    solapa,
                    [
                        {
                            transform: "scaleY(1)",
                            opacity: 1
                        },
                        {
                            transform: "scaleY(0)",
                            opacity: 0
                        }
                    ],
                    {
                        duration: 420,
                        delay: 50
                    }
                ),

                animar(
                    carta,
                    [
                        { transform: "translateY(0)" },
                        { transform: "translateY(-34%)" }
                    ],
                    {
                        duration: 550,
                        delay: 230
                    }
                ),

                animar(
                    apertura,
                    [
                        { opacity: 1 },
                        { opacity: 0 }
                    ],
                    {
                        duration: 250,
                        delay: 720,
                        easing: "ease-out",
                        fill: "forwards"
                    }
                )
            ]);

            cerrarSobre();
        } catch (error) {
            // Si se presiona Escape, las animaciones se cancelan.
            if (apertura.open) {
                cerrarSobre();
            }
        }
    }

    botonAbrir.addEventListener("click", abrirSobre);

    apertura.addEventListener("close", () => {
        cancelarAnimaciones();

        apertura.classList.remove(
            "apertura-fluida",
            "abriendo",
            "saliendo"
        );

        liberarPagina();

        abriendo = false;
        botonAbrir.disabled = false;

        if (nombres) {
            nombres.setAttribute("tabindex", "-1");
            nombres.focus({ preventScroll: true });
        }
    });

    if (window.location.hash) {
        liberarPagina();
        return;
    }

    apertura.classList.remove("abriendo", "saliendo");
    apertura.showModal();
    document.body.classList.add("olivo-apertura-activa");
})();