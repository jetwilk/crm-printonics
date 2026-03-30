export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-gray-400 dark:text-gray-500">
      <p className="text-lg">{message}</p>
    </div>
  );
}
