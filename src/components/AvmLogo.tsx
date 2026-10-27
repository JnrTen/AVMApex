import React from 'react';

export const AvmLogo: React.FC<{ className?: string }> = ({ className = 'h-9' }) => {
  return (
    <div className={`inline-flex items-center justify-center bg-white px-2.5 py-1 rounded-md border-2 border-[#003882] shadow-xs shrink-0 select-none ${className}`}>
      <svg viewBox="0 0 160 52" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Blue background / outline container */}
        <path d="M4 4H156V48H4V4Z" fill="white" />
        
        {/* 'A' */}
        <path d="M12 36L26 8H34L48 36H39L36 29H24L21 36H12ZM27 22H33L30 14.5L27 22Z" fill="#003882" />
        
        {/* Red diagonal dynamic speed slash across AVM */}
        <path d="M22 6L54 6L40 40H8L22 6Z" fill="#E11D48" fillOpacity="0.18" />
        
        {/* 'V' with red accent */}
        <path d="M47 8H57L68 31L79 8H89L74 36H62L47 8Z" fill="#003882" />
        <path d="M58 8L68 28L78 8H71L68 15L65 8H58Z" fill="#E11D48" />

        {/* 'M' */}
        <path d="M89 8H101L111 25L121 8H133V36H124V18L114 34H108L98 18V36H89V8Z" fill="#003882" />
        
        {/* Subtext 'AVM AFRICA (PVT) LTD' */}
        <text
          x="80"
          y="46"
          textAnchor="middle"
          fill="#003882"
          fontSize="9"
          fontWeight="800"
          letterSpacing="0.8"
          fontFamily="'Times New Roman', serif"
        >
          AVM AFRICA (PVT) LTD
        </text>
      </svg>
    </div>
  );
};
