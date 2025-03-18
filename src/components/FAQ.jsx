import { useState } from "react";
import { Helmet } from "react-helmet";
import Seo from "./Seo";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      id: "what-is",
      question: "What is Algorithm Arena?",
      answer:
        "Algorithm Arena is an interactive platform designed for visualizing and learning about various algorithms and data structures through animated visualizations and real-time comparisons.",
    },
    {
      id: "race-mode",
      question: "How does Race Mode work?",
      answer:
        "Race Mode allows you to select multiple algorithms and compare their performance in real time. You can see which algorithms complete faster and understand their efficiency differences visually.",
    },
    {
      id: "supported-algos",
      question: "Which algorithms are supported?",
      answer:
        "The platform currently supports sorting algorithms (Bubble, Merge, Quick, Heap Sort), searching algorithms (Linear, Binary, Jump Search), graph algorithms (BFS, DFS, Dijkstra's), and various other categories like dynamic programming and greedy algorithms.",
    },
    {
      id: "for-beginners",
      question: "Is this platform suitable for beginners?",
      answer:
        "Yes! Algorithm Arena is designed to be educational for all levels. Beginners can learn visually how algorithms work, while advanced users can compare performance characteristics and analyze algorithmic complexity.",
    },
    {
      id: "contributions",
      question: "Can I contribute to the project?",
      answer:
        "Absolutely! The project is open source, and we welcome contributions. You can fork the repository, create a feature branch, and submit a pull request with your improvements.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className="max-w-3xl px-4 py-8 mx-auto">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Seo
        title="Frequently Asked Questions"
        description="Find answers to common questions about Algorithm Arena, features, and how to use the platform"
        keywords="algorithm FAQ, algorithm questions, AlgoArena help, algorithm visualization help"
      />

      <h2 className="mb-6 text-2xl font-bold text-center text-white">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="overflow-hidden bg-slate-800 rounded-lg shadow-md"
          >
            <button
              className="flex items-center justify-between w-full p-4 text-left text-white"
              onClick={() => toggleFAQ(index)}
              aria-expanded={index === activeIndex}
            >
              <span className="text-lg font-medium">{faq.question}</span>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  index === activeIndex ? "transform rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {index === activeIndex && (
              <div className="p-4 pt-0 text-gray-300 border-t border-slate-700">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
