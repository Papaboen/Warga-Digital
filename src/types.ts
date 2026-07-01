export interface Resident {
  id: string;
  name: string;
  block: string;
  number: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  photoUrl?: string;
}

export interface Transaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran';
  category: string;
  amount: number;
  date: string;
  description: string;
  proofUrl?: string;
  createdAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  residentName?: string;
}

export interface Report {
  id: string;
  category: 'pengaduan' | 'surat' | 'iuran';
  detail: string;
  status: 'pending' | 'process' | 'done';
  submittedAt: string;
  photoUrl?: string;
  title: string;
  blockAndNo?: string;
}

export interface Info {
  id: string;
  title: string;
  category: 'penting' | 'umum' | 'kegiatan';
  content: string;
  imageUrl?: string;
  isNotified: boolean;
  isDraft: boolean;
  createdAt: string;
}
