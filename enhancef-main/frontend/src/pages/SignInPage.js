import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Zap } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "#050505" }}>
            {/* Animated background effects */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top-left cyan glow */}
                <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #00F0FF 0%, transparent 70%)", filter: "blur(80px)" }} />
                {/* Bottom-right purple glow */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #7000FF 0%, transparent 70%)", filter: "blur(80px)" }} />
                {/* Center subtle green glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
                    style={{ background: "radial-gradient(circle, #00FF94 0%, transparent 70%)", filter: "blur(100px)" }} />
                {/* Grid overlay */}
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

            {/* Sign In Card Area */}
            <div className="relative z-10 w-full max-w-md mx-4 animate-slide-up flex flex-col items-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center shadow-lg"
                        style={{ boxShadow: "0 0 30px rgba(0, 240, 255, 0.3)" }}>
                        <Zap className="w-6 h-6 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "Outfit" }}>
                        ELEVATE
                    </h1>
                </div>

                <div className="w-full relative shadow-2xl" style={{ boxShadow: "0 0 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)" }}>
                    <SignIn
                        routing="path"
                        path="/sign-in"
                        signUpUrl="/sign-up"
                        forceRedirectUrl="/"
                        appearance={{
                            baseTheme: dark,
                            variables: {
                                colorPrimary: "#00F0FF",
                                colorBackground: "rgba(10, 10, 10, 0.95)", // Slightly more opaque for readability
                                colorText: "#ffffff",
                                colorInputBackground: "rgba(255, 255, 255, 0.03)",
                                colorInputText: "#ffffff",
                                colorDanger: "#FF003C",
                                colorSuccess: "#00FF94",
                                fontFamily: "Manrope, sans-serif",
                                borderRadius: "1rem"
                            },
                            elements: {
                                card: "bg-transparent border border-white/10 shadow-none",
                                formButtonPrimary: "font-semibold text-black bg-gradient-to-r from-[#00F0FF] to-[#7000FF] hover:opacity-90 transition-all",
                                footerActionLink: "text-[#00F0FF] hover:text-[#00F0FF] hover:opacity-80",
                                cardBox: "shadow-none",
                                headerTitle: "font-bold text-xl",
                                socialButtonsBlockButton: "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white",
                                dividerText: "text-zinc-500",
                                dividerLine: "bg-white/10",
                                formFieldInput: "focus:ring-1 focus:ring-[#00F0FF]/50 border-white/10"
                            }
                        }}
                    />
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-zinc-700 mt-6">
                    Secured by <span className="text-zinc-500 font-medium">Clerk</span> · Built for placement readiness
                </p>
            </div>
        </div>
    );
}
