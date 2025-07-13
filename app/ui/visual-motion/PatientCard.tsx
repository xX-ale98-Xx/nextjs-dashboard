import { fetchPatients } from '@/app/lib/data';
import PatientCardClient from '@/app/ui/visual-motion/PatientCardClient';

export default async function PatientCard() {
  const patients = await fetchPatients();

  return (
    <div className="md:w-1/4 flex-none">
      <PatientCardClient patients={patients} />
    </div>
  );
}