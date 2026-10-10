(() => {
    const preferenciaMovimiento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const apertura = document.querySelector("#apertura-invitacion");

    let iniciado = false;
    let observador;

    function iniciarAnimaciones() {
        if (iniciado) {
            return;
        }

        iniciado = true;

        // Respetamos la preferencia de reducir movimiento.
        if (
            preferenciaMovimiento.matches ||
            !("IntersectionObserver" in window)
        ) {
            return;
        }

        const elementos = document.querySelectorAll(`
            .olivo-contador h2,
            .olivo-historia h2,
            .olivo-historia-texto,
            .olivo-firma,
            .olivo-celebracion > h2,
            .olivo-lugar,
            .olivo-programa > h2,
            .olivo-itinerario > li,
            .olivo-vestimenta-ilustracion,
            .olivo-vestimenta-tipo,
            .olivo-regalo-ilustracion,
            .olivo-regalos > h2,
            .olivo-despedida h2
        `);

        observador = new IntersectionObserver(
            function (entradas) {
                entradas.forEach(function (entrada) {
                    if (!entrada.isIntersecting) {
                        return;
                    }

                    entrada.target.classList.add("olivo-revelar");

                    // Cada elemento se anima solamente una vez.
                    observador.unobserve(entrada.target);
                });
            },
            {
                threshold: 0.12,
            }
        );

        elementos.forEach(function (elemento) {
            observador.observe(elemento);
        });
    }

    // Si cambia la preferencia del dispositivo, detenemos los efectos.
    preferenciaMovimiento.addEventListener("change", function (evento) {
        if (!evento.matches) {
            return;
        }

        if (observador) {
            observador.disconnect();
        }

        document.querySelectorAll(".olivo-revelar").forEach(
            function (elemento) {
                elemento.classList.remove("olivo-revelar");
            }
        );
    });

    // Esperamos a que se cierre el sobre antes de observar la página.
    if (apertura && apertura.open) {
        apertura.addEventListener("close", iniciarAnimaciones, {
            once: true,
        });
    } else {
        iniciarAnimaciones();
    }
})();