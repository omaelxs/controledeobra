"use client";

import { motion } from "framer-motion";
import React from "react";

/**
 * Skeleton Loading Component
 */
export function SkeletonLoader({ count = 5, height = 16 }: { count?: number; height?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            height,
            borderRadius: 6,
            background: "rgba(255,255,255,.1)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Fade + Slide Page Transition
 */
export function PageTransitionLayout({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Success/Error Feedback Animation
 */
interface FeedbackAnimationProps {
  type: "success" | "error" | "warning";
  children: React.ReactNode;
}

export function FeedbackAnimation({ type, children }: FeedbackAnimationProps) {
  const colors = {
    success: { bg: "rgba(34,197,94,.1)", border: "#22c55e", color: "#22c55e" },
    error: { bg: "rgba(239,68,68,.1)", border: "#ef4444", color: "#ef4444" },
    warning: { bg: "rgba(234,179,8,.1)", border: "#eab308", color: "#eab308" },
  };

  const style = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.3 }}
      style={{
        padding: 16,
        borderRadius: 8,
        border: `2px solid ${style.border}`,
        background: style.bg,
        color: style.color,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Button with Micro Interactions
 */
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export function AnimatedButton({
  variant = "primary",
  children,
  ...props
}: AnimatedButtonProps) {
  const variantStyles = {
    primary: { bg: "var(--red-accent)", color: "#fff", border: "var(--red-accent)" },
    secondary: { bg: "transparent", color: "inherit", border: "1px solid rgba(255,255,255,.2)" },
    ghost: { bg: "transparent", color: "inherit", border: "none" },
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      style={{
        padding: "8px 16px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * List Item with Stagger Animation
 */
interface StaggerListProps {
  items: React.ReactNode[];
  delay?: number;
}

export function StaggerList({ items, delay = 0.05 }: StaggerListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {items.map((item, idx) => (
        <motion.div key={idx} variants={itemVariants}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Hover Elevation Effect
 */
interface HoverElevationProps {
  children: React.ReactNode;
  styles?: React.CSSProperties;
}

export function HoverElevation({ children, styles }: HoverElevationProps) {
  return (
    <motion.div
      whileHover={{ translateY: -4 }}
      transition={{ duration: 0.1 }}
      style={styles}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pulse Notification Badge
 */
interface PulseBadgeProps {
  count: number;
}

export function PulseBadge({ count }: PulseBadgeProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "var(--red-accent)",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {count}
    </motion.div>
  );
}
