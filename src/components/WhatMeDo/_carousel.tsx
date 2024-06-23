"use client";

import { $cn } from "@/utils";
import { Button } from "@nextui-org/react";
import {
  DashboardSpeed02Icon,
  FigmaIcon,
  MobileProgramming01Icon,
} from "hugeicons-react";
import { useRef, useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { SwiperSlide as Slide, Swiper } from "swiper/react";
import { ArrowNext } from "../shared";
import { WhatMeDoProps } from "./@types";
import CarouselCard from "./__card";

const _data = [
  {
    id: 0,
    icon: MobileProgramming01Icon,
    title: "Responsive Web Design",
    desc: "Craft pixel-perfect, mobile-friendly web applications using React, Vue.js, and Tailwind CSS.",
  },
  {
    id: 1,
    icon: FigmaIcon,
    title: "Figma to Code",
    desc: "Transform design prototypes into functional, high-quality front-end code with precision.",
  },
  {
    id: 2,
    icon: DashboardSpeed02Icon,
    title: "Performance Optimization",
    desc: "Enhance web performance and user experience through efficient coding practices and modern frameworks.",
  },
];

const WhatMeDoCarousel: React.FC<WhatMeDoProps> = ({ className }) => {
  const classes = $cn("flex gap-x-9 items-center", className);
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const updateIndex = (swiperInstance: SwiperType) => {
    if (swiperInstance) {
      setCurrentIndex(swiperInstance.realIndex);
    }
  };

  function handleNext() {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  }

  return (
    <div className={classes}>
      <Swiper
        slidesPerView={2}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          updateIndex(swiper);
        }}
        loop
        onSlideChange={(swiper) => updateIndex(swiper)}
      >
        {_data.map(({ id, icon, title, desc }) => (
          <Slide key={id}>
            <CarouselCard icon={icon} title={title} desc={desc} />
          </Slide>
        ))}
      </Swiper>

      <Button isIconOnly variant="light" onClick={handleNext}>
        <ArrowNext />
      </Button>
    </div>
  );
};

export default WhatMeDoCarousel;
