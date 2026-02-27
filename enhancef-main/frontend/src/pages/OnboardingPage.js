import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { Zap, Mail, User, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
    const { login } = useUser();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            setError("Please fill in all fields");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await login(name.trim(), email.trim().toLowerCase());
            navigate("/");
        } catch (err) {
            setError("Something went wrong. Please try again.");
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#050505" }}>
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #00F0FF 0%, transparent 70%)", filter: "blur(80px)" }} />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #7000FF 0%, transparent 70%)", filter: "blur(80px)" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
                    style={{ background: "radial-gradient(circle, #00FF94 0%, transparent 70%)", filter: "blur(100px)" }} />
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute rounded-full animate-float"
                        style={{
                            width: `${3 + i * 2}px`, height: `${3 + i * 2}px`,
                            background: i % 2 === 0 ? "#00F0FF" : "#7000FF",
                            opacity: 0.3,
                            left: `${10 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + i}s`,
                        }} />
                ))}
            </div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-md mx-4">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center shadow-lg"
                        style={{ boxShadow: "0 0 30px rgba(0, 240, 255, 0.3)" }}>
                        <Zap className="w-6 h-6 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Outfit" }}>
                        ELEVATE
                    </h1>
                </div>

                <div className="rounded-2xl border border-white/[0.08] p-8"
                    style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(20px)", boxShadow: "0 0 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)" }}>

                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "Outfit" }}>Welcome to Elevate</h2>
                        <p className="text-sm text-zinc-500">Enter your details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                id="onboard-name"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/20 transition-all duration-200"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input
                                id="onboard-email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/20 transition-all duration-200"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-[#FF003C]/10 border border-[#FF003C]/20">
                                <span className="text-xs text-[#FF003C] leading-relaxed">{error}</span>
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-black transition-all duration-300 disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #00F0FF, #7000FF)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.3)" }}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[11px] text-zinc-700 mt-6">
                    AI Placement Readiness Simulator · Built for placement readiness
                </p>
            </div>
        </div>
    );
}
