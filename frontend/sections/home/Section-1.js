import Navbar from "@/components/navbar/navbar";


export default function Section1() {
    return (
        <div
            className="ratio ratio-16x9 my-4  "
            style={{
                backgroundImage: `url(/images/homepage.png)`,
                backgroundSize: 'cover',
                
            }}
        >
           <div className=" ">
            <Navbar />
            </div>            
        </div>
    );
}
