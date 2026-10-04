export default function InteractiveLabel({ children, className = "" }) {
  return (
    <span className={`interactive-label ${className}`.trim()}>
      <span>{children}</span>
      <span className="interactive-label-gradient" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
