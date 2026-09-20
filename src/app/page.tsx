import SmoothScroll from '@/components/SmoothScroll';
import SceneRootLazy from '@/components/scene/SceneRootLazy';
import Nav from '@/components/Nav';
import Hero from '@/components/sections/Hero';
import Group from '@/components/sections/Group';
import WhiteLabel from '@/components/sections/WhiteLabel';
import Technology from '@/components/sections/Technology';
import Catalogue from '@/components/sections/Catalogue';
import Process from '@/components/sections/Process';
import Faq from '@/components/sections/Faq';
import GetStarted from '@/components/sections/GetStarted';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <SmoothScroll>
      <SceneRootLazy />
      <Nav />
      <main id="top" className="relative z-10">
        <Hero />
        <Group />
        <WhiteLabel />
        <Technology />
        <Catalogue />
        <Process />
        <Faq />
        <GetStarted />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
