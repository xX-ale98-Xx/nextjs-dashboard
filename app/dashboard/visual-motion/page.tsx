import { Metadata } from 'next';
import InfoDialog from '@/app/ui/visual-motion/popup';
import PatientCard from '@/app/ui/visual-motion/PatientCard';
import VideoElement from '@/app/ui/visual-motion/VideoElement';

export const metadata: Metadata = {
  title: 'VisualMotion+',
};

export default function Page() {
  return (
    <main className='flex flex-col h-full overflow-hidden'>
      <div className='flex mb-4 items-center gap-8'>
        <h1 className={`font-semibold text-xl md:text-2xl`}>
          VisualMotion+
        </h1>
        <InfoDialog />
      </div>
      

      {/* Contenuto principale: griglia a due colonne */}
      <div className='flex flex-1 flex-col md:flex-row overflow-hidden'>

        <PatientCard />
        <VideoElement />
 
        {/*
        <aside className='w-full md:w-1/3 p-6 border-r bg-white'>
          
          <div className='bg-gray-100 rounded-xl p-4 text-center'>
            <div className='w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4'></div>
            <h2 className='text-lg font-semibold'>Giovanni Bianchi</h2>
            <p className='text-sm text-gray-500 mt-1'>Lussazione spalla - 23/02/2025</p>
            <span className='mt-2 inline-block text-green-600 text-sm font-medium'>● Attivo</span>
            <button className='mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm'>Scheda Paziente</button>
          </div>
        </aside>

        
        <section className='w-full md:w-2/3 p-6 flex flex-col items-center justify-center gap-6'>

         
          <div className='w-full aspect-video bg-black rounded-xl shadow-md flex items-center justify-center text-white text-lg'>
            Video ROM
          </div>

          
          <div className='flex flex-col md:flex-row items-center justify-between w-full gap-4'>
            <div className='text-center'>
              <p className='text-gray-500 text-sm'>ROM Attuale</p>
              <p className='text-3xl font-bold text-teal-600'>87°</p>
            </div>

            <div className='flex gap-2'>
              <button className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm'>Start</button>
              <button className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm'>Stop</button>
            </div>

            <button className='px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm'>
              Salva ROM
            </button>
          </div>

        </section>
        */}
        
      </div>
    </main>
  );
}
