import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Pickaxe, ArrowRight, Sparkles, SwitchCamera } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    // Determine where they go
    const authRoute = role === 'employer' ? '/auth/employer' : '/auth/worker';
    navigate(authRoute);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 flex items-center justify-center p-6">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/30 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm mb-8 backdrop-blur-sm animate-fade-in">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>The New Standard in Local Work</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-6 text-center tracking-tight">
          JobLink
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl text-center mb-16 leading-relaxed">
          Connecting local talent with neighborhood opportunities. Whether you're looking to hire help or offering your skills, JobLink makes it seamless and secure.
        </p>

        <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
          {/* Worker Path */}
          <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-700 to-slate-800 hover:from-blue-500 hover:to-blue-600 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-[23px] p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
                <Pickaxe className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">I want to work</h2>
              <p className="text-slate-400 mb-8 flex-grow text-sm">
                Find flexible, local gigs that match your skills.
              </p>
              <button
                onClick={() => handleRoleSelection('worker')}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-300 cursor-pointer"
              >
                Find Work <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Both Path */}
          <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-700 to-slate-800 hover:from-purple-500 hover:to-purple-600 transition-all duration-500 overflow-hidden transform md:-translate-y-4">
            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-800/90 backdrop-blur-xl rounded-[23px] p-6 flex flex-col items-center text-center border border-purple-500/20">
              <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded-full">
                Popular
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300">
                <SwitchCamera className="w-8 h-8 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">I want to do both</h2>
              <p className="text-slate-400 mb-8 flex-grow text-sm">
                Easily switch between hiring others and finding work for yourself.
              </p>
              <button
                onClick={() => handleRoleSelection('both')}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-300 cursor-pointer"
              >
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Employer Path */}
          <div className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-slate-700 to-slate-800 hover:from-emerald-500 hover:to-emerald-600 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative h-full bg-slate-900/90 backdrop-blur-xl rounded-[23px] p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                <Briefcase className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">I want to hire</h2>
              <p className="text-slate-400 mb-8 flex-grow text-sm">
                Post short-term jobs and connect with reliable workers.
              </p>
              <button
                onClick={() => handleRoleSelection('employer')}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-300 cursor-pointer"
              >
                Post a Job <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
