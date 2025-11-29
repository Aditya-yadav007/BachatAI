const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 ${className}`}>
      {children}
    </div>
  );
};
export default Card;
