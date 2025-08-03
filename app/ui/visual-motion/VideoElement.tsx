
'use client';

import dynamic from 'next/dynamic';

// Lazy load del componente PoseDetect
const PoseDetect = dynamic(() => import('@/app/ui/visual-motion/poseDetec'), {
  ssr: false,
  loading: () => <p className="text-center p-4">Caricamento componente...</p>,
});

export default function VideoElement() {
  return (
    <div className="h-full w-full bg-brand-100 rounded-md">
      <PoseDetect />
    </div>
  );
}

