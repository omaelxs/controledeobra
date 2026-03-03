"use client";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  count?: number;
  gap?: number;
}

export default function Skeleton({ width = "100%", height = 16, borderRadius = 4, count = 1, gap = 8 }: SkeletonProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width, height, borderRadius,
            background: "linear-gradient(90deg, var(--charcoal) 0%, var(--raised) 50%, var(--charcoal) 100%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-shimmer 1.5s infinite ease-in-out",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{
      background: "var(--surface)", border: "2px solid var(--border-hard)",
      borderRadius: 8, boxShadow: "4px 4px 0 #000", padding: "20px 18px",
    }}>
      <Skeleton height={10} width="40%" />
      <div style={{ marginTop: 12 }}><Skeleton height={18} width="75%" /></div>
      <div style={{ marginTop: 14 }}><Skeleton height={3} /></div>
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <Skeleton height={24} borderRadius={4} />
        <Skeleton height={24} borderRadius={4} />
      </div>
    </div>
  );
}
