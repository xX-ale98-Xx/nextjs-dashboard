
import PoseDetect from '@/app/ui/visual-motion/poseDetec';

export default async function VideoElement(){

  return(
    <div className='h-full w-full bg-green-100 rounded-md'>
      <PoseDetect />
    </div>
  )
}