import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  formula?: string;
  title?: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  formula,
  title,
  children,
  position = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    isFlipped: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 270;

    // Calcula posição horizontal centralizada e segura dentro da tela
    let left = rect.left + rect.width / 2;
    if (left - tooltipWidth / 2 < 12) {
      left = 12 + tooltipWidth / 2;
    } else if (left + tooltipWidth / 2 > window.innerWidth - 12) {
      left = window.innerWidth - 12 - tooltipWidth / 2;
    }

    // Se estiver muito perto do topo da janela (menos de 180px), inverte para baixo
    const shouldFlipToBottom = position === 'top' && rect.top < 180;
    const isFlipped = shouldFlipToBottom;

    let top: number;
    if (position === 'bottom' || isFlipped) {
      // Posiciona abaixo do elemento
      top = rect.bottom + 8;
    } else {
      // Posiciona acima do elemento
      top = rect.top - 8;
    }

    setCoords({ top, left, isFlipped });
  }, [position]);

  const handleMouseEnter = () => {
    calculatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    calculatePosition();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, calculatePosition]);

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-flex items-center gap-1 group cursor-help select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
        <span
          tabIndex={0}
          aria-label="Mais informações"
          className="text-slate-400 group-hover:text-amber-400 transition-colors p-0.5 rounded focus:outline-none"
        >
          <HelpCircle className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:text-amber-400" />
        </span>
      </div>

      {/* Renderiza via Portal no document.body para NUNCA ficar por baixo de overflow ou tabela */}
      {isOpen &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform:
                position === 'bottom' || coords.isFlipped
                  ? 'translate(-50%, 0)'
                  : 'translate(-50%, -100%)',
              zIndex: 999999,
              pointerEvents: 'none',
            }}
            className="w-[270px] p-3.5 rounded-xl bg-slate-950/98 text-slate-200 text-xs shadow-2xl shadow-black/80 border border-slate-700 backdrop-blur-md transition-opacity duration-150 animate-in fade-in"
          >
            {/* Seta indicativa */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-950 border-slate-700 transform rotate-45 ${
                position === 'bottom' || coords.isFlipped
                  ? 'top-[-5px] border-l border-t'
                  : 'bottom-[-5px] border-r border-b'
              }`}
            />

            {title && (
              <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5 text-[11px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{title}</span>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-slate-300 font-normal">
              {content}
            </p>

            {formula && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/90">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Cálculo:
                </span>
                <code className="text-[10px] font-mono text-cyan-300 bg-slate-900/95 px-2 py-1 rounded border border-slate-800 block shadow-inner">
                  {formula}
                </code>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
