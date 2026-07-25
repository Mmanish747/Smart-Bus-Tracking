import { LucideIcon, Inbox } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon: Icon = Inbox,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
