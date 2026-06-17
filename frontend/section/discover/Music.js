import Music from "@/components/music/music";
export default function MusicCard() {
    return (
        <div>

            <div className="mt-5 row mx-2 ">
                <div className="col-12 mb-4">
                    <h2 className="fw-bold">
                        Music
                    </h2>
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <Music id="1" imgurl='/images/artistprofile.png' title="Song 1" artist="Artist 1" />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <Music id="2" imgurl='/images/artistprofile.png' title="Song 2" artist="Artist 2" />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <Music id="3" imgurl='/images/artistprofile.png' title="Song 3" artist="Artist 3" />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <Music id="4" imgurl='/images/artistprofile.png' title="Song 4" artist="Artist 4" />
                </div>
            </div>
        </div>
    );
}
