import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { ArrowLeft, Lock, Mail, User, ShieldCheck, Loader2 } from "lucide-react";

export default function AuthPage({ type }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const isEmployer = type === "employer";
  const role = isEmployer ? "employer" : "worker";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password);
        navigate(isEmployer ? "/employer/dashboard" : "/worker/feed", { replace: true });
      } else {
        // Sign up logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile display name
        await updateProfile(user, { displayName: fullName });

        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: fullName,
          email: email,
          userRole: role,
          createdAt: new Date().toISOString(),
          bio: `I am a ${role} on JobLink.`,
          photoURL: null
        });

        // Store role in localStorage for immediate sync (compatibility with existing logic)
        localStorage.setItem(`userRole_${user.uid}`, role);

        navigate(isEmployer ? "/employer/dashboard" : "/worker/feed", { replace: true });
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] pointer-events-none ${isEmployer ? 'bg-emerald-600' : 'bg-blue-600'}`} />

      <button 
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center gap-2 transition-colors z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </button>

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[32px] shadow-2xl z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${isEmployer ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isEmployer ? "Employer Portal" : "Worker Portal"}
          </h2>
          <p className="text-slate-400">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="email" 
              placeholder="Email address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          <div className="relative">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-all shadow-lg ${
              isEmployer 
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className={`ml-2 font-bold hover:underline ${isEmployer ? 'text-emerald-400' : 'text-blue-400'}`}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
