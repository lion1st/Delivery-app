const defaultFoods = [
    {
        id: 1,
        name: "Beef Burger",
        price: 5000,
        image: "https://www.certifiedirishangus.ie/wp-content/uploads/2019/11/TheUltimateBurgerwBacon_RecipePic.jpg",
        restaurant: "Quick Grill",
        category: "Burgers"
    },
    {
        id: 2,
        name: "Chicken Pizza",
        price: 8000,
        image: "https://theartisticcook.com/wp-content/uploads/2025/03/Chicken-Pizza.jpg",
        restaurant: "Pizza Hub",
        category: "Pizza"
    },
    {
        id: 3,
        name: "Coca Cola",
        price: 1000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSd9DQWKns0pO5pNAdZJuiIa4ydA0546avYQ&s",
        restaurant: "Drink Spot",
        category: "Drinks"
    },
    {
        id: 4,
        name: "Fried Chicken",
        price: 6000,
        image: "https://i.ytimg.com/vi/3CVDrAkhDmI/maxresdefault.jpg",
        restaurant: "KFC Style",
        category: "Chicken"
    },
    {
        id: 5,
        name: "Ice Cream",
        price: 3000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUtJM2Nm4oFVI7I59YY3FSj-0H3FdT1FPCmg&s",
        restaurant: "Sweet Spot",
        category: "Dessert"
    },
    {
        id: 6,
        name: "Pepsi",
        price: 4000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9s4z5HJx6dQvqHKZM_AyYZZL6uE_XUUgK7Q&s",
        restaurant: "Madbag",
        category: "Drinks"
    },
    {
        id: 7,
        name: "Veggie Pizza",
        price: 7000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1arn3zktHMIMMZgHWkJwy8uYfFwIoFMNgiw&s",
        restaurant: "Pizza Hub",
        category: "Pizza"
    },
    {
        id: 8,
        name: "Chocolate",
        price: 2000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJX8Uc46p7grJfe_9vFjMEaPZFlqTHtGu59g&s",
        restaurant: "Sweet Spot",
        category: "Snacks"
    },
    {
        id: 9,
        name: "Fries",
        price: 3000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9MIimf5e_vsAvPvZMk2HGLN-o8uk7rAJIHQ&s",
        restaurant: "Quick Grill",
        category: "Snacks"
    },
    {
        id: 10,
        name: "Grilled Chicken",
        price: 6500,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzFu_9xepJB1ePXg_UxEiFth25KPc1R7WbrQ&s",
        restaurant: "KFC Style",
        category: "Chicken"
    },
    {
        id: 11,
        name: "Chicken Burger",
        price: 6000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcHJs4WyO8p2sKWztpAyyA-vtu2RVfBw2jmA&s",
        restaurant: "Quick Grill",
        category: "Burgers"
    },
    {
        id: 12,
        name: "Panna Cotta",
        price: 3500,
        image: "https://cdn.jwplayer.com/v2/media/XUqZDSbG/thumbnails/HNylojyg.jpg?width=1280",
        restaurant: "Sweet Spot",
        category: "Dessert"
    },
    {
        id: 13,
        name: "Apple Pie",
        price: 10000,
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5nRK7QQGCdPA1vc_rGX02WwNdr0pI2cNW0Q&s",
        restaurant: "Sweet Spot",
        category: "Dessert"
    },
    {
        id: 14,
        name:"Cheese burger",
        price:"5500",
        image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPxrZKKsYlZI4rkj43oVi-3NrcHXHNKwuRzw&s",
        restaurant:"Quick grill",
        category:"Burgers"
    },
    {
        id: 15,
        name:"Marinated burger",
        price:"6000",
        image:"https://www.savingdessert.com/wp-content/uploads/2016/06/Marinated-Burgers-5.jpg",
        restaurant:"Quick grill",
        category:"Burgers"
    },
];

function initializeFoods() {
    const savedFoods = JSON.parse(localStorage.getItem("foods")) || [];
    const mergedFoods = [...savedFoods];

    defaultFoods.forEach((defaultFood) => {
        const exists = mergedFoods.some((food) => Number(food.id) === Number(defaultFood.id));
        if (!exists) {
            mergedFoods.push(defaultFood);
        }
    });

    localStorage.setItem("foods", JSON.stringify(mergedFoods));
}

initializeFoods();
