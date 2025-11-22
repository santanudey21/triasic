import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className={`relative group ${className}`}>
      <input
        className="block w-full px-4 py-3 text-md-sys-onSurface bg-md-sys-surfaceVariant/30 rounded-t-lg border-b-2 border-md-sys-outline focus:border-md-sys-primary focus:bg-md-sys-surfaceVariant/50 focus:outline-none placeholder-transparent peer transition-colors"
        placeholder={label}
        {...props}
      />
      <label
        className="absolute left-4 top-3 text-md-sys-onSurfaceVariant text-xs transition-all 
        peer-placeholder-shown:text-base peer-placeholder-shown:text-md-sys-onSurfaceVariant peer-placeholder-shown:top-3.5 
        peer-focus:-top-1.5 peer-focus:text-xs peer-focus:text-md-sys-primary cursor-text"
      >
        {label}
      </label>
    </div>
  );
};