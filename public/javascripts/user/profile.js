//*Rferral Code*//

const key = document.querySelector(".key");
const keyText = key.innerText;
const copy = document.querySelector(".copy");
const copied = document.querySelector(".copied");

// Show "copy" icon on hover with helper class.
key.addEventListener("mouseover", () => copy.classList.remove("hide"));
key.addEventListener("mouseleave", () => copy.classList.add("hide"));

// Copy text when clicking on it.
key.addEventListener("click", () => {
  // We change "copy" icon for "copied" message.
  copy.classList.add("hide");
  copied.classList.remove("hide");

  // We turn simple text into an input value temporarily, so we can use methods .select() and .execCommand() which are compatible with inputs and textareas.
  let helperInput = document.createElement("input");
  document.body.appendChild(helperInput);
  helperInput.value = keyText;
  helperInput.select();
  document.execCommand("copy");
  document.body.removeChild(helperInput);

  // We remove the "copied" message after 2 seconds.
  setTimeout(() => {
    copied.classList.add("hide");
  }, 2000);
});

//* End Rferral Code*//
