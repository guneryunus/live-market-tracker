// server/api/prices.get.js
export default defineCachedEventHandler(
  async (event) => {
    try {
      // CoinGecko ID'leri (Piyasa değerine göre ilk 10)
      const ids = [
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
      ].join(",");

      // CoinGecko herkese açık basit fiyat API'si (IP kısıtlaması yok denecek kadar azdır)
      const response = await $fetch(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: ids,
            vs_currencies: "usd",
            include_24hr_change: "true",
          },
        },
      );

      // Frontend'deki "prices" yapına uygun hale getirmek için eşleştirme (mapping)
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
      Object.keys(response).forEach((id) => {
        const cleanKey = mapping[id];
        data[cleanKey] = {
          name: cleanKey.toUpperCase(),
          usd: response[id].usd,
          usd_24h_change: response[id].usd_24h_change,
        };
      });

      return data;
    } catch (error) {
      console.error("Fiyat Çekme Hatası:", error.message);
      throw createError({
        statusCode: 500,
        statusMessage:
          "Veri kaynagina ulasilamadi. Lütfen birazdan tekrar deneyin.",
      });
    }
  },
  { maxAge: 60, name: "top10-prices" }, // Cache süresini 60 saniyeye çıkarabilirsin, CoinGecko ücretsiz katmanda bunu sever.
);
