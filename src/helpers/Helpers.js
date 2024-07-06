export const formatter = new Intl.NumberFormat("en-US");

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "TZS",
});

export const capitalize = (text) => {
    text = text || "";
    if (typeof text === "string") {
        return text
        .split(" ")
        .map((e) => e.charAt(0).toUpperCase() + e.substr(1).toLowerCase())
        .join(" ");
    }
    return "";
};
