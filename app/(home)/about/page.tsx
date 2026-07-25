import AboutCards from "@/component/features/AboutCard"
import TeamSection from "@/component/features/TeamSection"
import AboutUsHero from "@/component/hero/AboutUsHero"
import TrackLayout from "@/component/track-layout/TrackLayout"

const page = () => {
  return (
    <TrackLayout>
   <div className="flex gap-5 flex-col">
   <AboutUsHero/>
   <AboutCards/>
   <TeamSection/>
   </div>
    </TrackLayout>
  )
}

export default page