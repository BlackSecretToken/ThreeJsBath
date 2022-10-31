import { useEffect, useState } from "react";

export function VanitiesContent(props) {

    const { show, setShow, categories } = props;
    const [create, setCreate] = useState(false);
    const [arrCat, setArrCat] = useState([]);

    useEffect(() => {
        const temp = [...arrCat];
        const tempC = [...categories]
        const tempCate = [];
        for (let i = 0; i < tempC.length / 2; i += 1) {
            let ttt = [];
            if (tempC.length % 2 == 0) {
                ttt = [tempC[i * 2], tempC[i * 2 + 1]];
            } else {
                ttt = tempC[i * 2];
            }
            tempCate.push(ttt)
        }
        console.log(tempCate, "----tempCate");
        setArrCat(tempCate)
    }, [categories])

    return (
        <div className="d-flex flex-wrap w-100 calc">
            <div className="d-flex flex-wrap w-100 cards1" style={{ "marginBottom": "5%" }}>
                <div className='card d-flex align-items-center text-center p-2 rounded card1'>
                    <span className='m-2'>Bath & Spas</span>
                    <img style={{ width: "70px", scale: "1.7" }} className='m-3 p-2' src="assets/ui/e09acac1-fc05-4078-bd84-73b765c26c31.png"></img>
                    <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub()}>Add to Plan +</div>
                </div>
                <div className='card d-flex align-items-center text-center p-2 rounded card1'>
                    <span className='m-2'>Window</span>
                    <img style={{ width: "70px", scale: "1.5" }} className='m-3 p-2' src="assets/ui/window.svg"></img>
                    <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub2()}>Add to Plan +</div>
                </div>
            </div>
            {
                arrCat.map(item => (<div className="d-flex flex-wrap w-100 cards1" style={{ "marginBottom": "5%" }}>
                    {
                        item.map(arr => <div className='card d-flex align-items-center text-center p-2 rounded card1'>
                            <span className='m-2'>{arr.title}</span>
                            <img style={{ width: "70px", scale: "1.5" }} className='m-3 p-2' src={arr.image}></img>
                            <div className='btn m-1 rounded-5 shadow-sm' onClick={() => props.loadBathtub()}>Add to Plan +</div>
                        </div>)
                    }
                </div>))
            }

            {create ? "" : <div className="create" onClick={() => setShow(true)}>
                <p>Create</p>
            </div>}
        </div>
    )
}