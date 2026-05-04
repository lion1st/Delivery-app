function notifyFoodsUpdated() {
    window.dispatchEvent(new Event("foodsUpdated"));
}

window.addEventListener("storage", (event) => {
    if (event.key === "foods") {
        window.dispatchEvent(new Event("foodsUpdated"));
    }

    if (event.key === "cart") {
        window.dispatchEvent(new Event("cartUpdated"));
    }
});
