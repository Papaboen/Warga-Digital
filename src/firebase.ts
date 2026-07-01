import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { Resident, Transaction, Report, Info } from './types';

// Web Firebase Configuration
const firebaseConfig = {
  projectId: "gen-lang-client-0070920828",
  appId: "1:735595621023:web:7393ee07f986d7418e50aa",
  apiKey: "AIzaSyAK0JgL3H1qMgmFcQPg_XfNjftzY6htvf0",
  authDomain: "gen-lang-client-0070920828.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-05f804a3-c1fb-44f9-b2bc-c503fad52da3",
  storageBucket: "gen-lang-client-0070920828.firebasestorage.app",
  messagingSenderId: "735595621023"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with local persistent cache and forced long-polling for iframe/sandbox compatibility
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

// Mock Fallback Data (Indonesian names and values matching mockups)
export const initialResidents: Resident[] = [
  { id: 'res_1', name: 'Siti Nurhaliza', block: 'Block A', number: 'No. 12', submittedAt: '2 jam lalu', status: 'pending' },
  { id: 'res_2', name: 'Ahmad Subarjo', block: 'Block C', number: 'No. 45', submittedAt: '5 jam lalu', status: 'pending' },
  { id: 'res_3', name: 'Dewi Lestari', block: 'Block B', number: 'No. 08', submittedAt: '1 hari lalu', status: 'pending' },
  { id: 'res_4', name: 'Budi Santoso', block: 'Block D', number: 'No. 04', submittedAt: '2 hari lalu', status: 'approved' },
  { id: 'res_5', name: 'Rina Wijaya', block: 'Block A', number: 'No. 15', submittedAt: '3 hari lalu', status: 'approved' }
];

export const initialTransactions: Transaction[] = [
  { id: 'tx_1', type: 'pemasukan', category: 'Iuran Bulanan Warga (Blok A)', amount: 2500000, date: '2023-11-12', description: 'Pembayaran iuran keamanan & kebersihan warga Blok A secara kolektif.', createdAt: '2023-11-12T10:00:00Z' },
  { id: 'tx_2', type: 'pengeluaran', category: 'Perbaikan Lampu Jalan (Blok C)', amount: 850000, date: '2023-11-10', description: 'Perbaikan bohlam lampu jalan utama di depan pos satpam Blok C yang putus.', createdAt: '2023-11-10T14:30:00Z' },
  { id: 'tx_3', type: 'pengeluaran', category: 'Biaya Kebersihan Lingkungan', amount: 1200000, date: '2023-11-05', description: 'Upah mingguan petugas kebersihan dan biaya pengolahan akhir sampah.', createdAt: '2023-11-05T08:00:00Z' },
  { id: 'tx_4', type: 'pemasukan', category: 'Donasi Acara 17 Agustus', amount: 5000000, date: '2023-11-01', description: 'Sumbangan sukarela dari para tokoh masyarakat untuk perlombaan kemerdekaan.', createdAt: '2023-11-01T11:00:00Z' },
  // History tab transactions
  { id: 'tx_h1', type: 'pemasukan', category: 'Iuran Keamanan & Kebersihan Mar 2024', amount: 150000, date: '2024-03-05', description: 'Iuran bulanan rutin', createdAt: '2024-03-05T09:12:00Z' },
  { id: 'tx_h2', type: 'pemasukan', category: 'Iuran Keamanan & Kebersihan Feb 2024', amount: 150000, date: '2024-02-02', description: 'Iuran bulanan rutin', createdAt: '2024-02-02T14:30:00Z' },
  { id: 'tx_h3', type: 'pemasukan', category: 'Sumbangan Agustusan', amount: 50000, date: '2023-08-10', description: 'Sumbangan sukarela warga', createdAt: '2023-08-10T11:05:00Z' },
  { id: 'tx_h4', type: 'pemasukan', category: 'Iuran Keamanan & Kebersihan Jan 2024', amount: 150000, date: '2024-01-04', description: 'Iuran bulanan rutin', createdAt: '2024-01-04T08:20:00Z' },
  // Pending dues payments awaiting admin validation
  { id: 'tx_p1', type: 'pemasukan', category: 'Iuran Keamanan & Kebersihan Apr 2024', amount: 150000, date: '2024-04-01', description: 'Pembayaran iuran April Siti Nurhaliza', createdAt: '2024-04-01T09:00:00Z', status: 'pending', residentName: 'Siti Nurhaliza' },
  { id: 'tx_p2', type: 'pemasukan', category: 'Iuran Kebersihan Mei 2024', amount: 100000, date: '2024-05-02', description: 'Pembayaran iuran Mei Ahmad Subarjo', createdAt: '2024-05-02T10:15:00Z', status: 'pending', residentName: 'Ahmad Subarjo' }
];

export const initialReports: Report[] = [
  { id: 'rep_1', category: 'pengaduan', detail: 'Mohon perbaikan lampu jalan utama di depan pos satpam Blok C, sudah 2 hari mati total dan jalanan sangat gelap saat malam.', status: 'pending', submittedAt: '2 jam lalu', title: 'Lampu Jalan Mati di...', blockAndNo: 'Jl. Merdeka Blok C no 12' },
  { id: 'rep_2', category: 'surat', detail: 'Mengajukan izin penggunaan fasilitas lapangan basket untuk acara syukuran dan perlombaan internal warga.', status: 'process', submittedAt: 'Kemarin', title: 'Izin Acara Syukuran...', blockAndNo: 'Blok A no 15' },
  { id: 'rep_3', category: 'iuran', detail: 'Mohon konfirmasi jadwal pengangkutan sampah minggu ini karena petugas biasa belum datang.', status: 'done', submittedAt: '2 Hari lalu', title: 'Jadwal Pengangkut...', blockAndNo: 'Block B no 08' }
];

export const initialInfos: Info[] = [
  {
    id: 'info_1',
    title: 'Jadwal Fogging Mingguan',
    category: 'penting',
    content: 'Pemberitahuan kepada seluruh warga, fogging rutin akan dilaksanakan pada hari Sabtu, 15 Juli 2024 mulai pukul 08:00 WIB. Mohon untuk menutup makanan dan minuman serta menjaga hewan peliharaan.',
    imageUrl: 'https://images.unsplash.com/photo-1513829096960-ef229e5230ab?q=80&w=800', // A nice residential area image
    isNotified: true,
    isDraft: false,
    createdAt: '2024-07-10T08:00:00Z'
  }
];

// Helper to check if Firestore collection is available or empty, then write initial data
export async function bootstrapDatabase() {
  try {
    const checkCollection = async (colName: string, initialData: any[]) => {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        for (const item of initialData) {
          await setDoc(doc(db, colName, item.id), item);
        }
        console.log(`Successfully bootstrapped collection: ${colName}`);
      }
    };

    await checkCollection('residents', initialResidents);
    await checkCollection('transactions', initialTransactions);
    await checkCollection('reports', initialReports);
    await checkCollection('infos', initialInfos);
  } catch (error) {
    console.warn("Firestore bootstrapping failed or permissions missing. Using client fallback.", error);
  }
}

export { db };
