import React, { useEffect, useRef } from 'react';
import SlideTitle from './SlideTitle';
import { Layers, Code2, Database, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ArchitectureSlideProps {
    title: string;
    subtitle?: string;
    description?: string[];
    architecture: {
        layers: {
            name: string;
            description: string;
            technologies: string[];
        }[];
    };
}

const ArchitectureSlide: React.FC<ArchitectureSlideProps> = ({ title, subtitle, description, architecture }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const layers = layersRef.current?.querySelectorAll('.layer-item');
        if (!layers) return;

        gsap.fromTo(layers,
            { y: 60, opacity: 0, scale: 0.95 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 60%",
                }
            }
        );

        // Animate icons
        layers.forEach((layer, i) => {
            const icon = layer.querySelector('.layer-icon');
            if (icon) {
                gsap.fromTo(icon,
                    { rotation: -180, scale: 0 },
                    {
                        rotation: 0,
                        scale: 1,
                        duration: 0.6,
                        delay: i * 0.15 + 0.3,
                        ease: "back.out(1.7)",
                        scrollTrigger: {
                            trigger: el,
                            scroller: "#presentation-container",
                            start: "top 60%",
                        }
                    }
                );
            }
        });
    }, []);

    const getIcon = (index: number) => {
        const icons = [Code2, Database, Shield, Layers];
        return icons[index % icons.length];
    };

    return (
        <div ref={containerRef} className="w-full max-w-6xl py-4">
            <div className="text-center mb-6">
                {subtitle && (
                    <p className="text-accent tracking-widest uppercase font-bold text-xs mb-2">{subtitle}</p>
                )}
                <SlideTitle className="!text-3xl md:!text-4xl">{title}</SlideTitle>
                {description?.map((para, i) => (
                    <p key={i} className="text-slate-500 text-sm mt-2 max-w-3xl mx-auto">{para}</p>
                ))}
            </div>

            <div ref={layersRef} className="space-y-3">
                {architecture.layers.map((layer, index) => {
                    const Icon = getIcon(index);
                    return (
                        <div
                            key={index}
                            className="layer-item opacity-0 p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="layer-icon flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">{layer.name}</h3>
                                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-2">{layer.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {layer.technologies.map((tech, techIndex) => (
                                            <span
                                                key={techIndex}
                                                className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 group-hover:bg-blue-100 transition-colors"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ArchitectureSlide;

