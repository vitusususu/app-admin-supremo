
const Spinner = ({ size = 'h-12 w-12' }: { size?: string }) => (
  <div className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-indigo-500`}></div>
);

export default Spinner;
