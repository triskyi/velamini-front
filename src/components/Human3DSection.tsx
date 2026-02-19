"use client";
import dynamic from 'next/dynamic';

const HumanViewer = dynamic(() => import("@/components/HumanViewer"), { ssr: false });

export default function Human3DSection() {
  return (
    <div className="flex items-center justify-center w-[420px] h-[520px]">
      <HumanViewer />
    </div>
  );
}
