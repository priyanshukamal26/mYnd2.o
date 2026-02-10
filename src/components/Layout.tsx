import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import UserMenu from '@/components/UserMenu';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 min-h-screen">
        <header className="flex items-center justify-end px-8 py-4">
          <UserMenu />
        </header>
        <main className="px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
