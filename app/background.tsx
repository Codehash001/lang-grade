"use client"
import Image from "next/image";
import React from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import * as reactSpring from '@react-spring/three'
import Hero from "@/components/hero";

export default function Background() {
  return (
    <ShaderGradientCanvas
      style={{
        position: 'absolute',
        top: 0,
        zIndex: -100
      }}
    >
      <ShaderGradient
        control='query'
        urlString='https://www.shadergradient.co/customize?animate=on&axesHelper=on&bgColor1=%23000000&bgColor2=%23000000&brightness=1.3&cAzimuthAngle=180&cDistance=0.7&cPolarAngle=95&cameraZoom=1&color1=%23ffff96&color2=%23ecbe43&color3=%23e4f1f6&destination=onCanvas&embedMode=off&envPreset=lobby&format=gif&fov=20&frameRate=10&grain=off&lightType=3d&pixelDensity=1&positionX=0&positionY=-2.1&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=20&rotationY=-180&rotationZ=225&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.8&uFrequency=5.5&uSpeed=0.1&uStrength=3&uTime=0&wireframe=false'
      />
    </ShaderGradientCanvas>
  );
}
