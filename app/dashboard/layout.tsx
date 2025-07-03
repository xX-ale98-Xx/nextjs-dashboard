import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '@/app/ui/dashboard/header';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen h-screen overflow-hidden flex flex-col">
      <Header />
      <div className="flex flex-1 flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>
        <div className="flex-1 px-6 py-4 bg-gray-100 md:overflow-y-auto md:px-4 md:py-4">{children}</div>
      </div>
    </div>
  );
}