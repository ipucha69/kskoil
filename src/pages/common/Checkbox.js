import React from "react";

const Checkbox = ({ onChange, value, checked, disabled }) => {
    return (
        <div>
            <input
                value={value}
                type={"checkbox"}
                onChange={onChange}
                checked={checked}
                disabled={disabled}
                className={`w-12 h-7`}
            />
        </div>
    );
};

export default Checkbox;
