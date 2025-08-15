'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

const TARGET_DATE =  new Date('2025-09-09T00:00:00');

const calculateTimeRemaining = (targetDate: Date) => {
  const currentTime = new Date();
  const timeDiff = Math.max(Number(targetDate) - Number(currentTime), 0);
  return {
    days: Math.floor(
      timeDiff / (1000 * 60 * 60 * 24)
    ),
    hours: Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor(
      (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
    ), 
    seconds: Math.floor(
      (timeDiff % (1000 * 60)) / 1000
    ), 
  };
};

const DealCountdown = () => {
  const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

  useEffect(() => {
    setTime(calculateTimeRemaining(TARGET_DATE));
    
    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(TARGET_DATE);
      setTime(newTime);

      if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  if (!time) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-20">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Loading Countdown...</h3>  
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 my-20">
      <div className="flex flex-col gap-2 justify-center">
        <h3 className="text-3xl font-bold">Deal Of The Month</h3>  

        <p>
          Professional messages can include marketing texts like a retail offer, spa offer, medical promotion, services offer etc. Another category is sales texts. This could be amongst professionals and could also include providing a quote, apartment leasing offers, auto responses etc
        </p>

        <ul className="grid grid-cols-4">
          <StatBox label="Days" value={Number(time?.days)} />
          <StatBox label="Hours" value={Number(time?.hours)} />
          <StatBox label="Minutes" value={Number(time?.minutes)} />
          <StatBox label="Seconds" value={Number(time?.seconds)} />
        </ul>

        <div className="text-center">
          <Button asChild>
            <Link href={'/search'}>View Products</Link>
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Image
          src={'/images/promo.jpg'}
          alt="promotion"
          width={300}
          height={200}
        />
      </div>
    </section>
  );
};

const StatBox = ({ label, value }: { label: string; value: number; }) => {
  return (
    <li className="p-4 w-full text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p>{label}</p>
    </li>
  );
};
 
export default DealCountdown;