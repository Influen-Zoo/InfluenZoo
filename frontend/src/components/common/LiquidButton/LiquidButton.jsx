import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";
import { Button } from "@mui/material";
import "./LiquidButton.css";

const sizeMap = {
  small: {
    padding: "10px 18px",
    minWidth: "92px",
    height: "44px",
    fontSize: "14px",
    gap: "0.45rem",
  },
  medium: {
    padding: "14px 30px",
    minWidth: "44px",
    height: "52px",
    fontSize: "15px",
    gap: "0.6rem",
  },
  large: {
    padding: "16px 42px",
    minWidth: "44px",
    height: "58px",
    fontSize: "16px",
    gap: "0.7rem",
  },
};

const LiquidButton = ({
  children = "Continue",
  onClick,
  variant = "primary",
  size = "medium",
  style = {},
  circular = false,
  fullWidth = false,
  ...props
}) => {
  const ref = useRef(null);
  const currentSize = sizeMap[size] || sizeMap.medium;

  // 🔄 rotation
  const spin = useMotionValue(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // 🎯 color toggle
  const [filled, setFilled] = useState(false);

  // 💥 spread state
  const [spread, setSpread] = useState({
    x: 0,
    y: 0,
    type: "in",
    key: 0,
    active: false,
  });

  // 🔹 hover motion
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const posX = useMotionValue(0);
  const posY = useMotionValue(0);

  const spring = { stiffness: 300, damping: 18 };

  const rX = useSpring(tiltX, spring);
  const rY = useSpring(tiltY, spring);
  const x = useSpring(posX, spring);
  const y = useSpring(posY, spring);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const midX = rect.width / 2;
    const midY = rect.height / 2;

    tiltX.set(-(py - midY) / 3);
    tiltY.set((px - midX) / 3);

    posX.set((px - midX) / 6);
    posY.set((py - midY) / 6);

    ref.current.style.setProperty("--x", `${px}px`);
    ref.current.style.setProperty("--y", `${py}px`);
  };

  const reset = () => {
    tiltX.set(0);
    tiltY.set(0);
    posX.set(0);
    posY.set(0);
  };

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isSpinning) return;

    const rect = ref.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    setIsSpinning(true);

    setSpread({
      x: px,
      y: py,
      type: filled ? "out" : "in",
      key: Date.now(),
      active: true,
    });

    setFilled((prev) => !prev);

    spin.stop();
    animate(spin, spin.get() + 360, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        setIsSpinning(false);
        onClick && onClick(e);
      },
    });
  };

  return (
    <motion.div
      style={{
        perspective: 1200,
        display: "inline-block",
        ...style
      }}
    >
      {/* 🔹 HOVER */}
      <motion.div
        style={{
          rotateX: rX,
          rotateY: rY,
          x,
          y,
          transformStyle: "preserve-3d",
        }}
      >
        {/* 🔄 SPIN */}
        <motion.div
          style={{
            rotateX: spin,
            transformStyle: "preserve-3d",
            filter: isSpinning ? "blur(1px)" : "blur(0px)",
          }}
          whileTap={{ scale: 0.94 }}
        >
          <Button
            ref={ref}
            disableRipple
            {...props}
            className={`glass-button glass-button-${variant} ${props.className || ""}`.trim()}
            onMouseMove={(e) => {
              handleMove(e);
              if (props.onMouseMove) props.onMouseMove(e);
            }}
            onMouseLeave={(e) => {
              reset();
              if (props.onMouseLeave) props.onMouseLeave(e);
            }}
            onClick={handleClick}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: circular ? "50%" : "50px",
              padding: circular ? "12px" : currentSize.padding,
              minWidth: circular ? "44px" : currentSize.minWidth,
              width: circular ? "44px" : fullWidth ? "100%" : "auto",
              height: circular ? "44px" : currentSize.height,
              fontSize: currentSize.fontSize,
              textTransform: "none",
              fontWeight: 600,
              display: "inline-flex",
              whiteSpace: "nowrap",

              // ✅ TEXT ALWAYS VISIBLE
              color: filled ? "#000" : "var(--text-primary)",

              // ✅ TRUE GLASS BASE
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.12)",

              boxShadow: `
                0 10px 25px rgba(0,0,0,0.2),
                inset 0 1px 1px rgba(255,255,255,0.3)
              `,

              // ✨ TOP GLOSS
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "60%",
                borderRadius: "50px 50px 0 0",
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
                pointerEvents: "none",
                zIndex: 5,
              },

              // 🌑 DEPTH
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "45%",
                borderRadius: "0 0 50px 50px",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.1), transparent)",
                pointerEvents: "none",
                zIndex: 5,
              },
              ...style
            }}
          >
            {/* 💙 GLASS TINT (LIGHT + BLENDED) */}
            {filled && (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background:
                    "linear-gradient(145deg, var(--accent), var(--accent-dark))",
                  opacity: 0.8,
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}

            {/* 💥 SPREAD */}
            {spread.active && (
              <span
                key={spread.key}
                style={{
                  position: "absolute",
                  top: spread.y,
                  left: spread.x,
                  width: spread.type === "in" ? "0px" : "900px",
                  height: spread.type === "in" ? "0px" : "900px",
                  transform: "translate(-50%, -50%)",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, var(--accent), var(--accent-light), transparent 70%)",
                  pointerEvents: "none",
                  animation:
                    spread.type === "in"
                      ? "spreadIn 0.5s ease-out forwards"
                      : "spreadOut 0.5s ease-out forwards",
                  zIndex: 2,
                }}
              />
            )}

            {/* 💡 LIGHT */}
            <span
              style={{
                position: "absolute",
                top: "var(--y)",
                left: "var(--x)",
                width: "260px",
                height: "260px",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.3), transparent 60%)",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />

            <span style={{ 
              position: 'relative', 
              zIndex: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: circular ? '0' : currentSize.gap,
              width: fullWidth ? '100%' : 'auto'
            }}>
              {children}
            </span>

            <style>
              {`
                @keyframes spreadIn {
                  from { width: 0; height: 0; opacity: 1; }
                  to { width: 900px; height: 900px; opacity: 1; }
                }

                @keyframes spreadOut {
                  from { width: 900px; height: 900px; opacity: 1; }
                  to { width: 0; height: 0; opacity: 0; }
                }
              `}
            </style>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LiquidButton;
