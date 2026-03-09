import SequencePlayer from '@/components/SequencePlayer';

export default function Home() {
  return (
    <main className="min-h-screen relative bg-zinc-950">
      {/* 
        This empty div creates some scroll space BEFORE the animation. 
        Optional: comment out if you want animation to start immediately.
      */}
      {/* <div className="h-screen flex items-center justify-center text-white">
          <h1 className="text-4xl">Scroll down to start drone flight</h1>
      </div> */}
      
      <SequencePlayer />
      
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-white flex-col">
        <h1 className="text-5xl font-bold mb-4">Llegada a Destino</h1>
        <p className="text-xl text-gray-400">El recorrido ha finalizado.</p>
      </div>
    </main>
  );
}
