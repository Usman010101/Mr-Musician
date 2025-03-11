
import Artists from "@/sections/home/Artists";
import Section1 from "@/sections/home/Section-1";
import WeeklySongs from "@/sections/home/Weekly-Songs";

export default function Home() {
  return (
    <div className="container ">
    <div className="row ">
        <div className="col ">
            <Section1 />
        </div>
    </div>
    <div className="row">
        <div className="col">
            <WeeklySongs />
        </div>
    </div>
    <div className="row">
        <div className="col">
            <Artists />
        </div>
    </div>

</div>
  );
}

