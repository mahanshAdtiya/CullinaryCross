"use client"
import React from 'react';
import CrosswordGrid from '@/components/CrosswordGrid'; 

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-24">
      <div>
        <CrosswordGrid />
      </div>
    </main>
  );
}