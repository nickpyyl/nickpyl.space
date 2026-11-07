import { useEffect } from "react";
import Home from "./HomeRedesign.jsx";
import { portfolioMedia } from "./portfolio-media.js";

export default function App() {
  useEffect(() => {
    function returnHome() {
      if (window.location.pathname !== "/" || window.location.hash) {
        window.history.replaceState(null, "", `/${window.location.search}`);
      }
    }
    returnHome();
    window.addEventListener("popstate", returnHome);
    window.addEventListener("hashchange", returnHome);
    return () => {
      window.removeEventListener("popstate", returnHome);
      window.removeEventListener("hashchange", returnHome);
    };
  }, []);

  return <Home projects={portfolioMedia} />;
}
