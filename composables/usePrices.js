// composables/usePrices.js
import { reactive } from "vue";

export const usePrices = () => {
  const prices = reactive({});

  // Renk belirleyici (Eski koddan buraya taşıdık)
  const getChangeColor = (change) =>
    change >= 0 ? "text-green-400" : "text-red-400";

  // Flash efekti (Eski koddan buraya taşıdık)
  const triggerFlash = (key, newPrice, oldPrice) => {
    if (!prices[key]) return;
    if (newPrice > oldPrice) prices[key].status = "up";
    else if (newPrice < oldPrice) prices[key].status = "down";
    setTimeout(() => {
      if (prices[key]) prices[key].status = "";
    }, 300);
  };

  const initialize = (data) => {
    if (!data) return;
    Object.keys(data).forEach((key) => {
      prices[key] = { ...data[key], status: "" };
    });
  };

  const connectWS = (symbols) => {
    if (process.server) return;

    const streamList = symbols.map((key) => `${key}usdt@ticker`).join("/");
    const socket = new WebSocket(
      `wss://stream.binance.com:9443/stream?streams=${streamList}`,
    );

    socket.onmessage = (event) => {
      const { data } = JSON.parse(event.data);
      const key = data.s.replace("USDT", "").toLowerCase();
      const newPrice = parseFloat(data.c);
      const newChange = parseFloat(data.P);

      if (!prices[key]) {
        prices[key] = {
          name: key.toUpperCase(),
          usd: newPrice,
          usd_24h_change: newChange,
          status: "",
        };
      } else {
        triggerFlash(key, newPrice, prices[key].usd);
        prices[key].usd = newPrice;
        prices[key].usd_24h_change = newChange;
      }
    };

    return socket;
  };

  return { prices, initialize, connectWS, getChangeColor };
};
