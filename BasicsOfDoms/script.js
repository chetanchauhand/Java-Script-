// let x = document.querySelectorAll(".Yes") // multiple users purpose
// console.log(x)

let x = document.querySelector("h1")
x.style.color = "Black"
setTimeout(function(){
    x.innerHTML = "Changed"
},4000)

let y = document.querySelector("h2")
y.style.background = "red"
setTimeout(function(){
    y.innerHTML = "Changed"
},2000)