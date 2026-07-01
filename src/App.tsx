/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  Home as HomeIcon,
  TrendingUp,
  FileText,
  UserCheck,
  Wallet,
  ArrowLeft,
  Check,
  X,
  UploadCloud,
  Info as InfoIcon,
  AlertCircle,
  DollarSign,
  Plus,
  Clock,
  Bell,
  ChevronRight,
  Search,
  Wifi,
  Battery,
  Database,
  Smartphone,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sparkles,
  User,
  Shield,
  Layers,
  FileSpreadsheet,
  Coins,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { db, bootstrapDatabase, initialResidents, initialTransactions, initialReports, initialInfos } from './firebase';
import { Resident, Transaction, Report, Info } from './types';

export default function App() {
  // Application Roles and Routing
  // role: 'warga' | 'admin'
  const [role, setRole] = useState<'warga' | 'admin'>('warga');
  // isLoggedIn: simulates session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  
  // Warga screen states
  // wargaTab: 'home' | 'finances' | 'report' | 'wallet'
  const [wargaTab, setWargaTab] = useState<'home' | 'finances' | 'report' | 'wallet'>('home');
  // Current active announcement for reader modal
  const [selectedInfo, setSelectedInfo] = useState<Info | null>(null);

  // Admin RT screen states
  // adminTab: 'dashboard' | 'validation' | 'finance' | 'news'
  const [adminTab, setAdminTab] = useState<'dashboard' | 'validation' | 'finance' | 'news'>('dashboard');

  // Real-time states synchronized with Firestore
  const [residents, setResidents] = useState<Resident[]>(initialResidents);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [infos, setInfos] = useState<Info[]>(initialInfos);

  // Synchronisation loading & logs
  const [syncStatus, setSyncStatus] = useState<'connected' | 'offline' | 'syncing'>('connected');
  const [syncLogs, setSyncLogs] = useState<string[]>(['Sistem Tersinkronisasi dengan Firestore.']);

  // Payment Gateway Simulator Modal states
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'process' | 'success'>('select');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('qris');
  const [paymentAmount, setPaymentAmount] = useState<number>(150000);
  const [paymentCategory, setPaymentCategory] = useState<string>('Iuran Keamanan & Kebersihan Apr 2024');
  const [senderName, setSenderName] = useState<string>('Siti Nurhaliza');
  const [senderBank, setSenderBank] = useState<string>('BCA');
  const [transferProof, setTransferProof] = useState<string>('');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Form Inputs: Input Keuangan (Admin RT)
  const [txType, setTxType] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [txCategory, setTxCategory] = useState<string>('');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [txDescription, setTxDescription] = useState<string>('');
  const [txProof, setTxProof] = useState<string>('');

  // Form Inputs: Buat Informasi Warga (Admin RT)
  const [infoTitle, setInfoTitle] = useState<string>('');
  const [infoCategory, setInfoCategory] = useState<'penting' | 'umum' | 'kegiatan'>('umum');
  const [infoContent, setInfoContent] = useState<string>('');
  const [infoNotify, setInfoNotify] = useState<boolean>(true);

  // Form Inputs: Buat Laporan Baru (Warga)
  const [reportCategory, setReportCategory] = useState<'pengaduan' | 'surat' | 'iuran'>('pengaduan');
  const [reportDetail, setReportDetail] = useState<string>('');
  const [reportFile, setReportFile] = useState<string>('');

  // Authentication & Session States
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState<string>('warga@gmail.com');
  const [loginPassword, setLoginPassword] = useState<string>('password');
  const [signupName, setSignupName] = useState<string>('');
  const [signupBlock, setSignupBlock] = useState<string>('Block A');
  const [signupNo, setSignupNo] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [signupRole, setSignupRole] = useState<'warga' | 'admin'>('warga');
  const [loggedInResidentName, setLoggedInResidentName] = useState<string>('Siti Nurhaliza');
  const [loggedInResidentBlock, setLoggedInResidentBlock] = useState<string>('Blok A/12');

  // Wallet filters
  const [walletFilter, setWalletFilter] = useState<'semua' | 'berhasil' | 'menunggu'>('semua');

  // Validation sub-tabs
  const [validationSubTab, setValidationSubTab] = useState<'residents' | 'payments'>('residents');

  // Validation search
  const [validationSearch, setValidationSearch] = useState<string>('');

  // Log synchronisation helper
  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setSyncLogs((prev) => [`[${time}] ${message}`, ...prev.slice(0, 19)]);
  };

  // Bootstrap & Listeners for Real-time database synchronisation
  useEffect(() => {
    // Bootstrap database collections if empty
    bootstrapDatabase();

    setSyncStatus('syncing');
    
    // Subscribe to Residents collection
    const unsubResidents = onSnapshot(collection(db, 'residents'), (snapshot) => {
      const data: Resident[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Resident);
      });
      if (data.length > 0) {
        setResidents(data);
        addLog(`Sinkronisasi Warga: ${data.length} data diperbarui`);
      }
      setSyncStatus('connected');
    }, (err) => {
      console.error(err);
      setSyncStatus('offline');
      addLog('Gagal sinkronisasi koleksi warga. Menggunakan data lokal.');
    });

    // Subscribe to Transactions collection
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const data: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
      });
      if (data.length > 0) {
        setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        addLog(`Sinkronisasi Keuangan: ${data.length} transaksi diperbarui`);
      }
    }, (err) => {
      console.error(err);
      addLog('Gagal sinkronisasi transaksi keuangan.');
    });

    // Subscribe to Reports collection
    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data: Report[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Report);
      });
      if (data.length > 0) {
        setReports(data);
        addLog(`Sinkronisasi Pengaduan: ${data.length} laporan diperbarui`);
      }
    }, (err) => {
      console.error(err);
    });

    // Subscribe to Infos collection
    const unsubInfos = onSnapshot(collection(db, 'infos'), (snapshot) => {
      const data: Info[] = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() } as Info);
      });
      if (data.length > 0) {
        setInfos(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        addLog(`Sinkronisasi Informasi: ${data.length} pengumuman diperbarui`);
      }
    }, (err) => {
      console.error(err);
    });

    return () => {
      unsubResidents();
      unsubTransactions();
      unsubReports();
      unsubInfos();
    };
  }, []);

  // Handler: Reseed Database to restore original states
  const handleResetDatabase = async () => {
    setSyncStatus('syncing');
    addLog('Mereset database Firestore...');
    try {
      // Clear and rewrite collections
      for (const res of initialResidents) {
        await setDoc(doc(db, 'residents', res.id), res);
      }
      for (const tx of initialTransactions) {
        await setDoc(doc(db, 'transactions', tx.id), tx);
      }
      for (const rep of initialReports) {
        await setDoc(doc(db, 'reports', rep.id), rep);
      }
      for (const inf of initialInfos) {
        await setDoc(doc(db, 'infos', inf.id), inf);
      }
      addLog('Database Firestore berhasil di-seed ulang.');
      setSyncStatus('connected');
    } catch (error) {
      console.error(error);
      addLog('Gagal melakukan seed ulang database.');
      setSyncStatus('offline');
    }
  };

  // Handler: Resident Verification (Accept/Reject)
  const handleVerifyResident = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const residentRef = doc(db, 'residents', id);
      await updateDoc(residentRef, { status: newStatus });
      addLog(`Status Warga (${id}) diubah menjadi ${newStatus}`);
    } catch (error) {
      // Fallback local modification if Firestore write fails
      setResidents(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      addLog(`[Lokal] Status Warga (${id}) diubah menjadi ${newStatus}`);
    }
  };

  // Handler: Transaction/Iuran Payment Verification (Accept/Reject)
  const handleVerifyPayment = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, { status: newStatus });
      addLog(`Pembayaran Iuran (${id}) diubah menjadi ${newStatus}`);
    } catch (error) {
      // Fallback local modification if Firestore write fails
      setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
      addLog(`[Lokal] Pembayaran Iuran (${id}) diubah menjadi ${newStatus}`);
    }
  };

  // Handler: Submit Financial Transaction (Admin RT)
  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txCategory || !txAmount) {
      alert('Tolong lengkapi kategori dan jumlah transaksi');
      return;
    }

    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Jumlah transaksi harus berupa angka positif');
      return;
    }

    const newTx: Omit<Transaction, 'id'> = {
      type: txType,
      category: txCategory,
      amount: amountNum,
      date: txDate,
      description: txDescription || 'Tidak ada keterangan tambahan.',
      proofUrl: txProof || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      setSyncStatus('syncing');
      await addDoc(collection(db, 'transactions'), newTx);
      addLog(`Transaksi Baru Ditambahkan: ${txCategory} (Rp ${amountNum.toLocaleString('id-ID')})`);
      
      // Reset Form
      setTxCategory('');
      setTxAmount('');
      setTxDescription('');
      setTxProof('');
      setAdminTab('dashboard');
    } catch (error) {
      // Fallback local update
      const mockId = `tx_${Date.now()}`;
      setTransactions(prev => [{ id: mockId, ...newTx } as Transaction, ...prev]);
      addLog(`[Lokal] Transaksi Baru Ditambahkan: ${txCategory}`);
      setAdminTab('dashboard');
    }
  };

  // Handler: Save Info/Bulletin (Admin RT)
  const handlePublishInfo = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!infoTitle || !infoContent) {
      alert('Tolong lengkapi judul dan isi berita.');
      return;
    }

    const newInfo: Omit<Info, 'id'> = {
      title: infoTitle,
      category: infoCategory,
      content: infoContent,
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=600&auto=format&fit=crop',
      isNotified: infoNotify,
      isDraft,
      createdAt: new Date().toISOString()
    };

    try {
      setSyncStatus('syncing');
      await addDoc(collection(db, 'infos'), newInfo);
      addLog(`Pengumuman diterbitkan: "${infoTitle}"`);
      
      // Reset Form
      setInfoTitle('');
      setInfoContent('');
      setAdminTab('dashboard');
    } catch (error) {
      const mockId = `inf_${Date.now()}`;
      setInfos(prev => [{ id: mockId, ...newInfo } as Info, ...prev]);
      addLog(`[Lokal] Pengumuman diterbitkan: "${infoTitle}"`);
      setAdminTab('dashboard');
    }
  };

  // Handler: Submit Complaint / Service Report (Warga)
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetail) {
      alert('Silahkan tulis detail masalah atau permohonan Anda.');
      return;
    }

    const titleMap = {
      pengaduan: 'Laporan Kejadian Baru',
      surat: 'Surat Pengantar Baru',
      iuran: 'Kendala Tagihan/Iuran'
    };

    const newReport: Omit<Report, 'id'> = {
      category: reportCategory,
      detail: reportDetail,
      status: 'pending',
      submittedAt: 'Baru saja',
      title: titleMap[reportCategory],
      blockAndNo: 'Blok A, No. 12'
    };

    try {
      setSyncStatus('syncing');
      await addDoc(collection(db, 'reports'), newReport);
      addLog(`Laporan Terkirim: ${titleMap[reportCategory]}`);
      
      setReportDetail('');
      alert('Laporan Anda telah berhasil terkirim dan disinkronisasikan ke RT Admin secara real-time!');
    } catch (error) {
      const mockId = `rep_${Date.now()}`;
      setReports(prev => [{ id: mockId, ...newReport } as Report, ...prev]);
      addLog(`[Lokal] Laporan Terkirim: ${titleMap[reportCategory]}`);
      setReportDetail('');
    }
  };

  // Handler: Payment Complete Simulator
  const handleSimulatePayment = async () => {
    setPaymentStep('process');
    addLog(`Memulai transaksi pembayaran iuran: Rp ${paymentAmount.toLocaleString('id-ID')} via ${selectedPaymentMethod.toUpperCase()}`);
    
    setTimeout(async () => {
      const isTransfer = selectedPaymentMethod === 'transfer';
      const isVa = selectedPaymentMethod === 'va';
      
      const newPayment: Omit<Transaction, 'id'> = {
        type: 'pemasukan',
        category: paymentCategory,
        amount: paymentAmount,
        date: new Date().toISOString().split('T')[0],
        description: isTransfer 
          ? `Transfer Bank Manual - Pengirim: ${senderName} (Bank: ${senderBank.toUpperCase()}).`
          : isVa 
            ? `Transfer Virtual Account BCA - Pengirim: Siti Nurhaliza (Otomatis).`
            : `Pembayaran aman iuran via QRIS Instan secara real-time.`,
        createdAt: new Date().toISOString(),
        status: 'pending',
        residentName: isTransfer ? senderName : 'Siti Nurhaliza',
        proofUrl: isTransfer 
          ? (transferProof || 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=400&auto=format&fit=crop')
          : undefined
      };

      try {
        await addDoc(collection(db, 'transactions'), newPayment);
        addLog(`[Pembayaran Diajukan] Rp ${paymentAmount.toLocaleString('id-ID')} dikirim untuk verifikasi admin`);
        
        // Update specific dues items in wallet history (simulated state modification or trigger)
        setPaymentStep('success');
      } catch (error) {
        const mockId = `tx_${Date.now()}`;
        setTransactions(prev => [{ id: mockId, ...newPayment } as Transaction, ...prev]);
        addLog(`[Lokal Pembayaran Diajukan] Rp ${paymentAmount.toLocaleString('id-ID')} berhasil diajukan`);
        setPaymentStep('success');
      }
    }, 2000);
  };

  // Live Calculations from transactions state
  const totalBalance = transactions.reduce((acc, curr) => {
    if (curr.status === 'pending' || curr.status === 'rejected') return acc;
    return curr.type === 'pemasukan' ? acc + curr.amount : acc - curr.amount;
  }, 45850000); // Base starting sum from design

  const incomingNov = transactions
    .filter(tx => tx.type === 'pemasukan' && (tx.date.includes('-11-') || tx.date.includes('-03-')))
    .reduce((acc, curr) => acc + curr.amount, 12400000); // Mock monthly default + actual

  const outgoingNov = transactions
    .filter(tx => tx.type === 'pengeluaran')
    .reduce((acc, curr) => acc + curr.amount, 4250000);

  // Filter lists based on components input
  const filteredWalletTxs = transactions.filter((tx) => {
    if (walletFilter === 'semua') return true;
    if (walletFilter === 'berhasil') return tx.type === 'pemasukan' && tx.status !== 'pending' && tx.status !== 'rejected' && !tx.category.includes('Sumbangan');
    if (walletFilter === 'menunggu') return tx.status === 'pending' || tx.category.includes('Sumbangan') || tx.category.includes('Apr');
    return true;
  });

  const filteredResidents = residents.filter((r) => {
    if (!validationSearch) return true;
    return r.name.toLowerCase().includes(validationSearch.toLowerCase()) || 
           r.block.toLowerCase().includes(validationSearch.toLowerCase());
  });

  const pendingResidentsCount = residents.filter(r => r.status === 'pending').length;
  const pendingPaymentsCount = transactions.filter(tx => tx.status === 'pending').length;

  const filteredIuranPayments = transactions.filter(tx => {
    if (tx.status === undefined) return false;
    if (!validationSearch) return true;
    return (tx.residentName?.toLowerCase() || '').includes(validationSearch.toLowerCase()) || 
           tx.category.toLowerCase().includes(validationSearch.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#0b1c30] text-slate-100 flex flex-col md:flex-row font-body overflow-x-hidden antialiased selection:bg-primary selection:text-white">
      
      {/* ========================================================= */}
      {/* 🚀 LEFT BAR: COMPREHENSIVE DEVELOPER CONTROL HUB (DESKTOP) */}
      {/* ========================================================= */}
      <div className="w-full md:w-[420px] bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col gap-6 shrink-0 z-10 overflow-y-auto max-h-screen">
        
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2.5 rounded-xl text-white shadow-lg shadow-primary/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-lg font-semibold tracking-tight text-white flex items-center gap-1.5">
              Warga Digital <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full font-mono border border-emerald-500/25">v1.2</span>
            </h1>
            <p className="text-xs text-slate-400">Panel Simulasi Sinkronisasi Real-Time</p>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-primary-container" /> Status Database
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                syncStatus === 'connected' ? 'bg-emerald-500 animate-pulse' :
                syncStatus === 'syncing' ? 'bg-amber-500 animate-spin border border-dashed border-amber-300' :
                'bg-rose-500'
              }`} />
              <span className="text-xs font-mono font-bold capitalize text-slate-200">
                {syncStatus === 'connected' ? 'Firestore Online' : 
                 syncStatus === 'syncing' ? 'Menyingkronkan...' : 'Offline / Cache'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Perubahan data di aplikasi mobile disinkronisasi secara instan ke server cloud Firebase Firestore.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Pilih Mode Tampilan</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => { setRole('warga'); setIsLoggedIn(true); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                role === 'warga' && isLoggedIn
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User className="w-4 h-4" />
              Warga (Citizen)
            </button>
            <button
              onClick={() => { setRole('admin'); setIsLoggedIn(true); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                role === 'admin' && isLoggedIn
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin RT
            </button>
          </div>
        </div>

        {/* Real-Time Database Event Logger */}
        <div className="flex flex-col gap-2 flex-grow">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Live Sync Logs</label>
            <button 
              onClick={() => setSyncLogs(['Dibersihkan. Siap sinkronisasi...'])}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[10px] h-[160px] md:h-auto overflow-y-auto flex flex-col gap-1.5 text-slate-400">
            {syncLogs.map((log, index) => (
              <div key={index} className={`pb-1 border-b border-slate-900 last:border-0 ${index === 0 ? 'text-primary-container font-semibold' : ''}`}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Admin Tools */}
        <div className="flex flex-col gap-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-semibold text-white">Database Control</h3>
          <p className="text-[11px] text-slate-400">
            Gunakan tombol di bawah untuk menyetel ulang database Firestore Anda ke kondisi mockup bawaan.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleResetDatabase}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-lg text-xs font-medium transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Database
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex flex-col gap-1">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500" /> API Keys Secured Server-side</span>
          <span>Sistem Pembayaran Terintegrasi Simulasi Midtrans.</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 📱 RIGHT SIDE: SMARTPHONE SIMULATOR FOR MOBILE DESIGNS    */}
      {/* ========================================================= */}
      <div className="flex-grow bg-[#0b1c30] p-4 md:p-8 flex items-center justify-center overflow-y-auto">
        
        {/* Realistic Smartphone Frame wrapper */}
        <div className="w-full max-w-[412px] h-[844px] bg-[#0c0f17] rounded-[52px] p-[12px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-[#2d3142] flex flex-col relative overflow-hidden isolate">
          
          {/* Top Speaker Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-[24px] bg-black rounded-full z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-neutral-800 rounded-full mb-1" />
            <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full absolute right-4 mb-1 border border-neutral-800" />
          </div>

          {/* Smartphone UI Screen Canvas */}
          <div className="w-full h-full bg-[#f8f9ff] text-[#0b1c30] rounded-[42px] flex flex-col overflow-hidden relative font-body">
            
            {/* Status Bar */}
            <div className="h-11 bg-[#f8f9ff]/90 backdrop-blur-md flex items-center justify-between px-7 shrink-0 z-30 select-none">
              <span className="text-xs font-semibold font-mono text-[#0b1c30]">19:55</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-[#0b1c30]" />
                <span className="text-[10px] font-bold bg-[#006b5d]/10 text-[#006b5d] px-1.5 py-0.5 rounded font-mono">5G</span>
                <Battery className="w-4 h-4 text-[#0b1c30]" />
              </div>
            </div>

            {/* Main Scrollable Canvas */}
            <div className="flex-grow overflow-y-auto hide-scrollbar flex flex-col pb-24 relative">
              
              {/* ========================== */}
              {/* 🚪 LOGIN SCREEN PRE-FLOW   */}
              {/* ========================== */}
              {!isLoggedIn ? (
                <div className="flex-grow flex flex-col items-center justify-center px-6 pt-6 pb-8 bg-white h-full overflow-y-auto">
                  <div className="w-full max-w-sm flex flex-col items-center gap-6">
                    {/* Brand Logo and Header */}
                    <div className="flex flex-col items-center text-center gap-1.5 w-full">
                      <div className="w-full flex justify-center items-center py-2">
                        <svg viewBox="0 0 320 180" className="w-52 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {/* Sparkles / Bintang-bintang */}
                          <path d="M125 100 L127 93 L134 91 L127 89 L125 82 L123 89 L116 91 L123 93 Z" fill="#b32e6a" opacity="0.8" />
                          <path d="M158 73 L159 68 L164 67 L159 66 L158 61 L157 66 L152 67 L157 68 Z" fill="#b32e6a" opacity="0.8" />
                          <path d="M160 125 L161 121 L165 120 L161 119 L160 115 L159 119 L155 120 L159 121 Z" fill="#15a34a" opacity="0.8" />

                          {/* Atap Rumah Pink */}
                          <path d="M152 72 C175 42 215 42 238 72" stroke="#b32e6a" strokeWidth="6" strokeLinecap="round" fill="none" />

                          {/* Daun-daun di atas kepala */}
                          <path d="M110 45 C115 35 125 30 135 28" stroke="#15a34a" strokeWidth="2" strokeLinecap="round" fill="none" />
                          <path d="M122 35 C120 28 126 23 131 26 C134 30 128 37 122 35 Z" fill="#15a34a" />
                          <path d="M132 28 C132 21 139 18 142 22 C143 27 137 32 132 28 Z" fill="#15a34a" />
                          <path d="M112 40 C108 34 113 29 118 31 C120 35 115 41 112 40 Z" fill="#b32e6a" />
                          <path d="M138 38 C138 33 144 30 147 33 C148 37 143 41 138 38 Z" fill="#15a34a" />

                          {/* Kepala Orang Green */}
                          <circle cx="102" cy="58" r="10" fill="#15a34a" />

                          {/* Tubuh Orang & Infinity & Heart Loops */}
                          {/* Tubuh & Tangan Orang Green (Left) */}
                          <path d="M68 52 C85 65 95 80 95 95 C95 125 65 145 45 125 C25 105 45 75 75 105 C105 135 135 145 165 125 C195 105 220 90 235 110 C250 130 230 150 210 150 C185 150 170 130 160 120" stroke="#15a34a" strokeWidth="7" strokeLinecap="round" fill="none" />

                          {/* Pink loop completing the infinity & Heart on right */}
                          <path d="M68 105 C50 125 35 115 35 100 C35 80 60 75 85 100 C110 125 140 135 165 115 C190 95 210 80 228 100 C245 120 235 140 215 140 C195 140 180 125 170 115" stroke="#b32e6a" strokeWidth="7" strokeLinecap="round" fill="none" />

                          {/* Tangan Kiri Orang Green */}
                          <path d="M102 68 C98 78 90 88 80 94" stroke="#15a34a" strokeWidth="6" strokeLinecap="round" fill="none" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-center">
                        <h2 className="font-headline text-lg font-black tracking-[0.1em] text-[#005146] leading-none mb-1">
                          RUKUN TETANGGA
                        </h2>
                        <p className="text-[9px] text-[#b32e6a] font-bold tracking-tight mb-2">
                          Komunitas Warga Untuk Hidup Selaras & Sehati
                        </p>
                        <div className="h-[1px] w-24 bg-slate-200 my-1" />
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                          WARGA DIGITAL
                        </span>
                      </div>
                    </div>

                    {/* Tab Navigation (Login vs Signup) */}
                    <div className="w-full grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => { setAuthTab('login'); setSignupSuccess(false); }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          authTab === 'login' 
                            ? 'bg-white text-[#005146] shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Masuk
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthTab('signup'); setSignupSuccess(false); }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          authTab === 'signup' 
                            ? 'bg-white text-[#005146] shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Daftar Warga
                      </button>
                    </div>

                    {/* Success Message Block */}
                    {signupSuccess && (
                      <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col gap-3 animate-fadeIn">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-emerald-900">Registrasi Warga Berhasil!</h4>
                            <p className="text-[10px] text-emerald-700 leading-relaxed mt-1">
                              Data pendaftaran Anda atas nama <strong className="font-bold">{signupName}</strong> berhasil dikirim ke basis data RT. Anda dapat langsung menggunakan email ini untuk mencoba login simulasi.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setAuthTab('login'); setSignupSuccess(false); }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all"
                        >
                          Lanjut Masuk Sekarang
                        </button>
                      </div>
                    )}

                    {!signupSuccess && (
                      <form onSubmit={(e) => { e.preventDefault(); }} className="w-full flex flex-col gap-4">
                        {authTab === 'login' ? (
                          <>
                            {/* LOGIN FIELDS */}
                            <div>
                              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email / Nama Warga</label>
                              <div className="relative">
                                <input 
                                  type="text" 
                                  placeholder="Masukkan email (cth: warga@gmail.com atau admin@gmail.com)" 
                                  value={loginEmail} 
                                  onChange={(e) => setLoginEmail(e.target.value)}
                                  className="w-full bg-[#f1f5f9] border border-slate-200/50 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 transition-all"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-slate-500">Kata Sandi</label>
                                <span className="text-[11px] text-[#0040e0] font-semibold cursor-pointer hover:underline">Lupa?</span>
                              </div>
                              <div className="relative">
                                <input 
                                  type="password" 
                                  placeholder="Masukkan kata sandi (cth: password)" 
                                  value={loginPassword} 
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  className="w-full bg-[#f1f5f9] border border-slate-200/50 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 transition-all"
                                  required
                                />
                              </div>
                            </div>

                            {/* Submit Button */}
                            <button 
                              type="button"
                              onClick={async () => {
                                // Determine role based on demo keyword, general role, or signup selection
                                const isDemoAdmin = loginEmail.toLowerCase().includes('admin') || 
                                                    (signupEmail && loginEmail.toLowerCase() === signupEmail.toLowerCase() && signupRole === 'admin');
                                if (isDemoAdmin) {
                                  setRole('admin');
                                  setIsLoggedIn(true);
                                  addLog(`Sesi Pengurus RT (${loginEmail}) dimulai.`);
                                } else {
                                  setRole('warga');
                                  // Set user dynamic session if matching signup data, otherwise default
                                  if (signupName && loginEmail.toLowerCase() === signupEmail.toLowerCase()) {
                                    setLoggedInResidentName(signupName);
                                    setLoggedInResidentBlock(`${signupBlock}/${signupNo}`);
                                  } else {
                                    setLoggedInResidentName('Siti Nurhaliza');
                                    setLoggedInResidentBlock('Blok A/12');
                                  }
                                  setIsLoggedIn(true);
                                  addLog(`Sesi warga ${loginEmail} dimulai.`);
                                }
                              }}
                              className="w-full bg-[#005146] hover:bg-[#003b33] active:scale-[0.98] text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-[#005146]/10 flex items-center justify-center gap-2 mt-2"
                            >
                              <LogIn className="w-4 h-4" />
                              Masuk Sekarang
                            </button>

                            {/* Demo Shortcut Helper */}
                            <div className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 mt-1 text-center">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Simulasi Pengguna Cepat:</span>
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLoginEmail('warga@gmail.com');
                                    setRole('warga');
                                    setLoggedInResidentName('Siti Nurhaliza');
                                    setLoggedInResidentBlock('Blok A/12');
                                    setIsLoggedIn(true);
                                    addLog("Sesi Warga Demo dimulai.");
                                  }}
                                  className="py-1.5 px-3 bg-white hover:bg-[#005146]/5 text-[#005146] border border-slate-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <User className="w-3 h-3" /> Warga Demo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLoginEmail('admin@gmail.com');
                                    setRole('admin');
                                    setIsLoggedIn(true);
                                    addLog("Sesi Admin Demo dimulai.");
                                  }}
                                  className="py-1.5 px-3 bg-white hover:bg-[#005146]/5 text-[#005146] border border-slate-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                                >
                                  <Shield className="w-3 h-3" /> Admin RT Demo
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* SIGNUP FIELDS */}
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Pilih Peran (Role)</label>
                                <div className="grid grid-cols-2 gap-2 bg-[#f1f5f9] p-1 rounded-xl">
                                  <button
                                    type="button"
                                    onClick={() => setSignupRole('warga')}
                                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                                      signupRole === 'warga'
                                        ? 'bg-[#005146] text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                  >
                                    Warga (Citizen)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSignupRole('admin')}
                                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                                      signupRole === 'admin'
                                        ? 'bg-[#b32e6a] text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                  >
                                    Pengurus (RT Admin)
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Lengkap Sesuai KTP</label>
                                <input 
                                  type="text" 
                                  placeholder="Masukkan nama lengkap" 
                                  value={signupName} 
                                  onChange={(e) => setSignupName(e.target.value)}
                                  className="w-full bg-[#f1f5f9] border border-slate-200/50 rounded-xl py-2.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 transition-all"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">Blok Rumah</label>
                                  <select 
                                    value={signupBlock} 
                                    onChange={(e) => setSignupBlock(e.target.value)}
                                    className="w-full bg-[#f1f5f9] border border-slate-200/50 rounded-xl py-2.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 transition-all"
                                  >
                                    <option value="Block A">Blok A</option>
                                    <option value="Block B">Blok B</option>
                                    <option value="Block C">Blok C</option>
                                    <option value="Block D">Blok D</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-500 mb-1">No. Rumah</label>
                                  <input 
                                    type="text" 
                                    placeholder="Contoh: 12" 
                                    value={signupNo} 
                                    onChange={(e) => setSignupNo(e.target.value)}
                                    className="w-full bg-[#f1f5f9] border border-slate-200/50 rounded-xl py-2.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 transition-all"
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Aktif</label>
                                <input 
                                  type="email" 
                                  placeholder="nama@email.com" 
                                  value={signupEmail} 
                                  onChange={(e) => setSignupEmail(e.target.value)}
                                  className="w-full bg-[#f1f5f9] border border-slate-200/50 rounded-xl py-2.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 transition-all"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Kata Sandi Baru</label>
                                <input 
                                  type="password" 
                                  placeholder="Buat sandi minimal 6 karakter" 
                                  value={signupPassword} 
                                  onChange={(e) => setSignupPassword(e.target.value)}
                                  className="w-full bg-[#f1f5f9] border border-slate-200/50 rounded-xl py-2.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 transition-all"
                                  required
                                />
                              </div>
                            </div>

                            {/* Submit Button */}
                            <button 
                              type="button"
                              onClick={async () => {
                                if (!signupName || !signupNo || !signupEmail || !signupPassword) {
                                  alert("Mohon lengkapi semua bidang isian pendaftaran.");
                                  return;
                                }
                                try {
                                  // Save to Firestore so it reflects instantly under Admin RT validations!
                                  const newRes = {
                                    name: signupName,
                                    block: signupBlock,
                                    number: `No. ${signupNo}`,
                                    submittedAt: 'Baru saja',
                                    status: signupRole === 'admin' ? 'approved' : 'pending'
                                  };
                                  await addDoc(collection(db, 'residents'), newRes);
                                  addLog(`Pendaftaran ${signupRole === 'admin' ? 'pengurus' : 'warga'} baru dikirim: ${signupName} (${signupBlock}/${signupNo})`);
                                  setSignupSuccess(true);
                                } catch (err) {
                                  console.error("Firestore write failed", err);
                                  // Local fallback
                                  addLog(`[Lokal] Pendaftaran ${signupRole === 'admin' ? 'pengurus' : 'warga'} dikirim: ${signupName}`);
                                  setSignupSuccess(true);
                                }
                              }}
                              className="w-full bg-[#005146] hover:bg-[#003b33] active:scale-[0.98] text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-[#005146]/10 flex items-center justify-center gap-2 mt-2"
                            >
                              <UserPlus className="w-4 h-4" />
                              Kirim Pengajuan Pendaftaran
                            </button>
                          </>
                        )}
                      </form>
                    )}

                    <div className="text-center">
                      <p className="text-[10px] text-slate-400">Verifikasi manual disetujui langsung oleh Admin RT setempat</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ========================== */}
                  {/* 🛡️ APP MAIN LOGGED IN VIEWS */}
                  {/* ========================== */}
                  
                  {/* CITIZEN MODE FLOW */}
                  {role === 'warga' && (
                    <div className="flex flex-col flex-grow">
                      
                      {/* CivicConnect Header */}
                      <div className="flex items-center justify-between px-6 py-4 bg-[#f8f9ff] sticky top-0 z-20 shrink-0">
                        <div className="flex items-center gap-2.5">
                          <button 
                            onClick={() => { setWargaTab('home'); }}
                            className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-300 transition-colors"
                          >
                            <User className="w-4 h-4 text-[#005146]" />
                          </button>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold leading-tight">Selamat Datang, {loggedInResidentName}</span>
                            <span className="font-headline text-[11px] font-bold text-[#0b1c30]">{loggedInResidentBlock}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-headline text-xs font-bold text-[#005146]">Warga Digital</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <button 
                            onClick={() => {
                              setIsLoggedIn(false);
                              addLog(`Sesi warga ${loggedInResidentName} telah berakhir. Pengguna keluar.`);
                            }}
                            className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-colors ml-1"
                            title="Keluar Aplikasi"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* CITIZEN TAB 1: HOME */}
                      {wargaTab === 'home' && (
                        <div className="px-5 flex flex-col gap-6 pt-2 animate-fadeIn">
                          
                          {/* Announcement card - Dynamic News from DB */}
                          {(() => {
                            const latestPenting = infos.find(i => i.category === 'penting' && !i.isDraft) || infos[0];
                            if (!latestPenting) return null;
                            return (
                              <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,107,93,0.06)] flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                  <span className="bg-rose-50 text-[#ba1a1a] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping" />
                                    {latestPenting.category}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium font-mono">
                                    {new Date(latestPenting.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="font-headline text-base font-bold text-[#0b1c30] leading-tight mb-2">
                                    {latestPenting.title}
                                  </h3>
                                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                                    {latestPenting.content}
                                  </p>
                                </div>

                                {latestPenting.imageUrl && (
                                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 relative border border-slate-100">
                                    <img 
                                      src={latestPenting.imageUrl} 
                                      alt={latestPenting.title} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1513829096960-ef229e5230ab?q=80&w=800";
                                      }}
                                    />
                                  </div>
                                )}

                                <button 
                                  onClick={() => setSelectedInfo(latestPenting)}
                                  className="text-xs font-bold text-[#005146] hover:text-[#003b33] flex items-center gap-1 group self-start transition-all"
                                >
                                  Baca Selengkapnya 
                                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                              </div>
                            );
                          })()}

                          {/* Quick Actions (Lapor Kejadian, Minta Surat, Bayar Iuran) */}
                          <div className="grid grid-cols-3 gap-3">
                            <button 
                              onClick={() => { setWargaTab('report'); setReportCategory('pengaduan'); }}
                              className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all text-center"
                            >
                              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#ba1a1a]">
                                <Bell className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-bold text-[#0b1c30] leading-tight">Lapor Kejadian</span>
                            </button>

                            <button 
                              onClick={() => { setWargaTab('report'); setReportCategory('surat'); }}
                              className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all text-center"
                            >
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0040e0]">
                                <FileText className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-bold text-[#0b1c30] leading-tight">Minta Surat</span>
                            </button>

                            <button 
                              onClick={() => { setWargaTab('wallet'); }}
                              className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center gap-2.5 hover:scale-[1.02] active:scale-95 transition-all text-center"
                            >
                              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#006b5d]">
                                <Wallet className="w-5 h-5" />
                              </div>
                              <span className="text-[11px] font-bold text-[#0b1c30] leading-tight">Bayar Iuran</span>
                            </button>
                          </div>

                          {/* Status Iuran Chart card (Mockup 2) */}
                          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,107,93,0.04)] flex flex-col gap-5">
                            <div className="flex items-center gap-2 text-[#0b1c30]">
                              <Wallet className="w-5 h-5 text-[#006b5d]" />
                              <h3 className="font-headline text-sm font-bold">Status Iuran</h3>
                            </div>

                            {/* Circular progress SVG */}
                            <div className="flex flex-col items-center justify-center py-2">
                              <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle 
                                    cx="64" cy="64" r="50" 
                                    className="text-blue-50 stroke-current" 
                                    strokeWidth="10" 
                                    fill="transparent" 
                                  />
                                  <circle 
                                    cx="64" cy="64" r="50" 
                                    className="text-[#005146] stroke-current" 
                                    strokeWidth="10" 
                                    strokeDasharray={2 * Math.PI * 50}
                                    strokeDashoffset={(2 * Math.PI * 50) * (1 - 0.75)}
                                    fill="transparent" 
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                  <span className="font-headline text-2xl font-bold text-[#0b1c30]">75%</span>
                                </div>
                              </div>
                            </div>

                            {/* Breakdown table and button */}
                            <div className="flex flex-col gap-2.5 text-xs">
                              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                <span className="flex items-center gap-2 font-medium text-slate-500">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#005146]" /> Sudah Bayar
                                </span>
                                <span className="font-bold text-[#0b1c30]">Rp 150.000</span>
                              </div>
                              <div className="flex justify-between items-center py-1.5">
                                <span className="flex items-center gap-2 font-medium text-slate-500">
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-100" /> Belum Bayar
                                </span>
                                <span className="font-bold text-[#ba1a1a]">Rp 50.000</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                setPaymentAmount(50000);
                                setPaymentCategory('Kekurangan Iuran Keamanan Mar 2024');
                                setPaymentStep('select');
                                setShowPaymentModal(true);
                              }}
                              className="w-full bg-[#005146] hover:bg-[#003b33] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#005146]/15"
                            >
                              Bayar Sekarang <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                          </div>

                        </div>
                      )}

                      {/* CITIZEN TAB 2: FINANCES (Mockup 5) */}
                      {wargaTab === 'finances' && (
                        <div className="px-5 flex flex-col gap-6 pt-2 animate-fadeIn">
                          <div>
                            <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Laporan Keuangan Warga</h2>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Transparansi arus kas dan penggunaan dana lingkungan periode berjalan.
                            </p>
                          </div>

                          {/* Total Kas balance */}
                          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,107,93,0.04)] flex flex-col gap-3">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Wallet className="w-3.5 h-3.5 text-[#006b5d]" /> Total Saldo Kas Lingkungan
                            </span>
                            <div className="flex justify-between items-baseline">
                              <span className="font-headline text-2xl font-black text-[#005146]">
                                Rp {totalBalance.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                +12% bulan ini
                              </span>
                            </div>
                          </div>

                          {/* Pemasukan vs Pengeluaran progress bars */}
                          <div className="grid grid-cols-1 gap-3">
                            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col gap-2.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500">Pemasukan (Nov)</span>
                                <span className="text-[#005146]">Rp {incomingNov.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#005146] h-full rounded-full" style={{ width: '70%' }} />
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">70% dari target bulanan</span>
                            </div>

                            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col gap-2.5">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-500">Pengeluaran (Nov)</span>
                                <span className="text-[#ba1a1a]">Rp {outgoingNov.toLocaleString('id-ID')}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '35%' }} />
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">35% dari anggaran bulanan</span>
                            </div>
                          </div>

                          {/* 6 Month Bar Chart (Mockup 5) */}
                          <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,107,93,0.04)] flex flex-col gap-4">
                            <h3 className="font-headline text-xs font-bold text-[#0b1c30] uppercase tracking-wider">Arus Kas 6 Bulan Terakhir</h3>
                            
                            <div className="h-44 flex items-end justify-between px-2 pt-6 pb-2">
                              {/* Chart Column June */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1 h-28 items-end">
                                  <div className="w-2.5 bg-[#006b5d] rounded-t" style={{ height: '60%' }} />
                                  <div className="w-2.5 bg-[#ba1a1a] rounded-t" style={{ height: '40%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Jun</span>
                              </div>

                              {/* Chart Column July */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1 h-28 items-end">
                                  <div className="w-2.5 bg-[#006b5d] rounded-t" style={{ height: '70%' }} />
                                  <div className="w-2.5 bg-[#ba1a1a] rounded-t" style={{ height: '35%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Jul</span>
                              </div>

                              {/* Chart Column Aug */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1 h-28 items-end">
                                  <div className="w-2.5 bg-[#006b5d] rounded-t" style={{ height: '90%' }} />
                                  <div className="w-2.5 bg-[#ba1a1a] rounded-t" style={{ height: '55%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Ags</span>
                              </div>

                              {/* Chart Column Sep */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1 h-28 items-end">
                                  <div className="w-2.5 bg-[#006b5d] rounded-t" style={{ height: '55%' }} />
                                  <div className="w-2.5 bg-[#ba1a1a] rounded-t" style={{ height: '50%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Sep</span>
                              </div>

                              {/* Chart Column Oct */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1 h-28 items-end">
                                  <div className="w-2.5 bg-[#006b5d] rounded-t" style={{ height: '85%' }} />
                                  <div className="w-2.5 bg-[#ba1a1a] rounded-t" style={{ height: '30%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Okt</span>
                              </div>

                              {/* Chart Column Nov */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1 h-28 items-end">
                                  <div className="w-2.5 bg-[#006b5d] rounded-t" style={{ height: '75%' }} />
                                  <div className="w-2.5 bg-[#ba1a1a] rounded-t" style={{ height: '25%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">Nov</span>
                              </div>
                            </div>

                            {/* Legend */}
                            <div className="flex justify-center gap-5 text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-50">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-[#006b5d] rounded-sm" /> Pemasukan
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-[#ba1a1a] rounded-sm" /> Pengeluaran
                              </span>
                            </div>
                          </div>

                          {/* Recent Transactions List */}
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-headline text-xs font-bold text-[#0b1c30] uppercase tracking-wider">Transaksi Terbaru</h3>
                              <span className="text-xs text-[#0040e0] font-bold">Lihat Semua</span>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              {transactions.slice(0, 4).map((tx) => (
                                <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex justify-between items-center gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                      tx.type === 'pemasukan' ? 'bg-emerald-50 text-[#005146]' : 'bg-rose-50 text-[#ba1a1a]'
                                    }`}>
                                      {tx.type === 'pemasukan' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-[#0b1c30] truncate">{tx.category}</h4>
                                      <span className="text-[10px] text-slate-400 font-medium block">
                                        {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                  </div>
                                  <span className={`text-xs font-bold whitespace-nowrap ${
                                    tx.type === 'pemasukan' ? 'text-emerald-600' : 'text-[#ba1a1a]'
                                  }`}>
                                    {tx.type === 'pemasukan' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}

                      {/* CITIZEN TAB 3: REPORT COMPLAINT (Mockup 6) */}
                      {wargaTab === 'report' && (
                        <div className="px-5 flex flex-col gap-6 pt-2 animate-fadeIn">
                          <div>
                            <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Pusat Layanan Warga</h2>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Sampaikan pengaduan atau ajukan permohonan surat RT/RW dengan mudah.
                            </p>
                          </div>

                          {/* New Report Form */}
                          <form onSubmit={handleSendReport} className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,107,93,0.04)] flex flex-col gap-4">
                            <h3 className="font-headline text-sm font-bold text-[#0b1c30]">Buat Laporan Baru</h3>
                            
                            {/* Category selector */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReportCategory('pengaduan')}
                                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    reportCategory === 'pengaduan' 
                                      ? 'bg-[#005146] text-white border-transparent' 
                                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  Pengaduan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReportCategory('surat')}
                                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    reportCategory === 'surat' 
                                      ? 'bg-[#005146] text-white border-transparent' 
                                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  Surat Pengantar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReportCategory('iuran')}
                                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    reportCategory === 'iuran' 
                                      ? 'bg-[#005146] text-white border-transparent' 
                                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  Iuran / Tagihan
                                </button>
                              </div>
                            </div>

                            {/* Details textarea */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail</label>
                              <textarea
                                value={reportDetail}
                                onChange={(e) => setReportDetail(e.target.value)}
                                placeholder="Jelaskan masalah atau keperluan Anda secara singkat..."
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 min-h-24 leading-relaxed"
                              />
                            </div>

                            {/* File Uploader */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lampiran (Opsional)</label>
                              <div className="border border-dashed border-slate-300 rounded-xl p-5 bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                                <UploadCloud className="w-8 h-8 text-[#006b5d]/80 group-hover:scale-105 transition-transform mb-2" />
                                <span className="text-xs font-bold text-[#0b1c30]">Upload Foto, Bukti Bayar, atau KTP</span>
                                <span className="text-[10px] text-slate-400 mt-1 font-medium">Maks. 5MB (JPG, PNG, PDF)</span>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#005146] hover:bg-[#003b33] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#005146]/15 mt-2"
                            >
                              Kirim Laporan
                            </button>
                          </form>

                          {/* Status Permohonan List */}
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-headline text-xs font-bold text-[#0b1c30] uppercase tracking-wider">Status Permohonan</h3>
                              <span className="text-xs text-[#0040e0] font-bold">Lihat Semua</span>
                            </div>

                            <div className="flex flex-col gap-2.5">
                              {reports.map((rep) => (
                                <div key={rep.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    rep.status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                                    rep.status === 'process' ? 'bg-blue-50 text-[#0040e0]' : 'bg-rose-50 text-[#ba1a1a]'
                                  }`}>
                                    {rep.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <h4 className="text-xs font-bold text-[#0b1c30] truncate">{rep.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium truncate">{rep.detail}</p>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                                    rep.status === 'done' ? 'bg-emerald-50 text-emerald-600' :
                                    rep.status === 'process' ? 'bg-blue-50 text-[#0040e0]' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                    {rep.status === 'done' ? 'Selesai' :
                                     rep.status === 'process' ? 'Diproses' : 'Pending'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}

                      {/* CITIZEN TAB 4: WALLET / HISTORY (Mockup 7) */}
                      {wargaTab === 'wallet' && (
                        <div className="px-5 flex flex-col gap-6 pt-2 animate-fadeIn">
                          <div>
                            <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Riwayat Iuran</h2>
                          </div>

                          {/* Yearly Summary Card */}
                          <div className="bg-gradient-to-br from-[#005146] to-[#006b5d] rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,107,93,0.2)] text-white relative overflow-hidden isolate">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400 rounded-full blur-2xl opacity-25 -z-10" />
                            
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-bold">Total Iuran Tahun Ini</span>
                                <h3 className="font-headline text-3xl font-black mt-1">Rp 1.800.000</h3>
                              </div>
                              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm text-white">
                                <Wallet className="w-5 h-5" />
                              </div>
                            </div>

                            <div className="h-px bg-white/15 my-4" />

                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-[10px] text-emerald-200 font-bold block">Status Iuran Terkini</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                                  <span className="text-xs font-bold text-white">Lunas (Jan - Mar 2024)</span>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => alert('Mengunduh rekap keuangan warga PDF...')}
                                className="bg-white text-[#005146] hover:bg-emerald-50 active:scale-95 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Rekap
                              </button>
                            </div>
                          </div>

                          {/* Filter chips (Semua, Berhasil, Menunggu Verifikasi) */}
                          <div className="flex gap-2.5">
                            <button
                              onClick={() => setWalletFilter('semua')}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-colors ${
                                walletFilter === 'semua' ? 'bg-[#005146] text-white shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/50'
                              }`}
                            >
                              Semua
                            </button>
                            <button
                              onClick={() => setWalletFilter('berhasil')}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-colors ${
                                walletFilter === 'berhasil' ? 'bg-[#005146] text-white shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/50'
                              }`}
                            >
                              Berhasil
                            </button>
                            <button
                              onClick={() => setWalletFilter('menunggu')}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-colors ${
                                walletFilter === 'menunggu' ? 'bg-[#005146] text-white shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200/50'
                              }`}
                            >
                              Menunggu
                            </button>
                          </div>

                          {/* List of dues transactions */}
                          <div className="flex flex-col gap-2.5">
                            {filteredWalletTxs.map((tx) => (
                              <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex gap-4 items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#005146] flex items-center justify-center shrink-0">
                                    <Shield className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-[#0b1c30] truncate">{tx.category}</h4>
                                    <span className="text-[10px] text-slate-400 font-medium block">
                                      {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0 gap-1.5">
                                  <span className="text-xs font-bold text-[#0b1c30] font-mono">
                                    + Rp {tx.amount.toLocaleString('id-ID')}
                                  </span>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    tx.category.includes('Sumbangan') ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {tx.category.includes('Sumbangan') ? 'Menunggu' : 'Berhasil'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-center mt-2">
                            <button className="font-headline text-xs font-bold text-[#005146] bg-transparent border border-slate-200 hover:bg-slate-50 active:scale-95 px-6 py-3 rounded-xl transition-all">
                              Muat Lebih Banyak
                            </button>
                          </div>

                        </div>
                      )}



                    </div>
                  )}

                  {/* ADMIN RT MODE FLOW */}
                  {role === 'admin' && (
                    <div className="flex flex-col flex-grow">
                      
                      {/* Admin App bar (Mockup 1) */}
                      <div className="flex items-center justify-between px-6 py-4 bg-[#f8f9ff] sticky top-0 z-20 shrink-0">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#005146] flex items-center justify-center text-white">
                            <Shield className="w-4 h-4 text-emerald-200" />
                          </div>
                          <div>
                            <span className="font-headline text-sm font-black text-[#005146] block uppercase tracking-wide">ADMIN RT</span>
                            <span className="text-[10px] text-slate-400 block font-semibold leading-tight">Dashboard Kepengurusan</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative hover:opacity-80 transition-opacity cursor-pointer" onClick={() => setAdminTab('validation')}>
                            <Bell className="w-5 h-5 text-slate-700" />
                            {(pendingResidentsCount + pendingPaymentsCount) > 0 && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center">
                                {pendingResidentsCount + pendingPaymentsCount}
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              setIsLoggedIn(false);
                              addLog("Sesi admin telah berakhir. Pengguna keluar.");
                            }}
                            className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-colors"
                            title="Keluar Aplikasi"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* ADMIN TAB 1: DASHBOARD (Mockup 1) */}
                      {adminTab === 'dashboard' && (
                        <div className="px-5 flex flex-col gap-6 pt-2 animate-fadeIn">
                          
                          {/* Stats cards Stack */}
                          <div className="flex flex-col gap-3">
                            
                            {/* Card: Total Warga */}
                            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,107,93,0.03)] flex justify-between items-start">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Warga</span>
                                <span className="font-headline text-3xl font-black text-[#0b1c30]">128</span>
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                  ▲ +3 bulan ini
                                </span>
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#006b5d]">
                                <User className="w-5 h-5" />
                              </div>
                            </div>

                            {/* Card: Validasi Pending */}
                            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,107,93,0.03)] flex justify-between items-start">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Validasi Pending Warga</span>
                                <span className="font-headline text-3xl font-black text-[#ba1a1a]">{pendingResidentsCount}</span>
                                <span className="text-[10px] text-[#ba1a1a] font-bold">Butuh tindakan segera</span>
                              </div>
                              <button
                                onClick={() => {
                                  setAdminTab('validation');
                                  setValidationSubTab('residents');
                                }}
                                className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-[#ba1a1a] transition-all"
                              >
                                <UserCheck className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Card: Validasi Iuran Pending */}
                            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,107,93,0.03)] flex justify-between items-start">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Validasi Pembayaran Iuran</span>
                                <span className="font-headline text-3xl font-black text-[#d97706]">{pendingPaymentsCount}</span>
                                <span className="text-[10px] text-[#d97706] font-bold">Belum dikonfirmasi admin</span>
                              </div>
                              <button
                                onClick={() => {
                                  setAdminTab('validation');
                                  setValidationSubTab('payments');
                                }}
                                className="w-10 h-10 rounded-xl bg-amber-50 hover:bg-amber-100 flex items-center justify-center text-[#d97706] transition-all"
                              >
                                <Wallet className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Card: Saldo Kas */}
                            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,107,93,0.03)] flex justify-between items-start">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Saldo Kas</span>
                                <span className="font-headline text-2xl font-black text-[#005146]">
                                  Rp {totalBalance.toLocaleString('id-ID')}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Terakhir update: Hari ini</span>
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                                <Wallet className="w-5 h-5" />
                              </div>
                            </div>

                          </div>

                          {/* Quick Actions Title */}
                          <div className="flex flex-col gap-3">
                            <h3 className="font-headline text-sm font-black text-[#0b1c30]">Aksi Cepat</h3>
                            
                            {/* Grid of 4 actions (Validation, Dues Validation, Financial entry, News creation) */}
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => { setAdminTab('validation'); setValidationSubTab('residents'); }}
                                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center border border-slate-50"
                              >
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#005146] flex items-center justify-center">
                                  <UserCheck className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-[#0b1c30]">Validasi Warga</span>
                              </button>

                              <button 
                                onClick={() => { setAdminTab('validation'); setValidationSubTab('payments'); }}
                                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center border border-slate-50"
                              >
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                                  <Wallet className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-[#0b1c30]">Validasi Iuran</span>
                              </button>

                              <button 
                                onClick={() => setAdminTab('finance')}
                                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center border border-slate-50"
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0040e0] flex items-center justify-center">
                                  <Coins className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-[#0b1c30]">Input Keuangan</span>
                              </button>

                              <button 
                                onClick={() => setAdminTab('news')}
                                className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-center border border-slate-50"
                              >
                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-[#0b1c30]">Buat Berita</span>
                              </button>
                            </div>
                          </div>

                          {/* Recent Reports List (Mockup 1) */}
                          <div className="flex flex-col gap-3 pb-4">
                            <div className="flex justify-between items-center">
                              <h3 className="font-headline text-sm font-black text-[#0b1c30]">Laporan Terbaru</h3>
                              <span className="text-xs text-[#0040e0] font-bold cursor-pointer">Lihat Semua</span>
                            </div>

                            <div className="flex flex-col gap-3">
                              {reports.map((rep) => (
                                <div key={rep.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex gap-4 items-start border border-slate-50">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                    rep.category === 'pengaduan' ? 'bg-rose-50 text-[#ba1a1a]' : 
                                    rep.category === 'surat' ? 'bg-blue-50 text-[#0040e0]' : 'bg-emerald-50 text-emerald-700'
                                  }`}>
                                    {rep.category === 'pengaduan' ? <AlertCircle className="w-5 h-5" /> : 
                                     rep.category === 'surat' ? <FileText className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                      <h4 className="text-xs font-bold text-[#0b1c30] truncate">{rep.title}</h4>
                                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                        {rep.submittedAt}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                                      {rep.detail}
                                    </p>
                                    <div className="flex gap-2">
                                      <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-100 uppercase">
                                        {rep.category === 'pengaduan' ? 'Infrastruktur' : 
                                         rep.category === 'surat' ? 'Perizinan' : 'Kebersihan'}
                                      </span>
                                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                                        rep.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                        rep.status === 'process' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                        'bg-rose-50 text-rose-700 border-rose-100'
                                      }`}>
                                        {rep.status === 'done' ? 'Selesai' :
                                         rep.status === 'process' ? 'Diproses' : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}

                      {/* ADMIN TAB 2: RESIDENT VALIDATION (Mockup 3 / 4) */}
                      {adminTab === 'validation' && (
                        <div className="px-5 flex flex-col gap-5 pt-2 animate-fadeIn">
                          <div>
                            <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Validasi Kepengurusan Hub</h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Tinjau dan setujui pendaftaran warga baru serta pembayaran iuran bulanan warga.
                            </p>
                          </div>

                          {/* Sub-tab Selector */}
                          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                            <button
                              onClick={() => setValidationSubTab('residents')}
                              className={`flex-grow flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                validationSubTab === 'residents'
                                  ? 'bg-white text-[#005146] shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <UserCheck className="w-4 h-4" />
                              Warga ({pendingResidentsCount})
                            </button>
                            <button
                              onClick={() => setValidationSubTab('payments')}
                              className={`flex-grow flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                                validationSubTab === 'payments'
                                  ? 'bg-white text-[#005146] shadow-sm'
                                  : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <Wallet className="w-4 h-4" />
                              Iuran ({pendingPaymentsCount})
                            </button>
                          </div>

                          {/* Search bar */}
                          <div className="relative">
                            <input 
                              type="text" 
                              value={validationSearch}
                              onChange={(e) => setValidationSearch(e.target.value)}
                              placeholder={validationSubTab === 'residents' ? "Cari nama warga atau blok..." : "Cari nama penyetor atau iuran..."}
                              className="w-full bg-[#f1f5f9] border border-transparent rounded-xl py-3 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          </div>

                          {validationSubTab === 'residents' ? (
                            <>
                              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Pendaftaran Menunggu</span>
                                <span className="bg-rose-50 text-[#ba1a1a] px-2.5 py-0.5 rounded-full border border-rose-100 font-mono">
                                  {pendingResidentsCount} Baru
                                </span>
                              </div>

                              {/* Applicants Cards List */}
                              <div className="flex flex-col gap-3">
                                {filteredResidents.length === 0 ? (
                                  <div className="text-center py-8 text-xs text-slate-400">Tidak ada pendaftaran warga baru.</div>
                                ) : (
                                  filteredResidents.map((r) => (
                                    <div key={r.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col gap-4 border border-slate-50 animate-slideUp">
                                      <div className="flex gap-3.5 items-center">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                                          <img 
                                            src={r.id === 'res_1' ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"} 
                                            alt={r.name} 
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <div className="flex-grow">
                                          <h4 className="text-sm font-bold text-[#0b1c30]">{r.name}</h4>
                                          <div className="flex gap-2 text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wide">
                                            <span>{r.block}, {r.number}</span>
                                            <span>•</span>
                                            <span>{r.submittedAt}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-50">
                                        {r.status === 'pending' ? (
                                          <>
                                            <button 
                                              onClick={() => handleVerifyResident(r.id, 'rejected')}
                                              className="w-full py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#ba1a1a] active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                            >
                                              <X className="w-3.5 h-3.5" /> Tolak
                                            </button>
                                            <button 
                                              onClick={() => handleVerifyResident(r.id, 'approved')}
                                              className="w-full py-2.5 bg-[#005146] hover:bg-[#003b33] text-white active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#005146]/10"
                                            >
                                              <Check className="w-3.5 h-3.5" /> Terima
                                            </button>
                                          </>
                                        ) : (
                                          <span className={`col-span-2 text-center py-2 text-xs font-bold uppercase rounded-lg ${
                                            r.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                          }`}>
                                            Status: {r.status === 'approved' ? 'Diterima' : 'Ditolak'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span>Verifikasi Pembayaran Iuran</span>
                                <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-100 font-mono">
                                  {pendingPaymentsCount} Pending
                                </span>
                              </div>

                              {/* Dues Payments Cards List */}
                              <div className="flex flex-col gap-3">
                                {filteredIuranPayments.length === 0 ? (
                                  <div className="text-center py-8 text-xs text-slate-400">Tidak ada pengajuan pembayaran iuran.</div>
                                ) : (
                                  filteredIuranPayments.map((tx) => (
                                    <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.01)] flex flex-col gap-4 border border-slate-50 animate-slideUp">
                                      <div className="flex justify-between items-start gap-3">
                                        <div className="flex gap-3 items-center">
                                          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                            <Wallet className="w-5 h-5" />
                                          </div>
                                          <div>
                                            <h4 className="text-sm font-bold text-[#0b1c30]">{tx.residentName || 'Warga'}</h4>
                                            <p className="text-xs text-[#005146] font-medium mt-0.5">{tx.category}</p>
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                              <span className="text-[10px] text-slate-400 font-medium">
                                                Diajukan: {new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                              </span>
                                              {tx.proofUrl && (
                                                <button
                                                  type="button"
                                                  onClick={() => setSelectedProofUrl(tx.proofUrl)}
                                                  className="text-[10px] bg-[#005146]/5 hover:bg-[#005146]/10 text-[#005146] font-bold px-2 py-0.5 rounded transition-all flex items-center gap-1"
                                                >
                                                  <FileText className="w-2.5 h-2.5" /> Lihat Bukti
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-sm font-bold text-[#0b1c30] font-mono block">
                                            Rp {tx.amount.toLocaleString('id-ID')}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-50">
                                        {tx.status === 'pending' ? (
                                          <>
                                            <button 
                                              onClick={() => handleVerifyPayment(tx.id, 'rejected')}
                                              className="w-full py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#ba1a1a] active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                            >
                                              <X className="w-3.5 h-3.5" /> Tolak
                                            </button>
                                            <button 
                                              onClick={() => handleVerifyPayment(tx.id, 'approved')}
                                              className="w-full py-2.5 bg-[#005146] hover:bg-[#003b33] text-white active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#005146]/10"
                                            >
                                              <Check className="w-3.5 h-3.5" /> Setujui
                                            </button>
                                          </>
                                        ) : (
                                          <span className={`col-span-2 text-center py-2 text-xs font-bold uppercase rounded-lg ${
                                            tx.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                          }`}>
                                            Status: {tx.status === 'approved' ? 'Disetujui (Kas Ditambahkan)' : 'Ditolak'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </>
                          )}

                        </div>
                      )}

                      {/* ADMIN TAB 3: INPUT KEUANGAN (Mockup 3) */}
                      {adminTab === 'finance' && (
                        <div className="px-5 flex flex-col gap-5 pt-2 animate-fadeIn">
                          <div>
                            <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Input Laporan Keuangan</h2>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Catat rincian pemasukan atau pengeluaran kas komunitas.
                            </p>
                          </div>

                          <form onSubmit={handleSaveTransaction} className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,107,93,0.04)] flex flex-col gap-4">
                            
                            {/* Type selector */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe Transaksi</label>
                              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setTxType('pemasukan')}
                                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                                    txType === 'pemasukan' ? 'bg-white text-[#005146] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  Pemasukan
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTxType('pengeluaran')}
                                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                                    txType === 'pengeluaran' ? 'bg-white text-[#ba1a1a] shadow-sm' : 'text-slate-400 hover:text-slate-600'
                                  }`}
                                >
                                  Pengeluaran
                                </button>
                              </div>
                            </div>

                            {/* Category input */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori / Sumber</label>
                              <input 
                                type="text" 
                                value={txCategory}
                                onChange={(e) => setTxCategory(e.target.value)}
                                placeholder="Pilih atau ketik Kategori..." 
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800"
                              />
                            </div>

                            {/* Amount Input */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah (Rp)</label>
                              <input 
                                type="text" 
                                value={txAmount}
                                onChange={(e) => setTxAmount(e.target.value)}
                                placeholder="Rp 0" 
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 font-mono font-bold"
                              />
                            </div>

                            {/* Date input */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</label>
                              <input 
                                type="date" 
                                value={txDate}
                                onChange={(e) => setTxDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800"
                              />
                            </div>

                            {/* Keterangan */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan</label>
                              <textarea
                                value={txDescription}
                                onChange={(e) => setTxDescription(e.target.value)}
                                placeholder="Tuliskan detail transaksi..."
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 min-h-16"
                              />
                            </div>

                            {/* Upload Bukti */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lampiran Bukti (Opsional)</label>
                              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                                <UploadCloud className="w-6 h-6 text-[#006b5d] mb-1.5" />
                                <span className="text-xs font-bold text-[#0b1c30]">Upload foto nota atau bukti transfer</span>
                                <span className="text-[9px] text-slate-400 mt-0.5 font-medium">JPG, PNG, PDF hingga 5MB</span>
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#005146] hover:bg-[#003b33] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#005146]/15 mt-2"
                            >
                              <Wallet className="w-4 h-4" /> Simpan Transaksi
                            </button>
                          </form>

                        </div>
                      )}

                      {/* ADMIN TAB 4: NEWS / BULLETINS (Mockup 4) */}
                      {adminTab === 'news' && (
                        <div className="px-5 flex flex-col gap-5 pt-2 animate-fadeIn">
                          <div>
                            <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Buat Informasi Warga</h2>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Terbitkan pengumuman penting atau kegiatan terbaru untuk warga komunitas.
                            </p>
                          </div>

                          <form onSubmit={(e) => handlePublishInfo(e, false)} className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,107,93,0.04)] flex flex-col gap-4">
                            
                            {/* Judul */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul Informasi</label>
                              <input 
                                type="text" 
                                value={infoTitle}
                                onChange={(e) => setInfoTitle(e.target.value)}
                                placeholder="Contoh: Jadwal Kerja Bakti RT 04" 
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800"
                              />
                            </div>

                            {/* Category selector */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</label>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setInfoCategory('penting')}
                                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    infoCategory === 'penting' 
                                      ? 'bg-rose-50 border-rose-200 text-[#ba1a1a]' 
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                  }`}
                                >
                                  Penting
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInfoCategory('umum')}
                                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    infoCategory === 'umum' 
                                      ? 'bg-blue-50 border-blue-200 text-[#0040e0]' 
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                  }`}
                                >
                                  Umum
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInfoCategory('kegiatan')}
                                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                    infoCategory === 'kegiatan' 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                  }`}
                                >
                                  Kegiatan
                                </button>
                              </div>
                            </div>

                            {/* Isi berita */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Isi Berita</label>
                              <textarea
                                value={infoContent}
                                onChange={(e) => setInfoContent(e.target.value)}
                                placeholder="Tuliskan detail informasi di sini..."
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#006b5d] focus:bg-white text-slate-800 min-h-24 leading-relaxed"
                              />
                            </div>

                            {/* Upload banner */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unggah Gambar / Poster</label>
                              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                                <UploadCloud className="w-6 h-6 text-[#006b5d] mb-1.5" />
                                <span className="text-xs font-bold text-[#0b1c30]">Klik untuk unggah atau seret file</span>
                                <span className="text-[9px] text-slate-400 mt-0.5 font-medium">SVG, PNG, JPG (Maks. 5MB)</span>
                              </div>
                            </div>

                            {/* Notify toggle */}
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                              <div>
                                <span className="text-xs font-bold text-[#0b1c30] block">Kirim Notifikasi ke Warga</span>
                                <span className="text-[10px] text-slate-400 font-medium">Munculkan push notification di HP warga</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setInfoNotify(!infoNotify)}
                                className={`w-11 h-6 rounded-full p-1 transition-all ${
                                  infoNotify ? 'bg-[#005146]' : 'bg-slate-300'
                                }`}
                              >
                                <div className={`bg-white w-4 h-4 rounded-full transition-transform ${
                                  infoNotify ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                              </button>
                            </div>

                            {/* Submission button stack */}
                            <div className="flex flex-col gap-2 pt-2">
                              <button
                                type="submit"
                                className="w-full bg-[#005146] hover:bg-[#003b33] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-[#005146]/15"
                              >
                                Terbitkan Informasi
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handlePublishInfo(e as any, true)}
                                className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all active:scale-95 text-center"
                              >
                                Simpan sebagai Draf
                              </button>
                            </div>

                          </form>

                        </div>
                      )}



                    </div>
                  )}

                </>
              )}

            </div>

            {/* ========================== */}
            {/* 📍 FIXED BOTTOM TAB BARS   */}
            {/* ========================== */}
            {isLoggedIn && role === 'warga' && (
              <div className="absolute bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around py-3.5 px-2 z-20 shrink-0 rounded-b-[42px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <button 
                  onClick={() => setWargaTab('home')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    wargaTab === 'home' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                </button>

                <button 
                  onClick={() => setWargaTab('finances')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    wargaTab === 'finances' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Finances</span>
                </button>

                <button 
                  onClick={() => setWargaTab('report')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    wargaTab === 'report' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Report</span>
                </button>

                <button 
                  onClick={() => { setRole('admin'); setAdminTab('dashboard'); }}
                  className="flex flex-col items-center gap-1 text-center transition-all text-slate-400 hover:text-slate-600"
                >
                  <UserCheck className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Admin</span>
                </button>

                <button 
                  onClick={() => setWargaTab('wallet')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    wargaTab === 'wallet' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Wallet</span>
                </button>
              </div>
            )}

            {isLoggedIn && role === 'admin' && (
              <div className="absolute bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around py-3.5 px-2 z-20 shrink-0 rounded-b-[42px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <button 
                  onClick={() => setAdminTab('dashboard')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    adminTab === 'dashboard' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Dashboard</span>
                </button>

                <button 
                  onClick={() => setAdminTab('validation')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    adminTab === 'validation' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Validation</span>
                </button>

                <button 
                  onClick={() => setAdminTab('finance')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    adminTab === 'finance' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Finance</span>
                </button>

                <button 
                  onClick={() => setAdminTab('news')}
                  className={`flex flex-col items-center gap-1 text-center transition-all ${
                    adminTab === 'news' ? 'text-[#005146] scale-105 font-bold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">News</span>
                </button>

                <button 
                  onClick={() => { setRole('warga'); setWargaTab('home'); }}
                  className="flex flex-col items-center gap-1 text-center transition-all text-slate-400 hover:text-slate-600"
                >
                  <User className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Warga</span>
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* 💎 COMPONENT MODAL: FULL BULLETIN DETAILS READER        */}
            {/* ========================================================= */}
            {selectedInfo && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn">
                <div className="bg-white w-full rounded-t-[32px] p-6 max-h-[85%] overflow-y-auto flex flex-col gap-5 shadow-2xl animate-slideUp">
                  
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="bg-rose-50 text-[#ba1a1a] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {selectedInfo.category}
                    </span>
                    <button 
                      onClick={() => setSelectedInfo(null)}
                      className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-headline text-lg font-bold text-[#0b1c30] leading-snug">
                      {selectedInfo.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                      Terbit: {new Date(selectedInfo.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  {selectedInfo.imageUrl && (
                    <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img 
                        src={selectedInfo.imageUrl} 
                        alt={selectedInfo.title} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1513829096960-ef229e5230ab?q=80&w=800";
                        }}
                      />
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedInfo.content}
                  </p>

                  <button 
                    onClick={() => setSelectedInfo(null)}
                    className="w-full bg-[#005146] hover:bg-[#003b33] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all"
                  >
                    Tutup Pengumuman
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* 💳 COMPONENT MODAL: PAYMENT GATEWAY SIMULATOR           */}
            {/* ========================================================= */}
            {showPaymentModal && (
              <div className="absolute inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end justify-center animate-fadeIn">
                <div className="bg-white w-full rounded-t-[32px] p-6 max-h-[90%] overflow-y-auto flex flex-col gap-5 shadow-2xl animate-slideUp">
                  
                  {/* Step 1: Selection */}
                  {paymentStep === 'select' && (
                    <>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#006b5d]" />
                          <h3 className="font-headline text-sm font-black text-[#0b1c30]">Metode Pembayaran Aman</h3>
                        </div>
                        <button 
                          onClick={() => setShowPaymentModal(false)}
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                        >
                          <X className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jumlah Tagihan</span>
                        <span className="font-headline text-2xl font-black text-[#005146]">
                          Rp {paymentAmount.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">
                          Untuk: {paymentCategory}
                        </span>
                      </div>

                      {/* Payment method selector */}
                      <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Metode Pembayaran</label>
                        
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMethod('qris')}
                            className={`flex justify-between items-center p-3.5 rounded-xl border transition-all text-left ${
                              selectedPaymentMethod === 'qris' ? 'border-[#005146] bg-[#005146]/5' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-700">QRIS Instan (GOPAY, OVO, ShopeePay)</span>
                            <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase">Populer</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMethod('va')}
                            className={`flex justify-between items-center p-3.5 rounded-xl border transition-all text-left ${
                              selectedPaymentMethod === 'va' ? 'border-[#005146] bg-[#005146]/5' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-700">Transfer Virtual Account (BCA, Mandiri)</span>
                            <span className="text-[9px] text-[#006b5d] font-bold font-mono bg-emerald-50 px-1.5 py-0.5 rounded uppercase text-[8px]">Otomatis</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPaymentMethod('transfer')}
                            className={`flex justify-between items-center p-3.5 rounded-xl border transition-all text-left ${
                              selectedPaymentMethod === 'transfer' ? 'border-[#005146] bg-[#005146]/5' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-700">Transfer Bank Manual (BCA, Mandiri, dll)</span>
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded uppercase">Verifikasi RT</span>
                          </button>
                        </div>
                      </div>

                      {/* Detail Section: Virtual Account */}
                      {selectedPaymentMethod === 'va' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex flex-col gap-2.5 animate-fadeIn">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Rekening Virtual Account</span>
                            <span className="text-[10px] text-slate-500 font-bold">BANK BCA</span>
                          </div>
                          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                            <span className="font-mono text-xs font-black text-slate-800">88301 08123456789</span>
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('8830108123456789');
                                alert('Nomor Virtual Account disalin!');
                              }}
                              className="text-[10px] font-bold text-[#005146] hover:underline"
                            >
                              Salin
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Pemberitahuan: Setelah menekan tombol bayar di bawah, pembayaran akan terverifikasi secara otomatis oleh sistem kami.
                          </p>
                        </div>
                      )}

                      {/* Detail Section: Manual Transfer Form */}
                      {selectedPaymentMethod === 'transfer' && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex flex-col gap-4 animate-fadeIn">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Kirim Transfer Ke Rekening RT</span>
                            <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-700">Bank BCA</span>
                                <span className="font-mono font-bold text-[#005146]">812-345-6789</span>
                              </div>
                              <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-1.5">
                                <span className="font-bold text-slate-700">Bank Mandiri</span>
                                <span className="font-mono font-bold text-[#005146]">132-00-1234567-8</span>
                              </div>
                              <div className="text-[10px] text-slate-400 text-center mt-0.5">Atas Nama: <strong>KAS KEUANGAN RT 05</strong></div>
                            </div>
                          </div>

                          {/* Inputs */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Pengirim</label>
                              <input 
                                type="text"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#005146]"
                                placeholder="Nama pengirim"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Bank Pengirim</label>
                              <select 
                                value={senderBank}
                                onChange={(e) => setSenderBank(e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#005146]"
                              >
                                <option value="BCA">BCA</option>
                                <option value="MANDIRI">MANDIRI</option>
                                <option value="BRI">BRI</option>
                                <option value="BNI">BNI</option>
                              </select>
                            </div>
                          </div>

                          {/* Bukti Transfer attachment */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Unggah Bukti Transfer</label>
                            <button
                              type="button"
                              onClick={() => {
                                setTransferProof('https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=400&auto=format&fit=crop');
                                alert('Bukti transfer simulasi berhasil terlampir!');
                              }}
                              className={`border border-dashed p-3.5 rounded-xl flex flex-col items-center justify-center text-center transition-colors ${
                                transferProof ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800' : 'border-slate-300 hover:bg-slate-100 bg-white text-slate-600'
                              }`}
                            >
                              <UploadCloud className={`w-5 h-5 mb-1 ${transferProof ? 'text-emerald-600 animate-bounce' : 'text-slate-400'}`} />
                              <span className="text-[11px] font-bold">
                                {transferProof ? 'Bukti Pembayaran Terlampir!' : 'Unggah Bukti (Klik Simulasi)'}
                              </span>
                              <span className="text-[8px] text-slate-400 mt-0.5">Klik untuk otomatis menyematkan struk transfer simulasi</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={handleSimulatePayment}
                        className="w-full bg-[#005146] hover:bg-[#003b33] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        Konfirmasi & Bayar Sekarang
                      </button>
                    </>
                  )}

                  {/* Step 2: Progress loader */}
                  {paymentStep === 'process' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-5">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-[#005146] animate-spin" />
                      </div>
                      <div>
                        <h4 className="font-headline text-base font-bold text-[#0b1c30]">Memproses Pembayaran Aman</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Menyambungkan ke API gateway simulasi Midtrans... <br />
                          Mohon jangan menutup aplikasi ini.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Success state */}
                  {paymentStep === 'success' && (
                    <div className="py-6 flex flex-col items-center justify-center text-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="font-headline text-base font-bold text-[#b45309]">Pembayaran Diajukan!</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed px-4">
                          Iuran senilai <strong>Rp {paymentAmount.toLocaleString('id-ID')}</strong> telah berhasil diajukan dan sedang menunggu verifikasi/validasi oleh RT Admin secara real-time.
                        </p>
                      </div>

                      <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-500 flex flex-col gap-1.5 text-left">
                        <div className="flex justify-between"><span>ID TRANSAKSI</span><span className="font-bold">TX-{Date.now().toString().slice(-6)}</span></div>
                        <div className="flex justify-between"><span>METODE</span><span className="font-bold">{selectedPaymentMethod.toUpperCase()}</span></div>
                        <div className="flex justify-between"><span>STATUS SINKRON</span><span className="text-amber-600 font-bold">MENUNGGU VERIFIKASI (FIREBASE)</span></div>
                      </div>

                      <button 
                        onClick={() => {
                          setShowPaymentModal(false);
                          // Reset chart values in local mock status for beautiful UI update if necessary
                        }}
                        className="w-full bg-[#005146] hover:bg-[#003b33] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider transition-all"
                      >
                        Kembali ke Aplikasi
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Modal: View Transfer Proof Receipt */}
            {selectedProofUrl && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fadeIn">
                <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col animate-slideUp">
                  <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-xs font-bold text-[#0b1c30]">Bukti Transfer Pembayaran</h3>
                    <button 
                      type="button"
                      onClick={() => setSelectedProofUrl(null)}
                      className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <div className="p-4 flex justify-center bg-slate-100 max-h-[360px] overflow-hidden items-center">
                    <img 
                      src={selectedProofUrl} 
                      alt="Struk Bukti Transfer" 
                      className="max-h-[320px] object-contain rounded shadow border border-slate-200/50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 border-t border-slate-100 flex flex-col gap-2 bg-slate-50">
                    <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Sistem real-time memvalidasi kecocokan data pengirim dengan status verifikasi manual oleh RT Admin.
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedProofUrl(null)}
                      className="w-full py-2.5 bg-[#005146] hover:bg-[#003b33] text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Tutup Pratinjau
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Safe Area indicator block */}
            <div className="h-6 bg-white shrink-0 z-30 flex items-center justify-center">
              <div className="w-32 h-1 bg-slate-300 rounded-full mb-1" />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
