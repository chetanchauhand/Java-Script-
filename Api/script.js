const URL = "https://catfact.ninja/facts?limit=1&max_length=140";
const factPara = document.querySelector("#fact");
const btn = document.querySelector("#btn");

const getFacts = async () =>{
    console.log("getting Data ...")
    let response = await fetch(URL);
    console.log(response)
    let data = await response.json();
    factPara.innerText = data[0].text;

};
btn1.addEventListener("click",getFacts);