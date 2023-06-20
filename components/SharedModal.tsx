import {
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { variants } from "../utils/animationVariants";
import downloadPhoto from "../utils/downloadPhoto";
import { range } from "../utils/range";
import type { ImageProps, SharedModalProps } from "../utils/types";
import Twitter from "./Icons/Twitter";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

export default function SharedModal({
  index,
  images,
  changePhotoId,
  closeModal,
  navigation,
  currentPhoto,
  direction,
}: SharedModalProps) {
  const [loaded, setLoaded] = useState(false);

  let filteredImages = images?.filter((img: ImageProps) =>
    range(index - 15, index + 15).includes(img.id)
  );

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (index < images?.length - 1) {
        changePhotoId(index + 1);
      }
    },
    onSwipedRight: () => {
      if (index > 0) {
        changePhotoId(index - 1);
      }
    },
    trackMouse: true,
  });

  let currentImage = images ? images[index] : currentPhoto;

  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [showMagnifier, setShowMagnifier] = useState(false);

  const [zoomActive, setZoomActive] = useState(false);

  const [zoomPercentage, setZoomPercentage] = useState(100);
  const [magnifierSize, setMagnifierSize] = useState(180);
  const [zoomLevel, setZoomLevel] = useState(2);

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
      <div className="absolute z-[100] left-1 bottom-0 flex items-center gap-2 p-3">
        <button
          className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
          onClick={() => {
            zoomIn(1);
            if (zoomPercentage < 200) {
              setZoomPercentage(zoomPercentage + 25);
            }
          }}
          title="Zoom In"
        >
          <MagnifyingGlassPlusIcon className="h-6 w-6" />
        </button>
        <button
          className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
          onClick={() => {
            zoomOut(1);
            if (zoomPercentage > 100) {
              setZoomPercentage(zoomPercentage - 25);
            }
          }}
          title="Zoom Out"
        >
          <MagnifyingGlassMinusIcon className="h-6 w-6" />
        </button>
        <button
          className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
          onClick={() => {
            resetTransform();
            setZoomActive(false);
            setZoomPercentage(100);
          }}
          title="Reset Transform"
        >
          <ViewColumnsIcon className="h-6 w-6" />
        </button>
        <h1 className="text-md rounded-full bg-black/50 p-2 px-4 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white">
          {zoomPercentage}%
        </h1>
      </div>
    );
  };

  useEffect(() => {
    if (zoomActive) {
      setShowMagnifier(false);
    } else {
      setShowMagnifier(true);
    }
  });

  return (
    <MotionConfig
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div
        className="relative z-40 flex aspect-[3/2] w-full max-w-5xl items-center wide:h-full xl:taller-than-854:h-auto"
        {...handlers}
      >
        {/* Main image */}
        <div className="w-full overflow-hidden">
          <div className="relative flex aspect-[3/2] items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute z-40"
              >
                <div
                  style={{ position: "relative" }}
                  onClick={(e) => {
                    if (zoomPercentage < 200 && e.detail === 2) {
                      setZoomPercentage(zoomPercentage + 25);
                    }
                  }}
                >
                  <TransformWrapper
                    minScale={1}
                    maxScale={5}
                    disablePadding={true}
                    wheel={{ step: 1 }}
                    pinch={{ disabled: true }}
                    doubleClick={{ step: 1 }}
                    onTransformed={(e) => {
                      if (e.state.scale <= 1.02) {
                        setZoomActive(false);
                        setShowMagnifier(true);
                      } else if (e.state.scale >= 1.02) {
                        setZoomActive(true);
                        setShowMagnifier(false);
                      }
                    }}
                  >
                    <Controls />
                    <TransformComponent>
                      <Image
                        src={`https://res.cloudinary.com/${
                          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                        }/image/upload/c_scale,${
                          navigation ? "w_1280" : "w_1920"
                        }/${currentImage.public_id}.${currentImage.format}`}
                        width={navigation ? 1280 : 1920}
                        height={navigation ? 853 : 1280}
                        priority
                        alt="Next.js Conf image"
                        onLoadingComplete={() => {
                          setLoaded(true);
                          setZoomPercentage(100);
                        }}
                        id="image"
                        style={{
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                        onMouseEnter={(e) => {
                          const elem = e.currentTarget;
                          const { width, height } =
                            elem.getBoundingClientRect();
                          setSize([width, height]);
                          setShowMagnifier(true);
                        }}
                        onMouseMove={(e) => {
                          console.log("moved");
                          const elem = e.currentTarget;
                          const { top, left } = elem.getBoundingClientRect();

                          const x = e.pageX - left - window.scrollX;
                          const y = e.pageY - top - window.screenY;
                          setXY([x, y]);
                        }}
                        onMouseLeave={() => {
                          setShowMagnifier(false);
                        }}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                  <div
                    id="glass"
                    style={{
                      display: showMagnifier ? "" : "none",
                      position: "absolute",
                      pointerEvents: "none",
                      height: `${magnifierSize}px`,
                      width: `${magnifierSize}px`,
                      top: `${y - magnifierSize / 2}px`,
                      left: `${x - magnifierSize / 2}px`,
                      opacity: "1",
                      border: "4px solid #eee",
                      borderRadius: "50%",
                      backgroundColor: "transparent",
                      backgroundImage: `url('${`https://res.cloudinary.com/${
                        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                      }/image/upload/c_scale,${
                        navigation ? "w_1280" : "w_1920"
                      }/${currentImage.public_id}.${currentImage.format}`}')`,
                      backgroundRepeat: "no-repeat",

                      backgroundSize: `${imgWidth * zoomLevel}px ${
                        imgHeight * zoomLevel
                      }px`,

                      backgroundPositionX: `${
                        -x * zoomLevel + magnifierSize / 2
                      }px`,
                      backgroundPositionY: `${
                        -y * zoomLevel + magnifierSize / 2
                      }px`,
                    }}
                  ></div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Buttons + bottom nav bar */}
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-center justify-center">
          {/* Buttons */}
          {loaded && (
            <div className="relative aspect-[3/2] max-h-full w-full">
              {navigation && (
                <>
                  {index > 0 && (
                    <button
                      className="absolute z-50 left-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                      style={{ transform: "translate3d(0, 0, 0)" }}
                      onClick={() => changePhotoId(index - 1)}
                    >
                      <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                  )}
                  {index + 1 < images.length && (
                    <button
                      className="absolute z-50 right-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                      style={{ transform: "translate3d(0, 0, 0)" }}
                      onClick={() => changePhotoId(index + 1)}
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </button>
                  )}
                </>
              )}
              <div className="absolute z-50 right-0 top-5 flex items-center gap-2 p-3 text-white">
                {navigation ? (
                  <a
                    href={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage.public_id}.${currentImage.format}`}
                    className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                    target="_blank"
                    title="Open fullsize version"
                    rel="noreferrer"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </a>
                ) : (
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20pic%20from%20Next.js%20Conf!%0A%0Ahttps://nextjsconf-pics.vercel.app/p/${index}`}
                    className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                    target="_blank"
                    title="Open fullsize version"
                    rel="noreferrer"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                <button
                  onClick={() =>
                    downloadPhoto(
                      `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${currentImage.public_id}.${currentImage.format}`,
                      `${index}.jpg`
                    )
                  }
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                  title="Download fullsize version"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute z-50 left-0 top-5 flex items-center gap-2 p-3 text-white">
                <button
                  onClick={() => closeModal()}
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                >
                  {navigation ? (
                    <XMarkIcon className="h-5 w-5" />
                  ) : (
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}
          {/* Bottom Nav bar */}
          {navigation && (
            <div className="fixed short:hidden inset-x-0 bottom-0 z-40 overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
              <motion.div
                initial={false}
                className="mx-auto mb-6 mt-6 flex aspect-[3/2] h-14"
              >
                <AnimatePresence initial={false}>
                  {filteredImages.map(({ public_id, format, id }) => (
                    <motion.button
                      initial={{
                        width: "0%",
                        x: `${Math.max((index - 1) * -100, 15 * -100)}%`,
                      }}
                      animate={{
                        scale: id === index ? 1.25 : 1,
                        width: "100%",
                        x: `${Math.max(index * -100, 15 * -100)}%`,
                      }}
                      exit={{ width: "0%" }}
                      onClick={() => changePhotoId(id)}
                      key={id}
                      className={`${
                        id === index
                          ? "z-20 rounded-md shadow shadow-black/50"
                          : "z-10"
                      } ${id === 0 ? "rounded-l-md" : ""} ${
                        id === images.length - 1 ? "rounded-r-md" : ""
                      } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                    >
                      <Image
                        alt="small photos on the bottom"
                        width={180}
                        height={120}
                        className={`${
                          id === index
                            ? "brightness-110 hover:brightness-110"
                            : "brightness-50 contrast-125 hover:brightness-75"
                        } h-full transform object-cover transition`}
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_180/${public_id}.${format}`}
                      />
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}
