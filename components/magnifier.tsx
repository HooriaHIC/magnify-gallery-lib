import { useState } from "react";
import Image from "next/image";

export default function ImageMagnifier({
  src,
  width,
  height,
  onload,
  show,
  magnifierHeight = 180,
  magnifieWidth = 180,
  zoomLevel = 2
}: {
  src: string;
  width?: any;
  height?: any;
  onload: any;
  show: boolean;
  magnifierHeight?: number;
  magnifieWidth?: number;
  zoomLevel?: number;
}) {
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        height: height,
        width: width
      }}
    >
        <Image
            src={src}
            width={width}
            height={height}
            priority
            alt="Next.js Conf image"
            onLoadingComplete={onload}
            style={{
                marginLeft: "auto",
                marginRight: "auto",
            }}
            onMouseEnter={(e) => {
                const elem = e.currentTarget;
                const { width, height } = elem.getBoundingClientRect();
                    setSize([width, height]);
                    setShowMagnifier(true);
                }}
            onMouseMove={(e) => {
                const elem = e.currentTarget;
                const { top, left } = elem.getBoundingClientRect();
          
                const x = e.pageX - left - window.pageXOffset;
                const y = e.pageY - top - window.pageYOffset;
                setXY([x, y]);
            }}
            onMouseLeave={() => {
                setShowMagnifier(false);
            }}
        />
      <div
        style={{
          display: showMagnifier ? "" : "none",
          visibility: show ? "visible" : "hidden",
          position: "absolute",
          pointerEvents: "none",
          height: `${magnifierHeight}px`,
          width: `${magnifieWidth}px`,
          top: `${y - magnifierHeight / 2}px`,
          left: `${x - magnifieWidth / 2}px`,
          opacity: "1",
          border: "4px solid #eee",
          borderRadius: "50%",
          backgroundColor: "transparent",
          backgroundImage: `url('${src}')`,
          backgroundRepeat: "no-repeat",

          backgroundSize: `${imgWidth * zoomLevel}px ${
            imgHeight * zoomLevel
          }px`,

          backgroundPositionX: `${-x * zoomLevel + magnifieWidth / 2}px`,
          backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`
        }}
      ></div>
    </div>
  );
}