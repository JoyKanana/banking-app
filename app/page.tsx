
const navigation = [
  "Overview",
  "Wallet",
  "Payments",
  "Messages",
  "Wishlist",
  "Creator Studio",
  "Business",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-white/10 bg-slate-900 p-6 md:block">
        <h1 className="text-2xl font-bold tracking-wide">
          RELAY<span className="text-teal-400">.</span>
        </h1>

        <p className="mt-2 text-xs text-slate-400">
          YOUR WORLD, CONNECTED.
        </p>

        <nav className="mt-12 space-y-2">
          {navigation.map((item) => (
            <button
              key={item}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm transition ${item === "Overview"
                  ? "bg-teal-400/10 font-semibold text-teal-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-6 text-sm text-slate-500">
          Project Relay · Early preview
        </div>
      </aside>

      <section className="p-6 md:ml-64 md:p-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Monday, November 9, 2026</p>
            <h2 className="mt-2 text-2xl font-semibold">
              Welcome to Relay.
            </h2>
          </div>

          <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
            Demo account
          </div>
        </header>

        <div className="mt-10">
          <p className="text-sm text-slate-400">Your workspace</p>
          <h3 className="mt-1 text-3xl font-bold">
            Everything in one place.
          </h3>
          <p className="mt-3 max-w-xl text-slate-400">
            Manage your money, connect with people, organise your goals
            and grow your business through Project Relay.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Wallet</p>
            <h4 className="mt-4 text-xl font-semibold">Your money, your way.</h4>
            <p className="mt-2 text-sm text-slate-500">
              Multi-currency wallet experience.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Connections</p>
            <h4 className="mt-4 text-xl font-semibold">Stay connected.</h4>
            <p className="mt-2 text-sm text-slate-500">
              Private conversations and family support.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Creator Studio</p>
            <h4 className="mt-4 text-xl font-semibold">Build your income.</h4>
            <p className="mt-2 text-sm text-slate-500">
              Tools for creators and independent businesses.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-teal-400/20 bg-teal-400/5 p-6">
          <p className="text-sm font-medium text-teal-300">
            PROJECT RELAY
          </p>
          <h4 className="mt-2 text-xl font-semibold">
            A connected digital ecosystem.
          </h4>
          <p className="mt-2 text-sm text-slate-400">
            This is our first development screen. Wallet balances,
            payments and other services are not connected yet.
          </p>
        </div>
      </section>
    </main>
  );
}
