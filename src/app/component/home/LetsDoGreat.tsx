"use client";
import Image from 'next/image'
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const LetsDoGreat = () => {
  const [count, setCount] = useState(0);
  const target = 100704;
  const duration = 2.5; // seconds

  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60); // assume 60fps
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
      setCount(Math.floor(start));
    }, 1000 / 60);
  }, []);

  return (
    <section className="flex flex-col md:flex-row items-center justify-between rounded-2xl overflow-hidden bg-[#002E22] text-white p-6 md:p-12 my-10 shadow-xl">
      {/* Left Side */}
      <div className="w-full md:w-2/3 space-y-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-lime-400"
        >
          Let&apos;s Do Great!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-sm md:text-base text-gray-200"
        >
          Join CRYPTAURA INVESTSPHERE COMPANY Investment Platform today and take the first step towards a prosperous financial future.
        </motion.p>
      </div>

      {/* Right Side */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-full md:w-1/3 bg-lime-400 text-black p-6 rounded-2xl mt-6 md:mt-0 flex flex-col items-center justify-center text-center space-y-4"
      >
        {/* Dummy avatars (can replace with real ones later) */}
        

<div className="flex justify-center -space-x-2">
  <Image
    src="/client-img-1-1.png"
    alt="avatar 1"
    width={40}
    height={40}
    className="rounded-full border-2 border-white"
  />
  <Image
    src="/client-img-1-2.png"
    alt="avatar 2"
    width={40}
    height={40}
    className="rounded-full border-2 border-white"
  />
  <Image
    src="/client-img-1-3.png"
    alt="avatar 3"
    width={40}
    height={40}
    className="rounded-full border-2 border-white"
  />
</div>


        {/* Count Number */}
        <div className="text-3xl font-bold">
          {count.toLocaleString()}+
        </div>
        <p className="text-sm text-gray-700">Worldwide clients</p>

        {/* Button */}
        <button className="bg-black text-white px-6 py-2 rounded-full hover:scale-105 transition">
          Get Started
        </button>
      </motion.div>
    </section>
  );
};

export default LetsDoGreat;