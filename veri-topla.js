// veri-topla.js
const fs = require('fs');

async function veriSetiTopla() {
  // Spoonacular veritabanından toplu olarak çekmek istediğimiz popüler tariflerin gerçek ID listesi
  const tarifIds = [
    716429, 715538, 715415, 715446, 715594, 715525, 715419, 715412, 
    644387, 642605, 637876, 638420, 633344, 654812, 654928, 665348
  ];
  
  // Sizin güncel Spoonacular API Anahtarınız
  const apiKey = '6ae528157c294bfd964327ba48e016e5';
  
  // IDs parametresini virgüllerle birleştirerek Bulk Request URL'sini hazırlıyoruz
  const url = `https://api.spoonacular.com/recipes/informationBulk?ids=${tarifIds.join(',')}&includeNutrition=true&apiKey=${apiKey}`;
  
  console.log("--------------------------------------------------");
  console.log("🚀 STYLIA VERİ SÜRECİ: Spoonacular ambarından toplu veri seti çekiliyor...");
  console.log(`📋 Toplam talep edilen tarif sayısı: ${tarifIds.length}`);
  console.log("--------------------------------------------------");
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Hatası! Durum Kodu: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Gelen ham veri setini proje klasörünüze 'spoonacular_veri_seti.json' adıyla kaydeder
    fs.writeFileSync('spoonacular_veri_seti.json', JSON.stringify(data, null, 2));
    
    console.log("\n💾 [BAŞARILI] Veri seti yerel depolamaya aktarıldı!");
    console.log("📂 Dosya adı: spoonacular_veri_seti.json");
    console.log(`✨ Tam ${data.length} adet tarifin tüm malzemeleri, besin değerleri ve yapılış adımları hazır.\n`);
  } catch (error) {
    console.error("\n❌ [HATA] Toplu veri çekme işlemi başarısız oldu:");
    console.error(error.message);
    console.log("💡 Tavsiye: Spoonacular API kotanızı veya internet bağlantınızı kontrol edin.\n");
  }
}

veriSetiTopla();