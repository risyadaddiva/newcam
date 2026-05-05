"use client";

export default function Input({ label, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-body font-bold uppercase tracking-widest text-cream/70">
          {label}
        </label>
      )}
      <input className={`input-coffee ${className}`} {...props} />
    </div>
  );
}
