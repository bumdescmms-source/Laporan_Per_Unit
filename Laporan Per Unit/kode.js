function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('BUMDES Digital')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getDashboardSummary() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transaksi');
  var data = sheet.getDataRange().getValues();
  
  // Inisialisasi unit (Pastikan nama unit sama dengan value di HTML)
  var units = {
    'Jasa': { masuk: 0, keluar: 0 },
    'Internet': { masuk: 0, keluar: 0 },
    'Ketapang Ayam': { masuk: 0, keluar: 0 },
    'Sampah': { masuk: 0, keluar: 0 }
  };
  
  var global = { masuk: 0, keluar: 0 };

  // Mulai dari baris ke-2 (i=1) karena baris ke-1 adalah Header
  for (var i = 1; i < data.length; i++) {
    var u = data[i][1]; // Kolom Unit
    var j = data[i][2]; // Kolom Jenis (Masuk/Keluar)
    var n = Number(data[i][4]) || 0; // Kolom Nominal

    if (units[u]) {
      if (j == "Masuk") { 
        units[u].masuk += n; 
        global.masuk += n; 
      } else { 
        units[u].keluar += n; 
        global.keluar += n; 
      }
    }
  }

  // Hitung Laba Bersih
  var labaBersih = global.masuk - global.keluar;
  
  // Logika Pembagian Laba AD/ART (Hanya jika untung)
  var alokasi = { modal: 0, pades: 0, pengelola: 0 };
  if (labaBersih > 0) {
    alokasi.modal = labaBersih * 0.30;     // 30%
    alokasi.pades = labaBersih * 0.35;     // 35%
    alokasi.pengelola = labaBersih * 0.35; // 35%
  }

  return { 
    units: units, 
    global: global, 
    laba: labaBersih,
    alokasi: alokasi 
  };
}

function processForm(formObject) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transaksi');
  
  // Ambil data dari form
  var unit = formObject.unit;
  var jenis = formObject.jenis;
  var kas = formObject.kas;
  var nominal = formObject.nominal;
  var keterangan = formObject.keterangan;
  
  // Tambah baris baru
  sheet.appendRow([
    new Date(), 
    unit, 
    jenis, 
    kas, 
    nominal, 
    keterangan
  ]);
  
  return "Berhasil! Data Transaksi " + unit + " telah disimpan.";
}

function getDataLaporan() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transaksi');
  return sheet.getDataRange().getDisplayValues();
}
function processForm(formObject) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transaksi');
  var unit = formObject.unit;
  var jenis = formObject.jenis;
  var kas = formObject.kas;
  var nominal = Number(formObject.nominal);
  var keterangan = formObject.keterangan;
  var tanggal = new Date();
  
  sheet.appendRow([tanggal, unit, jenis, kas, nominal, keterangan]);
  
  // Kirim data kembali ke browser untuk dicetak di faktur
  return {
    status: "Sukses",
    data: {
      tanggal: Utilities.formatDate(tanggal, "GMT+7", "dd/MM/yyyy HH:mm"),
      unit: unit,
      jenis: jenis,
      kas: kas,
      nominal: nominal,
      keterangan: keterangan,
      nomor: Math.floor(Math.random() * 100000) // Nomor invoice acak sederhana
    }
  };
}
