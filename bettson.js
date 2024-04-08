const { chromium } = require("playwright");
const axios = require("axios");

async function interceptAPICall() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Definir una variable para almacenar la última URL interceptada
  let interceptedURL;

  // Habilitar el interceptor de peticiones
  await context.route("**/*", (route) => {
    const url = route.request().url();
    if (
      url.startsWith(
        "https://www.betsson.com/api/sb/v1/widgets/events-table/v2?categoryIds=1&competitionIds="
      )
    ) {
      interceptedURL = url;
    }
    route.continue();
  });

  const page = await context.newPage();

  await page.goto("https://www.betsson.com/pe/apuestas-deportivas/futbol");

  // Esperar a que el acordeón aparezca en la página
  await page.waitForSelector(
    '.obg-m-events-master-detail-header[obgaccordionheader=""]'
  );

  // Obtener el tiempo actual
  const startTime = Date.now();

  // Hacer clic en el acordeón para expandirlo
  await page.click(
    '.obg-m-events-master-detail-header[obgaccordionheader=""]:has-text("Mañana")'
  );

  // Esperar hasta que se genere una nueva solicitud
  while (!interceptedURL) {
    // Esperar un breve momento para permitir que se realicen las solicitudes
    await page.waitForTimeout(500);

    // Comprobar si ha pasado demasiado tiempo (10 segundos)
    if (Date.now() - startTime > 10000) {
      throw new Error(
        "Se excedió el tiempo de espera para la nueva solicitud."
      );
    }
  }

  await browser.close();

  return interceptedURL;
}

interceptAPICall()
  .then((interceptedURL) => {
    if (interceptedURL) {
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        accept: "application/json, text/plain, */*",
        "accept-language": "es-ES,es;q=0.9",
        brandid: "e123be9a-fe1e-49d0-9200-6afcf20649af",
        "cloudfront-viewer-country": "PE",
        "content-type": "application/json",
        correlationid: "a70b8930-0cef-4bb9-b37f-c034d0c7ee28",
        marketcode: "pe",
        "sec-ch-ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      };

      axios
        .get(interceptedURL, { headers })
        .then((response) => {
          const data = response.data.data;
          const eventos = data.events;
          const selections = data.selections;

          console.log(`Cantidad de eventos: ${eventos.length}`);

          eventos.forEach((evento) => {
            console.log(`Evento: ${evento.label}`);
            console.log(
              `Liga: ${evento.competitionName}, Región: ${evento.regionName}`
            );

            const seleccionesEvento = selections.filter((seleccion) =>
              seleccion.marketId.includes(evento.id)
            );

            seleccionesEvento.forEach((seleccion) => {
              console.log(
                `Apuesta: ${seleccion.participantLabel}, Cuota: ${seleccion.odds}`
              );
            });

            console.log("---------------------------");
          });
        })
        .catch((error) => {
          console.error("Error al hacer la solicitud a la API:", error);
        });
    } else {
      console.log("No se interceptó ninguna URL de la API.");
    }
  })
  .catch((error) => {
    console.error("Error al interceptar la URL de la API:", error);
  });
