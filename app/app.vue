<script setup>
useSeoMeta({
  title: "Canlı Kripto Fiyatları | Anlık Coin Takip Ekranı",
  ogTitle: "Canlı Kripto Fiyatları | Anlık Coin Takip Ekranı",
  description:
    "Bitcoin, Ethereum ve en popüler 10 kripto paranın fiyatlarını saniyelik değişimlerle canlı takip edin. Reklamsız ve hızlı borsa verileri.",
  ogDescription:
    "Bitcoin, Ethereum ve en popüler 10 kripto paranın fiyatlarını saniyelik değişimlerle canlı takip edin.",
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image",
});
useHead({
  link: [
    {
      rel: "icon",
      type: "image/png",
      href: "/btc.png",
    },
  ],
});
import { reactive, onMounted, onUnmounted } from "vue";

const { data: initialData } = await useFetch("/api/prices");

// Reaktif state: Gelen veriye status alanı ekleyerek initialize ediyoruz
const prices = reactive({});
if (initialData.value) {
  Object.keys(initialData.value).forEach((key) => {
    prices[key] = { ...initialData.value[key], status: "" };
  });
}

let socket = null;
const getChangeColor = (change) =>
  change >= 0 ? "text-green-400" : "text-red-400";

const triggerFlash = (key, newPrice, oldPrice) => {
  if (newPrice > oldPrice) prices[key].status = "up";
  else if (newPrice < oldPrice) prices[key].status = "down";
  setTimeout(() => (prices[key].status = ""), 300);
};

onMounted(() => {
  // Dinamik olarak stream string'ini oluşturuyoruz
  const streamList = Object.keys(prices)
    .map((key) => `${key}usdt@ticker`)
    .join("/");
  socket = new WebSocket(
    `wss://stream.binance.com:9443/stream?streams=${streamList}`,
  );

  socket.onmessage = (event) => {
    const { data } = JSON.parse(event.data);
    const key = data.s.replace("USDT", "").toLowerCase();

    if (prices[key]) {
      const newPrice = parseFloat(data.c);
      triggerFlash(key, newPrice, prices[key].usd);
      prices[key].usd = newPrice;
      prices[key].usd_24h_change = parseFloat(data.P);
    }
  };
});

onUnmounted(() => socket?.close());
</script>

<template>
  <div
    class="min-h-screen bg-[#0d1117] text-white flex flex-col items-center py-6 px-4 font-sans"
  >
    <h1 class="text-3xl font-bold mb-6 flex items-center gap-3">
      Top 10 Market
    </h1>

    <div
      v-if="Object.keys(prices).length > 0"
      class="w-full max-w-xl bg-[#161b22] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl"
    >
      <div
        class="flex justify-between px-6 py-4 bg-[#1c2128] text-gray-400 text-xs uppercase font-bold tracking-wider"
      >
        <span>Varlık</span>
        <span class="text-right">Fiyat / 24s Değişim</span>
      </div>

      <div
        v-for="(coin, key) in prices"
        :key="key"
        :class="[
          'flex justify-between items-center px-6 py-4 border-b border-gray-800/50 transition-all duration-300',
          coin.status === 'up' ? 'bg-green-500/15' : '',
          coin.status === 'down' ? 'bg-red-500/10' : '',
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-700"
          >
            <img
              :src="`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${key}.png`"
              :alt="coin.name"
              class="w-full h-full object-cover"
              @error="
                (e) =>
                  (e.target.src = `https://ui-avatars.com/api/?name=${coin.name}&background=1c2128&color=fff`)
              "
            />
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-sm tracking-wide">{{ coin.name }}</span>
            <span class="text-[10px] text-gray-500 uppercase"
              >{{ key }} / usdt</span
            >
          </div>
        </div>

        <div class="text-right">
          <div class="font-mono text-base font-bold tabular-nums">
            ${{
              coin.usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })
            }}
          </div>
          <div
            :class="[
              'text-xs font-semibold mt-1',
              getChangeColor(coin.usd_24h_change),
            ]"
          >
            {{ coin.usd_24h_change >= 0 ? "▲" : "▼" }}
            {{ Math.abs(coin.usd_24h_change).toFixed(2) }}%
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-500 animate-pulse mt-20">
      Veriler senkronize ediliyor...
    </div>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
