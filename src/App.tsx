import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/Dashboard';
import MasterObat from './components/master/MasterObat';
import MasterJaringan from './components/master/MasterJaringan';
import MasterPenyedia from './components/master/MasterPenyedia';
import PenerimaanList from './components/penerimaan/PenerimaanList';
import DistribusiList from './components/distribusi/DistribusiList';
import LPLPOReport from './components/pelaporan/LPLPOReport';

// Network Unit Components
import DashboardJaringan from './components/jaringan/DashboardJaringan';
import POSJaringan from './components/jaringan/POS';
import StokJaringan from './components/jaringan/StokJaringan';
import LPLPOJaringan from './components/jaringan/LPLPOJaringan';

import { useMasterStore } from './stores/masterStore';
import { useTransactionStore } from './stores/transactionStore';

function App() {
  const fetchObat = useMasterStore((state) => state.fetchObat);
  const fetchJaringan = useMasterStore((state) => state.fetchJaringan);
  const fetchPenyedia = useMasterStore((state) => state.fetchPenyedia);
  const fetchPenerimaan = useTransactionStore((state) => state.fetchPenerimaan);
  const fetchDistribusi = useTransactionStore((state) => state.fetchDistribusi);
  const fetchPOSTransactions = useTransactionStore((state) => state.fetchPOSTransactions);

  useEffect(() => {
    fetchObat();
    fetchJaringan();
    fetchPenyedia();
    fetchPenerimaan();
    fetchDistribusi();
    fetchPOSTransactions();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto font-sans">
          <Routes>
            {/* Central Warehouse Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/master/obat" element={<MasterObat />} />
            <Route path="/master/jaringan" element={<MasterJaringan />} />
            <Route path="/master/penyedia" element={<MasterPenyedia />} />
            <Route path="/penerimaan" element={<PenerimaanList />} />
            <Route path="/distribusi" element={<DistribusiList />} />
            <Route path="/pelaporan" element={<LPLPOReport />} />

            {/* Network Unit Routes */}
            <Route path="/jaringan/dashboard" element={<DashboardJaringan />} />
            <Route path="/jaringan/pos" element={<POSJaringan />} />
            <Route path="/jaringan/stok" element={<StokJaringan />} />
            <Route path="/jaringan/lplpo" element={<LPLPOJaringan />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
