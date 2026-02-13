interface CarDisplayProps {
  carImage: string;
  carName: string;
}

export function CarDisplay({ carImage, carName }: CarDisplayProps) {
  return (
    <div className="fixed bottom-8 right-8 z-10">
      <div className="relative group">
        <div className="bg-white rounded-xl shadow-lg p-3 hover:shadow-2xl transition-all transform hover:scale-105">
          <img
            src={carImage}
            alt={carName}
            className="w-32 h-20 object-cover rounded-lg"
          />
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
            {carName}
          </div>
        </div>
      </div>
    </div>
  );
}
