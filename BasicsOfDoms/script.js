let x = document.getElementById("ele1")
x.addEventListener("click",function(){
    x.style.color = "yellow"
    x.style.backgroundColor = "red"
})
x.addEventListener("mouseleave",function(){
    x.style.color = "Black"
    x.style.backgroundColor = "white"
})

let y = document.getElementById("ele2")
//x.addEventListener("mousemove",function(){
y.addEventListener("mouseenter",function(){
    y.style.color = "cream"
    y.style.backgroundColor = "orange"
})
y.addEventListener("mouseleave",function(){
    y.style.color = "black"
    y.style.backgroundColor = "white"
})
let z = document.getElementById("ele3")
z.addEventListener("mouseenter",function(){
    z.style.color = "cream"
    z.style.backgroundColor = "green"
});

