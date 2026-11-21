import {
  LayoutDashboard, Newspaper, Film, Globe2, Users, Clock, Orbit, Clapperboard, UserSquare2, CalendarDays, Library, BrainCircuit,
  type LucideProps,
} from "lucide-react";

const ICONS = { LayoutDashboard, Newspaper, Film, Globe2, Users, Clock, Orbit, Clapperboard, UserSquare2, CalendarDays, Library, BrainCircuit };

export function NavIcon({ name, ...props }: { name: keyof typeof ICONS } & LucideProps) {
  const C = ICONS[name];
  return <C aria-hidden {...props} />;
}
