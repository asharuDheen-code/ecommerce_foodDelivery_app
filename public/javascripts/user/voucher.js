//****************User Use Voucher******************//

$("#voucherApply").click(() => {
  let voucher = $("#userVoucher").val();
  let totalamount = $("#subtotal").html();
  $.ajax({
    url: "/checkVoucher",
    method: "post",
    data: {
      voucher,
      totalamount,
    },
    success: function (response) {
      if (response.values.status) {
        $("#notvalid").hide();
        let offerPercentage = parseInt(response.values.result.offer);
        console.log("offerPercentage", offerPercentage);
        let total = response.total;
        console.log("total", total);
        let offerPrice = parseInt(total - (total / 100) * offerPercentage).toFixed(2);
        console.log("adddingOffer", total - (total / 100) * offerPercentage);
        // console.log("OtheradddingOffer", ((total/offerPercentage) * 100).toFixed(3));
        console.log("offerPrice", offerPrice);
        $("#subtotal").html(offerPrice);
      } else {
        $("#notvalid").show();
      }
    },
  });
});

//****************END User Use Voucher******************//
