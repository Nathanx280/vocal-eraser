import { Waves, Zap, Download, Music } from 'lucide-react';
import { VocalRemover } from '@/components/VocalRemover';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
            <Waves className="w-4 h-4 text-primary animate-pulse" />
            <span>AI-Powered Audio Separation</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-foreground">Vocal</span>
            <span className="text-primary text-glow">Remover</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Instantly separate vocals from any song. Extract instrumentals or isolate vocals 
            for karaoke, remixes, and more.
          </p>
        </header>

        {/* Main Tool */}
        <main className="mb-20">
          <VocalRemover />
        </main>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-6 text-center space-y-4 group hover:border-primary/30 transition-all duration-300">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Fast Processing</h3>
            <p className="text-sm text-muted-foreground">
              Process audio files directly in your browser with no upload needed.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 text-center space-y-4 group hover:border-accent/30 transition-all duration-300">
            <div className="inline-flex p-4 rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-300">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Dual Output</h3>
            <p className="text-sm text-muted-foreground">
              Get both the instrumental track and isolated vocals separately.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 text-center space-y-4 group hover:border-primary/30 transition-all duration-300">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Easy Download</h3>
            <p className="text-sm text-muted-foreground">
              Download your separated tracks as high-quality WAV files.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-muted-foreground">
          <p>Works best with stereo audio files where vocals are center-panned.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
