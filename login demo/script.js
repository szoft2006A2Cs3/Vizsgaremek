function togglePass(id) {
const i = document.getElementById(id);
i.type = i.type === 'password' ? 'text' : 'password';
}


function switchForm(type) {
const forms = document.querySelector('.forms');


document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));


document.getElementById(type).classList.add('active');
document.querySelector(`.tab[onclick="switchForm('${type}')"]`).classList.add('active');
if (type === 'register') {
forms.style.height = '420px';
}else {
forms.style.height = '260px';
}
}