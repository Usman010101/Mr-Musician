
import PopularArtist from "@/components/popularartist/popularartist";
export default function PopularArtistCard() {
    return (
        <div>

            <div className="mt-5 row mx-2 ">
                <div className="col-12 mb-4">
                    <h2 className="fw-bold">
                        Popular <span style={{ color: "#ee10b0" }}>Artists</span>
                    </h2>
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <PopularArtist id="1" imgurl='/images/Adele.png' name="Adele"  />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <PopularArtist id="2" imgurl='/images/Billie Elish.png' name="Billie Elish"  />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <PopularArtist id="3" imgurl='/images/Eminem.png' name="Eminem"  />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <PopularArtist id="4" imgurl='/images/The Weekend.png' name="The Weekend"  />
                </div>
            </div>
        </div>
    );
}
