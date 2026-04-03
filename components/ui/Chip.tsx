interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? "bg-lp-accent-light text-lp-accent"
          : "bg-lp-chip text-lp-secondary hover:bg-lp-border"
      }`}
    >
      {label}
    </button>
  );
}
