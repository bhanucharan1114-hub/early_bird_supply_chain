import React, { useRef, useEffect } from "react";
import GlobeGl from "react-globe.gl";

export default function Globe({ className = "" }) {
  const globeRef = useRef();

  useEffect(() => {
    // Ensure the globe rotates automatically
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.5;
      controls.enableZoom = false; // Prevent zooming out of the container
    }
  }, []);

  const markers = [
    { lat: 28.6139, lng: 77.209, size: 1.5, color: "#f472b6" },   // India (Pastel Pink)
    { lat: 37.7749, lng: -122.4194, size: 1.5, color: "#818cf8" }, // San Francisco (Pastel Indigo)
    { lat: 40.7128, lng: -74.006, size: 1.5, color: "#fbbf24" },    // New York (Pastel Amber)
    { lat: 51.5074, lng: -0.1278, size: 1.5, color: "#34d399" },    // London (Pastel Emerald)
    { lat: 35.6895, lng: 139.6917, size: 1.5, color: "#f87171" },   // Tokyo (Pastel Red)
    { lat: -33.8688, lng: 151.2093, size: 1.5, color: "#60a5fa" },   // Sydney (Pastel Blue)
    { lat: 1.3521, lng: 103.8198, size: 1.5, color: "#a78bfa" },     // Singapore (Pastel Purple)
  ];

  return (
    <div className={`flex items-center justify-center w-full h-full relative ${className}`}>
      {/* 
        Using react-globe.gl with a beautiful high-res topology map.
        This library uses Three.js natively and handles resizing and WebGL contexts flawlessly.
      */}
      <GlobeGl
        ref={globeRef}
        width={500}
        height={500}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)" // Transparent background
        pointsData={markers}
        pointAltitude={0.02}
        pointColor="color"
        pointRadius="size"
        pointsMerge={true}
        showAtmosphere={true}
        atmosphereColor="#818cf8"
        atmosphereAltitude={0.15}
      />
    </div>
  );
}