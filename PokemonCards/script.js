var min = document.getElementById("main");
let arr = 
["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_Up4CKstdL30cJh67IHNNMkGucXwRnB9jv42p3BsmVw&s=10",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdZTRcCp5iC8oydTxw48RqUdue4uHyNKbMN727VyOmIQ&s=10",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLRSLIjgC0YarhjZJg5pcCSi_okN1eKP-ofO8WEAihpg&s",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtHiGLuHovkyeU6w0pqNQMQ_4ypiixu0No7ZQWhUp8ng&s=10",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBz2ADVTP-f0JHA54x_9IbTtFpFn-VRQIMfU20z0WjPg&s=10",
"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrUZeKCUo4xsX25vVHE95rs1LNHZg_wLjnY0N7dP-qEw&s=10"]

let s = "";
for(let i=0;i<=55;i++){
    let r = Math.floor(Math.random()*6)
    s+= `<div class="card"><img src=${arr[r]}></div>`;
}

min.innerHTML = s; 

