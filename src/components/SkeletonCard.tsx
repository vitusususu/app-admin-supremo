
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <div className="animate-pulse flex flex-col items-center justify-center">
      <div className="rounded-full bg-gray-300 h-12 w-12 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    </div>
  </div>
);

export default SkeletonCard;
