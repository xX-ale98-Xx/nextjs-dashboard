import { Metadata } from 'next';
import InfoDialog from '@/app/ui/visual-motion/popup';


 
export const metadata: Metadata = {
  title: 'Calendar',
};

export default function Page() {
  return (
    <div>
    <p>Calendar page!</p>
      <InfoDialog />
  </div>
  )
}