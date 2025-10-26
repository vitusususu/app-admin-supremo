
const Logo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 000-18h.01M12 3a9 9 0 010 18H5.99M12 3a9 9 0 000 18h.01M12 21a9 9 0 010-18H5.99"></path>
    </svg>
    <h1 className="ml-3 text-2xl font-bold text-gray-800">Admin Supremo</h1>
  </div>
);

export default Logo;
