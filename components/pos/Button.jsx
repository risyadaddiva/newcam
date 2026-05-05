"use client";

const variants = {
  primary: "bg-gold hover:bg-gold-light text-espresso font-bold",
  secondary: "bg-espresso-mid hover:bg-espresso-light text-cream border border-gold/20",
  danger: "bg-red-900 hover:bg-red-800 text-red-100",
  ghost: "bg-transparent hover:bg-espresso-mid text-cream/60",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`rounded-lg font-body transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
