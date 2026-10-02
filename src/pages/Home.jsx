import CoconutIntro from '../sections/CoconutIntro';
import FlavourSection from '../sections/FlavourSection';
import ImageStory from '../sections/ImageStory';
import TestimonialsSection from '../sections/TestimonialsSection';
import FinalCTA from '../sections/FinalCTA';
import usePageTitle from '../hooks/usePageTitle';

export default function Home() {
  usePageTitle('Paradise in every sip');
  return (
    <>
      <CoconutIntro />
      <FlavourSection />
      <ImageStory />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}
