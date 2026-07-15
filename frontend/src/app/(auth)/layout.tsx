"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#ffffff_0%,#fcfcf8_100%)]">
      <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[45%] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>

      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-[#14140f] object-cover">
          <div className="flex h-full flex-col justify-center items-center p-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex max-w-md flex-col items-center"
            >
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[28px] bg-primary">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                Supercharge Your Marketing
              </h2>
              <p className="mt-4 text-lg leading-7 text-[#d2d2c8]">
                Join the world’s most advanced AI platform designed specifically for modern marketing teams.
              </p>
              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/10 px-6 py-4 text-left text-sm text-white/80 backdrop-blur">
                <p className="font-medium text-white">Editorial workflow • Smart automation • Premium reporting</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
