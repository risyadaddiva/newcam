export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-espresso-light border border-gold/10 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}
