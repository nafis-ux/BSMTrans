const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZGM0MWJkMy1kNDQxLTQ4NjUtYWI1YS0wY2Y4YTkzOTlmZjkiLCJpYXQiOjE3ODIwNTIzMjMsImV4cCI6MTc4MjA1NTkyM30.xL_WPLx7pRd1TSpscOPpGRkvXP1akpGhzOg0CuQEXMM";

const API = "https://bsmtrans-production-448e.up.railway.app";

async function testCreateMobil() {
  console.log("=== TEST 1: POST /api/admin/mobil (with image URL) ===");
  const body = {
    namaMobil: "Test Gambar",
    tipe: "SUV",
    hargaPerHari: 500000,
    biayaDriver: 150000,
    statusTersedia: true,
    kursi: 5,
    bagasi: 2,
    transmisi: "Manual",
    fiturLain: "AC, Audio",
    image: "https://res.cloudinary.com/dqofzamwz/image/upload/v1782050446/bsmtrans_uploads/wtugxdnjncouivomedrz.jpg"
  };

  try {
    const res = await fetch(`${API}/api/admin/mobil`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function testUpdateMobilImage() {
  console.log("\n=== TEST 2: PUT /api/admin/mobil/MBL-7316 (update data with image) ===");
  const body = {
    image: "https://res.cloudinary.com/dqofzamwz/image/upload/v1782050446/bsmtrans_uploads/wtugxdnjncouivomedrz.jpg"
  };

  try {
    const res = await fetch(`${API}/api/admin/mobil/MBL-7316`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

async function verifyDB() {
  console.log("\n=== VERIFY: GET /api/mobil ===");
  try {
    const res = await fetch(`${API}/api/mobil`);
    const data = await res.json();
    console.log("All mobil:", data.map(m => ({ id: m.id, namaMobil: m.namaMobil, image: m.image })));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

(async () => {
  await testCreateMobil();
  await testUpdateMobilImage();
  await verifyDB();
})();
