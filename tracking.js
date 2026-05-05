function updateOrderStatus(order, newStatus) {
  order.status = newStatus;

  if (newStatus === "shipped") {
    console.log("Package is on the way 🚚");
  }

  if (newStatus === "delivered") {
    console.log("Package delivered 📦");
  }

  return order;
}