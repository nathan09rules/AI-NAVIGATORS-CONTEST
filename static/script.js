console.log("start");

let data;
let symptoms = [];
let symptoms_by_body = {};
let symptoms_by_age_gender = {};
let age;
let gender;

async function load_symptoms() {
    const response = await fetch('/static/data.json');
    data = await response.json();

    symptoms = data.symptoms;
    symptoms_by_body = data.body_parts;
    symptoms_by_age_gender = data.age_gender;

    const datalist = document.getElementById("symptoms");
    symptoms.forEach(symptom => {
        const option = document.createElement("option");
        option.value = symptom;
        datalist.appendChild(option);
    });    
}
load_symptoms();

let precaution;
async function load_precautions() {
    const response = await fetch('/static/precautions.json');
    precaution = await response.json();
};

load_precautions();

const is_form_there = document.getElementById("form");
if (is_form_there) {

let count = 1; // Start from 1 because the first input already has id "inputed"

document.getElementById("add").onclick = function () {
    const ninput = document.createElement("input");
    ninput.classList.add('inputed');
    ninput.setAttribute('type', "text");
    ninput.setAttribute('list', "symptoms");
    ninput.placeholder = "symptoms";
    ninput.required = true;
    
    // Assign a unique ID (inputed-1, inputed-2, etc.)
    ninput.id = `inputed`;
    count++;

    document.getElementById('input_container').appendChild(ninput);
};


    document.getElementById("form").onsubmit = function(e){
        e.preventDefault();

        const entered = ["nan"];
        document.querySelectorAll('.inputed').forEach(input =>{
            entered.push(input.value)
        })

        list = symptoms.map(sym => entered.includes(sym)? 1 : 0);
        fetch('http://127.0.0.1:5000/predict' , {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({inputed: list})
        })
        .then(response => response.json())
        .then(data => {
            disease = data.result;
            document.getElementById("result").textContent = disease;

            console.log(disease[0]);
            document.getElementById("p1").textContent = precaution[disease[0]]["Precaution_1"];
            document.getElementById("p2").textContent = precaution[disease[0]]["Precaution_2"];
            document.getElementById("p3").textContent = precaution[disease[0]]["Precaution_3"];
            document.getElementById("p4").textContent = precaution[disease[0]]["Precaution_4"];

            const risk = precaution[disease[0]]["Risk"];
            let r = document.getElementById("risk");
            let rt = document.getElementById("risk-text");
            
            r.textContent =` ${risk}`
            if (risk === 0) {
                r.className = "l0";
                rt.textContent = "No major concern.";
            } else if (risk === 1) {
                r.className = "l1";
                rt.textContent = "Mild condition, monitor symptoms.";
            } else if (risk === 2) {
                r.className = "l2";
                rt.textContent = "Moderate risk, consider seeing a doctor.";
            } else if (risk === 3) {
                r.className = "l3";
                rt.textContent = "Needs medical attention soon.";
            } else if (risk === 4) {
                r.className = "l4";
                rt.textContent = "Serious condition, seek urgent care.";
            } else if (risk === 5) {
                r.className = "l5";
                rt.textContent = "Emergency! Immediate medical help required.";
            } else {
                r.className = "";
                rt.textContent = "";
            }
            
            
        })
    }
}else{

    document.getElementById("search_symp").onsubmit = function(e){
        e.preventDefault();

        const inputed = document.getElementById("s_symp").value;
        target = document.getElementById(inputed.slice(1));

        if(target){
            target.scrollIntoView();
        }else{
            alert("not found")
        }
    }

    document.getElementById("page1").onsubmit = function(e){
        e.preventDefault()

        const input_age = document.getElementById("age").value;
        if (input_age < 3){age = "Infant";}
        else if (input_age < 13){age = "Child";}
        else if (input_age < 20){age = "Teen";}
        else if (input_age < 60){age = "Adult";}
        else {age = "Senior"}
        gender = document.getElementById("gender").value;


        document.getElementById("page1").style.display = "none";
        document.getElementById("page2").style.display = "block";

        /* TRANSITION IF NEEDED
        document.getElementById("page1").classList.add("move_up");
        setTimeout(() => {
            document.getElementById("page1").style.display = "none";
            document.getElementById("page2").style.display = "block";
        },400);
        */
    }
}
//all the components done 

// all the drawing stuff

const bdDIV = document.createElement("div");
bdDIV.classList.add("border");
document.body.append(bdDIV);


const shader = document.querySelector(".shader");
const shader_o = document.querySelector(".shader_o");

const human = document.querySelector(".human_body");
const info = document.getElementById("info");
const part = document.getElementById("body_part");


function body_clicked(event, body_part) {
    const human_rect = human.getBoundingClientRect();
    const scaleX = human_rect.width / human.naturalWidth;
    const scaleY = human_rect.height / human.naturalHeight;

    const x = event.clientX;
    const y = event.clientY;
    
    shader_o.style.clipPath = `circle(30px at ${x}px ${y}px)`;
    shader.style.clipPath = `circle(20px at ${x}px ${y}px)`;

    part.textContent = body_part;

    let body_part_symp = symptoms_by_body[body_part] ;

    /* Gender class not enough data but irt works
    let gender_age_symp = new Set(symptoms_by_age_gender[age][gender]);
    let symp = body_part_symp.filter(i => gender_age_symp.has(i))
    */

    let size = 0;

    info.innerHTML = body_part_symp.map((symptom, index) => {
        size += symptom.length + 4;
        loca = document.getElementById(symptom) ? ("<a href='#" + symptom + "'>" + symptom + "</a>" ): symptom
        if (size > 50){ // change value
            size = 0;
            return loca + "<br>"
        }
        return  loca + "    "
    }).join("") ;
}

function move_up(id_hide , id_show){
    document.getElementById(id_hide).style.display = "none";
    document.getElementById(id_show).style.display = "block";

}