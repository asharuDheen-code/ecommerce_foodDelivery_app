let xhr = new XMLHttpRequest();

// const forms = document.querySelector("form");
// const user = document.querySelector("input[type=text]");
// const password = document.querySelector("input[type=password]");
const user = document.querySelector("#userName");
const password = document.querySelector("#password");
const btn = document.querySelector("#loginBtn");
const signbtn = document.querySelector("#signUpBtn");

const signuser = document.querySelector("#signUser");
const signemail = document.querySelector("#signEmail");
const signpassword = document.querySelector("#signPassword");
console.log(signbtn);

//singnupValidation
signbtn.addEventListener("click", function (event) {
  if (
    signuser.value === "" ||
    signemail.value === "" ||
    signpassword.value === ""
  ) {
    event.preventDefault();
    alert("Please fill");
    res.send("hiiii");
    return false;
  } else {
    let userData = {
      signUser: userName.value,
      signPassword: userName.value,
      // userName: document.getElementById("userName").value,
      // password: document.getElementById("password").value,
    };

    xhr.onreadystatechange = function () {
      // console.log( "responce");
      if (this.readyState === 4 && this.status === 200) {
        let homePage = this.responseText;
        // console.log( homePage);

        if (homePage == "false") {
          // let nonStatus = document.querySelector(".noUser");
          // nonStatus.classList.remove.("hideDisplayClass")
          document.getElementById("errMsg").style.display = "block";
          document.getElementById("userName").value = "";
          document.getElementById("password").value = "";
        } else {
          document.location.href = "http://localhost:3001/users";
        }
      }
    };
    xhr.open("post", "http://localhost:3001/submit", true);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(JSON.stringify(userData));
  }
});

//loginPage
btn.addEventListener("click", function (event) {
  console.log("working");
  if (user.value === "" || password.value === "") {
    event.preventDefault();
    // res.send("hiiii");
    alert("Please fill");
    return false;
  } else {
    // let homePage;

    let userData = {
      // userName: userName.value
      // userName: userName.value
      userName: document.getElementById("userName").value,
      password: document.getElementById("password").value,
    };

    xhr.onreadystatechange = function () {
      // console.log( "responce");
      if (this.readyState === 4 && this.status === 200) {
        let homePage = this.responseText;
        // console.log( homePage);

        if (homePage == "false") {
          // let nonStatus = document.querySelector(".noUser");
          // nonStatus.classList.remove.("hideDisplayClass")
          document.getElementById("errMsg").style.display = "block";
          document.getElementById("userName").value = "";
          document.getElementById("password").value = "";
        } else {
          document.location.href = "http://localhost:3001/users";
        }
      }
    };
    xhr.open("post", "http://localhost:3001/submit", true);
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(JSON.stringify(userData));
  }
});
