export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Hello World Scaffold
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          MTG Price Tracker
        </h1>
        <p className="max-w-2xl text-lg text-slate-700">
          Scaffold complete. This project is initialized with Next.js, TypeScript,
          Tailwind, and a baseline test setup.
        </p>
      </div>
    </main>
  );
}
