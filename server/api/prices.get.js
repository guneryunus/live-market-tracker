// server/api/prices.get.js
export default defineCachedEventHandler(
  async (event) => {
    try {
      const orderedIds = [
        "bitcoin",
        "ethereum",
        "binancecoin",
        "solana",
        "ripple",
        "cardano",
        "dogecoin",
        "avalanche-2",
        "polkadot",
        "tron",
      ];

      const response = await $fetch(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: orderedIds.join(","),
            vs_currencies: "usd",
            include_24hr_change: "true",
          },
        },
      );

      const mapping = {
        bitcoin: "btc",
        ethereum: "eth",
        binancecoin: "bnb",
        solana: "sol",
        ripple: "xrp",
        cardano: "ada",
        "avalanche-2": "avax",
        dogecoin: "doge",
        polkadot: "dot",
        tron: "trx",
      };

      const data = {};
      orderedIds.forEach((id) => {
        if (response[id]) {
          const cleanKey = mapping[id];
          data[cleanKey] = {
            name: cleanKey.toUpperCase(),
            usd: response[id].usd,
            usd_24h_change: response[id].usd_24h_change,
          };
        }
      });

      return data;
    } catch (error) {
      console.error("Fiyat Çekme Hatası:", error.message);
      throw createError({
        statusCode: 500,
        statusMessage: "Veri kaynagina ulasilamadi.",
      });
    }
  },
  { maxAge: 60, name: "top10-prices" },
);
