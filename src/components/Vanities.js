import React, {useState, useEffect} from "react";
import {VanitiesContent} from "./VanitiesContent";

export function Vanities(props){
    const {show, setShow, categories} = props;
    const [isAllCategories, setIsAllCategories] = useState(false);
    const {isAdd, setAdd} = useState(false);
    return (
        <div className="d-flex flex-wrap w-100 p-4">
            <div className="d-flex flex-wrap w-100 m-2 b_title">
                <p>All Categories</p>
            </div>
            <div className="d-flex flex-wrap w-100 b_title">
                <h4>Tapware & Accessories</h4>
            </div>
            {
                isAllCategories ? <TapwareContent
                    categories={categories}
                    isAdd = {isAdd}
                    setAdd = {setAdd}
                    loadBathtub = {props.loadBathtub}
                    loadBathtub2 = {props.loadBathtub2}
                    show={show}
                    setShow={setShow}
                />
                 : <div className="d-flex flex-wrap w-100">
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>View All</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>Shower & Bath Tapware</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>Basin Tapware</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>Bathroom Accessories</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>Kitchen & Laundry Tapware</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>Commerical & Access & Mobility Tapware</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>Outdoor Tapware</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                    <div className="d-flex flex-wrap mt-2 w-100 bg-white p-2 rounded shadow-sm">
                        <div className="d-flex cursor" onClick={() => setIsAllCategories(true)}>
                            <span>Bidet Tapware</span>
                            <span><img src="assets/ui/arrow-right.svg"/></span>
                        </div>
                    </div>
                </div>
            }
            
        </div>)
}