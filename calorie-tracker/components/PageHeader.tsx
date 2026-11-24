import Link from "next/link";
import { Icon } from "./Icon";
import type { IconName } from "@/lib/assets";

export function PageHeader({ title, icon, back = "/" }: { title: string; icon?: IconName; back?: string }) {
  return (
    <header className="mb-6 flex items-center gap-3">
      <Link href={back} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-sm">
        ‹
      </Link>
      {icon && <Icon name={icon} size={32} />}
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
