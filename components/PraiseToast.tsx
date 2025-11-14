import React, { useEffect, useState } from 'react';

interface PraiseToastProps {
    message: string;
    onClose: () => void;
}

export const PraiseToast: React.FC<PraiseToastProps> = ({ message, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            const exitTimer = setTimeout(onClose, 300); // Allow time for exit animation
            return () => clearTimeout(exitTimer);
        }, 2500);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div 
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
        >
            <span role="img" aria-label="sparkles" className="mr-2">✨</span> 
            {message} 
        </div>
    );
};