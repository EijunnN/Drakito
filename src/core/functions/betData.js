// const { chromium } = require("playwright");
// const axios = require("axios");
// const { Bet } = require("../../../lib/models/schema"); // Asegúrate de importar el modelo adecuado

// // Funcion para crear un id con letras y numeros de 6 digitos sin usar nanoId
// function idxd(length) {
//   let result = "";
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   const charactersLength = characters.length;
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

// async function actualizarApuestas() {
//   try {
//     const interceptedURL = await interceptAPICall();
//     const nextDate = new Date();
//     nextDate.setDate(nextDate.getDate() + 1);
//     if (interceptedURL) {
//       const headers = {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         accept: "application/json, text/plain, */*",
//         "accept-language": "es-ES,es;q=0.9",
//         brandid: "e123be9a-fe1e-49d0-9200-6afcf20649af",
//         "cloudfront-viewer-country": "PE",
//         "content-type": "application/json",
//         correlationid: "a70b8930-0cef-4bb9-b37f-c034d0c7ee28",
//         marketcode: "pe",
//         "sec-ch-ua":
//           '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
//       };

//       const response = await axios.get(interceptedURL, { headers });
//       const data = response.data.data;
//       const eventos = data.events;
//       const selections = data.selections;

//       // Limpiar apuestas anteriores
//       await Bet.deleteMany({});

//       // Crear nuevas apuestas
//       for (const evento of eventos) {
//         // Filtrar selecciones para este evento
//         const seleccionesEvento = selections.filter((seleccion) =>
//           seleccion.marketId.includes(evento.id)
//         );
//         // console.log(seleccionesEvento);
//         // Crear un objeto que contenga la información del evento y sus apuestas
//         const apuestasEvento = {
//           liga: evento.competitionName,
//           betId: idxd(6),
//           region: evento.regionName,
//           eventId: evento.id,
//           description: evento.label,
//           date : nextDate,
//           bets: seleccionesEvento.map((seleccion, index) => ({
//             index: index + 1,
//             // si la seleccion.participantLabel empieza con la palabra más o menos, se debe dejar igual, pero si empieza con Empate se mantiene igual, pero si empieza con otro texto se le agrega "gana"
//             description:
//               seleccion.participantLabel.startsWith("más") ||
//               seleccion.participantLabel.startsWith("menos")
//                 ? seleccion.participantLabel + ` goles`
//                 : seleccion.participantLabel.startsWith("Empate")
//                 ? seleccion.participantLabel
//                 : `Gana ${seleccion.participantLabel}`,
//             cuota: seleccion.odds,
//           })),
//         };

//         // Guardar el evento con sus apuestas en la base de datos
//         await Bet.create(apuestasEvento);
//       }

//       console.log("Apuestas actualizadas correctamente.");
//     } else {
//       console.log("No se interceptó ninguna URL de la API.");
//     }
//   } catch (error) {
//     console.error("Error al actualizar las apuestas:", error);
//   }
// }

// async function interceptAPICall() {
//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext();

//   // Definir una variable para almacenar la última URL interceptada
//   let interceptedURL;

//   // Habilitar el interceptor de peticiones
//   await context.route("**/*", (route) => {
//     const url = route.request().url();
//     if (
//       url.startsWith(
//         "https://www.betsson.com/api/sb/v1/widgets/events-table/v2?categoryIds=1&competitionIds="
//       )
//     ) {
//       interceptedURL = url;
//     }
//     route.continue();
//   });

//   const page = await context.newPage();

//   await page.goto("https://www.betsson.com/pe/apuestas-deportivas/futbol");

//   // Esperar a que el acordeón aparezca en la página
//   await page.waitForSelector(
//     '.obg-m-events-master-detail-header[obgaccordionheader=""]'
//   );

//   // Obtener el tiempo actual
//   const startTime = Date.now();

//   // Hacer clic en el acordeón para expandirlo
//   await page.click(
//     '.obg-m-events-master-detail-header[obgaccordionheader=""]:has-text("Mañana")'
//   );

//   // Esperar hasta que se genere una nueva solicitud
//   while (!interceptedURL) {
//     // Esperar un breve momento para permitir que se realicen las solicitudes
//     await page.waitForTimeout(2500);

//     // Comprobar si ha pasado demasiado tiempo (10 segundos)
//     if (Date.now() - startTime > 10000) {
//       throw new Error(
//         "Se excedió el tiempo de espera para la nueva solicitud."
//       );
//     }
//   }

//   await browser.close();

//   return interceptedURL;
// }

// module.exports = { actualizarApuestas };


const { chromium } = require("playwright");
const axios = require("axios");
const { Bet } = require("../../../lib/models/schema");

// Función para crear un ID con letras y números de 6 dígitos sin usar nanoId
function idxd(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function actualizarApuestas() {
  try {
    const interceptedURL = await interceptAPICall();
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

      const response = await axios.get(interceptedURL, { headers });
      const data = response.data.data;
      const eventos = data.events;
      const selections = data.selections;

      // Obtener los IDs de eventos existentes en la base de datos
      const existingEventIds = await Bet.distinct("eventId");

      // Filtrar los eventos nuevos que no están en la base de datos
      const newEventos = eventos.filter(
        (evento) => !existingEventIds.includes(evento.id)
      );

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);

      // Crear nuevas apuestas para los eventos nuevos
      for (const evento of newEventos) {
        // Filtrar selecciones para este evento
        const seleccionesEvento = selections.filter((seleccion) =>
          seleccion.marketId.includes(evento.id)
        );

        // Crear un objeto que contenga la información del evento y sus apuestas
        const apuestasEvento = {
          liga: evento.competitionName,
          betId: idxd(6),
          region: evento.regionName,
          eventId: evento.id,
          description: evento.label,
          bets: seleccionesEvento.map((seleccion, index) => ({
            index: index + 1,
            description: seleccion.participantLabel.startsWith("más") ||
              seleccion.participantLabel.startsWith("menos")
              ? seleccion.participantLabel + ` goles`
              : seleccion.participantLabel.startsWith("Empate")
              ? seleccion.participantLabel
              : `Gana ${seleccion.participantLabel}`,
            cuota: seleccion.odds,
          })),
          date: nextDate,
        };

        // Guardar el evento con sus apuestas en la base de datos
        await Bet.create(apuestasEvento);
      }

      console.log("Apuestas actualizadas correctamente.");
    } else {
      console.log("No se interceptó ninguna URL de la API.");
    }
  } catch (error) {
    console.error("Error al actualizar las apuestas:", error);
  }
}

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
    await page.waitForTimeout(2500);

    // Comprobar si ha pasado demasiado tiempo (10 segundos)
    if (Date.now() - startTime > 10000) {
      throw new Error("Se excedió el tiempo de espera para la nueva solicitud.");
    }
  }

  await browser.close();

  return interceptedURL;
}

module.exports = { actualizarApuestas };