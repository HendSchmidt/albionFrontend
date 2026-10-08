import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  formula?: string;
  title?: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
  position?: 'top' | 'bottom';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  formula,
  title,
  children,
  iconOnly = false,
  position = 'top',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center gap-1 group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <span
        tabIndex={0}
        aria-label="Mais informações"
        className="cursor-help text-slate-400 hover:text-amber-400 transition-colors p-0.5 rounded focus:outline-none"
      >
        <HelpCircle className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:text-amber-400" />
      </span>

      {/* Tooltip Popover */}
      <div
        className={`absolute z-50 pointer-events-none transition-all duration-200 transform ${
          isOpen
            ? 'opacity-100 scale-100 visible'
            : 'opacity-0 scale-95 invisible'
        } ${
          position === 'top'
            ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
            : 'top-full left-1/2 -translate-x-1/2 mt-2'
        } w-64 p-3 rounded-xl bg-slate-950/95 text-slate-200 text-xs shadow-2xl border border-slate-700 backdrop-blur-md`}
      >
        {/* Little Arrow */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-slate-700 transform rotate-45 ${
            position === 'top'
              ? 'bottom-[-5px] border-r border-b'
              : 'top-[-5px] border-l border-t'
          }`}
        />

        {title && (
          <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
            <Info className="w-3 h-3" />
            {title}
          </div>
        )}

        <p className="text-[11px] leading-relaxed text-slate-300 font-normal">
          {content}
        </p>

        {formula && (
          <div className="mt-2 pt-1.5 border-t border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
              Cálculo:
            </span>
            <code className="text-[10px] font-mono text-cyan-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800 block">
              {formula}
            </code>
          </div>
        )}
      </div>
    </div>
  );
};
