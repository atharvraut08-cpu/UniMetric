import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Sidebar from '../components/common/Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-brand-cream p-3 md:p-4">
      <div className="flex h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)] gap-3 md:gap-4">

        {/* Fixed dark sidebar */}
        <aside className="hidden md:flex w-20 flex-shrink-0 flex-col items-center justify-between rounded-4xl bg-brand-charcoal py-6">
          <Sidebar />
        </aside>

        {/* Massive rounded white content panel */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-4xl bg-brand-paper shadow-soft">
          <Navbar />
          <main className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="px-6 md:px-10 py-6 flex-1">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>

      </div>
    </div>
  );
}