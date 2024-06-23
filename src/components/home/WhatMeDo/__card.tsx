import { CarouselCardProps } from "./@types";

const CarouselCard: React.FC<CarouselCardProps> = ({
  icon: Icon,
  title,
  desc,
}) => {
  return (
    <div className="w-64 h-56 bg-zinc-700 rounded-xl p-5">
      <div className="grid place-content-center">
        <Icon size={40} />
      </div>

      <div>
        <h6 className="h6 text-center line-clamp-1">{title}</h6>
        <p className="text-sm leading-snug">{desc}</p>
      </div>
    </div>
  );
};

export default CarouselCard;
