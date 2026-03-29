import { useEffect, useState } from "react";
import "./collectibles.css";

export default function Navbar() {

    const [xp, setXP] = useState(0);

    useEffect(() => {

        fetch("http://localhost:8080/api/xp/1")
            .then(res => res.text())
            .then(data => setXP(parseInt(data)));

    }, []);

    return (

        <div className="xp-navbar">

            <div className="xp-wrapper">

                <span className="xp-text">
                    XP {xp}
                </span>

                <div className="xp-container">

                    <div
                        className="xp-bar"
                        style={{
                            width: `${Math.min(xp, 500) / 5}%`
                        }}
                    />

                </div>

            </div>

        </div>

    );

}