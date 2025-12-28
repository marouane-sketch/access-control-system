import React, { useEffect, useRef } from 'react';
import Slide from './Slide';
import SlideTitle from './SlideTitle';
import { CheckCircle2, XCircle, Minus } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ComparisonSlideProps {
    id: string;
    title: string;
    subtitle?: string;
    comparison?: {
        title: string;
        items: {
            feature: string;
            biosec: string | boolean;
            traditional: string | boolean;
        }[];
    };
    onEnter?: () => void;
}

const ComparisonSlide: React.FC<ComparisonSlideProps> = ({ id, title, subtitle, comparison, onEnter }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const rows = tableRef.current?.querySelectorAll('tr');
        if (!rows) return;

        gsap.fromTo(rows,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el,
                    scroller: "#presentation-container",
                    start: "top 60%",
                }
            }
        );
    }, []);

    const renderValue = (value: string | boolean) => {
        if (typeof value === 'boolean') {
            return value ? (
                <CheckCircle2 className="text-green-600 mx-auto" size={24} />
            ) : (
                <XCircle className="text-red-500 mx-auto" size={24} />
            );
        }
        return <span className="text-sm md:text-base font-medium text-slate-700">{value}</span>;
    };

    return (
        <Slide id={id} className="" onEnter={onEnter}>
            <div ref={containerRef} className="max-w-6xl w-full py-4">
                <div className="text-center mb-8">
                    {subtitle && (
                        <p className="text-xs md:text-sm font-bold tracking-widest text-slate-600 uppercase mb-2">{subtitle}</p>
                    )}
                    <SlideTitle className="!text-3xl md:!text-4xl">{title}</SlideTitle>
                    {comparison?.title && (
                        <p className="text-base md:text-lg text-slate-600 mt-4">{comparison.title}</p>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table ref={tableRef} className="w-full bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg">
                        <thead>
                            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-slate-200">
                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wider">Fonctionnalité</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-green-700 uppercase tracking-wider">BIOSEC</th>
                                <th className="px-6 py-4 text-center text-sm font-bold text-red-600 uppercase tracking-wider">Systèmes Traditionnels</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {comparison?.items.map((item, index) => (
                                <tr key={index} className="hover:bg-blue-50/50 transition-colors opacity-0">
                                    <td className="px-6 py-4 text-sm md:text-base font-medium text-slate-900">{item.feature}</td>
                                    <td className="px-6 py-4 text-center">{renderValue(item.biosec)}</td>
                                    <td className="px-6 py-4 text-center">{renderValue(item.traditional)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Slide>
    );
};

export default ComparisonSlide;

