const { response } = require("express");

function myFunction(value) {
  firstDate = $("#firstDate").val();
  secondDate = $("#secondDate").val();
  $.ajax({
    url: "/admin/takeReport",
    method: "post",
    data: {
      firstDate,
      secondDate,
    },
    success: (response) => {
        let purchaseTotal = response[0].total
        document.getElementById("totalSale").value = purchaseTotal
      console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhh",purchaseTotal);
      let length = Object.keys(response).length;
      for (var i = 0; i < length; i++) {
        let reports = response[i];

        var datas = {
          i: {
            username: reports.datas.firstName,
            orderId: reports.datas.orderId,
            date: reports.datas.date,
            orderStatus: reports.datas.status,
            paymentMethod: reports.datas.paymentMethod,
            totalAmount: reports.datas.orderTotal,
          },
        };
        $.each(datas, function (key, value) {
          var tr = $("<tr />");
          $.each(value, function (k, v) {
            tr.append(
              $("<td />", {
                html: v,
              })[0].outerHTML
            );
            $("table tbody").append(tr);
          });
        });
      }
    },
  });
}
