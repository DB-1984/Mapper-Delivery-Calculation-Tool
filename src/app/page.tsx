import DeliveryCalculator from "@/components/DeliveryCalculator";

export default function HomePage() {
  return (
    <main className="flex min-h-screen justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-700">
            ePianos
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-950">
            Delivery Cost Calculator
          </h1>

          <p className="mt-3 leading-7 text-zinc-600">
            Enter a UK postcode to calculate the estimated cost of delivery from
            our showroom.
          </p>
        </header>

        <DeliveryCalculator />
      </div>
    </main>
  );
}
