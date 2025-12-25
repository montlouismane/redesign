'use client';

import { LiquidMetal } from '@paper-design/shaders-react';
import Link from 'next/link';

export default function TestShaderPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 font-sans text-white">
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Liquid Metal Preview</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Testing the <code>@paper-design/shaders-react</code> component with your exported parameters.
        </p>
        <Link href="/" className="inline-block px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm">
          Return to Dashboard
        </Link>
      </div>

      <div className="relative group">
        {/* Glow behind */}
        <div className="absolute inset-0 bg-[#D08F2C] blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity" />
        
        <LiquidMetal 
          speed={1} 
          softness={0.24} 
          repetition={2} 
          shiftRed={0} 
          shiftBlue={0} 
          distortion={0.21} 
          contour={0.31} 
          scale={1.16} 
          rotation={0} 
          shape="circle" 
          angle={322} 
          frame={166287.5} 
          colorBack="#00000000" 
          colorTint="#D08F2C" 
          style={{ 
            backgroundColor: '#000000', 
            borderColor: '#000000', 
            borderRadius: 'calc(infinity * 1px)', 
            borderStyle: 'solid', 
            borderWidth: '1px', 
            boxShadow: '#00000033 0px 2px 3px, #00000033 0px 2px 3px inset', 
            height: '600px', 
            opacity: '100%', 
            outline: '1px solid #000000', 
            width: '600px' 
          }} 
        />
      </div>
    </div>
  );
}

