export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-36 sm:px-8" role="status" aria-label="Loading">
      <div className="skeleton h-10 w-2/3 max-w-md" />
      <div className="skeleton mt-4 h-5 w-full max-w-xl" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-64" />
        ))}
      </div>
    </div>
  );
}
