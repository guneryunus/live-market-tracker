// server/api/prices.get.js
export default defineCachedEventHandler(
  async (event) => {
    try {
      // Piyasa değerine göre popüler ilk 10 coin
      const symbols = [
        "BTCUSDT",
        "ETHUSDT",
        "BNBUSDT",
        "SOLUSDT",
        "XRPUSDT",
        "ADAUSDT",
        "DOGEUSDT",
        "AVAXUSDT",
        "DOTUSDT",
        "TRXUSDT",
      ];

      const response = await $fetch(
        "https://api.binance.com/api/v3/ticker/24hr",
        {
          params: { symbols: JSON.stringify(symbols) },
        },
      );

      // Veriyi frontend'de kolay dönebilmek için bir objeye çeviriyoruz
      const data = {};
      response.forEach((item) => {
        // Sembolü (BTCUSDT) daha temiz bir anahtara (BTC) çeviriyoruz
        const cleanKey = item.symbol.replace("USDT", "").toLowerCase();
        data[cleanKey] = {
          name: cleanKey.toUpperCase(),
          usd: parseFloat(item.lastPrice),
          usd_24h_change: parseFloat(item.priceChangePercent),
        };
      });

      return data;
    } catch (error) {
      throw createError({
        statusCode: 502,
        statusMessage: "Binance baglantisi koptu.",
      });
    }
  },
  { maxAge: 30, name: "top10-cache" },
);
