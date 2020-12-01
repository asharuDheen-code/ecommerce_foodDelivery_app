const { response } = require("express");

function myFunction(value) {
  $("#report").html(' ');
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
      let purchaseTotal = response[0].total;
      document.getElementById("totalSale").value = purchaseTotal;
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
            $("#report").append(tr);
          });
        });
      }
    },
  });
}

//***************ANUAL REPORT********************/
function newFun(key) {
  // jQuery(this).parents('tr').find('input').html('');
  $("#anualReport").html(' ');
  $.ajax({
    url: "/admin/date",
    method: "post",
    data: {
      date: key,
    },
    success: (response) => {
      let purchaseTotal = response[0].total;
      document.getElementById("totalSales").value = purchaseTotal;
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
            $("#anualReport").append(tr);
          });
        });
      }
    },
  });
}
//***************ANUAL REPORT********************/