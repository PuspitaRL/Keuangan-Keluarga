
/* ==========================================
   KEUANGAN KELUARGA
   SISTEM TRANSAKSI
========================================== */

const STORAGE_KEY = "keuanganKeluarga";

const saldoAwal = {
    dapur: 3200000,
    tabunganUmum: 2818477,
    tabunganAbi: 1130892,
    tabunganUmma: 600000,
    tabunganKia: 450000,
    investasi: 20000000,

    jajanAbi: 296903,
    jajanUmma: 56159,
    jajanKia: 100000,

    pinjamAbi: 0,
    pinjamUmma: 0,
    pinjamKia: 0,

    nombokAbi: 0,
    nombokUmma: 0,
    nombokKia: 0
};

const namaDompet = {
    dapur: "Dompet Dapur",
    tabunganUmum: "Tabungan Umum",
    tabunganAbi: "Tabungan Abi",
    tabunganUmma: "Tabungan Umma",
    tabunganKia: "Tabungan Kia",
    investasi: "Dompet Investasi",
    jajanAbi: "Jajan Abi",
    jajanUmma: "Jajan Umma",
    jajanKia: "Jajan Kia"
};

const namaOrang = {
    abi: "Abi",
    umma: "Umma",
    kia: "Kia",
    dapur: "Kebutuhan Rumah Tangga"
};


/* ==========================================
   DATA DAN LOCAL STORAGE
========================================== */

function ambilData() {
    try {
        const tersimpan = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (tersimpan) {
            return {
                ...tersimpan,
                saldo: {
                    ...saldoAwal,
                    ...(tersimpan.saldo || {})
                },
                transaksi: Array.isArray(tersimpan.transaksi)
                    ? tersimpan.transaksi
                    : []
            };
        }
    } catch (error) {
        console.error("Gagal membaca data:", error);
    }

    return {
        saldo: { ...saldoAwal },
        transaksi: []
    };
}

let data = ambilData();

function simpanData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* ==========================================
   FORMAT RUPIAH
========================================== */

function rupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(nilai);
}

function ambilNamaDompet(key) {
    return namaDompet[key] || key;
}

function pemilikDompet(key) {
    if (key.endsWith("Abi")) return "abi";
    if (key.endsWith("Umma")) return "umma";
    if (key.endsWith("Kia")) return "kia";
    return null;
}


/* ==========================================
   TAMPILKAN SALDO DASHBOARD
========================================== */

function tampilkanDompet() {
    const saldo = data.saldo;

    const totalTabungan =
        saldo.tabunganUmum +
        saldo.tabunganAbi +
        saldo.tabunganUmma +
        saldo.tabunganKia;

   const elemen = {
    "saldo-dapur": saldo.dapur,
    "saldo-tabungan-umum": saldo.tabunganUmum,
    "saldo-tabungan": totalTabungan,
    "saldo-investasi": saldo.investasi
};

    Object.entries(elemen).forEach(([id, nilai]) => {
        const target = document.getElementById(id);
        if (target) target.textContent = rupiah(nilai);
    });
}


/* ==========================================
   TAMPILKAN SALDO PROFIL
========================================== */

function tampilkanProfil() {
    const saldo = data.saldo;

    const elemen = {
        "jajan-abi": saldo.jajanAbi,
        "tabungan-abi": saldo.tabunganAbi,
        "pinjam-abi": saldo.pinjamAbi,
        "nombok-abi": saldo.nombokAbi,

        "jajan-umma": saldo.jajanUmma,
        "tabungan-umma": saldo.tabunganUmma,
        "pinjam-umma": saldo.pinjamUmma,
        "nombok-umma": saldo.nombokUmma,

        "jajan-kia": saldo.jajanKia,
        "tabungan-kia": saldo.tabunganKia,
        "pinjam-kia": saldo.pinjamKia,
        "nombok-kia": saldo.nombokKia
    };

    Object.entries(elemen).forEach(([id, nilai]) => {
        const target = document.getElementById(id);
        if (target) target.textContent = rupiah(nilai);
    });
}


/* ==========================================
   RIWAYAT TRANSAKSI
========================================== */

function aman(teks) {
    return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[karakter]);
}

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    const [tahun, bulan, hari] = tanggal.split("-");
    return `${hari}/${bulan}/${tahun}`;
}

function tampilkanTransaksi() {
    const wadah = document.getElementById("riwayat-transaksi");

    if (!wadah) return;

    if (data.transaksi.length === 0) {
        wadah.innerHTML = "<p>Belum ada transaksi.</p>";
        return;
    }

    const daftar = [...data.transaksi].reverse();

    wadah.innerHTML = daftar.map(item => {
        let keteranganJenis = item.jenis;
        let detail = "";
        let tanda = "";
        
        if (item.jenis === "Pemasukan") {
            detail = `${item.sumber || ""} → ${ambilNamaDompet(item.ke)}`;
            tanda = "+";
        }

        if (item.jenis === "Pengeluaran") {
            detail = `${ambilNamaDompet(item.dari)} • ${item.kategori || ""}`;
            tanda = "−";
        }

        if (item.jenis === "Transfer") {
            detail = `${ambilNamaDompet(item.dari)} → ${ambilNamaDompet(item.ke)}`;
            tanda = "";
        }

        if (item.jenis === "Nombok") {
            detail = `${ambilNamaDompet(item.dari)} untuk ${namaOrang[item.pihakTerkait] || item.pihakTerkait}`;
            tanda = "−";
        }

        if (item.jenis === "Pinjam") {
            detail = `${ambilNamaDompet(item.dari)} dipinjam ${namaOrang[item.peminjam] || item.peminjam}`;
            tanda = "−";
        }
        if (item.jenis === "Pelunasan") {
            detail = `${ambilNamaDompet(item.dari)} → ${ambilNamaDompet(item.ke)}`;
            tanda = "";
        }
       return `
    <div class="transaction-item">
        <div class="transaction-info">
            <strong>${aman(keteranganJenis)}</strong>
            <span>${aman(detail)}</span>
            <small>${formatTanggal(item.tanggal)} • ${aman(item.keterangan || "")}</small>
        </div>

        <strong class="transaction-amount">
            ${tanda}${rupiah(item.nominal)}
        </strong>

        <button
            type="button"
            class="hapus-transaksi"
            data-hapus="${item.id}"
            title="Hapus transaksi"
        >
            Hapus
        </button>
    </div>
`;
    }).join("");
}
/* ==========================================
   HAPUS TRANSAKSI DAN KEMBALIKAN SALDO
========================================== */

function hapusTransaksi(id) {
    const index = data.transaksi.findIndex(item =>
        Number(item.id) === Number(id)
    );

    if (index === -1) return;

    const item = data.transaksi[index];
    const saldo = data.saldo;
    const perubahan = {};

    function tambahPerubahan(dompet, nominal) {
        perubahan[dompet] = (perubahan[dompet] || 0) + nominal;
    }

    // Cegah penghapusan kewajiban yang sudah memiliki pelunasan
    if (item.jenis === "Nombok" || item.jenis === "Pinjam") {
        const punyaPelunasan = data.transaksi.some(t =>
            t.jenis === "Pelunasan" &&
            Number(t.pelunasanId) === Number(item.id)
        );

        if (punyaPelunasan) {
            alert(
                "Transaksi ini sudah memiliki pelunasan. " +
                "Hapus transaksi pelunasannya terlebih dahulu."
            );
            return;
        }
    }

    // PEMASUKAN: kurangi kembali saldo yang pernah diterima
    if (item.jenis === "Pemasukan") {
        tambahPerubahan(item.ke, -item.nominal);
    }

    // PENGELUARAN: kembalikan saldo yang pernah dikeluarkan
    else if (item.jenis === "Pengeluaran") {
        tambahPerubahan(item.dari, item.nominal);
    }

    // TRANSFER: kembalikan saldo ke dompet asal
    else if (item.jenis === "Transfer") {
        tambahPerubahan(item.dari, item.nominal);
        tambahPerubahan(item.ke, -item.nominal);
    }

    // NOMBOK: kembalikan uang ke dompet pemilik
    else if (item.jenis === "Nombok") {
        const pemilik = pemilikDompet(item.dari);

        if (!pemilik) {
            alert("Data pemilik dompet tidak valid.");
            return;
        }

        const key = `nombok${pemilik.charAt(0).toUpperCase() + pemilik.slice(1)}`;

        tambahPerubahan(item.dari, item.nominal);
        tambahPerubahan(key, -item.nominal);
    }

    // PINJAM: kembalikan uang ke dompet pemberi pinjaman
    else if (item.jenis === "Pinjam") {
        const nama = item.peminjam.charAt(0).toUpperCase() +
            item.peminjam.slice(1);

        tambahPerubahan(item.dari, item.nominal);
        tambahPerubahan(`pinjam${nama}`, -item.nominal);
    }

    // PELUNASAN: batalkan pembayaran dan pulihkan kewajiban
    else if (item.jenis === "Pelunasan") {
        const kewajiban = data.transaksi.find(t =>
            Number(t.id) === Number(item.pelunasanId)
        );

        if (!kewajiban) {
            alert("Transaksi kewajiban asal tidak ditemukan.");
            return;
        }

        tambahPerubahan(item.dari, item.nominal);
        tambahPerubahan(item.ke, -item.nominal);

        if (kewajiban.jenis === "Nombok") {
            const pemilik = pemilikDompet(kewajiban.dari);
            const nama = pemilik.charAt(0).toUpperCase() +
                pemilik.slice(1);

            tambahPerubahan(`nombok${nama}`, item.nominal);
        }

        if (kewajiban.jenis === "Pinjam") {
            const nama = kewajiban.peminjam.charAt(0).toUpperCase() +
                kewajiban.peminjam.slice(1);

            tambahPerubahan(`pinjam${nama}`, item.nominal);
        }
    }

    // Pastikan saldo tidak menjadi minus setelah transaksi dihapus
    for (const [dompet, perubahanSaldo] of Object.entries(perubahan)) {
        if (
            saldo[dompet] === undefined ||
            saldo[dompet] + perubahanSaldo < 0
        ) {
            alert(
                `Transaksi tidak bisa dihapus karena saldo ` +
                `${ambilNamaDompet(dompet)} tidak mencukupi untuk pembatalan.`
            );
            return;
        }
    }

    const yakin = confirm(
        `Yakin ingin menghapus transaksi ${item.jenis} ` +
        `sebesar ${rupiah(item.nominal)}?\n\nSaldo akan disesuaikan otomatis.`
    );

    if (!yakin) return;

    // Terapkan perubahan saldo
    Object.entries(perubahan).forEach(([dompet, nilai]) => {
        saldo[dompet] += nilai;
    });

    // Hapus transaksi dari riwayat
    data.transaksi.splice(index, 1);

    simpanData();
    tampilkanSemua();

    alert("Transaksi berhasil dihapus dan saldo telah disesuaikan.");
}


/* ==========================================
   TOMBOL HAPUS DI RIWAYAT
========================================== */

const wadahRiwayat = document.getElementById("riwayat-transaksi");

if (wadahRiwayat) {
    wadahRiwayat.addEventListener("click", function(event) {
        const tombol = event.target.closest("[data-hapus]");

        if (!tombol) return;

        hapusTransaksi(tombol.dataset.hapus);
    });
}

/* ==========================================
   PERBARUI SELURUH DASHBOARD
========================================== */

function tampilkanSemua() {
    tampilkanDompet();
    tampilkanProfil();
    tampilkanTransaksi();
}


/* ==========================================
   FORM TRANSAKSI
========================================== */

const modalTransaksi = document.getElementById("modal-transaksi");
const tombolBuka = document.getElementById("tombol-transaksi");
const tombolTutup = document.getElementById("tutup-transaksi");
const tombolBatal = document.getElementById("batal-transaksi");

const formTransaksi = document.getElementById("form-transaksi");
const jenisTransaksi = document.getElementById("jenis-transaksi");

const semuaField = [
    "field-pemasukan",
    "field-pengeluaran",
    "field-transfer",
    "field-nombok",
    "field-pinjam",
    "field-pelunasan"
];

function aturFieldTransaksi() {
    const jenis = jenisTransaksi.value.toLowerCase();

    semuaField.forEach(id => {
        const field = document.getElementById(id);
        if (!field) return;

        const aktif = id === `field-${jenis}`;

        field.hidden = !aktif;

        field.querySelectorAll("input, select, textarea").forEach(input => {
            input.disabled = !aktif;
        });
    });
}

/* ==========================================
   DAFTAR KEWAJIBAN YANG BELUM LUNAS
========================================== */

function hitungSisaKewajiban(item) {
    const sudahDibayar = data.transaksi
        .filter(t =>
            t.jenis === "Pelunasan" &&
            Number(t.pelunasanId) === Number(item.id)
        )
        .reduce((total, t) => total + t.nominal, 0);

    return Math.max(0, item.nominal - sudahDibayar);
}

function tampilkanDaftarKewajiban() {
    const jenis = document.getElementById("jenis-pelunasan").value;
    const pilihan = document.getElementById("transaksi-dilunasi");
    const dompetBayar = document.getElementById("dompet-pelunasan");

    pilihan.innerHTML = '<option value="">Pilih kewajiban</option>';
    dompetBayar.innerHTML = '<option value="">Pilih dompet pembayaran</option>';

    const daftar = data.transaksi.filter(item =>
        item.jenis === jenis &&
        hitungSisaKewajiban(item) > 0
    );

    daftar.forEach(item => {
        const sisa = hitungSisaKewajiban(item);

        const pihak = jenis === "Nombok"
            ? (namaOrang[item.pihakTerkait] || item.pihakTerkait)
            : (namaOrang[item.peminjam] || item.peminjam);

        const option = document.createElement("option");
        option.value = item.id;
        option.textContent =
            `${pihak} • Sisa ${rupiah(sisa)}`;

        pilihan.appendChild(option);
    });
}

function tampilkanDompetPembayaran() {
    const id = Number(
        document.getElementById("transaksi-dilunasi").value
    );

    const item = data.transaksi.find(t =>
        Number(t.id) === id
    );

    const dompetBayar = document.getElementById("dompet-pelunasan");

    dompetBayar.innerHTML =
        '<option value="">Pilih dompet pembayaran</option>';

    if (!item) return;

    let pilihan = [];

    if (item.jenis === "Nombok") {
        if (item.pihakTerkait === "dapur") {
            pilihan = ["dapur"];
        } else {
            pilihan = [
                `jajan${item.pihakTerkait.charAt(0).toUpperCase() + item.pihakTerkait.slice(1)}`,
                `tabungan${item.pihakTerkait.charAt(0).toUpperCase() + item.pihakTerkait.slice(1)}`
            ];
        }
    }

    if (item.jenis === "Pinjam") {
        const nama = item.peminjam.charAt(0).toUpperCase() +
            item.peminjam.slice(1);

        pilihan = [`jajan${nama}`, `tabungan${nama}`];
    }

    pilihan.forEach(key => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = ambilNamaDompet(key);
        dompetBayar.appendChild(option);
    });
}

document.getElementById("jenis-pelunasan")
    .addEventListener("change", tampilkanDaftarKewajiban);

document.getElementById("transaksi-dilunasi")
    .addEventListener("change", tampilkanDompetPembayaran);

function bukaFormTransaksi() {
    modalTransaksi.hidden = false;

    const sekarang = new Date();
    const tanggal =
        sekarang.getFullYear() + "-" +
        String(sekarang.getMonth() + 1).padStart(2, "0") + "-" +
        String(sekarang.getDate()).padStart(2, "0");

    document.getElementById("tanggal-transaksi").value = tanggal;

    aturFieldTransaksi();
}

function tutupFormTransaksi() {
    modalTransaksi.hidden = true;
}

tombolBuka.addEventListener("click", bukaFormTransaksi);
tombolTutup.addEventListener("click", tutupFormTransaksi);
tombolBatal.addEventListener("click", tutupFormTransaksi);

jenisTransaksi.addEventListener("change", aturFieldTransaksi);

modalTransaksi.addEventListener("click", function(event) {
    if (event.target === modalTransaksi) {
        tutupFormTransaksi();
    }
});


/* ==========================================
   SIMPAN TRANSAKSI
========================================== */

function prosesTransaksi(event) {
    event.preventDefault();

    const jenis = jenisTransaksi.value;
    const tanggal = document.getElementById("tanggal-transaksi").value;
    const nominal = Number(document.getElementById("nominal-transaksi").value);
    const keterangan = document.getElementById("keterangan-transaksi").value.trim();

    if (!tanggal || !Number.isFinite(nominal) || nominal <= 0) {
        alert("Tanggal dan nominal harus diisi dengan benar.");
        return;
    }

    const saldo = data.saldo;

    const transaksi = {
        id: Date.now(),
        jenis,
        tanggal,
        nominal,
        keterangan
    };

    function cekSaldo(dompet) {
        if (saldo[dompet] < nominal) {
            alert(`Saldo ${ambilNamaDompet(dompet)} tidak mencukupi.`);
            return false;
        }
        return true;
    }

    /* PEMASUKAN */
    if (jenis === "Pemasukan") {
        const sumber = document.getElementById("sumber-pemasukan").value;
        const tujuan = document.getElementById("dompet-masuk").value;

        if (!sumber || !tujuan) {
            alert("Pilih sumber dana dan dompet tujuan.");
            return;
        }

        saldo[tujuan] += nominal;

        transaksi.sumber = sumber;
        transaksi.ke = tujuan;
    }

    /* PENGELUARAN */
    else if (jenis === "Pengeluaran") {
        const dari = document.getElementById("dompet-pengeluaran").value;
        const kategori = document.getElementById("kategori-pengeluaran").value;

        if (!dari || !kategori) {
            alert("Pilih dompet dan kategori pengeluaran.");
            return;
        }

        if (!cekSaldo(dari)) return;

        saldo[dari] -= nominal;

        transaksi.dari = dari;
        transaksi.kategori = kategori;
    }

    /* TRANSFER */
    else if (jenis === "Transfer") {
        const dari = document.getElementById("dompet-asal").value;
        const ke = document.getElementById("dompet-tujuan").value;

        if (!dari || !ke) {
            alert("Pilih dompet asal dan tujuan.");
            return;
        }

        if (dari === ke) {
            alert("Dompet asal dan tujuan tidak boleh sama.");
            return;
        }

        if (!cekSaldo(dari)) return;

        saldo[dari] -= nominal;
        saldo[ke] += nominal;

        transaksi.dari = dari;
        transaksi.ke = ke;
    }

    /* NOMBOK */
    else if (jenis === "Nombok") {
        const dari = document.getElementById("dompet-nombok").value;
        const pihak = document.getElementById("pihak-nombok").value;
        const kategori = document.getElementById("kategori-nombok").value;

        if (!dari || !pihak || !kategori) {
            alert("Lengkapi semua pilihan Nombok.");
            return;
        }

        if (!cekSaldo(dari)) return;

        const pemilik = pemilikDompet(dari);

        if (!pemilik) {
            alert("Nombok harus menggunakan dompet pribadi.");
            return;
        }

        if (pihak === pemilik) {
            alert("Pihak yang menggunakan dana tidak boleh sama dengan pemilik dana.");
            return;
        }

        saldo[dari] -= nominal;
        saldo[`nombok${pemilik.charAt(0).toUpperCase() + pemilik.slice(1)}`] += nominal;

        transaksi.dari = dari;
        transaksi.pihakTerkait = pihak;
        transaksi.kategori = kategori;
    }

    /* PINJAM */
    else if (jenis === "Pinjam") {
        const dari = document.getElementById("dompet-pinjam").value;
        const peminjam = document.getElementById("pihak-pinjam").value;
        const kategori = document.getElementById("kategori-pinjam").value;

        if (!dari || !peminjam || !kategori) {
            alert("Lengkapi semua pilihan Pinjam.");
            return;
        }

        if (!cekSaldo(dari)) return;

        const pemilik = pemilikDompet(dari);

        if (pemilik === peminjam) {
            alert("Pemilik dompet tidak bisa meminjamkan uang kepada dirinya sendiri.");
            return;
        }

        saldo[dari] -= nominal;
        saldo[`pinjam${peminjam.charAt(0).toUpperCase() + peminjam.slice(1)}`] += nominal;

        transaksi.dari = dari;
        transaksi.peminjam = peminjam;
        transaksi.kategori = kategori;
    }

   
/* PELUNASAN */
else if (jenis === "Pelunasan") {
    const id = Number(
        document.getElementById("transaksi-dilunasi").value
    );

    const dari = document.getElementById("dompet-pelunasan").value;

    const kewajiban = data.transaksi.find(t =>
        Number(t.id) === id
    );

    if (!kewajiban || !dari) {
        alert("Pilih kewajiban dan dompet pembayaran.");
        return;
    }

    const sisa = hitungSisaKewajiban(kewajiban);

    if (nominal > sisa) {
        alert(`Pelunasan maksimal ${rupiah(sisa)}.`);
        return;
    }

    if (!cekSaldo(dari)) return;

    const tujuan = kewajiban.dari;

    saldo[dari] -= nominal;
    saldo[tujuan] += nominal;

    if (kewajiban.jenis === "Nombok") {
        const pemilik = pemilikDompet(kewajiban.dari);
        const key = `nombok${pemilik.charAt(0).toUpperCase() + pemilik.slice(1)}`;
        saldo[key] -= nominal;
    }

    if (kewajiban.jenis === "Pinjam") {
        const nama = kewajiban.peminjam.charAt(0).toUpperCase() +
            kewajiban.peminjam.slice(1);

        saldo[`pinjam${nama}`] -= nominal;
    }

    transaksi.dari = dari;
    transaksi.ke = tujuan;
    transaksi.pelunasanId = kewajiban.id;
    transaksi.jenisKewajiban = kewajiban.jenis;
}
else {
    alert("Jenis transaksi tidak dikenali.");
    return;
}


    data.transaksi.push(transaksi);

    simpanData();
    tampilkanSemua();

    formTransaksi.reset();

    const sekarang = new Date();
    document.getElementById("tanggal-transaksi").value =
        sekarang.getFullYear() + "-" +
        String(sekarang.getMonth() + 1).padStart(2, "0") + "-" +
        String(sekarang.getDate()).padStart(2, "0");

    jenisTransaksi.value = "Pemasukan";
    aturFieldTransaksi();

    tutupFormTransaksi();

    alert("Transaksi berhasil disimpan!");
}

formTransaksi.addEventListener("submit", prosesTransaksi);

// Pastikan tombol simpan mengirim form
document.getElementById("simpan-transaksi").type = "submit";


/* ==========================================
   SEMBUNYIKAN / TAMPILKAN SALDO
========================================== */

const tombolPrivasi = document.getElementById("toggle-saldo");
const ikonMata = document.getElementById("ikon-mata");
const teksPrivasi = document.getElementById("teks-privasi");

let saldoTersembunyi = false;

if (tombolPrivasi) {
    tombolPrivasi.addEventListener("click", function() {
        saldoTersembunyi = !saldoTersembunyi;

        document.body.classList.toggle(
            "privacy-hidden",
            saldoTersembunyi
        );

        if (ikonMata) {
            ikonMata.textContent = saldoTersembunyi ? "◎" : "◉";
        }

        if (teksPrivasi) {
            teksPrivasi.textContent = saldoTersembunyi
                ? "Tampilkan"
                : "Sembunyikan";
        }
    });
}


/* ==========================================
   JALANKAN APLIKASI
========================================== */

aturFieldTransaksi();
tampilkanSemua();
