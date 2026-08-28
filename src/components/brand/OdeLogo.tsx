import Image from "next/image";

const marks = {
  primary: "/brand/ode-primary.png",
  dark: "/brand/ode-dark.png",
  light: "/brand/ode-light.png",
  favicon: "/brand/ode-favicon.png",
} as const;

export type OdeLogoVariant = keyof typeof marks;

interface OdeLogoProps {
  className?: string;
  priority?: boolean;
  size?: number;
  variant?: OdeLogoVariant;
}

/** The supplied Ode artwork, sized for navigation rather than treated as a UI icon. */
export default function OdeLogo({
  className,
  priority = false,
  size = 44,
  variant = "primary",
}: OdeLogoProps) {
  return (
    <Image
      alt="Ode"
      className={className}
      draggable={false}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      src={marks[variant]}
      width={size}
    />
  );
}
