import MusicGenre from "@/components/musicgenre/musicgenre";
export default function GenreCard() {
    return (
        <div>

            <div className="mt-5 row mx-2 ">
                <div className="col-12 mb-4">
                    <h2 className="fw-bold">
                        Music <span style={{ color: "#ee10b0" }}>Genre</span>
                    </h2>
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <MusicGenre id="1" imgurl='/images/artistprofile.png' title="Sad"  />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <MusicGenre id="2" imgurl='/images/artistprofile.png' title="Rap"/>
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <MusicGenre id="3" imgurl='/images/artistprofile.png' title="Pop" />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <MusicGenre id="4" imgurl='/images/artistprofile.png' title="Classic"/>
                </div>
            </div>
        </div>
    );
}
