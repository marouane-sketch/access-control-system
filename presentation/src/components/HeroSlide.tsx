import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShieldCheck } from 'lucide-react';

const HeroSlide: React.FC = () => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const iconRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        // Left section entry
        tl.fromTo(leftRef.current?.children || [],
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.2, stagger: 0.15 },
            0
        );

        // Right section entry
        tl.fromTo(rightRef.current?.children || [],
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.2, stagger: 0.15 },
            0.2
        );

        // Subtle icon float with rotation
        gsap.to(iconRef.current, {
            y: 15,
            rotation: 5,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });

        // Pulse glow effect
        const glowEl = iconRef.current?.querySelector('.absolute');
        if (glowEl) {
            gsap.to(glowEl, {
                scale: 1.2,
                opacity: 0.6,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }

    }, []);

    return (
        <div className="overflow-hidden relative font-sans w-full h-full flex flex-col justify-center items-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[150px] rounded-full opacity-40"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/10 blur-[150px] rounded-full opacity-40"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-4 md:px-8 gap-8 md:gap-12">

                {/* LEFT SECTION: Names & Class */}
                <div ref={leftRef} className="flex-1 space-y-6 text-left order-2 md:order-1">
                    <div className="space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-600/5 border border-blue-600/10 text-blue-600 font-bold tracking-[0.2em] text-[9px] uppercase backdrop-blur-md">
                            Projet de Sécurité Physique
                        </span>
                        <h2 className="text-xl md:text-2xl font-light text-slate-400 leading-tight">
                            Faculté des Sciences <br /> <span className="text-slate-900 font-medium">Moulay Ismaïl Meknès</span>
                        </h2>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <p className="text-blue-600/60 text-sm md:text-base uppercase tracking-[0.4em] font-bold mb-4">Réalisé par</p>
                            <div className="space-y-4">
                                <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">MAROUANE BOUKAR</p>
                                <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none italic">MOHAMED-TAHA <br className="hidden md:block" /> TAHIRI-EL ALAOUI</p>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-200 w-2/3">
                            <p className="text-blue-600/60 text-sm md:text-base uppercase tracking-[0.4em] font-bold mb-4">Encadré par</p>
                            <p className="text-2xl md:text-4xl font-bold text-blue-600 italic">
                                Mme Soukayna RIFFI BOUALAM
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION: Brand & Icon */}
                <div ref={rightRef} className="flex-1 flex flex-col items-center justify-center text-center order-1 md:order-2">
                    <div ref={iconRef} className="mb-6 relative">
                        <div className="absolute inset-0 bg-blue-400/20 blur-[60px] rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-indigo-400/30 to-purple-400/30 blur-[80px] rounded-full opacity-50"></div>
                        <div className="relative p-6 md:p-8 rounded-2xl bg-white/95 border-2 border-slate-200 shadow-2xl backdrop-blur-2xl hover:border-blue-500/50 transition-all duration-300">
                            <ShieldCheck size={64} className="md:w-20 md:h-20 text-blue-600 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 ref={titleRef} className="text-6xl md:text-7xl font-black tracking-tighter leading-none select-none italic">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-blue-700 to-indigo-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                                BIOSEC
                            </span>
                        </h1>
                        <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full mb-3"></div>
                        <p className="text-sm md:text-base font-medium tracking-[0.4em] text-blue-600 uppercase opacity-80">
                            Système Biométrique
                        </p>
                    </div>
                </div>

            </div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
    );
};

export default HeroSlide;
