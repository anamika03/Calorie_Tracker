import Image from "next/image";
import { ICONS, type IconName } from "@/lib/assets";

export function Icon({ name, size = 28, alt = "", className }: { name: IconName; size?: number; alt?: string; className?: string }) {
  return <Image src={ICONS[name]} width={size} height={size} alt={alt} className={className} />;
}
