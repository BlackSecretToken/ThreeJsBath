import { useEffect, useState } from "react";

export function TapwareContent(props) {

    const { show, setShow, categories } = props;
    const [create, setCreate] = useState(false);
    const [arrCat, setArrCat] = useState([]);

    useEffect(() => {
        const temp = [...arrCat];
        const tempC = [...categories]
        const tempCate = [];
        console.log(tempC, "jk122222222222")
        for (let i = 0; i < tempC.length; i += 1) {
            let ttt = [];
            ttt = tempC[i];
            tempCate.push(ttt)
        }
        console.log(tempCate, "----tempCate");
        setArrCat(tempCate)
    }, [categories])

    return (
        <div className="d-flex flex-wrap w-100 calc">
            <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                <span className='m-2'>Bath & Spas</span>
                <img style={{ width: "70px", scale: "1.2" }} className='m-3 p-2' src="assets/ui/e09acac1-fc05-4078-bd84-73b765c26c31.png"></img>
                <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub('assets/doors/bath1.gltf')}>Add to Plan +</div>
            </div>
            <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                <span className='m-2'>Window</span>
                <img style={{ width: "70px", scale: "1.2" }} className='m-3 p-2' src="assets/ui/window.svg"></img>
                <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub2('assets/doors/bath2.gltf', 0.58, 0.3)}>Add to Plan +</div>
            </div>
            <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                <span className='m-2'>Shower</span>
                <img style={{ width: "70px", scale: "1.2" }} className='m-3 p-2' src="assets/ui/Showers.png"></img>
                <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.shower()}>Add to Plan +</div>
            </div>
            <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                <span className='m-2'>Tapware</span>
                <img style={{ width: "70px", scale: "1.2" }} className='m-3 p-2' src="assets/ui/Tapware & Accessories.png"></img>
                <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadTapware('assets/doors/tapware.gltf', 0.05, 0.19, 0)}>Add to Plan +</div>
            </div>
            <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                <span className='m-2'>Wall Mix</span>
                <img style={{ width: "70px", scale: "1.2" }} className='m-3 p-2' src="assets/ui/Wall.png"></img>
                <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadTapware('assets/doors/Wall Mix.glb', 0, 0.35, 0.25)}>Add to Plan +</div>
            </div>
            {
                arrCat.map(arr =>
                    <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                        <span className='m-2'>{arr.title}</span>
                        <img style={{ width: "70px", scale: "1" }} className='m-3 p-2' src={arr.image}></img>
                        <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadTapware('assets/doors/tapware.gltf', 0.05, 0.19, 0)}>Add to Plan +</div>
                    </div>
                )
            }
            <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                <span className='m-2'>Waverley</span>
                <img style={{ width: "70px", scale: "1.2" }} className='m-3 p-2' src="assets/ui/Vanity Bag Tex 1.952.png"></img>
                <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub2('assets/doors/Waverley Without Bottom.glb', 0.5, 0.29)}>Add to Plan +</div>
            </div>
            <div className='card d-flex align-items-center text-center p-2 rounded card1 marr'>
                <span className='m-2'>Wall Mix</span>
                <img style={{ width: "70px", scale: "1.2" }} className='m-3 p-2' src="assets/ui/modern.JPG"></img>
                <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadTapware('assets/doors/modern brass cioso color/cioso wall bath set brushed brass.glb', 0, 0, 0)}>Add to Plan +</div>
            </div>

            {create ? "" : <div className="create" onClick={() => setShow(true)}>
                <p>Create</p>
            </div>}
        </div>
    )
}