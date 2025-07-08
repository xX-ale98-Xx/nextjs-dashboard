import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '@/app/ui/dashboard/header';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <div className="flex-1 pt-4 pb-6 overflow-y-auto px-6 md:px-4 md:py-6">{children}</div>
      </div>
    </div>
  );
}