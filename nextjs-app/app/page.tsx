import Hero from "../components/Hero";
import HomeCategoryStrip from "../components/HomeCategoryStrip";
import HomeGallery from "../components/HomeGallery";
import HomeProductCarousel from "../components/HomeProductCarousel";
import HomeVideo from "../components/HomeVideo";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HomeCategoryStrip />
      <HomeGallery />
      <HomeProductCarousel />
      <HomeVideo />
    </>
  );
}
