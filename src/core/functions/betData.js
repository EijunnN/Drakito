const { chromium } = require("playwright");
const axios = require("axios");
const { Bet } = require("../../../lib/models/schema");

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

async function actualizarApuestas(guildId) {
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

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);

      for (const evento of eventos) {
        const seleccionesEvento = selections.filter((seleccion) =>
          seleccion.marketId.includes(evento.id)
        );

        const apuestasEvento = {
          guildId,
          liga: evento.competitionName,
          betId: idxd(6),
          region: evento.regionName,
          eventId: evento.id,
          description: evento.label,
          bets: seleccionesEvento.map((seleccion, index) => ({
            index: index + 1,
            description:
              seleccion.participantLabel.startsWith("más") ||
              seleccion.participantLabel.startsWith("menos")
                ? seleccion.participantLabel + ` goles`
                : seleccion.participantLabel.startsWith("Empate")
                ? seleccion.participantLabel
                : `Gana ${seleccion.participantLabel}`,
            cuota: seleccion.odds,
          })),
          date: nextDate,
        };

        const existingEvent = await Bet.findOne({
          guildId,
          eventId: evento.id,
        });

        if (existingEvent) {
          await Bet.updateOne(
            { guildId, eventId: evento.id },
            { $set: apuestasEvento }
          );
        } else {
          await Bet.create(apuestasEvento);
        }
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

  let interceptedURL;

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

  await page.waitForSelector(
    '.obg-m-events-master-detail-header[obgaccordionheader=""]'
  );

  const startTime = Date.now();

  await page.click(
    '.obg-m-events-master-detail-header[obgaccordionheader=""]:has-text("Mañana")'
  );

  while (!interceptedURL) {
    await page.waitForTimeout(2500);

    if (Date.now() - startTime > 10000) {
      throw new Error(
        "Se excedió el tiempo de espera para la nueva solicitud."
      );
    }
  }

  await browser.close();

  return interceptedURL;
}

module.exports = { actualizarApuestas };
