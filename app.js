const inputBuscar = document.querySelector('input');
const buscarPokemon = document.getElementById('search-pokemon');
const btnNext = document.getElementById('btn-next');
const btnPrevious = document.getElementById('btn-previous');

let currentPage = 1; // Página actual                                                 // establezco la pagina actual en 1

const getPokemonData = async () => {
  // Aqui hago mi fetch para traer todos los pokemones claro con un limit
  showSpinner(); // muestro la barra de carga
  const limit = 24;
  const offset = (currentPage - 1) * limit;
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.ok) {
      if (data.results.length === 0 && currentPage > 1) {
        Swal.fire({
          icon: 'info',
          title: '¡Fin del contenido!',
          text: 'No hay más pokemones para mostrar.',
        });
        currentPage--; // Aqui redusco la pagina -1 ya que no encontro mas contenido
        hideSpinner();
      } else {
        const pokemonDetails = await Promise.all(
          //promise.all lo use para manejar muchas promesas a la vez en paralelo debido a la gran cantidad de datos
          data.results.map(async (pokemon) => {
            // Creo mi nuevo array con cada uno de los elementos
            const response = await fetch(pokemon.url);
            return await response.json();
          })
        );
        hideSpinner();
        renderPokemons(pokemonDetails); // pase los pokemones para usar en mi html
      }
    } else {
      throw new Error('Network response was not ok.');
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
};

const renderPokemons = (pokemons) => {
  const pokemonsContainer = document.getElementById('pokemones');
  pokemonsContainer.innerHTML = '';
  pokemons.forEach((pokemon) => {
    const pokemonElement = document.createElement('div');
    pokemonElement.classList.add('pokemon-card');

    // contenedor para los badges de tipo
    const typeBadgesContainer = document.createElement('div');
    typeBadgesContainer.classList.add('type-badges');

    // los badges de tipo y agregarlos al contenedor
    pokemon.types.forEach((typeInfo) => {
      const type = typeInfo.type.name;
      const badge = document.createElement('span');
      badge.classList.add('type-badge', `type-${type}`);
      badge.textContent = type.toUpperCase();
      typeBadgesContainer.appendChild(badge);
    });

    // contenedor para estadísticas
    const statsContainer = document.createElement('div');
    statsContainer.classList.add('stats-container', 'hide');
    // estadísticas al contenedor
    const statsHtml = pokemon.stats.map((stat) => {
      // porcentaje de la barra de progreso en función del valor máximo.
      const percentage = (stat.base_stat / 150) * 100;
    
      return `
        <div class='stats-item'>
          <div class='stats-name'>${stat.stat.name.toUpperCase()}: ${stat.base_stat}</div>
          <div class='stats-bar-container'>
            <div class='stats-bar' style='width: ${percentage}%'></div>
          </div>
        </div>
      `;
    }).join('');
    
    const heightWeightHtml = `
      <div class='stats-item height-weight'>HEIGHT: ${pokemon.height * 10} cm</div>
      <div class='stats-item height-weight'>WEIGHT: ${pokemon.weight} libras</div>
    `;
    statsContainer.innerHTML = statsHtml + heightWeightHtml;

    // Agregar contenedores al elemento de Pokémon
    pokemonElement.appendChild(typeBadgesContainer);
    pokemonElement.appendChild(statsContainer);

    // Agregar evento de mouse para mostrar/ocultar estadísticas
    pokemonElement.addEventListener('mouseenter', () => {
      statsContainer.classList.remove('hide');
      statsContainer.style.animation = 'fadeIn 0.3s ease';
    });
    
    pokemonElement.addEventListener('mouseleave', () => {
      statsContainer.classList.add('hide');
      statsContainer.style.animation = 'fadeOut 0.3s ease';
    });

    // Agregar la imagen y nombre del Pokémon
    const previewContainer = document.createElement('div');
    previewContainer.classList.add('pokemon-preview');
    previewContainer.innerHTML = `
      <img src='${
        pokemon.sprites.other['official-artwork'].front_default
      }' alt='${pokemon.name}' class='modal-image' />
      <h3>#${pokemon.id.toString().padStart(3, '0')}</h3>
      <h3>${pokemon.name}</h3>
    `;
    pokemonElement.appendChild(previewContainer);

    const pokeballImage = document.createElement('img');
    pokeballImage.src = './img/pokeball.png';
    pokeballImage.alt = 'PokeBola';
    pokeballImage.classList.add('pokebal-title');
    previewContainer.appendChild(pokeballImage);

    pokemonElement.addEventListener('mouseenter', () => {
      // Aplica la animación de giro a la Pokébola
      pokeballImage.style.animation = 'spin 1s infinite linear';
      // Muestra el contenedor de estadísticas
      statsContainer.classList.remove('hide');
    });

    pokemonElement.addEventListener('mouseleave', () => {
      // Detiene la animación de giro de la Pokébola
      pokeballImage.style.animation = '';
      // Oculta el contenedor de estadísticas
      statsContainer.classList.add('hide');
    });

    // Agregar la tarjeta de Pokémon al contenedor principal
    pokemonsContainer.appendChild(pokemonElement);
    
  });
};

const showSpinner = () => {
  document.querySelector('.loading-container').style.display = 'flex';
};

const hideSpinner = () => {
  document.querySelector('.loading-container').style.display = 'none';
};

const searchPokemon = async (pokemons) => {
  // en esta la uso para buscar un pokemon por id o nombre pero aqui hago la peticion a la ur
  try {
    let surl = `https://pokeapi.co/api/v2/pokemon/${pokemons}`;
    const response = await fetch(surl);
    const data = await response.json();
    return data;
  } catch (error) {}
};

const busqueda = async (name_id) => {
  // Aqui es donde realmento hago la busquueda
  showSpinner();
  try {
    const pokemon = await searchPokemon(name_id);
    if (pokemon) {
      renderPokemons([pokemon]); // le paso un array a renderpokemons debido a que solo quiero un pokemon con el id o nombre
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontro el pokemon',
      });
    }
  } catch (error) {
    console.error('Hubo un problema con la operación fetch:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al buscar el Pokémon. Asegurese de haber ingresado un ID o nombre correcto..',
    });
  } finally {
    hideSpinner();
  }
};

buscarPokemon.addEventListener('click', (e) => {
  // tomo del input el nombre o id del pokemon y se lo paso a la busqueda aqui es el botono
  const pokemonNameId = inputBuscar.value.trim().toLowerCase();
  if (!pokemonNameId) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Por favor, ingresa un nombre o ID de Pokémon.',
    });
    return;
  }
  busqueda(pokemonNameId);
});

inputBuscar.addEventListener('keypress', (e) => {
  // hago lo mismo de antes pero al presionar Enter
  if (e.key === 'Enter') {
    e.preventDefault();
    const pokemonNameId = inputBuscar.value.trim().toLowerCase();
    if (!pokemonNameId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, ingresa un nombre o ID de Pokémon.',
      });
      return;
    }
    busqueda(pokemonNameId);
  }
});

/* Parte de la Paginacion */

const updatePaginationInput = () => {
  const paginationInput = document.querySelector('.pagination-controls input'); // Actualizo la pagina cada vez que le pongo y busco una en el input
  paginationInput.value = currentPage;
};

const handleNextPage = () => {
  //actualizo los pokemones cuando paso a la siguiente
  currentPage++;
  updatePaginationInput();
  getPokemonData();
  btnPrevious.disabled = false;
};

const handlePreviousPage = () => {
  if (currentPage > 1) {
    //actualizo los pokemones cuando paso a la anterior
    currentPage--;
    updatePaginationInput();
    getPokemonData();
  }
  btnPrevious.disabled = currentPage === 1;
  btnNext.disabled = false;
};

btnNext.addEventListener('click', handleNextPage);
btnPrevious.addEventListener('click', handlePreviousPage); //mis addeventlistener de los botones
btnPrevious.disabled = true;
btnNext.disabled = false;

const handlePaginationInputChange = () => {
  const paginationInput = document.querySelector('.pagination-controls input'); //Aqui manejo cuando el valor del input cambia
  const page = parseInt(paginationInput.value);
  if (!isNaN(page) && page >= 1) {
    currentPage = page;
    getPokemonData();
    btnPrevious.disabled = currentPage === 1; // Desactivar el botón 'Anterior' si estamos en la primera página
    btnNext.disabled = false;
  }
};

document
  .querySelector('.pagination-controls input')
  .addEventListener('change', handlePaginationInputChange); //me permite cambiar de pagina ingresando un numero dediba que lo paso a handlePaginationInputChange

getPokemonData();
