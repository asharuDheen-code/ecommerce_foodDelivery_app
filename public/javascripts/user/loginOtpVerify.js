// *******************OTP VERIFICATION***************>\\

function otpCall() {
  $("#userName").hide();
  $("#password").hide();
  $("#otp").hide();
  $("#mobile").show();
  $("#callMobileBtn").show();
  $("#loginBtn").hide();
  $("#enterMobile").hide();
}
function mobileSubmit() {
  $("#mobile").show();
  $("#otp").show();
  $("#callMobileBtn").hide();
  $("#otpSubmit").show();
  let mobileNumber = $("#mobile").val();
  $.ajax({
    url: "/checkMobile",
    method: "post",
    data: {
      mobileNumber,
    },
    success: (response) => {
      console.log("ressssssssssssss", response);
      if (response.details == null) {
        $("#otp").hide();
        $("#otpSubmit").hide();
        $("#notValid").show();
        $("#callMobileBtn").show();
      } else {
        $("#notValid").hide();
        $.ajax({
          url: "/callOtp",
          method: "post",
          data: {
            mobileNumber,
          },
          success: (response) => {
            localStorage.setItem("id", response);

            $("#lastValue").val(response);

            let latestId = response;
            console.log("lllllllllllllllllllllllll", response);
          },
        });
      }
    },
  });
}

function applyOtp() {
  let otpId = $("#lastValue").val();
  let otpNum = $("#otp").val();
  let mobileNumber = $("#mobile").val();
  let number = parseInt(otpNum);
  if (otpNum.length < 6 || otpNum.length > 6) {
    $("#otpTotalNum").show();
    $("#otpError").hide();
  } else {
    $.ajax({
      url: "/otpVerify",
      method: "post",
      data: {
        otpId,
        otpNum,
        mobileNumber,
      },
      success: (response) => {
        if (response.status) {
          window.location = "/";
        } else {
          $("#otpTotalNum").hide();
          $("#otpError").show();
          $("#otpError").html(response.errMsg);
        }
      },
    });
  }
}

// *******************END OF OTP VERIFICATION***************>\\
