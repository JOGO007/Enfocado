// Variables
const formulario = document.querySelector('#form_pendiente');//Seleccionamos el formulario 
const btnAgregar = document.querySelector('.button_icon-agregar')//.......
const inputPendiente = document.querySelector('#new_pendiente');//Seleccionamos el input
const contenedorPendientes = document.querySelector('#content_pendientes-cards');//El contenedor de pendientes
const contenedorRealizados = document.querySelector('#content_realizados-cards');//El contenedor de realizados
let listPendientes = [];
let listRealizados = [];

//Event Listeners
eventListeners();

function eventListeners(){

    inputPendiente.addEventListener('input', () => {
        inputPendiente.style.height = "auto"; //Reinicia la altura
        inputPendiente.style.height = inputPendiente.scrollHeight + 'px'; //Ajusta el contenido
    });

    inputPendiente.addEventListener('keydown', (e) => {
        
        if (e.key === 'Enter') {
            e.preventDefault();
            formulario.requestSubmit();
        }
    });

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        agregarPendiente();
        inputPendiente.value = '';//Vacia el texto
        inputPendiente.style.height = 'auto';//Resetea la altura
    });

    document.addEventListener('DOMContentLoaded', () => {
        listPendientes = JSON.parse(localStorage.getItem('PendientesIngresados')) || [];
        viewHTMLPendientes();

        listRealizados = JSON.parse(localStorage.getItem('RealizadosIngresados')) || []; 
        viewHTMLRealizados();

        //Actualia el anio en el footer
        const yearSpan = document.querySelector('#year');
        const yearActual = new Date().getFullYear();
        yearSpan.textContent = yearActual;
    })
}

function agregarPendiente(){
    const newPendiente = inputPendiente.value.trim();

    if(newPendiente === ''){
        mensajeError('No se ingreso pendiente...');
        return;
    }

    const newPenObj = {
        id: Date.now(),
        newPendiente
    }

    listPendientes = [...listPendientes, newPenObj];

    viewHTMLPendientes();

    formulario.reset();
}

function mensajeError(error){
    
    //Si existe un elemento con la clase .error, entonces eliminalo
    document.querySelector('.error')?.remove();

    const msjError = document.createElement('p');
    msjError.textContent = error;
    msjError.classList.add('error');

    const sectionPendiente = document.querySelector('#content_section_pendiente');
    sectionPendiente.insertBefore(msjError, sectionPendiente.children[1]);

    setTimeout(() => msjError.remove(), 3000);
}

function viewHTMLPendientes(){

    cleanPendiente();

    if(listPendientes.length > 0){
        listPendientes.forEach( penIngresado => {
            
            //Creamos la nueva card pendiente
            const card = document.createElement('div');
            card.classList.add('todo_list-card');    

            const Span = document.createElement('span');
            Span.classList.add('span_icon-select');

            const btnImgSelect = document.createElement('img');
            btnImgSelect.classList.add('circule_select')
                            btnImgSelect.src = './img/circulo_borde_solido.svg';

            // Guardamos el id como atributo para identificar qué tarea se clickeó
            btnImgSelect.dataset.id = penIngresado.id;

            // Evento para mover a realizados
            btnImgSelect.addEventListener('click', marcarComoRealizado);

            const texto = document.createElement('p');
            texto.classList.add('form_texto');
            texto.textContent = penIngresado.newPendiente;
            
            card.addEventListener('click', (e) => {
                // Solo activar si el click fue en el card o en el texto
                if( e.target === card || e.target === texto ){
                    texto.setAttribute('contenteditable', 'true');
                    texto.focus();
                }
                
            });

            texto.addEventListener('blur', () => {
                const nTexto = texto.textContent.trim();

                if(nTexto === ''){
                    //Si se borra todo, eliminar e pendiente
                    listPendientes = listPendientes.filter( p => p.id !== penIngresado.id);
                } else {
                    //Editar e valor del texto
                    const index = listPendientes.findIndex( p => p.id === penIngresado.id );
                    if( index !== -1 ){
                        listPendientes[index].newPendiente = nTexto;
                    }
                }

                viewHTMLPendientes();
            });

            texto.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    texto.blur(); // dispara el blur y guarda cambios
                }
            });
            

            Span.appendChild(btnImgSelect);
            card.appendChild(Span);
            card.appendChild(texto);
            contenedorPendientes.appendChild(card); 
        } );
    }

    sincronizarLocalStorageIng();
}

function viewHTMLRealizados(){

    cleanRealizados();

    if(listRealizados.length > 0){
        listRealizados.forEach( penRealizado => {
            
            //Creamos la nueva card realizado
            const card = document.createElement('div');
            card.classList.add('todo_list-card');

            const checkDone = document.createElement('span');
            checkDone.classList.add('span_icon-check');

            const btnImgCheck = document.createElement('img');
                            btnImgCheck.src = './img/circulo_check.svg.svg';

            const texto = document.createElement('p');
            texto.classList.add('form_texto');
            texto.textContent = penRealizado.newPendiente;

            const eliminar = document.createElement('p');
            eliminar.classList.add('btnEliminar')
            eliminar.textContent = 'Eliminar';
            // Guardamos el id como atributo para identificar qué tarea se clickeó
            eliminar.dataset.id = penRealizado.id;

            // Evento para eliminar a realizados
            eliminar.onclick = () => {
                eliminarRealizado(penRealizado.id);
            }

            checkDone.appendChild(btnImgCheck);
            card.appendChild(checkDone);
            card.appendChild(texto);
            card.appendChild(eliminar);
            contenedorRealizados.appendChild(card);

        });
    }

    sincronizarLocalStorageRea();
}

function marcarComoRealizado(e){

    //Capturamos el id del evento click en el img que contiene el id y lo ingresado en el input
    const id = parseInt(e.target.dataset.id);

    // Buscamos el objeto en pendientes
    const pendiente = listPendientes.find(p => p.id === id);

    // Lo eliminamos de pendientes y lo agregamos a realizados
    listPendientes = listPendientes.filter( p => p.id !== id );
    listRealizados = [...listRealizados, pendiente];

    viewHTMLPendientes();
    viewHTMLRealizados();
}

//Sincronizar con el LocalStorage
function sincronizarLocalStorageIng(){
    localStorage.setItem('PendientesIngresados', JSON.stringify(listPendientes));
}

function sincronizarLocalStorageRea(){
    localStorage.setItem('RealizadosIngresados', JSON.stringify(listRealizados));
}

function eliminarRealizado(id){
    listRealizados = listRealizados.filter( eliminado => eliminado.id !== id );

    viewHTMLRealizados();
}

function cleanPendiente(){
    while(contenedorPendientes.firstChild){
        contenedorPendientes.removeChild(contenedorPendientes.firstChild);
    }
}

function cleanRealizados(){
    while(contenedorRealizados.firstChild){
        contenedorRealizados.removeChild(contenedorRealizados.firstChild);
    }
}
