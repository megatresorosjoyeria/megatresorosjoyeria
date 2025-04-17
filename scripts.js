jQuery(document).ready(function() {
    // Inicializar URL en el formulario
    jQuery('#landingurl').val(window.location.href);

    // Animaciones al hacer scroll
    function animateOnScroll() {
        jQuery('.animate-on-scroll').each(function() {
            const elementTop = jQuery(this).offset().top;
            const elementHeight = jQuery(this).outerHeight();
            const windowHeight = jQuery(window).height();
            const scrollY = window.scrollY || window.pageYOffset;

            if (scrollY > elementTop - windowHeight + elementHeight / 3) {
                jQuery(this).addClass('animate');
            }
        });
    }

    // Ejecutar animaciones al cargar y al hacer scroll
    animateOnScroll();
    jQuery(window).on('scroll', animateOnScroll);

    // Cambiar el formulario según el tipo de consulta
    jQuery('input[name="tipo_consulta"]').on('change', function() {
        const tipoConsulta = jQuery('input[name="tipo_consulta"]:checked').val();
        const submitButton = jQuery('#submit-button');

        // Mostrar/ocultar campos según el tipo de consulta
        if (tipoConsulta === 'venta_oro') {
            jQuery('#detalles-group').show();
            jQuery('#cita-group').show();
            jQuery('#detalles').attr('placeholder', 'Ejemplo: Peso del oro, tipo de joya, etc.');
            submitButton.text('Solicitar Cotización');
        } else if (tipoConsulta === 'compra_oro') {
            jQuery('#detalles-group').show();
            jQuery('#cita-group').show();
            jQuery('#detalles').attr('placeholder', 'Ejemplo: Tipo de oro que buscas, presupuesto, etc.');
            submitButton.text('Solicitar Información');
        } else if (tipoConsulta === 'catalogo_joyas') {
            jQuery('#detalles-group').show();
            jQuery('#cita-group').hide();
            jQuery('#detalles').attr('placeholder', 'Ejemplo: Tipo de joyas que te interesan (anillos, collares, etc.)');
            submitButton.text('Solicitar Catálogo');
        }
    });

    // Validación y envío del formulario unificado
    jQuery('#leadForm').on('submit', async function(event) {
        event.preventDefault();
        console.log("Evento submit disparado");

        let isValid = true;
        const errorSummaryList = jQuery('.error-summary ul');
        errorSummaryList.empty();
        jQuery('.error-summary').hide();

        // Validación del nombre completo
        const nombre = jQuery('#nombre').val();
        const nombreError = jQuery('#nombre-error');
        if (nombre.trim().split(/\s+/).length < 2) {
            nombreError.show();
            jQuery('#nombre').addClass('error');
            isValid = false;
            addErrorToSummary('Nombre completo (nombre y apellido).');
        } else {
            nombreError.hide();
            jQuery('#nombre').removeClass('error');
        }

        // Validación del número de WhatsApp
        const whatsapp = jQuery('#whatsapp').val();
        const whatsappError = jQuery('#whatsapp-error');
        if (whatsapp.length < 12 || !/^\d+$/.test(whatsapp)) {
            whatsappError.show();
            jQuery('#whatsapp').addClass('error');
            isValid = false;
            addErrorToSummary('Número de WhatsApp válido (mínimo 12 dígitos).');
        } else {
            whatsappError.hide();
            jQuery('#whatsapp').removeClass('error');
        }

        // Validación de selección de sucursal
        const sucursal = jQuery('input[name="sucursal"]:checked').val();
        const sucursalError = jQuery('#sucursal-error');
        if (!sucursal) {
            sucursalError.show();
            isValid = false;
            addErrorToSummary('Selecciona una sucursal para visitar.');
        } else {
            sucursalError.hide();
        }

        // Validación de tipo de consulta
        const tipoConsulta = jQuery('input[name="tipo_consulta"]:checked').val();
        const tipoConsultaError = jQuery('#tipo-consulta-error');
        if (!tipoConsulta) {
            tipoConsultaError.show();
            isValid = false;
            addErrorToSummary('Selecciona el tipo de consulta.');
        } else {
            tipoConsultaError.hide();
        }

        // Si hay errores, mostrar el resumen
        if (!isValid) {
            console.log("Form validation failed");
            jQuery('.error-summary').show();
        } else {
            // Enviar datos a la aplicación web usando AJAX y jQuery
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });

            console.log("Datos del formulario a enviar:", formObject);

            // Obtener el WhatsApp de la sucursal seleccionada
            let sucursalWhatsapp = "593995190080"; // Default a Norte

            if (sucursal.includes("Sur")) {
                sucursalWhatsapp = "593979012315";
            } else if (sucursal.includes("Centro") && !sucursal.includes("Norte")) {
                sucursalWhatsapp = "593995199146";
            } else if (sucursal.includes("Centro-Norte")) {
                sucursalWhatsapp = "593958984622";
            } else if (sucursal.includes("Norte")) {
                sucursalWhatsapp = "593995190080";
            }

            // Crear el mensaje de WhatsApp según el tipo de consulta
            let whatsappLink;
            let whatsappMessage = "";

            if (tipoConsulta === 'venta_oro') {
                whatsappMessage = `Hola, quisiera confirmar mi cotización para venta de oro:%0A*Nombre:* ${encodeURIComponent(formObject.nombre)}%0A*Cotización:* ${encodeURIComponent(formObject.detalles || '')}%0A*Sucursal:* ${encodeURIComponent(sucursal)}%0A`;

                if (formObject.cita) {
                    whatsappMessage += `*Día y hora preferible de cita:* ${encodeURIComponent(formObject.cita)}%0A`;
                }
            } else if (tipoConsulta === 'compra_oro') {
                whatsappMessage = `Hola, me interesa comprar oro:%0A*Nombre:* ${encodeURIComponent(formObject.nombre)}%0A*Detalles:* ${encodeURIComponent(formObject.detalles || '')}%0A*Sucursal:* ${encodeURIComponent(sucursal)}%0A`;

                if (formObject.cita) {
                    whatsappMessage += `*Día y hora preferible de cita:* ${encodeURIComponent(formObject.cita)}%0A`;
                }
            } else if (tipoConsulta === 'catalogo_joyas') {
                whatsappMessage = `Hola, me interesa ver el catálogo de joyas:%0A*Nombre:* ${encodeURIComponent(formObject.nombre)}%0A*Interés:* ${encodeURIComponent(formObject.detalles || '')}%0A*Sucursal:* ${encodeURIComponent(sucursal)}%0A`;
            }

            console.log("Formulario validado correctamente, entrando al try/catch");

            try {
                const response = await jQuery.ajax({
                    url: "https://script.google.com/macros/s/AKfycbwdhXFtrcZPhYBX_kJl35Njwncpoi8RcmUPJzyWUfQLZETmKiAOql6MC0zqQB3ybjoucA/exec",
                    method: "POST",
                    dataType: "json",
                    data: formObject,
                });

                console.log('Respuesta del servidor:', response);
                if (response.result === 'success') {
                    gtag('event', 'conversion', {'send_to': 'AW-11551405281/mlLNCIqbkIQaEOHpkYQr'});
                    console.log("Evento de conversión de Google Ads disparado.");

                    whatsappLink = `https://wa.me/${sucursalWhatsapp}?text=${whatsappMessage}`;

                    // Redirigir a WhatsApp después de 2 segundos
                    setTimeout(function () {
                        window.open(whatsappLink, '_blank');
                        jQuery('#leadForm')[0].reset();
                        // Restaurar el formulario al estado inicial
                        jQuery('#detalles-group').show();
                        jQuery('#cita-group').show();
                        jQuery('#detalles').attr('placeholder', 'Ejemplo: Peso del oro, tipo de joya, etc.');
                        jQuery('#submit-button').text('Solicitar Cotización');
                    }, 2000);

                } else {
                    console.error('Error en la respuesta del servidor:', response.message);
                }
            } catch (error) {
                console.error('Error en la petición AJAX:', error);

                gtag('event', 'conversion', {'send_to': 'AW-11551405281/mlLNCIqbkIQaEOHpkYQr'});
                console.log("Evento de conversión de Google Ads disparado (caso de error AJAX).");

                whatsappLink = `https://wa.me/${sucursalWhatsapp}?text=${whatsappMessage}`;

                // Redirigir a WhatsApp después de 2 segundos
                setTimeout(function () {
                    window.open(whatsappLink, '_blank');
                    jQuery('#leadForm')[0].reset();
                    // Restaurar el formulario al estado inicial
                    jQuery('#detalles-group').show();
                    jQuery('#cita-group').show();
                    jQuery('#detalles').attr('placeholder', 'Ejemplo: Peso del oro, tipo de joya, etc.');
                    jQuery('#submit-button').text('Solicitar Cotización');
                }, 2000);
            }
        }

        function addErrorToSummary(errorMessage) {
            console.log("Adding error to summary:", errorMessage);
            const listItem = jQuery('<li></li>').text(errorMessage);
            errorSummaryList.append(listItem);
        }
    });

    // Smooth scroll para los enlaces internos
    jQuery('a[href^="#"]').on('click', function(event) {
        event.preventDefault();
        const target = jQuery(this.getAttribute('href'));

        if (target.length) {
            jQuery('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 1000);
        }
    });
});
