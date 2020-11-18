
function changeQuantity(cartId, proId, userId, count) {
  let quantity = parseInt($("#quantity-" + proId).val());
  console.log(quantity);
  console.log(count);
  count = parseInt(count);
  if (quantity <= 1 && count == -1) {
    diasableMinus(proId);
  } else {
    $.ajax({
      url: "/change-product-quantity",
      data: {
        user: userId,
        cart: cartId,
        product: proId,
        count: count,
        quantity: quantity,
      },
      method: "post",
      success: (response) => {
        // if (response.removeProduct) {
        //   alert("Are you sure");
        //   location.reload();
        // } else {
        document.getElementById("quantity-" + proId).innerHTML = quantity + count;
        document.getElementById("total").innerHTML = response.total;
        diasableMinus(proId);
      },
    });
  }
}

function diasableMinus(proId) {
  let quantity = parseInt($("#quantity-" + proId).val());
  if (quantity <= 1) {
    $("#minus-btn" + proId).prop("dissable", true);
  } else {
    $("#minus-btn" + proId).prop("dissable", false);
  }
}
