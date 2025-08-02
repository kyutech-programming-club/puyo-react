import React from "react";
import type { Cell } from "../types";

type Props = {
    color: Cell;
};

const colorMap: Record<Exclude<Cell, null>, string> = {
    red: "#e74c3c",
    green: "#2ecc71",
    blue: "#3498db",
    yellow: "#f1c40f",
};

const Puyo: React.FC<Props> = ({ color }) => {
    return (
        <div
            style={{
                width: "30px",
                height: "30px",
                backgroundColor: color ? colorMap[color] : "lightgray",
                borderRadius: "50%",
            }}
        />
    );
};

export default Puyo;
