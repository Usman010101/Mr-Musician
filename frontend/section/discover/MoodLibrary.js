import MoodLibrary from "@/components/moodlibrary/moodlibrary";
export default function MoodLibraryCard() {
    return (
        <div>

            <div className="mt-5 row mx-2 ">
                <div className="col-12 mb-4">
                    <h2 className="fw-bold">
                        Mood <span style={{ color: "#ee10b0" }}>Library</span>
                    </h2>
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <MoodLibrary id="1" imgurl='/images/artistprofile.png' title="Sad Songs" playlist="Sad Playlist"  />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <MoodLibrary id="1" imgurl='/images/artistprofile.png' title="Sad Songs" playlist="Sad Playlist"  />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                    <MoodLibrary id="1" imgurl='/images/artistprofile.png' title="Sad Songs" playlist="Sad Playlist"  />
                </div>
                <div className="col-lg-3 col-md-4 col-sm-6">
                   <MoodLibrary id="1" imgurl='/images/artistprofile.png' title="Sad Songs" playlist="Sad Playlist"  />   
                </div>
            </div>
        </div>
    );
}
