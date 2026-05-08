import Title from "./Title";
import { plansData } from "../assets/dummy-data";
import { CheckIcon } from "lucide-react";
import { PrimaryButton } from "./Buttons";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 bg-white/3 border-t border-white/6">
      <div className="max-w-6xl mx-auto px-4">
        <Title
          title="Pricing"
          heading="Pricing Plans"
          description="Our Pricing Plans are simple, transparent and flexible. Choose the plan that best suits your needs."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
          {plansData.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.popular
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 bg-indigo-500 rounded-full text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.desc}</p>
              <p className="text-4xl font-bold mb-6">
                {plan.price}
                <span className="text-base font-normal text-gray-400">/mo</span>
              </p>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckIcon className="size-4 text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <PrimaryButton
                onClick={() => navigate("/generate")}
                className="w-full justify-center"
              >
                Get Started
              </PrimaryButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
