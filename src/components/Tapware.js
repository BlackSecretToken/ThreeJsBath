import React, { useState, useEffect } from "react";
import { TapwareContent } from "./TapwareContent";

export function Tapware(props) {
    const { show, setShow, header, setHeader, categories, isCategory, setIsCategory } = props;
    const [ isAllCategories, setIsAllCategories ] = useState(false);
    const { isAdd, setAdd } = useState(false);
    const [ secondHeader, setSecondHeader] = useState(header);

    const Theader = header;
    console.log(Theader,"DFadfadfad7r9q7ru9fdsi")

    function Hchange(header) {
        setIsAllCategories(true)
        setHeader(header)
    }

    return (
        <div className="d-flex flex-wrap w-100 p-4">
            <div className="d-flex flex-wrap w-100 m-2 b_title">
                <span><img src="assets/ui/left-arrow.svg" style={{ width: "12px", marginRight: "5px" }} /></span>
                <p onClick={() => setIsCategory(false)}>All Categories</p>
                {isAllCategories ?
                    <>
                        <span><img src="assets/ui/left-arrow.svg" style={{ width: "12px", marginRight: "5px" }} /></span>
                        <p onClick={() => setIsAllCategories(false)}>{secondHeader}</p>
                    </> : ""}
            </div>
            <div className="d-flex flex-wrap w-100 b_title">
                <h4>{isAllCategories ? header : secondHeader}</h4>
            </div>
            {
                isAllCategories ? <TapwareContent
                    categories={categories}
                    isAdd={isAdd}
                    setAdd={setAdd}
                    loadBathtub={props.loadBathtub}
                    loadBathtub2={props.loadBathtub2}
                    loadTapware={props.loadTapware}
                    shower={props.shower}
                    show={show}
                    setShow={setShow}
                />
                    : <div className="d-flex flex-wrap w-100">
                        <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                            <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                                <span>View All</span>
                                <span><img src="assets/ui/arrow-right.svg" /></span>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                            <div className="d-flex cursor" onClick={() => Hchange('Freestanding baths')}>
                                <span>Freestanding baths</span>
                                <span><img src="assets/ui/arrow-right.svg" /></span>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                            <div className="d-flex cursor" onClick={() => Hchange('Corner baths')}>
                                <span>Corner baths</span>
                                <span><img src="assets/ui/arrow-right.svg" /></span>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                            <div className="d-flex cursor" onClick={() => Hchange('Built in baths')}>
                                <span>Built in baths</span>
                                <span><img src="assets/ui/arrow-right.svg" /></span>
                            </div>
                        </div>
                        <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                            <div className="d-flex cursor" onClick={() => Hchange('Spa baths')}>
                                <span>Spa baths</span>
                                <span><img src="assets/ui/arrow-right.svg" /></span>
                            </div>
                        </div>
                    </div>
            }

        </div>)
}