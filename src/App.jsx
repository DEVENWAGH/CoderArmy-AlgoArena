import { Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import Layout from "./components/Layout";
import Home from "./components/Home";
import SortingVisualizer from "./components/sorting/SortingVisualizer";
import SearchVisualizer from "./components/searching/SearchVisualizer";
import GraphVisualizer from "./components/graph/GraphVisualizer";
import DPVisualizer from "./components/dp/DPVisualizer";
import GreedyVisualizer from "./components/greedy/GreedyVisualizer";
import BacktrackingVisualizer from "./components/backtracking/BacktrackingVisualizer";
import TreeVisualizer from "./components/tree/TreeVisualizer";
import MathVisualizer from "./components/mathematical/MathVisualizer";
import ErrorBoundary from "./components/ErrorBoundary";
import RaceMode from "./components/race/RaceMode";
import Faq from "./components/FAQ"; // Add this import

const App = () => {
  // Enhanced structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Algorithm Arena",
    description:
      "Interactive platform to visualize and understand algorithms through animations and step-by-step explanations",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Deven Wagh",
    },
    keywords:
      "algorithms, data structures, visualization, sorting, searching, graphs, dynamic programming, educational tool",
    url: "https://coder-army-algo-arena.vercel.app/",
    softwareVersion: "1.0.0",
  };

  return (
    <div className="flex flex-col w-screen">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>
          Algorithm Arena - Interactive Algorithm Visualization Platform
        </title>
        <meta
          name="description"
          content="Visualize and learn algorithms through interactive animations. Compare algorithm performance in real-time with our unique Race Mode."
        />
        <meta
          name="keywords"
          content="algorithm visualization, sorting algorithms, searching algorithms, data structures, computer science, educational tool"
        />

        {/* Open Graph Meta Tags */}
        <meta
          property="og:title"
          content="Algorithm Arena - Interactive Visualization"
        />
        <meta
          property="og:description"
          content="Learn algorithms through interactive visualizations and real-time comparisons."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://coder-army-algo-arena.vercel.app/"
        />
        <meta property="og:image" content="/og-image.png" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Algorithm Arena" />
        <meta
          name="twitter:description"
          content="Interactive algorithm visualization platform for educational purposes."
        />
        <meta name="twitter:image" content="/twitter-image.png" />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href="https://coder-army-algo-arena.vercel.app/"
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="sorting/:algorithm" element={<SortingVisualizer />} />
            <Route path="searching/:algorithm" element={<SearchVisualizer />} />
            <Route path="graph/:algorithm" element={<GraphVisualizer />} />
            <Route
              path="dynamic-programming/:algorithm"
              element={<DPVisualizer />}
            />
            <Route
              path="greedy-algorithm/:algorithm"
              element={<GreedyVisualizer />}
            />
            <Route
              path="backtracking/:algorithm"
              element={<BacktrackingVisualizer />}
            />
            <Route
              path="tree-algorithms/:algorithm"
              element={<TreeVisualizer />}
            />
            <Route
              path="mathematical-algorithms/:algorithm"
              element={<MathVisualizer />}
            />
            <Route path="race-mode" element={<RaceMode />} />
            <Route path="faq" element={<Faq />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
